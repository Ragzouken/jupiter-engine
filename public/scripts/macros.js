/**
 * @callback Macro
 * @param {ParentNode} root
 */

/**
 * @callback Replacer
 * @param {ParentNode} root
 * @returns {string | Node | Node[]}
 */

/**
 * Iterate all results of querying a given root or otherwise the document.
 * @param {string} query 
 * @param {ParentNode} root 
 * @return {Iterable<Element>}
 */
function* ALL(query, root = document) {
  for (const element of root.querySelectorAll(query))
    yield element;
}

/**
 * Return a macro that looks at all text nodes under the root and replaces each
 * of them with the element returned by calling replacer with the node's text
 * content.
 * @param {(text: string) => string} replacer
 * @returns {Macro}
 */
const TEXT_REPLACER_MACRO = (replacer) => (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode())
    walker.currentNode.textContent = replacer(walker.currentNode.textContent);
}

const MARK_REGEX = /\[(?<text>[^\]\|]+)(\|(?<extra>[^\]]+))?\]/gd;

/**
 * Return a macro that looks at all text nodes under the root and replaces
 * instances of [text|extra] with the element returned by calling replacer with
 * the matched text and extra strings. 
 * @param {(text: string, extra: string) => string | Node} replacer 
 * @returns {Macro}
 */
const TEXT_MARK_MACRO = (replacer) =>
  REGEX_TEXT_REPLACER_MACRO(
    MARK_REGEX,
    ({ text, extra }) => replacer(text, extra),
  );

/**
 * Return a macro that looks at all text nodes under the root and replaces text
 * matched with regex with the element returned by calling replacer with the
 * regex match named groups.
 * @param {RegExp} regex 
 * @param {(match: Object.<string, string>) => string | Node | Node[]} replacer 
 * @returns {Macro} 
 */
const REGEX_TEXT_REPLACER_MACRO = (regex, replacer) => (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const prev = /** @type {Text} */ (walker.currentNode);
    const [match,] = prev.textContent.matchAll(regex);

    if (match === undefined)
      continue;

    // split into three parts, replace middle
    const [first, last] = match.indices[0];
    const next = replacer(match.groups);
    const nodes = Array.isArray(next) ? next : [next];

    walker.currentNode = prev.splitText(last);
    prev.splitText(first).replaceWith(...nodes);

    // nextNode() will be right side of the split
    walker.previousNode();
  }
}

/**
 * Return a macro that queries a root node with a selector and replaces each
 * element with the tree returned by running a replacer function on the original
 * element.
 * @param {string} query 
 * @param {Replacer} replacer 
 * @returns
 */
const QUERY_REPLACER_MACRO = (query, replacer) => (root) => {
  const temp = html("template", { "data-temporary-stub": "" });
  
  for (const prev of ALL(query, root)) {
    prev.replaceWith(temp);
    const next = replacer(prev);
    const nodes = Array.isArray(next) ? next : [next];
    temp.replaceWith(...nodes);
  }
}

/** @type {Map<string, Macro>} */
const LOAD_MACROS = new Map();

{
  const NAMES = new Map();
  NAMES.set("SCRIPT", "THIS_SCRIPT");
  NAMES.set("TEMPLATE", "PREV_TEMPLATE");

  /** @type {Set<Element>} */
  const SEEN = new Set();

  const runElementLoader = (element) => {
    SEEN.delete(element);
    const loader = LOAD_MACROS.get(element.getAttribute("data-load-macro"));
    if (loader) loader(element.content ?? element);
  };

  const checkSeen = (next) => {
    for (const element of SEEN)
      if (!element.contains(next))
        runElementLoader(element);
  };

  const finalise = () => {
    observer.disconnect();
    for (const element of SEEN)
      runElementLoader(element);
  };

  /**
   * @param {MutationRecord[]} mutations 
   * @param {MutationObserver} observer 
   */
  const callback = (mutations, observer) => {
    for (const mutation of mutations) {
      const [node] = /** @type {NodeList} */ (mutation.addedNodes);

      checkSeen(node);

      for (const [nodeName, varName] of NAMES)
        if (node.nodeName == nodeName)
          window[varName] = node;

      if (!node.nodeName.startsWith("#")) {
        const element = /** @type {Element} */ (node);
        const loader = LOAD_MACROS.has(element.getAttribute("data-load-macro"));
        if (loader) SEEN.add(element);
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(document, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", () => finalise());
}
