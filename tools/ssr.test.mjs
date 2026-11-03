import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { JSDOM } from 'jsdom';

test('published HTML contains rendered interface and crawlable article before JavaScript', () => {
    const html = readFileSync('index.html', 'utf8');
    expect(/<div id="app">\s*<header class="header">/.test(html)).toBe(true);
    expect(html).toContain('<meta name="description"');
    expect(html).toContain('<link rel="canonical" href="https://typograf.github.io">');
    expect(html.indexOf('<!--/noindex-->')).toBeLessThan(html.indexOf('<main id="seo">'));
    expect(html).toContain('<main id="seo">');
    expect(html).toContain('<article class="seo-article">');
    expect(html).toContain('<h1>Типограф</h1>');
    const document = new JSDOM(html).window.document;
    expect(document.querySelector('#app .result-panel__text')).toBeTruthy();
    expect(document.querySelector('#app .result-panel__html')).toBeNull();
    expect(document.querySelector('#app .result-panel__diff')).toBeNull();
    expect(document.querySelector('#footer .interface-language-toggle')?.textContent).toBe('Русский');
    expect(document.getElementById('interface-language-toggle')).toBeNull();
    expect(document.title).toBe('Онлайн Типограф: исправьте и улучшите ваш текст бесплатно');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content'))
        .toContain('умный онлайн-инструмент для автоматического исправления типографики');
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content'))
        .toBe('Типограф — помощь с монотонной вёрсткой текстов');
    const article = document.querySelector('#seo > article.seo-article');
    expect(article?.querySelectorAll('h2').length).toBe(6);
    expect(article?.querySelector('a[href="https://github.com/typograf/typograf/blob/dev/docs/RULES.ru.md"]')?.textContent).toBe('список правил');
    const footer = document.querySelector('#footer > footer.footer');
    expect(footer?.querySelector('a[href="https://t.me/webtypograf"]')?.textContent).toBe('@webtypograf');
    expect(footer?.querySelector('a[href="https://checkdevice.online/?from=typograf.github.io"]')?.textContent).toBe('Проверь');
    expect(footer?.querySelector('.footer__version')?.textContent).toMatch(/^\d+\.\d+\.\d+$/);
    expect(document.getElementById('extension')).toBeNull();
    const link = footer?.querySelector('.browser-extension-link__link');
    expect(link?.getAttribute('href')).toBe('https://chrome.google.com/webstore/detail/red-typography/dgmmkhdeghobfcedlnmgbncknnfjhnmo');
    expect(link?.textContent).toBe('Google Chrome');
});

test('published settings show descriptions for every rule before JavaScript', () => {
    const html = readFileSync('index.html', 'utf8');
    const document = new JSDOM(html).window.document;
    const rules = [...document.querySelectorAll('.rule-group__rule')];
    const missing = rules
        .filter(rule => !rule.querySelector('label > span')?.textContent?.trim())
        .map(rule => rule.getAttribute('title'));

    expect(rules.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
});
