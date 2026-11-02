import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { App } from './components/app/app';
import { LanguageSelector } from './components/languageSelector/languageSelector';
import { initI18n } from './i18n/init';

export function renderInitialPage() {
    initI18n();
    return {
        app: renderToString(h(App, { language: 'ru' })),
        languageSelector: renderToString(h(LanguageSelector, { language: 'ru', onChange: () => {} })),
    };
}
