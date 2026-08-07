<?php

namespace App\Http\Controllers\Web;
use App\Http\Controllers\Controller;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\School;
use App\Models\Level;
use App\Models\Student;
use App\Models\QuizSession;
use App\Models\User;
use App\Models\Friend;
use App\Models\FriendRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
public function index()
{
    $dashboardStats = $this->emptyDashboardStats();
    $activityCalendar = $this->emptyActivityCalendar();

    // Check if user is authenticated
    if (Auth::check()) {
        $user = Auth::user();
        $user->load('student');
        
        // Get the student profile data
        $student = Student::with(['school', 'level'])
            ->where('user_id', $user->id)
            ->first();

        // Get friends data
        $friends = $this->getFriendsData($user);
        
        // Get pending friend requests
        $pendingRequests = $this->getPendingRequests($user);
        $dashboardStats = $this->calculateDashboardStats($user->id);
        $activityCalendar = $this->buildMonthlyActivityCalendar($user->id);

        // Prepare profile data from student information
        $profileData = [
            'name' => $student ? $student->name : $user->name,
            'email' => $student ? $student->email : $user->email,
            'school' => $student && $student->school ? $student->school->name : 'Add your school',
            'grade' => $student->class_name ?? 'Form 5',
            'display_name' => $student ? $student->display_name : $user->display_name,
            'profile_picture' => $user->profile_picture ?? null,
        ];
        
        $authData = ['user' => $user];
        
    } else {
        // For non-authenticated users
        $profileData = [
            'name' => 'Guest User',
            'email' => 'guest@example.com',
            'school' => 'Not specified',
            'grade' => 'Form 5',
            'display_name' => 'Guest'
        ];
        
        $friends = [];
        $pendingRequests = [];
        $student = null;
        $authData = null;
    }

    // Get quiz sessions for leaderboard
    $quizSessions = QuizSession::with('school')
        ->orderBy('total_correct', 'desc')
        ->orderBy('total_time_seconds', 'asc')
        ->limit(7)
        ->get();

    // Show every active course with progress calculated from the learner's
    // latest practice result for each published topic.
    $courses = $this->getDashboardCourses(Auth::id());

    $assignments = [
        [
            'title' => "New Assignment",
            'dueDate' => "Due Jun 26th, 11:59 PM",
            'topic' => "Nombor Dan Operasi",
            'description' => "Objective - Same question set"
        ]
    ];
    
    return Inertia::render('Dashboard', [
        'title' => 'Dashboard',
        'profileData' => $profileData,
        'student' => $student,
        'courses' => $courses,
        'assignments' => $assignments,
        'quizSessions' => $quizSessions,
        'friends' => $friends,
        'pendingRequests' => $pendingRequests,
        'auth' => $authData,
        'dashboardStats' => $dashboardStats,
        'activityCalendar' => $activityCalendar,
    ]);
}

    /**
     * Return all active Form 4 subjects and their real course completion.
     *
     * A topic is complete when the learner's latest objective or subjective
     * practice for that topic has a passing score (70% or higher). This
     * mirrors the completion rule used on the subject course page.
     */
    private function getDashboardCourses(?int $userId): array
    {
        $subjects = DB::table('subject')
            ->where('is_active', 1)
            ->where('level_id', 10)
            ->select('id', 'name', 'abbr', 'level_id', 'seq')
            ->orderBy('seq')
            ->get();

        if ($subjects->isEmpty()) {
            return [];
        }

        $subjectIds = $subjects->pluck('id');
        $learningUnits = DB::table('topics as parent')
            ->leftJoin('topics as child', function ($join) {
                $join->on('child.parent_id', '=', 'parent.id')
                    ->where('child.is_active', 1)
                    ->where('child.is_published', 1);
            })
            ->whereIn('parent.subject_id', $subjectIds)
            ->where('parent.level_id', 10)
            ->where(function ($query) {
                $query->whereNull('parent.parent_id')
                    ->orWhere('parent.parent_id', 0);
            })
            ->where('parent.is_active', 1)
            ->where('parent.is_published', 1)
            ->selectRaw('parent.subject_id')
            ->selectRaw('COALESCE(child.id, parent.id) as topic_id')
            ->selectRaw('COALESCE(child.name, parent.name) as topic_name')
            ->distinct()
            ->get();

        $unitsBySubject = $learningUnits->groupBy('subject_id');
        $latestPractice = collect();

        if ($userId && $learningUnits->isNotEmpty()) {
            $unitTopicIds = $learningUnits->pluck('topic_id')->unique()->values();

            $latestPractice = DB::table('practice_session')
                ->where('user_id', $userId)
                ->whereIn('subject_id', $subjectIds)
                ->whereIn('question_type_id', [1, 2])
                ->where(function ($query) use ($unitTopicIds) {
                    $query->whereIn('subtopic_id', $unitTopicIds)
                        ->orWhere(function ($topicQuery) use ($unitTopicIds) {
                            $topicQuery->where(function ($subtopicQuery) {
                                $subtopicQuery->whereNull('subtopic_id')
                                    ->orWhere('subtopic_id', 0);
                            })->whereIn('topic_id', $unitTopicIds);
                        });
                })
                ->select([
                    'subject_id',
                    'topic_id',
                    'subtopic_id',
                    'question_type_id',
                    'score',
                    'created_at',
                ])
                ->orderByDesc('created_at')
                ->orderByDesc('id')
                ->get()
                ->map(function ($session) {
                    $session->course_topic_id = $session->subtopic_id
                        ? (int) $session->subtopic_id
                        : (int) $session->topic_id;

                    return $session;
                })
                ->unique(fn ($session) => $session->course_topic_id . ':' . $session->question_type_id);
        }

        return $subjects->map(function ($subject) use ($unitsBySubject, $latestPractice) {
            $units = $unitsBySubject->get($subject->id, collect());
            $completed = $units->filter(function ($unit) use ($latestPractice) {
                return $latestPractice->contains(function ($session) use ($unit) {
                    return $session->course_topic_id === (int) $unit->topic_id
                        && (float) $session->score >= 70;
                });
            })->count();
            $total = $units->count();

            return [
                'id' => (int) $subject->id,
                'name' => $subject->name,
                'abbr' => $subject->abbr,
                'level_id' => (int) $subject->level_id,
                'progress' => $completed,
                'total' => $total,
                'progress_percentage' => $total > 0
                    ? (int) round(($completed / $total) * 100)
                    : 0,
                'topic' => $total > 0
                    ? "{$completed} of {$total} topics completed"
                    : 'Course content is coming soon',
            ];
        })->all();
    }

    /**
     * Build the current month's learning calendar.
     *
     * Completing a session requires authentication, so historical completed
     * sessions are also treated as verified login dates.
     */
    private function buildMonthlyActivityCalendar(int $userId): array
    {
        $today = Carbon::today();
        $monthStart = $today->copy()->startOfMonth();
        $monthEnd = $today->copy()->endOfMonth();

        $loginDates = DB::table('user_login_activities')
            ->where('user_id', $userId)
            ->whereBetween('login_date', [
                $monthStart->toDateString(),
                $monthEnd->toDateString(),
            ])
            ->pluck('login_date')
            ->map(fn ($date) => Carbon::parse($date)->toDateString())
            ->flip();

        $sessionDates = DB::table('practice_session')
            ->where('user_id', $userId)
            ->whereNotNull('end_at')
            ->whereBetween('end_at', [
                $monthStart->copy()->startOfDay(),
                $monthEnd->copy()->endOfDay(),
            ])
            ->selectRaw('DATE(end_at) as activity_date')
            ->selectRaw('COUNT(*) as sessions_completed')
            ->groupByRaw('DATE(end_at)')
            ->pluck('sessions_completed', 'activity_date');

        $days = collect(range(1, $monthStart->daysInMonth))
            ->map(function (int $day) use ($monthStart, $today, $loginDates, $sessionDates) {
                $date = $monthStart->copy()->day($day);
                $dateKey = $date->toDateString();
                $completedSessions = (int) ($sessionDates[$dateKey] ?? 0);
                $loggedIn = $loginDates->has($dateKey) || $completedSessions > 0;

                return [
                    'date' => $dateKey,
                    'day' => $day,
                    'is_today' => $date->isSameDay($today),
                    'is_future' => $date->isAfter($today),
                    'logged_in' => $loggedIn,
                    'sessions_completed' => $completedSessions,
                    'is_active' => $loggedIn && $completedSessions > 0,
                ];
            });

        $weekStart = $today->copy()->startOfWeek(Carbon::MONDAY);
        $weekEnd = $today->copy()->endOfWeek(Carbon::SUNDAY);
        $weeklyCompleted = $days
            ->filter(fn ($day) => $day['is_active'])
            ->filter(function ($day) use ($weekStart, $weekEnd) {
                return Carbon::parse($day['date'])->betweenIncluded($weekStart, $weekEnd);
            })
            ->count();

        return [
            'month_label' => $monthStart->format('F Y'),
            'days_in_month' => $monthStart->daysInMonth,
            'first_day_offset' => $monthStart->dayOfWeekIso - 1,
            'days' => $days->values(),
            'active_days' => $days->where('is_active', true)->count(),
            'login_days' => $days->where('logged_in', true)->count(),
            'weekly_goal' => 5,
            'weekly_completed' => $weeklyCompleted,
        ];
    }

    private function emptyActivityCalendar(): array
    {
        return [
            'month_label' => now()->format('F Y'),
            'days_in_month' => now()->daysInMonth,
            'first_day_offset' => now()->startOfMonth()->dayOfWeekIso - 1,
            'days' => [],
            'active_days' => 0,
            'login_days' => 0,
            'weekly_goal' => 5,
            'weekly_completed' => 0,
        ];
    }

    /**
     * Calculate objective-practice performance from first-attempt records.
     *
     * Skipped questions remain in the denominator so a partially completed
     * session cannot become the student's best score unfairly.
     */
    private function calculateDashboardStats(int $userId): array
    {
        $sessions = DB::table('practice_session as ps')
            ->leftJoin('quiz_attempts as qa', function ($join) use ($userId) {
                $join->on('qa.session_id', '=', 'ps.id')
                    ->where('qa.user_id', '=', $userId)
                    ->where('qa.question_type_id', '=', 1);
            })
            ->where('ps.user_id', $userId)
            ->where('ps.question_type_id', 1)
            ->select([
                'ps.id',
                'ps.total_skipped',
                'ps.total_time_seconds',
                'ps.created_at',
            ])
            ->selectRaw('COUNT(DISTINCT qa.question_id) as total_answered')
            ->selectRaw('COUNT(DISTINCT CASE WHEN qa.answer_status = 1 THEN qa.question_id END) as total_correct')
            ->groupBy(
                'ps.id',
                'ps.total_skipped',
                'ps.total_time_seconds',
                'ps.created_at'
            )
            ->get()
            ->map(function ($session) {
                $answered = (int) $session->total_answered;
                $skipped = max(0, (int) $session->total_skipped);
                $correct = (int) $session->total_correct;
                $totalQuestions = $answered > 0
                    ? $answered
                    : $correct + $skipped;

                return [
                    'session_id' => (int) $session->id,
                    'total_answered' => $answered,
                    'total_correct' => $correct,
                    'total_skipped' => $skipped,
                    'total_questions' => $totalQuestions,
                    'percentage' => $totalQuestions > 0
                        ? round(($correct / $totalQuestions) * 100, 1)
                        : 0,
                    'total_time_seconds' => (int) ($session->total_time_seconds ?? 0),
                    'completed_at' => $session->created_at,
                ];
            })
            ->filter(fn ($session) => $session['total_questions'] > 0)
            ->values();

        if ($sessions->isEmpty()) {
            return $this->emptyDashboardStats();
        }

        $bestSession = $sessions
            ->sort(function ($left, $right) {
                $leftTime = $left['total_time_seconds'] > 0
                    ? $left['total_time_seconds']
                    : PHP_INT_MAX;
                $rightTime = $right['total_time_seconds'] > 0
                    ? $right['total_time_seconds']
                    : PHP_INT_MAX;

                return ($right['percentage'] <=> $left['percentage'])
                    ?: ($right['total_questions'] <=> $left['total_questions'])
                    ?: ($leftTime <=> $rightTime)
                    ?: strcmp((string) $right['completed_at'], (string) $left['completed_at']);
            })
            ->first();

        $totalCorrect = $sessions->sum('total_correct');
        $totalAnswered = $sessions->sum('total_answered');
        $totalQuestions = $sessions->sum('total_questions');

        return [
            'practice_sessions' => $sessions->count(),
            'total_answered' => $totalAnswered,
            'total_correct' => $totalCorrect,
            'total_questions' => $totalQuestions,
            'accuracy_percentage' => $totalQuestions > 0
                ? round(($totalCorrect / $totalQuestions) * 100, 1)
                : 0,
            'best_session' => $bestSession,
        ];
    }

    private function emptyDashboardStats(): array
    {
        return [
            'practice_sessions' => 0,
            'total_answered' => 0,
            'total_correct' => 0,
            'total_questions' => 0,
            'accuracy_percentage' => 0,
            'best_session' => null,
        ];
    }

    /**
     * Get friends data for the current user
     */
    private function getFriendsData($user)
    {
        return Friend::where('user_id', $user->id)
            ->orWhere('friend_id', $user->id)
            ->with(['user.student.school', 'friend.student.school'])
            ->get()
            ->map(function ($friend) use ($user) {
                // Determine if the user is the initiator or receiver
                $friendUser = $friend->user_id == $user->id ? $friend->friend : $friend->user;
                
                return [
                    'id' => $friend->id,
                    'friend_id' => $friendUser->id,
                    'name' => $friendUser->display_name ?? $friendUser->name,
                    'avatar' => $this->getAvatarInitials($friendUser->display_name ?? $friendUser->name),
                    'avatarColor' => $this->getAvatarColor($friendUser->id),
                    'status' => 'online', // You can implement actual online status logic
                    'mutualFriends' => $this->getMutualFriendsCount($user->id, $friendUser->id),
                    'school' => $friendUser->student->school->name ?? 'Unknown School',
                ];
            });
    }

    /**
     * Get pending friend requests for the current user
     */
    private function getPendingRequests($user)
    {
        return FriendRequest::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with(['user.student.school'])
            ->get()
            ->map(function ($request) use ($user) {
                return [
                    'id' => $request->id,
                    'requester_id' => $request->requester_id,
                    'name' => $request->user->display_name ?? $request->user->name,
                    'avatar' => $this->getAvatarInitials($request->user->display_name ?? $request->user->name),
                    'mutualFriends' => $this->getMutualFriendsCount($user->id, $request->requester_id),
                ];
            });
    }

    /**
     * Get mutual friends count between two users
     */
    private function getMutualFriendsCount($userId1, $userId2)
    {
        $user1Friends = Friend::where('user_id', $userId1)
            ->orWhere('friend_id', $userId1)
            ->get()
            ->map(function ($friend) use ($userId1) {
                return $friend->user_id == $userId1 ? $friend->friend_id : $friend->user_id;
            })
            ->toArray();

        $user2Friends = Friend::where('user_id', $userId2)
            ->orWhere('friend_id', $userId2)
            ->get()
            ->map(function ($friend) use ($userId2) {
                return $friend->user_id == $userId2 ? $friend->friend_id : $friend->user_id;
            })
            ->toArray();

        $mutualFriends = array_intersect($user1Friends, $user2Friends);
        
        return count($mutualFriends);
    }

    /**
     * Generate avatar initials from name
     */
    private function getAvatarInitials($name)
    {
        return collect(explode(' ', $name))
            ->map(fn($word) => strtoupper(substr($word, 0, 1)))
            ->take(2)
            ->join('');
    }

    /**
     * Generate consistent avatar color based on user ID
     */
    private function getAvatarColor($userId)
    {
        $colors = [
            'bg-gradient-to-r from-blue-400 to-purple-500',
            'bg-gradient-to-r from-green-400 to-teal-500',
            'bg-gradient-to-r from-pink-400 to-red-500',
            'bg-gradient-to-r from-yellow-400 to-orange-500',
            'bg-gradient-to-r from-indigo-400 to-blue-500',
        ];

        return $colors[$userId % count($colors)];
    }
    
    /**
     * Get user statistics for dashboard
     */
    public function getUserStats()
    {
        $user = Auth::user();

        // Get user's quiz performance
        $userQuizSessions = QuizSession::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalQuizzes = $userQuizSessions->count();
        $averageScore = $userQuizSessions->avg('total_correct');
        $bestScore = $userQuizSessions->max('total_correct');

        // Get user's rank
        $userRank = $this->calculateUserRank($user->id);

        return [
            'totalQuizzes' => $totalQuizzes,
            'averageScore' => round($averageScore, 1),
            'bestScore' => $bestScore,
            'currentRank' => $userRank,
        ];
    }

    /**
     * Calculate user's rank based on quiz performance
     */
    private function calculateUserRank($userId)
    {
        // Get all users with their best scores and fastest times
        $rankedUsers = QuizSession::select('user_id')
            ->selectRaw('MAX(total_correct) as best_score')
            ->selectRaw('MIN(total_time_seconds) as best_time')
            ->groupBy('user_id')
            ->orderBy('best_score', 'desc')
            ->orderBy('best_time', 'asc')
            ->get();

        $rank = 1;
        foreach ($rankedUsers as $rankedUser) {
            if ($rankedUser->user_id == $userId) {
                return $rank;
            }
            $rank++;
        }

        return null; // User not found in rankings
    }

    /**
     * Get leaderboard data with pagination
     */
    public function getLeaderboard(Request $request)
    {
        $perPage = $request->get('per_page', 20);
        
        $leaderboard = QuizSession::with('school', 'user')
            ->select('user_id')
            ->selectRaw('MAX(total_correct) as best_score')
            ->selectRaw('MIN(total_time_seconds) as best_time')
            ->selectRaw('COUNT(*) as quiz_count')
            ->groupBy('user_id')
            ->orderBy('best_score', 'desc')
            ->orderBy('best_time', 'asc')
            ->paginate($perPage);

        return response()->json($leaderboard);
    }

    /**
     * Get recent activity for dashboard
     */
    public function getRecentActivity()
    {
        $user = Auth::user();

        $recentQuizzes = QuizSession::with('school')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($quiz) {
                return [
                    'type' => 'quiz',
                    'title' => 'Quiz Completed',
                    'description' => "Scored {$quiz->total_correct}/5 in {$quiz->total_time_seconds} seconds",
                    'date' => $quiz->created_at->diffForHumans(),
                    'score' => $quiz->total_correct,
                    'time' => $quiz->total_time_seconds,
                ];
            });

        return $recentQuizzes;
    }
}
