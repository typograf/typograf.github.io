import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { JSDOM } from 'jsdom';

test('published HTML contains rendered interface and crawlable article before JavaScript', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(/<div id="app">\s*<header class="header">/.test(html)).toBe(true);
    expect(/<span id="language-selector">\s*<span class="language-selector">Русский<\/span>/.test(html)).toBe(true);
    expect(html).toContain('<meta name="description"');
    expect(html).toContain('<link rel="canonical" href="https://typograf.github.io">');
    expect(html.indexOf('<!--/noindex-->')).toBeLessThan(html.indexOf('<main>'));
    expect(html).toContain('<article class="description">');
    expect(html).toContain('<h1>Типограф</h1>');
    const link = new JSDOM(html).window.document.querySelector('#extension .extension__link');
    expect(link?.getAttribute('href')).toBe('https://chrome.google.com/webstore/detail/red-typography/dgmmkhdeghobfcedlnmgbncknnfjhnmo');
    expect(link?.textContent).toBe('Google Chrome');
});
