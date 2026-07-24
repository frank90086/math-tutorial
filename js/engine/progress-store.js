const STORAGE_KEY_PREFIX = "math-progress:v1:";

// 練熟規則：最近連續 MASTERY_STREAK 次作答都答對，就視為已練熟；
// 只要其中一次答錯，就打斷連續紀錄，回到未練熟。
const MASTERY_STREAK = 3;

function storageKey(chapterId) {
  return `${STORAGE_KEY_PREFIX}${chapterId}`;
}

function readAttempts(storage, chapterId) {
  const raw = storage.getItem(storageKey(chapterId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordAttempt(storage, chapterId, attempt) {
  const attempts = readAttempts(storage, chapterId);
  attempts.push({ correct: attempt.correct, timestamp: attempt.timestamp });
  storage.setItem(storageKey(chapterId), JSON.stringify(attempts));
}

export function getProgress(storage, chapterId) {
  const attempts = readAttempts(storage, chapterId);
  const recentStreak = attempts.slice(-MASTERY_STREAK);
  const mastered = recentStreak.length === MASTERY_STREAK && recentStreak.every((a) => a.correct);
  const lastPracticedAt = attempts.length > 0 ? attempts[attempts.length - 1].timestamp : null;

  return { attempts, mastered, lastPracticedAt };
}

// Shared UI label for a mastery boolean, so the sidebar badge and a
// chapter's own practice panel never drift into showing different wording.
export function masteryLabel(mastered) {
  return mastered ? "已練熟" : "尚未練熟";
}
