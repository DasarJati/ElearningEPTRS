// Exports the Quiz Arena question pools to resources/data/quiz_bank.json so the
// server can pick questions and check answers (the answers never reach the browser).
// Edit the question files in resources/js/Data, then run: npm run quiz:export
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import mathematic from '../resources/js/Data/StandardMathematicQuestions.js';
import science from '../resources/js/Data/StandardScienceQuestions.js';
import kemahiranHidup from '../resources/js/Data/KemahiranHidupQuestions.js';
import generalKnowledge from '../resources/js/Data/GeneralKnowledgeQuestionBank.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(root, 'resources/data/quiz_bank.json');
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const errors = [];

const normalizePool = (poolName, questions) => questions.map((q, index) => {
  const id = String(q.id ?? `${poolName}_${index}`);
  const where = `${poolName} #${index + 1} (id ${id})`;

  if (!q.question) errors.push(`${where}: missing question text`);
  if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: needs at least 2 options`);
  if (!Number.isInteger(q.correctAnswer) || !q.options?.[q.correctAnswer]) errors.push(`${where}: correctAnswer out of range`);
  if (new Set(q.options).size !== q.options?.length) errors.push(`${where}: duplicate options`);
  if (!DIFFICULTIES.includes(q.difficulty)) errors.push(`${where}: difficulty must be ${DIFFICULTIES.join('/')}`);

  return {
    id,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation ?? '',
    category: q.category ?? poolName,
    difficulty: q.difficulty,
  };
});

const bank = {
  pools: {
    mathematic: normalizePool('mathematic', mathematic),
    science: normalizePool('science', science),
    kemahiran_hidup: normalizePool('kemahiran_hidup', kemahiranHidup),
  },
  general: Object.fromEntries(
    Object.entries(generalKnowledge).map(([topic, questions]) => [topic, normalizePool(topic, questions)])
  ),
};

if (errors.length) {
  console.error(`Quiz bank has ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(bank, null, 2) + '\n');

const count = [...Object.values(bank.pools), ...Object.values(bank.general)].flat().length;
console.log(`Exported ${count} quiz questions to resources/data/quiz_bank.json`);
