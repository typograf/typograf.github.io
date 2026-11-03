import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { App } from './components/App';
import { Footer } from './components/Footer';
import { SeoArticle } from './components/SeoArticle';
import { SeoHead } from './components/SeoHead';
import { initI18n } from './i18n/init';

export function renderInitialPage() {
    initI18n();
    return {
        app: renderToString(h(App, { language: 'ru' })),
        seoHead: renderToString(h(SeoHead, {})),
        seo: renderToString(h(SeoArticle, {})),
        footer: renderToString(h(Footer, { language: 'ru', onLanguageChange: () => {} })),
    };
}
