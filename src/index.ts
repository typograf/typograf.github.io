import { startMetrika } from './services/metrika';
import { withInstallApp } from './helpers/withInstallApp';
import { App } from './components/app/app';
import { initI18n } from './i18n/init';
import { config } from './components/app/config';
import { i18nUpdatePage, I18NLanguage, setI18nLang } from './i18n/i18n';
import { LanguageSelector } from './components/languageSelector/languageSelector';
import { metrikaReachGoal } from './services/metrika';
import { h, render } from 'preact';

startMetrika();

initI18n();

withInstallApp();

const appRoot = document.getElementById('app');
const languageRoot = document.getElementById('language-selector');

function updateLanguage(language: I18NLanguage) {
    setI18nLang(language);
    config.language = language;
    i18nUpdatePage();
    metrikaReachGoal('switch-lang');
    renderUI();
}

function renderUI() {
    const language = config.language as I18NLanguage;
    if (appRoot) render(h(App, { language }), appRoot);
    if (languageRoot) render(h(LanguageSelector, { language, onChange: updateLanguage }), languageRoot);
}

renderUI();
document.body.classList.remove('transition_no');

