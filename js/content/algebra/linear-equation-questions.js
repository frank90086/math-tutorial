// 「一元一次方程式」（七上）題庫：
// - kind: "fixed" 兩題改寫自歷屆國中教育會考公開試題（依官方詳解改寫解析與提示，
//   文字敘述已重新撰寫，非原題逐字照抄）。
// - kind: "template" 三種參數化模板，涵蓋「純列式求解」與兩種不同情境的「應用題」。

function randomIntInclusive(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

function pickOne(rng, options) {
  return options[randomIntInclusive(rng, 0, options.length - 1)];
}

// 標準數學記法：係數是 1 時省略不寫（"x" 而非 "1x"）。
function termWithX(coefficient) {
  return coefficient === 1 ? "x" : `${coefficient}x`;
}

const budgetItems = ["筆記型電腦", "腳踏車", "電動玩具主機", "相機", "無線耳機"];
// percent 用整數（不用 0.8 這種小數），折扣後價錢的計算才能全程用整數運算，
// 不會因為浮點數誤差算出 909.9999999999999 這種數字。
const discountOptions = [
  { percent: 70, label: "七折" },
  { percent: 75, label: "七五折" },
  { percent: 80, label: "八折" },
  { percent: 85, label: "八五折" },
  { percent: 90, label: "九折" },
];

const packingScenarios = [
  { itemA: "吊飾", itemB: "鑰匙圈", itemC: "磁鐵", material: "串珠" },
  { itemA: "餅乾", itemB: "手工皂", itemC: "蠟燭", material: "香料" },
  { itemA: "杯墊", itemB: "書籤", itemC: "明信片", material: "彩色紙" },
];

export const LINEAR_EQUATION_QUESTIONS = [
  {
    id: "alg-7a-3-exam-111-q11",
    kind: "fixed",
    source: { exam: "111年國中教育會考數學科", questionNumber: 11 },
    prompt:
      "小宇想買一台遊戲主機。他相中的那台，售價比他的預算多 1200 元；後來剛好遇到八折特價，折扣後的價錢反而比他的預算少 200 元。請問小宇的預算是多少元？",
    answer: 5800,
    explanation:
      "設預算為 x 元，則售價為 x + 1200 元。打八折後的價錢為 0.8(x + 1200) 元，這個價錢比預算少 200 元，所以 0.8(x + 1200) = x − 200。展開得 0.8x + 960 = x − 200，移項得 200 + 960 = x − 0.8x，也就是 1160 = 0.2x，所以 x = 5800。",
    hint: "先設預算為 x，把「售價」和「打折後的價錢」都用 x 表示出來，再列出等式。",
  },
  {
    id: "alg-7a-3-exam-109-q16",
    kind: "fixed",
    source: { exam: "109年國中教育會考數學科", questionNumber: 16 },
    prompt:
      "小柚在園遊會擺攤，賣手工餅乾、手工皂、手工蠟燭三種商品，數量比為 2:1:3。只有做餅乾和肥皂需要用到某種香料，做一份餅乾要用 2 克香料、一份肥皂要用 1 克香料，她總共用了 120 克香料。請問她做了幾份蠟燭？",
    answer: 72,
    explanation:
      "設餅乾、肥皂、蠟燭的數量分別為 2x、x、3x 份。用掉的香料為 2×(2x) + 1×x = 4x + x = 5x 克，已知總共用了 120 克，所以 5x = 120，解得 x = 24。因此蠟燭的數量為 3x = 3×24 = 72 份。",
    hint: "先用一個未知數 x 表示三種數量的比例關係，再從「用掉的香料總量」列出方程式。",
  },
  {
    id: "alg-7a-3-template-solve-linear",
    kind: "template",
    sampleParams: (rng) => ({
      a: randomIntInclusive(rng, 2, 9),
      b: randomIntInclusive(rng, 1, 20),
      x: randomIntInclusive(rng, -10, 10),
    }),
    buildPrompt: ({ a, b, x }) => `解方程式：${a}x + ${b} = ${a * x + b}，求 x 的值。`,
    computeAnswer: ({ x }) => x,
    explain: ({ a, b, x }) => {
      const c = a * x + b;
      return `${a}x + ${b} = ${c} → ${a}x = ${c - b} → x = ${x}`;
    },
    hint: () => "先把常數項移到等號右邊，再除以 x 的係數。",
  },
  {
    id: "alg-7a-3-template-discount-budget",
    kind: "template",
    sampleParams: (rng) => {
      const x = randomIntInclusive(rng, 10, 90) * 100;
      const { percent, label } = pickOne(rng, discountOptions);
      // surcharge 上限要保證「折扣後的價錢」嚴格小於預算 x，
      // 否則「折扣後反而比預算少」這句話就會變成假的（甚至是負數）。
      const maxSurchargeHundreds = Math.max(
        1,
        Math.min(15, Math.floor((x * (100 - percent) - 1) / (percent * 100)))
      );
      const surcharge = randomIntInclusive(rng, 1, maxSurchargeHundreds) * 100;
      const item = pickOne(rng, budgetItems);
      const price = x + surcharge;
      const discounted = (price / 100) * percent;
      const savings = x - discounted;
      return { x, surcharge, percent, label, item, price, discounted, savings };
    },
    buildPrompt: ({ item, surcharge, label, savings }) =>
      `小美想買一台${item}。她相中的那台，售價比她的預算多 ${surcharge} 元；後來剛好打${label}，折扣後的價錢反而比預算少 ${savings} 元。請問小美的預算是多少元？`,
    computeAnswer: ({ x }) => x,
    explain: ({ x, surcharge, label, percent, price, discounted, savings }) =>
      `設預算為 x 元，售價為 x + ${surcharge} = ${price} 元。打${label}後的價錢為 ${price} × ${percent}% = ${discounted} 元，比預算少 ${savings} 元，所以 ${discounted} = x − ${savings}，解得 x = ${x}。`,
    hint: () => "先設預算為 x，用 x 表示「售價」和「打折後的價錢」，再列出等式。",
  },
  {
    id: "alg-7a-3-template-ratio-packing",
    kind: "template",
    sampleParams: (rng) => {
      const ratioOptions = [
        [2, 1, 3],
        [3, 1, 2],
        [1, 2, 3],
        [3, 2, 1],
        [2, 3, 1],
      ];
      const [ratioA, ratioB, ratioC] = pickOne(rng, ratioOptions);
      const usageA = randomIntInclusive(rng, 1, 4);
      const usageB = randomIntInclusive(rng, 1, 4);
      const k = randomIntInclusive(rng, 5, 30);
      const scenario = pickOne(rng, packingScenarios);
      const total = usageA * ratioA * k + usageB * ratioB * k;
      return { ratioA, ratioB, ratioC, usageA, usageB, k, scenario, total };
    },
    buildPrompt: ({ ratioA, ratioB, ratioC, usageA, usageB, scenario, total }) =>
      `手工藝社團做${scenario.itemA}、${scenario.itemB}、${scenario.itemC}三種小物，數量比為 ${ratioA}:${ratioB}:${ratioC}。只有做${scenario.itemA}和${scenario.itemB}需要用到${scenario.material}，做一個${scenario.itemA}要用 ${usageA} 顆${scenario.material}、一個${scenario.itemB}要用 ${usageB} 顆${scenario.material}，總共用了 ${total} 顆${scenario.material}。請問做了幾個${scenario.itemC}？`,
    computeAnswer: ({ ratioC, k }) => ratioC * k,
    explain: ({ ratioA, ratioB, ratioC, usageA, usageB, k, total, scenario }) =>
      `設一份的數量為 x，則${scenario.itemA}、${scenario.itemB}、${scenario.itemC}的數量分別為 ${termWithX(ratioA)}、${termWithX(ratioB)}、${termWithX(ratioC)}。用掉的${scenario.material}為 ${usageA}×${termWithX(ratioA)} + ${usageB}×${termWithX(ratioB)} = ${termWithX(total / k)}，已知總共用了 ${total} 顆，所以 ${termWithX(total / k)} = ${total}，解得 x = ${k}。因此${scenario.itemC}的數量為 ${termWithX(ratioC)} = ${ratioC}×${k} = ${ratioC * k}。`,
    hint: () => "先用一個未知數表示三種數量的比例關係，再從「總共用掉的材料數」列出方程式。",
  },
];
