async function SHOW_TITLE(text) {
  await showTitle(text);
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

function RUN_EVENT_AFTER_SEEN(event, ids) {
  return openedTrigger(...ids).then(() => EVENTS.get(event)());
}

function RUN_EVENT_AFTER_CLOSED(event, ids) {
  return closedTrigger(...ids).then(() => EVENTS.get(event)());
}

async function flashElement(element, duration = .1) {
  element.classList.toggle("flash", true);
  await sleep(duration * 1000);
  element.classList.toggle("flash", false);
}

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

const opened = new Set();
const closedWindows = new Set();

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
