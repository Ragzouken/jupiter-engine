/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tagName 
 * @param {*} attributes 
 * @param  {...(Node | string)} children 
 * @returns {HTMLElementTagNameMap[K]}
 */
 function html(tagName, attributes = {}, ...children) {
    const element = /** @type {HTMLElementTagNameMap[K]} */ (document.createElement(tagName)); 
    Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
    children.forEach((child) => element.append(child));
    return element;
}

/** @param {number} milliseconds */
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

let activeMusic;

function setMusic(music) {
    if (activeMusic === music) return;
    if (activeMusic) activeMusic.stop();

    activeMusic = music;
    activeMusic.play();
    activeMusic.fade(0, 0.1, 1000);
}

function fadeMusicOut(duration=1) {
    if (activeMusic) {
        activeMusic.fade(activeMusic._volume, 0, duration*1000);
    }
}

/**
 * @param {HTMLElement} handleElement 
 * @param {HTMLElement} draggedElement
 * @param {HTMLElement} boundingElement 
 */
function makeDraggable(handleElement, draggedElement, boundingElement=undefined) {
    boundingElement = boundingElement ?? document.querySelector("html");
    let offset;

    handleElement.addEventListener('pointerdown', (event) => {
        if (event.target !== handleElement) return;
        event.preventDefault();

        const dx = draggedElement.offsetLeft - event.clientX;
        const dy = draggedElement.offsetTop - event.clientY;
        offset = [dx, dy];

        focusWindow(draggedElement);
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

        sounds.move.play();
    });
}

async function flashElement(element, duration=.1) {
    element.classList.toggle("flash", true);
    await sleep(duration * 1000);
    element.classList.toggle("flash", false);
}

let prevZ = 0;

async function exclusiveWindow(windowElement) {
    const screen = document.getElementById("screen");
    screen.style.setProperty("opacity", "100%");
    screen.style.removeProperty("pointer-events");
    focusWindow(screen);
    focusWindow(windowElement);
}

async function hideScreen() {
    const screen = document.getElementById("screen");
    screen.style.setProperty("opacity", "0%");
    screen.style.setProperty("pointer-events", "none");
}

/**
 * @param {HTMLElement} windowElement 
 */
async function focusWindow(windowElement) {
    prevZ += 1;
    windowElement.style.setProperty("z-index", prevZ.toString());
    windowElement.classList.remove("attention");
}

async function attentionWindow(windowElement) {
    windowElement.classList.add("attention");
}

const opened = new Set();
const closedWindows = new Set();

async function openWindow(id) {
    const windowElement = document.getElementById(id);

    window.getSelection().removeAllRanges();

    const reposition = windowElement.hidden === true;

    windowElement.hidden = false;

    if (reposition) {
        const boundingElement = document.querySelector("html");
        const cx = boundingElement.clientWidth / 2;
        const cy = boundingElement.clientHeight / 2;
        const w = windowElement.clientWidth;
        const h = windowElement.clientHeight;

        const ox = Math.random() * 512 - 256;
        const oy = Math.random() * 512 - 256;

        await moveWindow(windowElement, cx-w/2+ox, cy-h/2+oy);
    }

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
    const exceptions = new Set(except);

    document.querySelectorAll(".window").forEach((windowElement) => {
        if (exceptions.has(windowElement)) return;
        
        windowElement.hidden = true;
    });
}

function applyMacros(element) {
    element.innerHTML = element.innerHTML.replaceAll(/\[([^\]]+)\|([^\]]+)\]/g,'<a href="#$2">$1</a>');
    element.querySelectorAll("a").forEach((anchorElement) => {
        const href = anchorElement.getAttribute("href");
        if (href.startsWith("#")) {
            anchorElement.addEventListener("click", (event) => {
                sounds.click.play();
                event.preventDefault();
                event.stopPropagation();

                focusWindow(anchorElement.closest(".window"));
                openWindow(href.slice(1));
            });
        }
    });
}

function extractBody(parentElement) {
    applyMacros(parentElement);

    parentElement.querySelectorAll("img").forEach((imageElement) => {
        const wrapper = html("div", { "class": "img-tint" }); 
        imageElement.parentElement.replaceChild(wrapper, imageElement);
        wrapper.append(imageElement);
    });

    return parentElement.children;
}

function makeWindow(id) {
    const closeButton = html("button", { "class": "window-close" }, "✕");
    const titleElement = html("div", { "class": "window-title" });
    const bodyElement = html("div", { "class": "window-body" });
    const windowElement = html("div", { "class": "window" }, closeButton, titleElement, bodyElement);

    windowElement.id = id;
    windowElement.hidden = true;
    windowElement.addEventListener("mousedown", (event) => focusWindow(windowElement));
    
    makeDraggable(titleElement, windowElement);
    closeButton?.addEventListener("click", () => {
        sounds.click.play();
        closeWindow(windowElement);
    });

    bodyElement.addEventListener("scroll", (event) => {
        sounds.move.play();
        focusWindow(windowElement);
    });

    document.body.append(windowElement);

    return windowElement;
}

/**
 * @param {HTMLElement} container 
 */
async function setupWindow(container, closed=false) {
    const id = container.id;
    const windowElement = document.getElementById(id) ?? makeWindow(id);

    windowElement.querySelector(".window-title").replaceChildren(container.getAttribute("title"));
    windowElement.querySelector(".window-body").replaceChildren(...extractBody(container));
    windowElement.querySelector(".window-close").hidden = container.hasAttribute("data-pinned");

    windowElement.title = container.title;
    windowElement.classList.add(...container.classList);

    if (!closed && container.hasAttribute("data-open")) {
        openWindow(id);
    }

    return windowElement;
}

function replaceWindow(targetId, sourceId) {
    const target = document.getElementById(targetId);
    const source = document.getElementById(sourceId);

    target.querySelector(".window-body").replaceChildren(...source.querySelector(".window-body").children);
}

async function confineWindows() {
    window.requestAnimationFrame(confineWindows);
    
    const boundingElement = document.querySelector("html");
    const width = boundingElement.offsetWidth;
    const height = boundingElement.offsetHeight;

    document.querySelectorAll(".window").forEach((windowElement) => {
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

        windowElement.style.left = minX + 'px';
        windowElement.style.top = minY + 'px';
    });
}

async function loadWindows(id, closed=false) {
    const template = document.getElementById(id);
    template.content.querySelectorAll("p.redacted s").forEach((element) => {
        element.textContent = element.textContent.replaceAll(/[A-z]/g, "X");
    });
    template.content.querySelectorAll("div > div").forEach((element) => setupWindow(element, closed));
    template.remove();
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