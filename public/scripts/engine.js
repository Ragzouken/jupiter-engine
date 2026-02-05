/**
 * @typedef {Object} JupiterDataWindow
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {string[]} classes
 * @property {boolean} pinned
 */

document.addEventListener("DOMContentLoaded", setup);

const WINDOW_DATA = new Map();

async function SHOW_TITLE(text) {
  await showTitle(text);
}

async function OPEN_WINDOW(id, autoclose = true) {
  const data = WINDOW_DATA.get(id);
  setupWindow2(data);
  await openWindow(id, autoclose);
}

async function CLOSE_WINDOW(id) {
  await closeWindow(document.getElementById(id));
}

async function PING_WINDOW(id) {
  await attentionWindow(id);
}

async function FADE_ALL_EXCEPT(...ids) {
  exclusiveWindow(...ids);
  await DELAY(1);
  CLOSE_ALL_EXCEPT(...ids);
  hideScreen();
}

function CLOSE_ALL_EXCEPT(...ids) {
  closeAll(...ids);
}

async function REPLACE_WINDOW(targetId, sourceId) {
  replaceWindow(targetId, sourceId);
}

function RUN_EVENT_AFTER_SEEN(event, ids) {
  return openedTrigger(...ids).then(() => EVENTS.get(event)());
}

function RUN_EVENT_AFTER_CLOSED(event, ids) {
  return closedTrigger(...ids).then(() => EVENTS.get(event)());
}

const DELAY = (seconds) => sleep(seconds * 1000);

function ADD_WORDS(...words) {
  return addWords(words);
}

function CLEAR_WORDS() {
  return clearWords();
}

function HTML(source) {
  const parser = new DOMParser();
  const document = parser.parseFromString(source, "text/html");
  const elements = [...document.querySelector("body").children];
  return elements;
}

document.addEventListener("dragend", (event) => {
  if (event.dataTransfer.dropEffect == "none") {
    PLAY_CLIP("audio/clips/none");
  }
});

/**
 * @param {HTMLElement} handleElement 
 * @param {HTMLElement} draggedElement
 * @param {HTMLElement} boundingElement 
 */
function makeDraggable(handleElement, draggedElement, boundingElement = undefined) {
  boundingElement = boundingElement ?? document.querySelector("html");
  let offset;

  handleElement.addEventListener('pointerdown', async (event) => {
    if (event.target !== handleElement) return;
    event.preventDefault();

    const dx = draggedElement.offsetLeft - event.clientX;
    const dy = draggedElement.offsetTop - event.clientY;
    offset = [dx, dy];

    await focusWindow(draggedElement);
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

    // PLAY_CLIP("audio/clips/move");
  });
}

async function flashElement(element, duration = .1) {
  element.classList.toggle("flash", true);
  await sleep(duration * 1000);
  element.classList.toggle("flash", false);
}

let prevZ = 0;

async function exclusiveWindow(...ids) {
  const screen = document.getElementById("screen");
  screen.style.setProperty("opacity", "100%");
  screen.style.removeProperty("pointer-events");
  await focusWindow(screen);

  ids.forEach((id) => focusWindow(document.getElementById(id)));
}

async function hideScreen() {
  const screen = document.getElementById("screen");
  screen.style.setProperty("opacity", "0%");
  screen.style.setProperty("pointer-events", "none");
}

let lastWindow = undefined;

/**
 * @param {HTMLElement} windowElement 
 */
async function focusWindow(windowElement) {
  lastWindow = windowElement;
  prevZ += 1;
  windowElement.style.setProperty("z-index", prevZ.toString());
  windowElement.classList.remove("attention");
}

async function attentionWindow(id) {
  PLAY_CLIP("audio/clips/notification");
  const windowElement = document.getElementById(id);
  windowElement.classList.add("attention");
}

const opened = new Set();
const closedWindows = new Set();

async function closeChildren(id) {
  await Promise.all([...WINDOW_DATA.keys()].map((path) => {
    const child = path.startsWith(id) && id != path;
    const pinned = WINDOW_DATA.get(path).pinned;

    if (child && !pinned)
      return CLOSE_WINDOW(path);
  }));
}

