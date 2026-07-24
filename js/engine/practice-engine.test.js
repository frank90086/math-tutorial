import { test } from "node:test";
import assert from "node:assert/strict";
import { generateInstance, checkAnswer, createRng } from "./practice-engine.js";

test("固定題目（考古題）產生的實例保留 prompt/answer/explanation/hint", () => {
  const fixedQuestion = {
    id: "alg-7a-3-past-2023-q5",
    kind: "fixed",
    prompt: "解方程式：2x + 3 = 9",
    answer: 3,
    explanation: "2x + 3 = 9 → 2x = 6 → x = 3",
    hint: "先把常數項移到等號右邊。",
  };

  const instance = generateInstance(fixedQuestion);

  assert.equal(instance.prompt, "解方程式：2x + 3 = 9");
  assert.equal(instance.answer, 3);
  assert.equal(instance.explanation, "2x + 3 = 9 → 2x = 6 → x = 3");
  assert.equal(instance.hint, "先把常數項移到等號右邊。");
});

test("checkAnswer 對數字答案給出正確的對/錯判斷", () => {
  const instance = { answer: 3 };

  assert.equal(checkAnswer(instance, "3").correct, true);
  assert.equal(checkAnswer(instance, "5").correct, false);
});

test("createRng 用相同種子會重現相同的數列，不同種子則不同", () => {
  const a1 = createRng(42);
  const a2 = createRng(42);
  const b = createRng(7);

  const sequenceA1 = [a1(), a1(), a1()];
  const sequenceA2 = [a2(), a2(), a2()];
  const sequenceB = [b(), b(), b()];

  assert.deepEqual(sequenceA1, sequenceA2);
  assert.notDeepEqual(sequenceA1, sequenceB);
  for (const value of sequenceA1) {
    assert.ok(value >= 0 && value < 1);
  }
});

test("參數化模板題目：generateInstance 用抽樣參數組出 prompt/answer/explanation/hint", () => {
  // 範例模板：ax + b = c，解 x = (c - b) / a
  const templateQuestion = {
    id: "alg-7a-3-template-linear",
    kind: "template",
    sampleParams: () => ({ a: 2, b: 3, c: 9 }),
    buildPrompt: ({ a, b, c }) => `解方程式：${a}x + ${b} = ${c}`,
    computeAnswer: ({ a, b, c }) => (c - b) / a,
    explain: ({ a, b, c }) => `${a}x + ${b} = ${c} → ${a}x = ${c - b} → x = ${(c - b) / a}`,
    hint: () => "先把常數項移到等號右邊。",
  };

  const instance = generateInstance(templateQuestion, createRng(1));

  assert.equal(instance.prompt, "解方程式：2x + 3 = 9");
  assert.equal(instance.answer, 3);
  assert.equal(instance.explanation, "2x + 3 = 9 → 2x = 6 → x = 3");
  assert.equal(instance.hint, "先把常數項移到等號右邊。");
});

function randomIntInclusive(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

const varyingLinearTemplate = {
  id: "alg-7a-3-template-linear-varying",
  kind: "template",
  sampleParams: (rng) => ({
    a: randomIntInclusive(rng, 2, 9),
    b: randomIntInclusive(rng, 1, 20),
    x: randomIntInclusive(rng, -10, 10),
  }),
  buildPrompt: ({ a, b, x }) => `解方程式：${a}x + ${b} = ${a * x + b}`,
  computeAnswer: ({ x }) => x,
  explain: ({ a, b, x }) => `${a}x + ${b} = ${a * x + b} → x = ${x}`,
  hint: () => "先把常數項移到等號右邊，再除以 x 的係數。",
};

test("同一個模板用不同種子會產生不同題目，且每次都能通過自己的答案驗證", () => {
  const instanceA = generateInstance(varyingLinearTemplate, createRng(1));
  const instanceB = generateInstance(varyingLinearTemplate, createRng(2));

  assert.notEqual(instanceA.prompt, instanceB.prompt);
  assert.equal(checkAnswer(instanceA, String(instanceA.answer)).correct, true);
  assert.equal(checkAnswer(instanceB, String(instanceB.answer)).correct, true);
});

test("同一個模板用相同種子會重現同一題（可重現性）", () => {
  const instance1 = generateInstance(varyingLinearTemplate, createRng(99));
  const instance2 = generateInstance(varyingLinearTemplate, createRng(99));

  assert.deepEqual(instance1, instance2);
});

test("checkAnswer 回傳結果會附帶該題目的提示", () => {
  const instance = { answer: 3, hint: "先把常數項移到等號右邊。" };

  assert.equal(checkAnswer(instance, "5").hint, "先把常數項移到等號右邊。");
  assert.equal(checkAnswer(instance, "3").hint, "先把常數項移到等號右邊。");
});

test("checkAnswer 邊界案例：分數輸入、前後空白、非數字輸入都不會出錯", () => {
  const instance = { answer: 1.5 };

  assert.equal(checkAnswer(instance, "3/2").correct, true);
  assert.equal(checkAnswer(instance, "  3/2  ").correct, true);
  assert.equal(checkAnswer(instance, "  1.5 ").correct, true);
  assert.equal(checkAnswer(instance, "不是數字").correct, false);
  assert.equal(checkAnswer(instance, "").correct, false);
});

test("checkAnswer 邊界案例：答案剛好是 0 時，交白卷不會被誤判為正確", () => {
  const zeroAnswerInstance = { answer: 0 };

  assert.equal(checkAnswer(zeroAnswerInstance, "").correct, false);
  assert.equal(checkAnswer(zeroAnswerInstance, "0").correct, true);
});
