// Curriculum skeleton for Taiwan junior-high (國中七〜九年級) math, organized by
// cross-grade topic strand rather than by semester (see ticket #6 rationale).
// Chapter titles/ordering are an approximation based on the common 108課綱
// textbook structure (cross-checked against 均一教育平台's 南一版-aligned
// course listing) — verify against the actual textbook edition when a
// chapter's real content is written (see docs for ticket #5/#6).
//
// status: 'placeholder' (待補) until a ticket fills in real content.
// contentId, when present, points to a module under js/content/ that
// renders the real lesson (used starting with ticket #6).

export const STRANDS = [
  {
    id: "algebra",
    name: "代數",
    icon: "🧮",
    tagline: "數與式、方程式、不等式、函數",
    chapters: [
      { id: "alg-7a-1", grade: "七上", title: "整數運算與科學記號", status: "placeholder" },
      { id: "alg-7a-2", grade: "七上", title: "因數分解與分數運算", status: "placeholder" },
      { id: "alg-7a-3", grade: "七上", title: "一元一次方程式", status: "complete" },
      { id: "alg-7b-1", grade: "七下", title: "二元一次聯立方程式", status: "placeholder" },
      { id: "alg-7b-2", grade: "七下", title: "一元一次不等式", status: "placeholder" },
      { id: "alg-8a-1", grade: "八上", title: "乘法公式與多項式", status: "placeholder" },
      { id: "alg-8a-2", grade: "八上", title: "因式分解", status: "placeholder" },
      { id: "alg-8a-3", grade: "八上", title: "一元二次方程式", status: "placeholder" },
      { id: "alg-8b-1", grade: "八下", title: "函數及其圖形", status: "placeholder" },
    ],
  },
  {
    id: "geometry",
    name: "幾何",
    icon: "📐",
    tagline: "圖形性質、全等、相似形、圓、尺規作圖",
    chapters: [
      { id: "geo-7b-1", grade: "七下", title: "生活中的幾何圖形", status: "placeholder" },
      { id: "geo-8a-1", grade: "八上", title: "平方根與畢氏定理", status: "placeholder" },
      { id: "geo-8b-1", grade: "八下", title: "三角形的性質與尺規作圖", status: "placeholder" },
      { id: "geo-8b-2", grade: "八下", title: "平行與四邊形", status: "placeholder" },
      { id: "geo-9a-1", grade: "九上", title: "比例線段與相似形", status: "placeholder" },
      { id: "geo-9a-2", grade: "九上", title: "圓的性質", status: "placeholder" },
      { id: "geo-9a-3", grade: "九上", title: "推理證明與三角形的心", status: "placeholder" },
    ],
  },
  {
    id: "stats",
    name: "統計與機率",
    icon: "📊",
    tagline: "資料整理、統計圖表、機率",
    chapters: [
      { id: "sta-7b-1", grade: "七下", title: "統計圖表", status: "placeholder" },
      { id: "sta-8a-1", grade: "八上", title: "統計資料處理", status: "placeholder" },
      { id: "sta-9b-1", grade: "九下", title: "資料分析與機率", status: "placeholder" },
    ],
  },
  {
    id: "unify",
    name: "大一統",
    icon: "🔗",
    tagline: "跨脈絡的連結，讓數學不再是一塊一塊的知識",
    chapters: [
      { id: "uni-1", grade: "跨年級", title: "函數與相似形：比例關係的兩種面貌", status: "placeholder" },
      { id: "uni-2", grade: "跨年級", title: "代數推導如何撐起幾何證明", status: "placeholder" },
      { id: "uni-3", grade: "跨年級", title: "資料裡的方程式思維", status: "placeholder" },
      { id: "uni-4", grade: "跨年級", title: "國中數學全貌：會考複習地圖", status: "placeholder" },
    ],
  },
];

export function findChapter(chapterId) {
  for (const strand of STRANDS) {
    const chapter = strand.chapters.find((c) => c.id === chapterId);
    if (chapter) return { strand, chapter };
  }
  return null;
}

export function countProgress() {
  let total = 0;
  let complete = 0;
  for (const strand of STRANDS) {
    for (const chapter of strand.chapters) {
      total += 1;
      if (chapter.status === "complete") complete += 1;
    }
  }
  return { total, complete };
}
