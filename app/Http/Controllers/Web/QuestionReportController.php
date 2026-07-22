<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class QuestionReportController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            'question_code' => ['nullable', 'string', 'max:100'],
            'subject_id' => ['nullable', 'integer'],
            'topic_id' => ['nullable', 'integer'],
            'report_type' => [
                'required',
                Rule::in(['incorrect_answer', 'broken_image', 'text_issue', 'not_understood', 'other']),
            ],
            'details' => ['nullable', 'string', 'max:1500'],
            'context' => ['nullable', 'string', 'max:60'],
            'page_url' => ['nullable', 'url', 'max:2000'],
            'metadata' => ['nullable', 'array'],
            'metadata.question_number' => ['nullable', 'integer', 'min:1'],
            'metadata.selected_answer_id' => ['nullable', 'integer'],
        ]);

        // Resolve the code from the database so the report cannot contain a
        // mismatched client-supplied question ID/code pair.
        $question = Question::query()
            ->select(['id', 'question_code'])
            ->findOrFail($validated['question_id']);

        $report = QuestionReport::create([
            ...$validated,
            'user_id' => $request->user()->id,
            // Always use the database value; the client value is only useful
            // for diagnostics and must never override the authoritative code.
            'question_code' => $question->question_code,
            'status' => 'open',
        ]);

        return response()->json([
            'message' => 'Thank you. Your report has been sent for review.',
            'report_id' => $report->id,
            'question_id' => $report->question_id,
            'question_code' => $report->question_code,
        ], 201);
    }
}
