import { startMetrika } from './services/metrika';
import { withInstallApp } from './helpers/withInstallApp';
import { App } from './components/App';
import { initI18n } from './i18n/init';
import { config } from './lib/Config';
import { i18nUpdatePage, I18NLanguage, setI18nLang } from './i18n/i18n';
import { Footer } from './components/Footer';
import { metrikaReachGoal } from './services/metrika';
import { h, hydrate, render } from 'preact';
import './components/SeoArticle/index.css';

startMetrika();

initI18n();

withInstallApp();

const appRoot = document.getElementById('app');
const footerRoot = document.getElementById('footer');
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
    const footer = h(Footer, { language, onLanguageChange: updateLanguage });
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
        if (footerRoot) {
            if (canHydrate && footerRoot.firstElementChild) hydrate(footer, footerRoot);
            else {
                footerRoot.replaceChildren();
                render(footer, footerRoot);
            }
        }
        mounted = true;
        return;
    }
    if (appRoot) render(app, appRoot);
    if (footerRoot) render(footer, footerRoot);
}

renderUI();
document.body.classList.remove('transition_no');

