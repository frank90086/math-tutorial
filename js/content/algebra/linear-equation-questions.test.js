import { test } from "node:test";
import assert from "node:assert/strict";
import { generateInstance, checkAnswer, createRng } from "../../engine/practice-engine.js";
import { LINEAR_EQUATION_QUESTIONS } from "./linear-equation-questions.js";

function assertValidInstance(instance) {
  assert.equal(typeof instance.prompt, "string");
  assert.ok(instance.prompt.length > 0);
  assert.equal(typeof instance.answer, "number");
  assert.equal(typeof instance.explanation, "string");
  assert.ok(instance.explanation.length > 0);
  assert.equal(typeof instance.hint, "string");
  assert.ok(instance.hint.length > 0);
}

test("題庫裡每一題都通過練習題引擎的 schema 驗證，且自己的答案能對上", () => {
  for (const questionDef of LINEAR_EQUATION_QUESTIONS) {
    const rng = createRng(1);
    const instance = generateInstance(questionDef, rng);
    assertValidInstance(instance);
    assert.equal(checkAnswer(instance, String(instance.answer)).correct, true, `題目 ${questionDef.id} 的答案沒有通過驗證`);
  }
});

test("每個參數化模板換 20 個種子都能穩定產生合法題目，且答案都驗證得過", () => {
  const templates = LINEAR_EQUATION_QUESTIONS.filter((q) => q.kind === "template");
  assert.ok(templates.length > 0, "應該至少要有一個參數化模板");

  for (const questionDef of templates) {
    for (let seed = 1; seed <= 20; seed++) {
      const instance = generateInstance(questionDef, createRng(seed));
      assertValidInstance(instance);
      assert.equal(checkAnswer(instance, String(instance.answer)).correct, true);
    }
  }
});

test("題庫涵蓋至少兩種題型：考古題（固定題）與參數化模板都要有", () => {
  const fixedCount = LINEAR_EQUATION_QUESTIONS.filter((q) => q.kind === "fixed").length;
  const templateCount = LINEAR_EQUATION_QUESTIONS.filter((q) => q.kind === "template").length;

  assert.ok(fixedCount >= 2, "考古題（固定題）應該至少有 2 題");
  assert.ok(templateCount >= 2, "參數化模板應該至少有 2 種不同題型");
});

test("兩題會考考古題改寫後，答案仍與官方解答一致", () => {
  const budgetQuestion = LINEAR_EQUATION_QUESTIONS.find((q) => q.id === "alg-7a-3-exam-111-q11");
  const ratioQuestion = LINEAR_EQUATION_QUESTIONS.find((q) => q.id === "alg-7a-3-exam-109-q16");

  assert.ok(budgetQuestion, "應該要有改寫自 111 年會考第 11 題的題目");
  assert.ok(ratioQuestion, "應該要有改寫自 109 年會考第 16 題的題目");

  assert.equal(generateInstance(budgetQuestion).answer, 5800);
  assert.equal(generateInstance(ratioQuestion).answer, 72);
});

test("折扣預算模板：窮舉大量種子，折扣後價錢一定是整數，且確實比預算少（不會出現浮點誤差或負數/零折扣差）", () => {
  const template = LINEAR_EQUATION_QUESTIONS.find((q) => q.id === "alg-7a-3-template-discount-budget");
  assert.ok(template, "應該要有折扣預算模板");

  for (let seed = 1; seed <= 500; seed++) {
    const instance = generateInstance(template, createRng(seed));

    assert.ok(Number.isInteger(instance.answer), `seed=${seed} 的答案不是整數`);
    assert.ok(
      instance.prompt.match(/少\s*(-?\d+(\.\d+)?)\s*元/)[1] > 0,
      `seed=${seed} 的題目文字裡「比預算少」的金額應該要是正數：${instance.prompt}`
    );
    assert.doesNotMatch(instance.prompt, /\.\d{3,}/, `seed=${seed} 的題目文字出現浮點誤差：${instance.prompt}`);
    assert.doesNotMatch(instance.explanation, /\.\d{3,}/, `seed=${seed} 的解析出現浮點誤差：${instance.explanation}`);
    assert.equal(checkAnswer(instance, String(instance.answer)).correct, true);
  }
});
