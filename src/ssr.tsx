import { h } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { App } from './components/App/App';
import { LanguageSelector } from './components/LanguageSelector/LanguageSelector';
import { Extension } from './components/Extension/Extension';
import { initI18n } from './i18n/init';

export function renderInitialPage() {
    initI18n();
    return {
        app: renderToString(h(App, { language: 'ru' })),
        languageSelector: renderToString(h(LanguageSelector, { language: 'ru', onChange: () => {} })),
        extension: renderToString(h(Extension, {})),
    };
}
