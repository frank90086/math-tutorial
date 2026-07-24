import { STRANDS, findChapter, countProgress } from "./data/curriculum.js";

const sidebarEl = document.getElementById("sidebar");
const mainEl = document.getElementById("main");
const overlayEl = document.getElementById("overlay");
const menuBtn = document.getElementById("menu-btn");
const bottomTabsEl = document.getElementById("bottom-tabs");

let openStrandId = STRANDS[0].id;

function renderSidebar() {
  const { total, complete } = countProgress();

  sidebarEl.innerHTML = `
    <div class="sidebar-header">
      <h1>國中數學脈絡</h1>
      <p>會考複習・按主題脈絡學</p>
      <div class="overall-progress">
        <div class="overall-progress-bar">
          <div class="overall-progress-fill" style="width:${total ? (complete / total) * 100 : 0}%"></div>
        </div>
        <span>${complete} / ${total} 章節完成</span>
      </div>
    </div>
    <nav class="strand-list">
      ${STRANDS.map((strand) => renderStrandGroup(strand)).join("")}
    </nav>
  `;

  sidebarEl.querySelectorAll(".strand-toggle").forEach((el) => {
    el.addEventListener("click", () => {
      const strandId = el.dataset.strand;
      openStrandId = openStrandId === strandId ? null : strandId;
      renderSidebar();
    });
  });

  sidebarEl.querySelectorAll(".chapter-link").forEach((el) => {
    el.addEventListener("click", () => {
      location.hash = `#/chapter/${el.dataset.chapter}`;
      closeMobileSidebar();
    });
  });
}

function renderStrandGroup(strand) {
  const isOpen = openStrandId === strand.id;
  return `
    <div class="strand-group ${isOpen ? "open" : ""}">
      <button class="strand-toggle" data-strand="${strand.id}">
        <span class="strand-icon">${strand.icon}</span>
        <span class="strand-name">${strand.name}</span>
        <span class="strand-arrow">▾</span>
      </button>
      <div class="chapter-list" style="max-height:${isOpen ? "1000px" : "0"}">
        ${strand.chapters
          .map(
            (ch) => `
          <button class="chapter-link ${ch.status}" data-chapter="${ch.id}">
            <span class="chapter-grade">${ch.grade}</span>
            <span class="chapter-title">${ch.title}</span>
            ${ch.status === "placeholder" ? '<span class="badge">待補</span>' : ""}
          </button>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderBottomTabs() {
  bottomTabsEl.innerHTML = STRANDS.map(
    (strand) => `
    <button class="tab-btn" data-strand="${strand.id}">
      <span class="tab-icon">${strand.icon}</span>
      <span class="tab-label">${strand.name}</span>
    </button>
  `
  ).join("");

  bottomTabsEl.querySelectorAll(".tab-btn").forEach((el) => {
    el.addEventListener("click", () => selectStrand(el.dataset.strand));
  });
}

function selectStrand(strandId) {
  openStrandId = strandId;
  renderSidebar();
  openMobileSidebar();
}

function renderHome() {
  mainEl.innerHTML = `
    <section class="view home-view">
      <h1>把數學學成一套完整的工具</h1>
      <p class="lead">不再是一塊一塊獨立的單元。用「代數」「幾何」「統計與機率」三條主線，加上「大一統」看懂它們怎麼互相呼應——這就是準備會考最需要的融會貫通。</p>
      <div class="strand-cards">
        ${STRANDS.map(
          (strand) => `
          <button class="strand-card" data-strand="${strand.id}">
            <span class="strand-card-icon">${strand.icon}</span>
            <span class="strand-card-name">${strand.name}</span>
            <span class="strand-card-tagline">${strand.tagline}</span>
            <span class="strand-card-count">${strand.chapters.length} 個章節</span>
          </button>
        `
        ).join("")}
      </div>
    </section>
  `;

  mainEl.querySelectorAll(".strand-card").forEach((el) => {
    el.addEventListener("click", () => selectStrand(el.dataset.strand));
  });
}

function renderPlaceholderChapter(strand, chapter) {
  mainEl.innerHTML = `
    <section class="view chapter-view">
      <p class="breadcrumb">${strand.icon} ${strand.name} ・ ${chapter.grade}</p>
      <h1>${chapter.title}</h1>
      <div class="placeholder-card">
        <span class="placeholder-emoji">🚧</span>
        <p>這個章節還在準備中，敬請期待！</p>
        <p class="placeholder-sub">內容會包含觀念講解、互動示範與練習題。</p>
      </div>
    </section>
  `;
}

function renderNotFound() {
  mainEl.innerHTML = `
    <section class="view">
      <h1>找不到這個章節</h1>
      <p>它可能還沒被加進課綱地圖裡。</p>
    </section>
  `;
}

function route() {
  const hash = location.hash;
  const match = hash.match(/^#\/chapter\/(.+)$/);

  if (!match) {
    renderHome();
    return;
  }

  const found = findChapter(match[1]);
  if (!found) {
    renderNotFound();
    return;
  }

  openStrandId = found.strand.id;
  renderSidebar();

  // Real chapter content modules get wired in here starting with ticket #6.
  renderPlaceholderChapter(found.strand, found.chapter);
}

function openMobileSidebar() {
  sidebarEl.classList.add("open");
  overlayEl.classList.add("visible");
}

function closeMobileSidebar() {
  sidebarEl.classList.remove("open");
  overlayEl.classList.remove("visible");
}

menuBtn.addEventListener("click", () => {
  sidebarEl.classList.contains("open") ? closeMobileSidebar() : openMobileSidebar();
});
overlayEl.addEventListener("click", closeMobileSidebar);

window.addEventListener("hashchange", route);

renderSidebar();
renderBottomTabs();
route();
