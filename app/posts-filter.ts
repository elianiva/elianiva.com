/**
 * The archive's search box and tag toggles, in plain DOM: the server draws every
 * post, and this hides the ones that do not match. The first post is drawn twice
 * (featured, and as a plain cell); the plain one shows while a filter is on.
 * No Effect runtime loads for it.
 */
export const runPostsFilter = () => {
  const root = document.querySelector<HTMLElement>("[data-posts-filter]");
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>("[data-posts-query]")!;
  const clear = root.querySelector<HTMLElement>("[data-posts-clear]")!;
  const count = root.querySelector<HTMLElement>("[data-posts-count]")!;
  const empty = root.querySelector<HTMLElement>("[data-posts-empty]")!;
  const fill = root.querySelector<HTMLElement>("[data-posts-fill]")!;
  const featured = root.querySelector<HTMLElement>("[data-post-featured]");
  const cells = [...root.querySelectorAll<HTMLElement>("[data-post-text]")].filter(
    (cell) => cell !== featured,
  );
  const tagButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-posts-tag]")];
  const tags = new Set<string>();

  const update = () => {
    const query = input.value.toLowerCase();
    const filtering = query !== "" || tags.size > 0;
    let shown = 0;
    for (const cell of cells) {
      const own = (cell.dataset.postTags ?? "").split(" ");
      const match =
        [...tags].every((tag) => own.includes(tag)) &&
        (!query || (cell.dataset.postText ?? "").includes(query));
      // The hidden twin of the featured post stays out unless a filter is on.
      const twin = cell.previousElementSibling === featured;
      const visible = match && (!twin || filtering);
      cell.hidden = !visible;
      if (visible) shown++;
    }
    if (featured) featured.hidden = filtering;
    empty.hidden = shown > 0;
    fill.hidden = filtering;
    clear.hidden = query === "";
    count.textContent = filtering ? `${shown} of ${cells.length} posts` : "\u00a0";
  };

  input.addEventListener("input", update);
  clear.addEventListener("click", () => {
    input.value = "";
    update();
    input.focus();
  });
  for (const button of tagButtons) {
    button.addEventListener("click", () => {
      const tag = button.dataset.postsTag!;
      if (!tags.delete(tag)) tags.add(tag);
      button.setAttribute("aria-pressed", String(tags.has(tag)));
      update();
    });
  }
  update();
};
