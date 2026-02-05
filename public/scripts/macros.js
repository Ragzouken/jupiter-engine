/**
 * @callback Macro
 * @param {Element} root
 */

/**
 * Query for template elements then query within and create a map of element id
 * to callback on the element. 
 * @template T
 * @param {string} tquery Selector to find template elements.
 * @param {string} query Selector for elements within found templates.
 * @param {(element: Element) => T} callback Callback to map elements. 
 * @returns {Map<string, T>} 
 */
function TEMPLATE_QUERY_MAP(tquery, query, callback) {
  return new Map(
    ALL_TEMPLATE(tquery, query).map((element) => [element.id, callback(element)]),
  );
}

/**
 * Iterate all results of querying a given root or otherwise the document.
 * @param {string} query 
 * @param {ParentNode} root 
 */
function* ALL(query, root = document) {
  for (const element of root.querySelectorAll(query))
    yield element;
}

/**
 * Iterate queried elements inside queried template elements.
 * @param {string} tquery 
 * @param {string} query 
 */
function* ALL_TEMPLATE(tquery, query) {
  for (const template of document.querySelectorAll(tquery))
    for (const element of template.content.querySelectorAll(query))
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
 * @param {(match: Object.<string, string>) => string | Node} replacer 
 * @returns {Macro} 
 */
const REGEX_TEXT_REPLACER_MACRO = (regex, replacer) => (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const current = /** @type {Text} */ (walker.currentNode);
    const [match,] = current.textContent.matchAll(regex);

    if (match === undefined)
      continue;

    // split into three parts, replace middle
    const [first, last] = match.indices[0];
    const element = replacer(match.groups);

    walker.currentNode = current.splitText(last);
    current.splitText(first).replaceWith(element);

    // nextNode() will be right side of the split
    walker.previousNode();
  }
}

const LOAD_MACROS = new Map();

{
  const names = new Map();
  names.set("SCRIPT", "THIS_SCRIPT");
  names.set("TEMPLATE", "PREV_TEMPLATE");

  /**
   * @param {MutationRecord[]} mutations 
   * @param {MutationObserver} observer 
   */
  function callback(mutations, observer) {
    for (const mutation of mutations) {
      const [node] = /** @type {NodeList} */ (mutation.addedNodes);

      for (const [nodeName, varName] of names)
        if (node.nodeName == nodeName)
          window[varName] = node;
      
      if (!node.nodeName.startsWith("#")) {
        const element = /** @type {Element} */ (node);
        const loader = LOAD_MACROS.get(element.getAttribute("data-load-macro"));
        if (loader) loader(element.content ?? element);
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(document, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", () => observer.disconnect());
}
