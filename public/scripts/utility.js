/**
 * 
 * @param {Element} element 
 * @param {string} name 
 * @param {number} duration
 */
async function PULSE_CLASS(element, name, duration=.1) {
    element.classList.toggle(name, true);
    await sleep(duration * 1000);
    element.classList.toggle(name, false);
}

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

/**
 * @param {string} source 
 * @returns {Element[]}
 */
function parseHtml(source) {
  const parser = new DOMParser();
  const document = parser.parseFromString(source, "text/html");
  const elements = [...document.querySelector("body").children];
  return elements;
}

/** 
 * @param {number} milliseconds 
 * @returns {Promise}
 */
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function randFloat(min, max) {
    return min + (max - min) * Math.random();
}

function randInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

// async equivalent of Function constructor
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
