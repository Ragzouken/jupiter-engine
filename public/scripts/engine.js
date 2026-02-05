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

const WORDS = new Set();

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
    firstOpen(id);
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
    firstClose(windowElement.id);
  }
}

async function closeAll(...except) {
  const exceptions = new Set(except.map((id) => document.getElementById(id)));

  document.querySelectorAll(".window").forEach((windowElement) => {
    if (exceptions.has(windowElement)) return;

    windowElement.hidden = true;
  });
}

/**
 * @param {HTMLElement} element 
 * @param {string} selector 
 * @param {(element: HTMLElement) => HTMLElement} transform 
 */
function applyTransform(element, selector, transform) {
  [...element.querySelectorAll(selector)].forEach((element) => {
    const next = transform(element);
    if (next != element) element.replaceWith(next);
  });
}

/**
 * @param {HTMLElement} element 
 * @param {string} attribute 
 * @param {(element: HTMLElement, value: string) => Node} transform 
 */
function applyAttributeTransform(element, attribute, transform) {
  applyTransform(element, `[${attribute}]`, (element) => transform(element, element.getAttribute(attribute)));
}

const SCRAMBLE_IGNORE = new Set([..." ,.;:!?:'[]<>{}/\n"]);
const SCRAMBLE_CHARS = [..."qwertyuiopasdfghjklzxcvbnm"];
//☀☁☂☃☄★☆☇☈☉☊☋☌☍☎☏☐☑☒☓☖☗☘☙☚☛☜☞☟☠☡☢☣☤☥☦☧☨☩☪☫☬☭☮☯☰☱☲☳☴☵☶☷☸☹☺☻☼☽☾☿

function scrambleChar(char) {
  return SCRAMBLE_IGNORE.has(char) ? char : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
}

/**
 * 
 * @param {HTMLElement} element 
 * @param {string} attribute
 * @param {(node: Text) => string} transform 
 */
function applyAttributeTextTransform(element, attribute, transform) {
  applyAttributeTransform(element, attribute, (element, value) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      walker.currentNode.textContent = transform(walker.currentNode);
    }
    return element;
  });
}

function applyMacros(element) {
  applyAttributeTransform(element, "data-macro-chat", (element) => {
    function transformLine(line) {
      if (line.startsWith("< ")) return html("p", { class: "left" }, line.slice(2));
      if (line.startsWith("> ")) return html("p", { class: "right" }, line.slice(2));
    }

    const lines = element.textContent.trim().split("\n").map(l => l.trim());
    return html("div", {}, ...lines.map(transformLine));
  });

  applyAttributeTransform(element, "data-macro-table", (element) => {
    const regex = /\/\*(.+)\*\/(.+)/sg;
    const matches = regex.exec(element.textContent);
    const [, table, source] = matches;

    const lines = table.trim().split("\n").map(l => l.trim());
    const [header, ...rows] = lines;
    const names = header.split(",");

    const elements = [];

    const preamble = `const { ${names} } = this;\n`;
    const script = Function(preamble + source);
    const defines = {}

    for (const row of rows) {
      const data = row.split(",");

      for (let i = 0; i < names.length; ++i) {
        defines[names[i]] = data[i];
      }

      elements.push(...script.call(defines));
    }

    return html("div", {}, ...elements);
  });

  applyAttributeTransform(element, "data-macro", (element) => {
    const defines = { ARTICLE: element, ROOT: element.parentElement };
    const names = Object.keys(defines).join(", ");
    const preamble = `const { ${names} } = this;\n`;
    const script = Function(preamble + element.textContent);
    return html("div", {}, ...script.call(defines));
  });

  applyAttributeTransform(element, "data-tint", (element) => html("div", { "class": "img-tint" }, element.cloneNode()));
  applyAttributeTransform(element, "data-link", (element, value) => html("a", { href: "#" + value }, element.cloneNode()));

  element.innerHTML = element.innerHTML.replaceAll(/\[([^\]]+)\|([^\]]+)\]/g, '<a href="#$2">$1</a>');
  element.querySelectorAll("a").forEach((anchorElement) => {
    if (anchorElement.getAttribute("href").startsWith("#")) {
      anchorElement.addEventListener("click", onClickAnchor);
    }
  });

  element.querySelectorAll("[data-word-entry]").forEach((element) => {
    element.innerHTML = element.innerHTML.replaceAll(/\[([^\]]+)]/g, '<span data-word-answer="$1"></span>');
  });

  element.querySelectorAll("[data-word-source]").forEach((element) => {
    element.innerHTML = element.innerHTML.replaceAll(/\[([^\]]+)]/g, '<span data-word-item>$1</span>');
  });

  async function onClickAnchor(event) {
    PLAY_CLIP("audio/clips/click");
    event.preventDefault();
    event.stopPropagation();

    const dest = event.target.closest("a").getAttribute("href").slice(1);
    const window = event.target.closest(".window");
    const parent = window.getAttribute("id");
    const path = dest.startsWith("/") ? dest.slice(1) : `${parent}/${dest}`;

    await focusWindow(window);
    await openWindow(path);
  }

  applyAttributeTextTransform(element, "data-macro-scramble", (node) => [...node.textContent].map(scrambleChar).join(""));
}

