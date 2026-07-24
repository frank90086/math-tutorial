// Maps a chapter id (see js/data/curriculum.js) to a lazy-loaded content
// module. Each module exports `render(container)`, which builds the full
// chapter UI into `container`. Only chapters with status "complete" have
// an entry here — this is the template future chapters plug into.
export const CHAPTER_CONTENT_LOADERS = {
  "alg-7a-3": () => import("./algebra/linear-equation-chapter.js"),
};
