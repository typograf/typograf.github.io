import DOMPurify from 'dompurify';
import { isHTML } from '../../helpers/string';

export function getCopyExcerpt(text: string) {
    const plainText = isHTML(text)
        ? DOMPurify.sanitize(text, { RETURN_DOM_FRAGMENT: true }).textContent ?? ''
        : text;
    const normalized = plainText.replace(/\s+/g, ' ').trim();
    const limit = 16;
    let excerpt = '';
    let length = 0;
    for (const character of normalized) {
        if (length === limit) return excerpt + '…';
        excerpt += character;
        length++;
    }
    return excerpt;
}
