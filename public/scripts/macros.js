/**
 * @param {string} query 
 * @param {(element: Element) => {}} apply 
 */
function APPLY_MACRO(query, apply) {
  for (const element of document.querySelectorAll(query)) {
    apply(element);
  }
}

/**
 * @param {Element} root
 * @param {(text: string) => string} replacer
 */
function applyTreeTextToTextReplacer(root, replacer) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode())
    walker.currentNode.textContent = replacer(walker.currentNode.textContent);
}

/**
 * @param {Element} root 
 * @param {RegExp} regex
 * @param {(match: Object.<string, string>) => Element} replacer 
 */
function applyTreeTextRegexReplacer(root, regex, replacer) {
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
