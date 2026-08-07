<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Level;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class SubjectContentController extends Controller
{
    public function index(Request $request, $subject)
    {
        $subjectId = $request->get('subject_id');
        $levelId = $request->get('level_id');
        $form = $request->get('form', 'Form 4');

        $userId = Auth::id();
        
        // ✅ OPTIMIZATION 1: Load user data only if needed
        if (!Auth::user()->relationLoaded('student')) {
            Auth::user()->load('student');
        }

        // ✅ OPTIMIZATION 3: Cache levels & subjects (30 minutes)
        $availableLevels = Cache::remember('available_levels', 1800, function () {
            return DB::table('level')
                ->where('is_active', 1)
                ->select('id', 'name', 'abbr')
                ->get()
                ->mapWithKeys(fn($level) => [$level->name => $level->id])
                ->toArray();
        });

        $availableSubjects = Cache::remember("available_subjects_{$subject}", 1800, function () use ($subject, $availableLevels) {
            return DB::table('subject')
                ->where('abbr', $subject)
                ->whereIn('level_id', array_values($availableLevels))
                ->where('is_active', 1)
                ->select('id', 'abbr', 'name', 'level_id')
                ->get()
                ->mapWithKeys(function ($subj) use ($availableLevels) {
                    $levelName = array_search($subj->level_id, $availableLevels);
                    return [$levelName => $subj->id];
                })
                ->toArray();
        });

        // Handle form-based level/subject selection
        if ($form && isset($availableLevels[$form])) {
            $newLevelId = $availableLevels[$form];
            if ($newLevelId != $levelId) {
                $levelId = $newLevelId;
                if (isset($availableSubjects[$form])) {
                    $subjectId = $availableSubjects[$form];
                }
            }
        }

        // Validate required parameters
        if (!$subjectId || !$levelId) {
            abort(400, 'Missing required parameters: subject_id and level_id are required');
        }

        // ✅ OPTIMIZATION 4: Get subject with DB query (faster than Eloquent for single record)
        $subjectData = DB::table('subject')
            ->where('id', $subjectId)
            ->where('is_active', 1)
            ->first(['id', 'name', 'abbr', 'level_id']);

        if (!$subjectData) {
            abort(404, 'Subject not found');
        }

        // Verify level match
        if ($subjectData->level_id != $levelId) {
            $correctSubject = DB::table('subject')
                ->where('abbr', $subject)
                ->where('level_id', $levelId)
                ->where('is_active', 1)
                ->first(['id', 'name', 'abbr', 'level_id']);
                
            if ($correctSubject) {
                $subjectId = $correctSubject->id;
                $subjectData = $correctSubject;
            }
        }

        // ✅ OPTIMIZATION 5: Get content data with aggressive optimization
        $contentData = $this->getOptimizedContent($subjectId, $levelId, $userId);

        return Inertia::render('courses/SubjectPage', [
            'subject' => $subjectData->name,
            'subject_abbr' => $subjectData->abbr,
            'subject_id' => $subjectId,
            'level_id' => $levelId,
            'form' => $form,
            'content' => $contentData,
            'selectedStandard' => $form,
            'availableLevels' => $availableLevels,
            'availableSubjects' => $availableSubjects,
        ]);
    }

    /**
 * ✅ SUPER OPTIMIZED: Get all content data in minimal queries
 */
private function getOptimizedContent($subjectId, $levelId, $userId = null)
{
    // Version the cache with the latest topic update so active-status changes
    // do not continue serving an old topic/subtopic structure.
    $latestTopicUpdate = DB::table('topics')
        ->where('subject_id', $subjectId)
        ->where('level_id', $levelId)
        ->max('updated_at');
    $structureVersion = $latestTopicUpdate
        ? strtotime((string) $latestTopicUpdate)
        : 0;
    $structureCacheKey = "active_published_content_structure_v1_{$subjectId}_{$levelId}_{$structureVersion}";
    
    // ✅ STEP 1: Get cached structure (topics + subtopics) - 15 min cache
    $structure = Cache::remember($structureCacheKey, 900, function () use ($subjectId, $levelId) {
        // Single query: only active and published parent topics/subtopics.
        return DB::table('topics as parent')
            ->leftJoin('topics as child', function ($join) {
                $join->on('child.parent_id', '=', 'parent.id')
                    ->where('child.is_active', 1)
                    ->where('child.is_published', 1);
            })
            ->where('parent.subject_id', $subjectId)
            ->where('parent.level_id', $levelId)
            ->where(function ($query) {
                $query->whereNull('parent.parent_id')
                    ->orWhere('parent.parent_id', 0);
            })
            ->where('parent.is_active', 1)
            ->where('parent.is_published', 1)
            ->orderBy('parent.seq')
            ->orderBy('child.seq')
            ->select([
                'parent.id as parent_id',
                'parent.name as parent_name',
                'parent.seq as parent_seq',
                'child.id as child_id',
                'child.name as child_name',
                'child.seq as child_seq'
            ])
            ->get();
    });

    if ($structure->isEmpty()) {
        return ['id' => 1, 'sections' => []];
    }

    // ✅ STEP 2: Group structure by parent
    $groupedTopics = [];
    $allTopicIds = [];
    
    foreach ($structure as $row) {
        $parentId = $row->parent_id;
        
        if (!isset($groupedTopics[$parentId])) {
            $groupedTopics[$parentId] = [
                'id' => $parentId,
                'name' => $row->parent_name,
                'seq' => $row->parent_seq,
                'subtopics' => []
            ];
            $allTopicIds[] = $parentId;
        }
        
        if ($row->child_id) {
            $groupedTopics[$parentId]['subtopics'][] = [
                'id' => $row->child_id,
                'name' => $row->child_name,
                'seq' => $row->child_seq
            ];
            $allTopicIds[] = $row->child_id;
        }
    }

    // ✅ NEW STEP: Batch get videos for all topics (1 query for all videos)
    $videos = DB::table('video_learning')
        ->whereIn('topic_id', $allTopicIds)
        ->select('id', 'topic_id', 'title', 'url', 'created_at')
        ->orderBy('created_at', 'desc')
        ->get()
        ->groupBy('topic_id');

    // ✅ STEP 3: Batch get question counts (1 query for all topics)
    $questionCounts = DB::table('questions')
        ->whereIn('topic_id', $allTopicIds)
        ->where('is_active', 1)
        ->selectRaw('topic_id, question_type_id, COUNT(*) as count')
        ->groupBy('topic_id', 'question_type_id')
        ->get()
        ->groupBy('topic_id');

    // ✅ STEP 4: Batch get practice data (1 query for all topics, only if logged in)
    $practiceData = collect();
    if ($userId) {
        $attemptCounts = DB::table('quiz_attempts')
            ->selectRaw('session_id, COUNT(DISTINCT question_id) as total_questions')
            ->groupBy('session_id');

        $practiceData = DB::table('practice_session as ps')
            ->leftJoinSub($attemptCounts, 'attempt_counts', function ($join) {
                $join->on('attempt_counts.session_id', '=', 'ps.id');
            })
            ->whereIn(
                DB::raw('CASE WHEN ps.subtopic_id IS NOT NULL AND ps.subtopic_id <> 0 THEN ps.subtopic_id ELSE ps.topic_id END'),
                $allTopicIds
            )
            ->where('ps.user_id', $userId)
            ->selectRaw('
                ps.id,
                CASE WHEN ps.subtopic_id IS NOT NULL AND ps.subtopic_id <> 0 THEN ps.subtopic_id ELSE ps.topic_id END as topic_id,
                ps.question_type_id,
                ps.score,
                ps.total_correct,
                ps.total_skipped,
                ps.total_time_seconds,
                ps.created_at,
                CASE
                    WHEN COALESCE(attempt_counts.total_questions, 0) > 0
                        THEN attempt_counts.total_questions
                    ELSE COALESCE(ps.total_correct, 0) + COALESCE(ps.total_skipped, 0)
                END as total_questions
            ')
            ->orderByDesc('ps.created_at')
            ->orderByDesc('ps.id')
            ->get()
            ->groupBy(['topic_id', 'question_type_id']);
    }

    // ✅ STEP 5: Build final structure (all in memory, no more DB queries)
    $sections = [];
    foreach ($groupedTopics as $parent) {
        $section = [
            'id' => count($sections) + 1,
            'title' => $parent['name'],
            'subSections' => []
        ];
        
        // If no subtopics, treat parent as subtopic
        $subtopics = !empty($parent['subtopics']) 
            ? $parent['subtopics'] 
            : [['id' => $parent['id'], 'name' => $parent['name']]];
        
        foreach ($subtopics as $subtopic) {
            $topicId = $subtopic['id'];
            
            // Get videos for this topic
            $topicVideos = $videos[$topicId] ?? collect();
            $formattedVideos = $topicVideos->map(function ($video) {
                return [
                    'id' => $video->id,
                    'title' => $video->title,
                    'url' => $video->url,
                    
                    'created_at' => $video->created_at
                ];
            })->toArray();
            
            // Get counts (from cache)
            $counts = $questionCounts[$topicId] ?? collect();
            $objectiveCount = $counts->where('question_type_id', 1)->sum('count');
            $subjectiveCount = $counts->where('question_type_id', 2)->sum('count');
            
            // Get practice data (from cache)
            $objectiveSessions = collect($practiceData[$topicId][1] ?? []);
            $objectivePractice = $objectiveSessions->first();
            $subjectivePractice = $practiceData[$topicId][2][0] ?? null;
            
            $section['subSections'][] = [
                'id' => $topicId,
                'title' => $subtopic['name'],
                'practiceTitle' => $subtopic['name'],
                'videos' => $formattedVideos, // Add videos to the response
                'questionCounts' => [
                    'objective' => (int)$objectiveCount,
                    'subjective' => (int)$subjectiveCount
                ],
                'lastPractice' => [
                    'objective' => $objectivePractice ? $this->formatPracticeData($objectivePractice) : null,
                    'subjective' => $subjectivePractice ? $this->formatPracticeData($subjectivePractice) : null
                ],
                'mastery' => $this->calculateTopicMastery($objectiveSessions),
            ];
        }
        
        $sections[] = $section;
    }

    return ['id' => 1, 'sections' => $sections];
}

    /**
     * Format practice session data
     */
    private function formatPracticeData($session)
    {
        $totalQuestions = (int) ($session->total_questions ?? 0);
        if ($totalQuestions === 0 && (float) $session->score > 0) {
            $totalQuestions = (int) round(
                ((int) $session->total_correct * 100) / (float) $session->score
            );
        }
        if ($totalQuestions === 0) {
            $totalQuestions = (int) $session->total_correct + (int) $session->total_skipped;
        }
        $averageTime = $totalQuestions > 0 ? $session->total_time_seconds / $totalQuestions : 0;
        
        return [
            'score' => (float)$session->score,
            'total_correct' => (int)$session->total_correct,
            'total_questions' => $totalQuestions,
            'last_practice_at' => date('d/m/Y, g:i A', strtotime($session->created_at)),
            'average_time_per_question' => round($averageTime, 1)
        ];
    }

    /**
     * Calculate a five-level topic status from recent objective practice.
     *
     * Mastery needs evidence of consistency: more than five completed
     * sessions and at least 80% accuracy across the latest five sessions.
     */
    private function calculateTopicMastery($sessions): array
    {
        $sessions = collect($sessions);
        $sessionCount = $sessions->count();

        if ($sessionCount === 0) {
            return [
                'level' => 1,
                'label' => 'Not started',
                'session_count' => 0,
                'recent_session_count' => 0,
                'recent_correct' => 0,
                'recent_questions' => 0,
                'raw_accuracy_percentage' => 0,
                'accuracy_percentage' => 0,
                'inactive_weeks' => 0,
                'inactivity_penalty_percentage' => 0,
            ];
        }

        $recentSessions = $sessions->take(5);
        $recentCorrect = (int) $recentSessions->sum('total_correct');
        $recentQuestions = (int) $recentSessions->sum(function ($session) {
            return $this->formatPracticeData($session)['total_questions'];
        });
        $rawAccuracy = $recentQuestions > 0
            ? round(($recentCorrect / $recentQuestions) * 100)
            : 0;

        // Deduct two percentage points for every full seven-day period
        // since the learner's most recent objective practice for this topic.
        $lastPracticeAt = Carbon::parse($sessions->first()->created_at);
        $inactiveSeconds = $lastPracticeAt->isPast()
            ? (int) $lastPracticeAt->diffInSeconds(now())
            : 0;
        $inactiveWeeks = intdiv($inactiveSeconds, 7 * 24 * 60 * 60);
        $inactivityPenalty = $inactiveWeeks * 2;
        $accuracy = max(0, $rawAccuracy - $inactivityPenalty);

        if ($sessionCount >= 6 && $accuracy >= 80) {
            [$level, $label] = [5, 'Mastered'];
        } elseif ($accuracy >= 60) {
            [$level, $label] = [4, 'Proficient'];
        } elseif ($accuracy >= 40) {
            [$level, $label] = [3, 'Developing'];
        } else {
            [$level, $label] = [2, 'Beginner'];
        }

        return [
            'level' => $level,
            'label' => $label,
            'session_count' => $sessionCount,
            'recent_session_count' => $recentSessions->count(),
            'recent_correct' => $recentCorrect,
            'recent_questions' => $recentQuestions,
            'raw_accuracy_percentage' => $rawAccuracy,
            'accuracy_percentage' => $accuracy,
            'inactive_weeks' => $inactiveWeeks,
            'inactivity_penalty_percentage' => $inactivityPenalty,
        ];
    }

    /**
     * Get subjects by level (if needed)
     */
    public function getSubjectsByLevel($levelId)
    {
        return Cache::remember("subjects_by_level_{$levelId}", 1800, function () use ($levelId) {
            return DB::table('subject')
                ->where('level_id', $levelId)
                ->where('is_active', 1)
                ->select('id', 'abbr', 'name', 'level_id')
                ->get();
        });
    }
}