function extractBody(parentElement) {
  try {
    applyMacros(parentElement);
  } catch (e) {
    console.log(`MACROS FAILED IN`, parentElement);
    throw e;
  }
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

  const eventData = document.getElementById("event-data");
  eventData.remove();
  addEventsFromDOM(eventData.content);

  const audioData = document.getElementById("audio-data");
  audioData.remove();
  audioData.content.querySelectorAll("audio").forEach((element) => {
    const audio = new Howl({
      src: element.getAttribute("src"),
      volume: parseFloat(element.getAttribute("volume") ?? "1"),
      loop: element.hasAttribute("loop"),
    });
    SOUNDS.set(element.getAttribute("id"), audio);
  });

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
    background: false,
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

/**
 * @param {HTMLElement} root
 */
function addEventsFromDOM(root) {
  const scripts = Array.from(root.querySelectorAll("script"));
  scripts.forEach((element) => {
    const func = new AsyncFunction("", element.textContent);
    EVENTS.set(element.getAttribute("id"), func);
  });

  const triggers = Array.from(root.querySelectorAll("event-trigger"));
  triggers.forEach((element) => {
    const id = element.getAttribute("event");
    const opened = element.getAttribute("opened")?.split(" ") ?? [];
    const closed = element.getAttribute("closed")?.split(" ") ?? [];
    openedClosedTrigger(opened, closed).then(() => RUN_EVENT(id));
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
  extractBody(windowElement.querySelector(".window-body"));
  windowElement.querySelector(".window-close").hidden = data.pinned;
  windowElement.querySelector(".window-title").hidden = data.background;

  if (data.background) {
    windowElement.classList.add("background");
  }

  windowElement.title = data.title;
  windowElement.classList.add(...data.classes);

  [...windowElement.querySelectorAll("style")].forEach((style) => {
    windowElement.append(style);
  });

  applyTransform(windowElement, "style", (element) => {
    const style = element.cloneNode();
    style.textContent = `@scope { ${element.textContent} }`;
    return style;
  })

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

const events = new EventTarget();

async function openedClosedTrigger(opened, closed) {
  return new Promise((resolve, reject) => {
    opened = new Set(opened);
    closed = new Set(closed);

    function check() {
      if (opened.size === 0 && closed.size === 0) {
        resolve();
        events.removeEventListener("opened", onOpened);
        events.removeEventListener("closed", onClosed);
      }
    }

    function onOpened({ detail: id }) {
      opened.delete(id);
      check();
    }

    function onClosed({ detail: id }) {
      closed.delete(id);
      check();
    }

    events.addEventListener("opened", onOpened);
    events.addEventListener("closed", onClosed);
  });
}

async function openedTrigger(...ids) {
  return new Promise((resolve, reject) => {
    const reqs = new Set(ids);

    function check({ detail: id }) {
      reqs.delete(id);
      if (reqs.size === 0) {
        resolve(id);
        events.removeEventListener("opened", check);
      }
    }

    events.addEventListener("opened", check);
  });
}

async function closedTrigger(...ids) {
  return new Promise((resolve, reject) => {
    const reqs = new Set(ids);

    function check({ detail: id }) {
      reqs.delete(id);
      if (reqs.size === 0) {
        resolve(id);
        events.removeEventListener("closed", check);
      }
    }

    events.addEventListener("closed", check);
  });
}

async function firstOpen(id) {
  events.dispatchEvent(new CustomEvent("opened", { detail: id }));
}

async function firstClose(id) {
  events.dispatchEvent(new CustomEvent("closed", { detail: id }));
}