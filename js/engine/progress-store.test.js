import { test } from "node:test";
import assert from "node:assert/strict";
import { recordAttempt, getProgress, masteryLabel } from "./progress-store.js";

// Mimics the real Web Storage API surface (including `clear()` and key
// enumeration) so tests never need to know progress-store.js's internal
// key-naming scheme.
function createFakeStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear(),
    keys: () => [...data.keys()],
  };
}

test("recordAttempt 寫入的作答紀錄可以透過 getProgress 正確讀回", () => {
  const storage = createFakeStorage();

  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 1000 });

  const progress = getProgress(storage, "alg-7a-3");

  assert.equal(progress.attempts.length, 1);
  assert.equal(progress.attempts[0].correct, true);
  assert.equal(progress.attempts[0].timestamp, 1000);
});

test("多次作答會依序累積，且不同章節的紀錄互不干擾", () => {
  const storage = createFakeStorage();

  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 1000 });
  recordAttempt(storage, "alg-7a-3", { correct: false, timestamp: 2000 });
  recordAttempt(storage, "geo-8a-1", { correct: true, timestamp: 3000 });

  const alg = getProgress(storage, "alg-7a-3");
  const geo = getProgress(storage, "geo-8a-1");

  assert.deepEqual(
    alg.attempts.map((a) => a.correct),
    [true, false]
  );
  assert.equal(geo.attempts.length, 1);
});

test("練熟規則：最近連續 3 次答對才算已練熟，否則未練熟", () => {
  const storage = createFakeStorage();

  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 1000 });
  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 2000 });
  assert.equal(getProgress(storage, "alg-7a-3").mastered, false);

  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 3000 });
  assert.equal(getProgress(storage, "alg-7a-3").mastered, true);

  recordAttempt(storage, "alg-7a-3", { correct: false, timestamp: 4000 });
  assert.equal(getProgress(storage, "alg-7a-3").mastered, false);
});

test("getProgress 回傳最近一次練習時間，沒有作答紀錄時為 null", () => {
  const storage = createFakeStorage();

  assert.equal(getProgress(storage, "alg-7a-3").lastPracticedAt, null);

  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 1000 });
  recordAttempt(storage, "alg-7a-3", { correct: false, timestamp: 5000 });

  assert.equal(getProgress(storage, "alg-7a-3").lastPracticedAt, 5000);
});

test("清除瀏覽器資料後（storage 被清空），進度會回到初始狀態", () => {
  const storage = createFakeStorage();

  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 1000 });
  storage.clear();

  const progress = getProgress(storage, "alg-7a-3");

  assert.deepEqual(progress.attempts, []);
  assert.equal(progress.mastered, false);
  assert.equal(progress.lastPracticedAt, null);
});

test("storage 裡的資料損毀（非合法 JSON）時不會拋出例外，視為沒有紀錄", () => {
  const storage = createFakeStorage();
  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 1000 });
  const [key] = storage.keys();
  storage.setItem(key, "不是合法的 JSON{{{");

  const progress = getProgress(storage, "alg-7a-3");

  assert.deepEqual(progress.attempts, []);
  assert.equal(progress.mastered, false);
});

test("storage 裡的資料是合法 JSON 但不是陣列（例如遭竄改）時，視為沒有紀錄而不是拋出例外", () => {
  const storage = createFakeStorage();
  recordAttempt(storage, "alg-7a-3", { correct: true, timestamp: 1000 });
  const [key] = storage.keys();
  storage.setItem(key, JSON.stringify({ not: "an array" }));

  const progress = getProgress(storage, "alg-7a-3");

  assert.deepEqual(progress.attempts, []);
  assert.equal(progress.mastered, false);
  assert.equal(progress.lastPracticedAt, null);
});

test("masteryLabel 把 mastered 布林值轉成中文標籤", () => {
  assert.equal(masteryLabel(true), "已練熟");
  assert.equal(masteryLabel(false), "尚未練熟");
});
