/**
 * @callback Macro
 * @param {Element} root
 */

/**
 * @param {string} query 
 * @param {Macro} macro 
 */
function APPLY_QUERY_MACRO(query, macro) {
  for (const element of document.querySelectorAll(query)) {
    macro(element);
  }
}

/**
 * Return a macro that looks at all text nodes under the root and replaces each
 * of them with the element returned by calling replacer with the node's text
 * content.
 * 
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
 * 
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
 * 
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

    const [first, last] = match.indices[0];
    const element = replacer(match.groups);

    walker.currentNode = current.splitText(last);
    current.splitText(first).replaceWith(element);

    walker.previousNode();
  }
}
