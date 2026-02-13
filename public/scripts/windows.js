/** @type {Map<string, HTMLElement>} */
const WINDOW_DATA = new Map();

/** @type {Map<string, HTMLElement>} */
const WINDOWS = new Map();

/** @type {Set<HTMLElement>} */
const OPEN_WINDOWS = new Set();

/**
 * 
 * @param {string} path 
 */
function OPEN_WINDOW(path) {
  const window = WINDOWS.get(path);

  if (!OPEN_WINDOWS.has(window)) {
    document.body.append(window);
    placeWindow(window, document.querySelector("[data-window-bounds]"));
  }

  window.dispatchEvent(new CustomEvent("window-open", { bubbles: true, detail: { window } }));

  FOREGROUND_WINDOW(path);
}

/**
 * @param {string} path
 */
function CLOSE_WINDOW(path) {
  const window = WINDOWS.get(path);
  if (window.dispatchEvent(new CustomEvent("window-close", { bubbles: true, detail: { window }, cancelable: true }))) {
    window.remove();
    OPEN_WINDOWS.delete(window);
  }
}

/**
 * 
 * @param {string} path 
 */
function FOREGROUND_WINDOW(path) {
  const window = WINDOWS.get(path);
  
  OPEN_WINDOWS.delete(window);
  OPEN_WINDOWS.add(window);
  reorderWindows();

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

function reorderWindows() {
  let z = 0;
  for (const window of OPEN_WINDOWS) {
    window.style.zIndex = z.toString();
    z += 1;
  }
}

function makeWindow(path) {
  const data = WINDOW_DATA.get(path);
  const pinned = data.hasAttribute("data-pinned");

  const label = html("div", { "data-title": "" }, data.getAttribute("title"));
  const close = html("button", { "data-close": "" }, "✕");
  const title = html("div", { "class": "titlebar" }, label, pinned ? "" : close);
  const content = html("div", { "data-content": "", "class": "content" }, data);
  const window = html("div", { "data-window": "" }, title, content);

  window.classList.add(...data.classList);

  content.addEventListener("scroll", () => {
    FOREGROUND_WINDOW(path);
    window.dispatchEvent(new CustomEvent("window-scroll", { bubbles: true }));
  });

  window.addEventListener("pointerdown", () => FOREGROUND_WINDOW(path));

  close.addEventListener("click", () => CLOSE_WINDOW(path));
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

  handleElement.setAttribute("data-drag-handle", "");
  handleElement.addEventListener('pointerdown', async (event) => {
    if (event.target !== handleElement) return;
    event.preventDefault();

    const { x, y } = draggedElement.getBoundingClientRect();
    offset = [x - event.clientX, y - event.clientY];
  });

  window.addEventListener('pointerup', (event) => {
    if (offset)
      event.preventDefault();
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
function placeWindow(window, bound) {
  const windowRect = window.getBoundingClientRect();
  const boundRect = bound.getBoundingClientRect();

  const left = boundRect.left;
  const right = boundRect.right - windowRect.width;
  const top = boundRect.top;
  const bottom = boundRect.bottom - windowRect.height;

  window.style.left = randInt(left, right) + 'px';
  window.style.top = randInt(top, bottom) + 'px';
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

  window.style.left = left + 'px';
  window.style.top = top + 'px';
}

const LOAD_WINDOWS = (element) => {
  const parents = new Map();

  for (const data of ALL("article[id]", element))
    parents.set(data, data.parentElement?.closest("article[id]"));

  for (const data of parents.keys())
    WINDOW_DATA.set(getPath(data), data);

  for (const path of WINDOW_DATA.keys())
    WINDOWS.set(path, makeWindow(path));

  for (const data of WINDOW_DATA.values()) {
    // data.remove();
    data.removeAttribute("id");
  }

  for (const window of WINDOWS.values())
    document.dispatchEvent(new CustomEvent("window-load", { bubbles: true, detail: { window } }));

  function getPath(element) {
    const parent = parents.get(element);
    const root = parent ? getPath(parent) + "/" : "";
    return root + element.id;
  }
};

LOAD_MACROS.set("windows", LOAD_WINDOWS);
