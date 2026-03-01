const HIGHLIGHT_ATTR = 'data-overseer-highlight';

const MARK_STYLE =
  'background-color: rgba(163, 13, 19, 0.15); border-radius: 2px; display: inline;';

/**
 * Wraps every text node within a Range in a styled <mark> element.
 * Returns a cleanup function that unwraps the marks.
 */
export function applyHighlightToRange(range: Range): () => void {
  const marks: HTMLElement[] = [];

  // Collect text nodes in the range, skipping SVG elements
  // (inserting HTML <mark> elements into SVG namespace breaks rendering)
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Node) {
        if (!range.intersectsNode(node)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.parentElement?.closest('svg')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  let node = walker.nextNode();
  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }

  for (const textNode of textNodes) {
    // Determine which part of this text node is inside the range
    let startOffset = 0;
    let endOffset = textNode.length;

    if (textNode === range.startContainer) {
      startOffset = range.startOffset;
    }
    if (textNode === range.endContainer) {
      endOffset = range.endOffset;
    }

    if (startOffset === endOffset) continue;

    // Split off the portion we need to wrap
    const targetNode =
      startOffset > 0 ? textNode.splitText(startOffset) : textNode;
    if (endOffset - startOffset < targetNode.length) {
      targetNode.splitText(endOffset - startOffset);
    }

    const mark = document.createElement('mark');
    mark.setAttribute('style', MARK_STYLE);
    mark.setAttribute(HIGHLIGHT_ATTR, 'true');
    targetNode.parentNode?.replaceChild(mark, targetNode);
    mark.appendChild(targetNode);
    marks.push(mark);
  }

  // Return cleanup
  return () => {
    for (const mark of marks) {
      const parent = mark.parentNode;
      if (!parent) continue;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      parent.normalize();
    }
  };
}

/**
 * Safety fallback: remove ALL overseer highlight marks from the document.
 */
export function removeAllHighlights(): void {
  const marks = document.querySelectorAll(`mark[${HIGHLIGHT_ATTR}]`);
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
    parent.normalize();
  });
}