async function closeCousins(id) {
  [...WINDOW_DATA.keys()].forEach((path) => {
    const parent = id.startsWith(path);
    const pinned = WINDOW_DATA.get(path).pinned;

    if (!parent && !pinned)
      CLOSE_WINDOW(path);
  });
}

async function openWindow(id, autoclose = true) {
  window.getSelection().removeAllRanges();

  const windowElement = document.getElementById(id);

  if (!windowElement) {
    return RUN_EVENT(id);
  }

  const reposition = windowElement.hidden === true;

  windowElement.hidden = false;

  if (reposition) {
    /** @type {HTMLElement} */
    const boundingElement = lastWindow ?? document.querySelector("html");
    const rect = boundingElement.getBoundingClientRect();
    const cx = (rect.left + rect.right) / 2;
    const cy = (rect.top + rect.bottom) / 2;
    const w = windowElement.clientWidth;
    const h = windowElement.clientHeight;

    const ox = (Math.random() - .5) * 256;
    const oy = (Math.random() - .5) * 256;

    await moveWindow(windowElement, cx - w / 2 + ox, cy - h / 2 + oy);
  }

  const background = WINDOW_DATA.get(id)?.background ?? false;
  if (background) windowElement.style = "";

  // if (autoclose)
  // await closeCousins(windowElement.getAttribute("id"));
  await focusWindow(windowElement);
  await flashElement(windowElement);

  if (!opened.has(id)) {
    opened.add(id);
  }
}

async function moveWindow(windowElement, x, y) {
  windowElement.style.left = x + 'px';
  windowElement.style.top = y + 'px';
}

async function closeWindow(windowElement) {
  await flashElement(windowElement);
  windowElement.hidden = true;

  if (!closedWindows.has(windowElement.id)) {
    closedWindows.add(windowElement.id);
  }
}

async function closeAll(...except) {
  const exceptions = new Set(except.map((id) => document.getElementById(id)));

  document.querySelectorAll(".window").forEach((windowElement) => {
    if (exceptions.has(windowElement)) return;

    windowElement.hidden = true;
  });
}

function extractBody(parentElement) {
  return parentElement.children;
}

function makeWindow(id) {
  const closeButton = html("button", { "class": "window-close" }, "✕");
  const titleElement = html("div", { "class": "window-title" });
  const bodyElement = html("div", { "class": "window-body" });
  const windowElement = html("article", { "class": "window" }, titleElement, closeButton, bodyElement);

  windowElement.id = id;
  windowElement.hidden = true;
  windowElement.addEventListener("mousedown", () => focusWindow(windowElement));

  makeDraggable(titleElement, windowElement);
  closeButton?.addEventListener("click", () => {
    PLAY_CLIP("audio/clips/click");
    closeWindow(windowElement);
  });

  bodyElement.addEventListener("scroll", () => {
    // PLAY_CLIP("audio/clips/move");
    focusWindow(windowElement);
  });

  document.body.append(windowElement);

  return windowElement;
}

function replaceWindow(targetId, sourceId) {
  const target = document.getElementById(targetId);
  const source = document.getElementById(sourceId);

  target.querySelector(".window-body").replaceChildren(...source.querySelector(".window-body").children);
}

function preventSelect() {
  document.body.addEventListener("selectstart", (event) => {
    if (event.target != event.currentTarget) return;
    event.preventDefault();
    // event.stopPropagation();
  });
}

async function setup() {
  confineWindows();
  preventSelect();

  await loadWindows("window-data");

  document.addEventListener("keydown", (event) => {
    if (event.key === "e" && event.ctrlKey) {
      openDebugWindow();
    }
  });

  await RUN_EVENT("events/start");
}

