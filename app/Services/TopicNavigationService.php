<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class TopicNavigationService
{
    /**
     * Find the next visible learning unit that has active questions of the
     * requested type. Parents with published children are section headings,
     * while a parent without children is itself a practice topic.
     */
    public function nextPracticeTopic(
        int $currentTopicId,
        int $subjectId,
        int $levelId,
        int $questionTypeId
    ): ?array {
        $rows = DB::table('topics as parent')
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
                'child.id as child_id',
                'child.name as child_name',
            ])
            ->get();

        if ($rows->isEmpty()) {
            return null;
        }

        $grouped = $rows->groupBy('parent_id');
        $topics = collect();

        foreach ($grouped as $parentRows) {
            $children = $parentRows->whereNotNull('child_id');

            if ($children->isNotEmpty()) {
                foreach ($children as $child) {
                    $topics->push([
                        'id' => (int) $child->child_id,
                        'name' => $child->child_name,
                        'section_id' => (int) $child->parent_id,
                        'section_title' => $child->parent_name,
                    ]);
                }
            } else {
                $parent = $parentRows->first();
                $topics->push([
                    'id' => (int) $parent->parent_id,
                    'name' => $parent->parent_name,
                    'section_id' => (int) $parent->parent_id,
                    'section_title' => $parent->parent_name,
                ]);
            }
        }

        $availableTopicIds = DB::table('questions')
            ->whereIn('topic_id', $topics->pluck('id'))
            ->where('question_type_id', $questionTypeId)
            ->where('is_active', 1)
            ->distinct()
            ->pluck('topic_id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $topics = $topics
            ->filter(fn ($topic) => in_array($topic['id'], $availableTopicIds, true))
            ->values();

        $currentIndex = $topics->search(
            fn ($topic) => $topic['id'] === $currentTopicId
        );

        if ($currentIndex === false || !$topics->has($currentIndex + 1)) {
            return null;
        }

        return $topics->get($currentIndex + 1);
    }
}
