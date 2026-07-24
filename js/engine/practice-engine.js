const NUMERIC_TOLERANCE = 1e-9;

// mulberry32 — small, dependency-free seedable PRNG so template question
// generation is reproducible in tests.
export function createRng(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateInstance(questionDef, rng) {
  if (questionDef.kind === "template") {
    const params = questionDef.sampleParams(rng);
    return {
      id: questionDef.id,
      prompt: questionDef.buildPrompt(params),
      answer: questionDef.computeAnswer(params),
      explanation: questionDef.explain(params),
      hint: questionDef.hint(params),
    };
  }

  return {
    id: questionDef.id,
    prompt: questionDef.prompt,
    answer: questionDef.answer,
    explanation: questionDef.explanation,
    hint: questionDef.hint,
  };
}

function parseNumericAnswer(rawInput) {
  const trimmed = String(rawInput).trim();
  if (trimmed === "") return NaN;
  const fractionMatch = trimmed.match(/^(-?\d+)\/(\d+)$/);
  if (fractionMatch) {
    const [, numerator, denominator] = fractionMatch;
    return Number(numerator) / Number(denominator);
  }
  return Number(trimmed);
}

export function checkAnswer(instance, userAnswer) {
  const parsed = parseNumericAnswer(userAnswer);
  const correct = Number.isFinite(parsed) && Math.abs(parsed - instance.answer) < NUMERIC_TOLERANCE;
  return { correct, hint: instance.hint };
}
