/** @type {Map<string, HTMLElement>} */
const WINDOW_DATA = new Map();

/** @type {Map<string, HTMLElement>} */
const WINDOWS = new Map();

/**
 * 
 * @param {string} path 
 */
function OPEN_WINDOW(path) {
  document.body.append(WINDOWS.get(path));
}

/**
 * @param {string} path
 */
function CLOSE_WINDOW(path) {
  WINDOWS.get(path).remove();
}

/**
 * @param {HTMLElement} handleElement 
 * @param {HTMLElement} draggedElement
 * @param {HTMLElement} boundingElement 
 */
function make_draggable(handleElement, draggedElement, boundingElement = undefined) {
  boundingElement = boundingElement ?? document.querySelector("html");
  let offset;

  handleElement.addEventListener('pointerdown', async (event) => {
    if (event.target !== handleElement) return;
    event.preventDefault();

    const { x, y } = draggedElement.getBoundingClientRect();
    offset = [x - event.clientX, y - event.clientY];
  });

  window.addEventListener('pointerup', (event) => {
    offset = undefined;
  });

  window.addEventListener('pointermove', (event) => {
    if (!offset) return;

    const [dx, dy] = offset;
    const tx = event.clientX + dx;
    const ty = event.clientY + dy;

    let minX = tx;
    let minY = ty;

    const maxX = minX + draggedElement.clientWidth;
    const maxY = minY + draggedElement.clientHeight;

    const shiftX = Math.min(0, boundingElement.clientWidth - maxX);
    const shiftY = Math.min(0, boundingElement.clientHeight - maxY);

    minX = Math.max(0, minX + shiftX);
    minY = Math.max(0, minY + shiftY);

    draggedElement.style.left = minX + 'px';
    draggedElement.style.top = minY + 'px';
  });
}

function make_window(article) {
  const label = html("div", { "class": "window-title" }, "title")
  const close = html("button", { "class": "window-close" }, "✕");
  const title = html("div", { "class": "titlebar" }, label, close);
  const content = html("div", { "class": "content" }, article);
  const window = html("div", { "data-window": "" }, title, content);

  close.addEventListener("click", () => window.remove());
  make_draggable(title, window);

  return window;
}

const LOAD_WINDOWS = (element) => {
  const parents = new Map();

  for (const data of ALL("article[id]", element))
    parents.set(data, data.parentElement?.closest("article[id]"));

  for (const data of parents.keys())
    WINDOW_DATA.set(getPath(data), data);

  for (const [path, data] of WINDOW_DATA)
    WINDOWS.set(path, make_window(data));

  for (const data of WINDOW_DATA.values()) {
    // data.remove();
    data.removeAttribute("id");
  }

  function getPath(element) {
    const parent = parents.get(element);
    const root = parent ? getPath(parent) + "/" : "";
    return root + element.id;
  }
};

LOAD_MACROS.set("windows", LOAD_WINDOWS);
