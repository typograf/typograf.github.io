import { startMetrika } from './services/metrika';
import { withInstallApp } from './helpers/withInstallApp';
import { App } from './components/App/App';
import { initI18n } from './i18n/init';
import { config } from './components/App/config';
import { i18nUpdatePage, I18NLanguage, setI18nLang } from './i18n/i18n';
import { LanguageSelector } from './components/LanguageSelector/LanguageSelector';
import { Extension } from './components/Extension/Extension';
import { metrikaReachGoal } from './services/metrika';
import { h, hydrate, render } from 'preact';

startMetrika();

initI18n();

withInstallApp();

const appRoot = document.getElementById('app');
const languageRoot = document.getElementById('language-selector');
const extensionRoot = document.getElementById('extension');
let mounted = false;

function updateLanguage(language: I18NLanguage) {
    setI18nLang(language);
    config.language = language;
    i18nUpdatePage();
    metrikaReachGoal('switch-lang');
    renderUI();
}

function renderUI() {
    const language = config.language as I18NLanguage;
    const app = h(App, { language });
    const selector = h(LanguageSelector, { language, onChange: updateLanguage });
    const extension = h(Extension, {});
    if (!mounted) {
        const canHydrate = language === 'ru' && config.locale === 'ru' && config.mode === 'default' &&
            !config.onlyInvisible && !config.text && !config.rules.enabled.length &&
            !config.rules.disabled.length && !window.location.hash;
        if (appRoot) {
            if (canHydrate && appRoot.firstElementChild) hydrate(app, appRoot);
            else {
                appRoot.replaceChildren();
                render(app, appRoot);
            }
        }
        if (languageRoot) {
            if (canHydrate && languageRoot.firstElementChild) hydrate(selector, languageRoot);
            else {
                languageRoot.replaceChildren();
                render(selector, languageRoot);
            }
        }
        if (extensionRoot) {
            if (extensionRoot.firstElementChild) hydrate(extension, extensionRoot);
            else render(extension, extensionRoot);
        }
        mounted = true;
        return;
    }
    if (appRoot) render(app, appRoot);
    if (languageRoot) render(selector, languageRoot);
    if (extensionRoot) render(extension, extensionRoot);
}

renderUI();
document.body.classList.remove('transition_no');

