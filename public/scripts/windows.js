/** @type {Map<string, HTMLElement>} */
const WINDOW_DATA = new Map();

/** @type {Map<string, HTMLElement>} */
const WINDOWS = new Map();

/**
 * 
 * @param {string} path 
 */
function OPEN_WINDOW(path) {
  const window = WINDOWS.get(path);
  document.body.append(window);
  window.dispatchEvent(new CustomEvent("window-open", { bubbles: true, detail: { window } }));
}

/**
 * @param {string} path
 */
function CLOSE_WINDOW(path) {
  const window = WINDOWS.get(path);
  window.dispatchEvent(new CustomEvent("window-close", { bubbles: true, detail: { window } }));
  window.remove();
}

/**
 * 
 * @param {string} path 
 */
function FOREGROUND_WINDOW(path) {
  const window = WINDOWS.get(path);
  window.parentElement.append(window);
  window.dispatchEvent(new CustomEvent("window-foreground", { bubbles: true, detail: { window } }));
}

/**
 * Replace the content of the window of the target path with the content of the
 * window of the source path.
 * @param {string} target 
 * @param {string} source 
 */
function SPLICE_WINDOW(target, source) {
  const content = WINDOWS.get(target).querySelector("[data-content]");
  content.replaceChildren(WINDOW_DATA.get(source));
}

/**
 * 
 * @param  {...string} exceptions 
 */
function CLOSE_WALL_WINDOWS(...exceptions) {
  for (const path of WINDOWS.keys())
    if (!exceptions.includes(path))
      CLOSE_WINDOW(path);
}

function make_window(article) {
  const label = html("div", { "class": "window-title" }, "title")
  const close = html("button", { "class": "window-close" }, "✕");
  const title = html("div", { "class": "titlebar" }, label, close);
  const content = html("div", { "data-content": "", "class": "content" }, article);
  const window = html("div", { "data-window": "" }, title, content);

  content.addEventListener("scroll", () => window.dispatchEvent(new CustomEvent("window-scroll", { bubbles: true })));

  close.addEventListener("click", () => window.remove());
  make_draggable(title, window, document.querySelector("[data-window-bounds]"));

  return window;
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

    draggedElement.style.left = tx + 'px';
    draggedElement.style.top = ty + 'px';

    boundWindow(draggedElement, boundingElement);

    draggedElement.dispatchEvent(new CustomEvent("window-drag", { bubbles: true }));
  });
}

/**
 * 
 * @param {HTMLElement} window 
 * @param {HTMLElement} bound 
 */
function boundWindow(window, bound) {
  const windowRect = window.getBoundingClientRect();
  const boundRect = bound.getBoundingClientRect();

  let { left, top } = windowRect;

  left -= Math.min(0, windowRect.left   - boundRect.left);
  left -= Math.max(0, windowRect.right  - boundRect.right);
  top  -= Math.min(0, windowRect.top    - boundRect.top);
  top  -= Math.max(0, windowRect.bottom - boundRect.bottom);

  console.log(boundRect.bottom, boundRect.right);

  window.style.left = left + 'px';
  window.style.top = top + 'px';
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
