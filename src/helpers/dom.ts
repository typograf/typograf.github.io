export function hideElement(dom: HTMLElement | null) {
    if (dom) {
        dom.style.display = 'none';
    }
}

export function showElement(dom: HTMLElement | null) {
    if (dom) {
        dom.style.display = isInlineElement(dom.tagName) ? 'inline-block' : 'block';
    }
}

function isInlineElement(tagName: string) {
    return tagName === 'SPAN';
}

export function isHiddenElement(dom: HTMLElement | null) {
    if (!dom) {
        return true;
    }

    return !dom.offsetHeight || dom.style.display === 'none';
}

export function toggleElement(dom: HTMLElement | null) {
    if (isHiddenElement(dom)) {
        showElement(dom);
    } else {
        hideElement(dom);
    }
}

export function closest(dom: HTMLElement | null, className: string): Element | null {
    if (!dom) {
        return null;
    }

    let parent = dom;
    while (!parent || !parent.classList?.contains(className)) {
        parent = parent.parentNode as HTMLElement;
    }

    return parent || null;
}

export function disablePageScroll() {
    document.body.style.overflowY = 'hidden';
}

export function enablePageScroll() {
    document.body.style.overflowY = 'visible';
}
