import { generateInstance, checkAnswer, createRng } from "../../engine/practice-engine.js";
import { recordAttempt, getProgress, masteryLabel } from "../../engine/progress-store.js";
import { LINEAR_EQUATION_QUESTIONS } from "./linear-equation-questions.js";

// chapterId is passed in by the caller (see js/content/registry.js /
// js/app.js) rather than hardcoded here, so it always matches the single
// source of truth in js/data/curriculum.js.
export function render(container, chapterId) {
  container.innerHTML = `
    <div class="chapter-content">
      <h2>什麼是一元一次方程式？</h2>
      <div class="concept-card">
        <p><strong>一元一次方程式</strong>是只含有「一個未知數」，且未知數的最高次方是「1 次方」的等式，例如：2x + 3 = 9。</p>
        <p>「解方程式」就是找出讓等式成立的那個未知數的值。</p>
      </div>

      <h3>解方程式的唯一合法工具：等量公理</h3>
      <div class="insight">
        <span class="icon">💡</span>
        <p>等式的兩邊同時加上、減去、乘以、除以同一個數（除以時不能是 0），等式仍然成立。解方程式的每一步，都只是在用這個規則，把 x 一步一步孤立出來。</p>
      </div>

      <h3>範例：解 2x + 5 = 13</h3>
      <div class="derivation">
        <div class="step"><span class="label">原式</span><span>2x + 5 = 13</span></div>
        <div class="step"><span class="label">兩邊減 5</span><span>2x = 8</span></div>
        <div class="step"><span class="label">兩邊除以 2</span><span>x = 4</span></div>
      </div>

      <h2>互動示範：找出讓等式成立的 x</h2>
      <div class="demo-area">
        <div class="demo-equation" id="demo-equation">3x − 2 = 7</div>
        <div class="slider-group">
          <label>拖動看看，猜猜 x 是多少 <span id="demo-x-value">0</span></label>
          <input type="range" id="demo-slider" min="-10" max="10" step="1" value="0" />
        </div>
        <div class="demo-values">
          <div class="demo-value-box">
            <div class="demo-label">左邊 3x − 2</div>
            <div class="demo-number" id="demo-lhs">-2</div>
          </div>
          <div class="demo-value-box">
            <div class="demo-label">右邊</div>
            <div class="demo-number">7</div>
          </div>
        </div>
        <div class="balance-indicator unbalanced" id="demo-balance">還沒平衡，繼續試試看</div>
      </div>

      <h2>練習題</h2>
      <div class="practice-area">
        <div class="practice-progress">
          <span id="practice-stats"></span>
          <span class="mastery-pill" id="practice-mastery-pill"></span>
        </div>
        <div class="question-prompt" id="question-prompt"></div>
        <div class="answer-row">
          <input type="text" id="answer-input" placeholder="輸入答案，例如 3 或 3/2" />
          <button id="submit-answer-btn">確認答案</button>
        </div>
        <div id="feedback-area"></div>
        <button class="next-question-btn" id="next-question-btn" style="display:none">下一題</button>
      </div>
    </div>
  `;

  wireInteractiveDemo(container);
  wirePractice(container, chapterId);
}

function wireInteractiveDemo(container) {
  const slider = container.querySelector("#demo-slider");
  const xValueEl = container.querySelector("#demo-x-value");
  const lhsEl = container.querySelector("#demo-lhs");
  const balanceEl = container.querySelector("#demo-balance");

  const a = 3;
  const b = -2;
  const c = 7;

  function update() {
    const x = Number(slider.value);
    const lhs = a * x + b;
    xValueEl.textContent = x;
    lhsEl.textContent = lhs;

    const balanced = lhs === c;
    balanceEl.textContent = balanced ? "⚖️ 平衡了！這就是方程式的解" : "還沒平衡，繼續試試看";
    balanceEl.classList.toggle("balanced", balanced);
    balanceEl.classList.toggle("unbalanced", !balanced);
  }

  slider.addEventListener("input", update);
  update();
}

function wirePractice(container, chapterId) {
  const promptEl = container.querySelector("#question-prompt");
  const answerInput = container.querySelector("#answer-input");
  const submitBtn = container.querySelector("#submit-answer-btn");
  const feedbackEl = container.querySelector("#feedback-area");
  const nextBtn = container.querySelector("#next-question-btn");
  const statsEl = container.querySelector("#practice-stats");
  const masteryPillEl = container.querySelector("#practice-mastery-pill");

  let currentInstance = null;
  let answered = false;

  function pickRandomQuestionDef() {
    const index = Math.floor(Math.random() * LINEAR_EQUATION_QUESTIONS.length);
    return LINEAR_EQUATION_QUESTIONS[index];
  }

  function refreshProgressUI() {
    const progress = getProgress(window.localStorage, chapterId);
    statsEl.textContent = `已作答 ${progress.attempts.length} 次`;
    masteryPillEl.textContent = masteryLabel(progress.mastered);
    masteryPillEl.classList.toggle("mastered", progress.mastered);
    masteryPillEl.classList.toggle("practicing", !progress.mastered);
  }

  function loadNewQuestion() {
    const questionDef = pickRandomQuestionDef();
    const rng = createRng(Math.floor(Math.random() * 1e9));
    currentInstance = generateInstance(questionDef, rng);
    answered = false;

    promptEl.textContent = currentInstance.prompt;
    answerInput.value = "";
    answerInput.disabled = false;
    submitBtn.disabled = false;
    feedbackEl.innerHTML = "";
    nextBtn.style.display = "none";
    answerInput.focus();
  }

  function submitAnswer() {
    if (answered || !currentInstance) return;
    const result = checkAnswer(currentInstance, answerInput.value);
    answered = true;

    recordAttempt(window.localStorage, chapterId, { correct: result.correct, timestamp: Date.now() });

    feedbackEl.innerHTML = result.correct
      ? `<div class="feedback correct">✅ 答對了！${currentInstance.explanation}</div>`
      : `<div class="feedback incorrect">❌ 再想想。提示：${result.hint}<br>解析：${currentInstance.explanation}</div>`;

    answerInput.disabled = true;
    submitBtn.disabled = true;
    nextBtn.style.display = "inline-block";
    refreshProgressUI();
  }

  submitBtn.addEventListener("click", submitAnswer);
  answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") submitAnswer();
  });
  nextBtn.addEventListener("click", loadNewQuestion);

  refreshProgressUI();
  loadNewQuestion();
}