function openDebugWindow() {
  const window = setupWindow2({
    id: "debug",
    title: "[DEBUG]",
    body: "",
    classes: ['normal'],
    pinned: false,
  });


  const events = Array.from(EVENTS.keys());
  const eventOptions = events.map((id) => html("option", { value: id }, id));
  const eventSelect = html("select", { size: 4 }, ...eventOptions);

  const runEvent = html("button", {}, "run event");
  runEvent.addEventListener("click", () => RUN_EVENT(eventSelect.value));
  const eventButtons = html("div", { style: "display: flex; flex-direction: row; gap: .5em;" }, runEvent);

  const windows = Array.from(WINDOW_DATA.keys());
  const windowOptions = windows.map((id) => html("option", { value: id }, id));
  const windowSelect = html("select", { size: 4 }, ...windowOptions);

  const openWindowB = html("button", {}, "open window");
  openWindowB.addEventListener("click", () => OPEN_WINDOW(windowSelect.value));
  const closeWindowB = html("button", {}, "close window");
  closeWindowB.addEventListener("click", () => CLOSE_WINDOW(windowSelect.value));
  const windowButtons = html("div", { style: "display: flex; flex-direction: row; gap: .5em;" }, openWindowB, closeWindowB);

  const left = html("div", { style: "display: flex; flex-direction: column; gap: .5em; flex: 1;" }, eventSelect, eventButtons);
  const right = html("div", { style: "display: flex; flex-direction: column; gap: .5em; flex: 1;" }, windowSelect, windowButtons);

  const body = window.querySelector(".window-body");
  body.replaceChildren(left, right);

  openWindow("debug");
}

async function confineWindows() {
  window.requestAnimationFrame(confineWindows);

  const boundingElement = document.querySelector("html");
  const width = boundingElement.offsetWidth;
  const height = boundingElement.offsetHeight;

  document.querySelectorAll(".window").forEach((windowElement) => {
    const id = windowElement.getAttribute("id")

    const x = windowElement.offsetLeft;
    const y = windowElement.offsetTop;
    const w = windowElement.offsetWidth;
    const h = windowElement.offsetHeight;

    let minX = x;
    let minY = y;

    const maxX = minX + w;
    const maxY = minY + h;

    const shiftX = Math.min(0, boundingElement.clientWidth - maxX);
    const shiftY = Math.min(0, boundingElement.clientHeight - maxY);

    minX = Math.max(0, minX + shiftX);
    minY = Math.max(0, minY + shiftY);

    const background = WINDOW_DATA.get(id)?.background ?? false;

    if (!background) {
      windowElement.style.left = minX + 'px';
      windowElement.style.top = minY + 'px';
    }
  });
}

/**
 * @param {HTMLElement} root
 * @returns {JupiterDataWindow[]}
 */
function loadWindowDatasFromDOM(root) {
  const elements = Array.from(root.querySelectorAll("article[id]"));

  const parents = new Map();
  elements.forEach((element) => {
    parents.set(element, element.parentElement?.closest("article"));
    element.remove();
  });

  function getPath(element) {
    const id = element.getAttribute("id");
    const parent = parents.get(element);
    return parent === undefined ? id : `${getPath(parent)}/${id}`;
  }

  return elements.map((element) => {
    return {
      id: getPath(element),
      title: element.getAttribute("title") ?? "",
      body: element.innerHTML,
      classes: Array.from(element.classList),
      pinned: element.hasAttribute("data-pinned"),
      background: element.hasAttribute("data-background"),
    };
  });
}

async function loadWindows(id) {
  const template = document.getElementById(id);
  template.remove();

  const data = loadWindowDatasFromDOM(template.content);
  data.forEach((data) => WINDOW_DATA.set(data.id, data));
  data.forEach((data) => setupWindow2(data));
}

/**
 * @param {JupiterDataWindow} data 
 * @return {HTMLElement}
 */
function setupWindow2(data) {
  if (document.getElementById(data.id)) return document.getElementById(data.id);

  const windowElement = makeWindow(data.id);

  windowElement.querySelector(".window-title").replaceChildren(data.title);
  windowElement.querySelector(".window-body").innerHTML = data.body;
  windowElement.querySelector(".window-close").hidden = data.pinned;

  windowElement.title = data.title;
  windowElement.classList.add(...data.classes);

  [...windowElement.querySelectorAll("style")].forEach((style) => {
    windowElement.append(style);
  });

  return windowElement;
}

async function showTitle(title) {
  const screen = document.getElementById("title-board");
  screen.hidden = false;
  screen.style.setProperty("opacity", "100%");
  screen.style.setProperty("pointer-events", "initial");

  document.getElementById("title").textContent = title;

  await sleep(2000);

  screen.style.setProperty("opacity", "0%");
  screen.style.removeProperty("pointer-events");

  await sleep(1000);
}
