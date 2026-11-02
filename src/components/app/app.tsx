import { useEffect, useMemo, useState } from 'preact/hooks';
import copyTextToClipboard from 'copy-text-to-clipboard';
import { prepareLocale } from '../../helpers/prepareLocale';
import { getHashParam, isPrefsHash, resetHash, setPrefsHash } from '../../helpers/hash';
import { saveFile } from '../../helpers/saveFile';
import { isJSON, typografyJSON } from '../../helpers/json';
import { isHTML } from '../../helpers/string';
import { Typograf } from '../../helpers/typograf';
import { i18n, I18NLanguage } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import { config } from './config';
import { Header } from '../header/header';
import { Input } from '../input/input';
import { Result, ResultType } from '../result/result';
import { LocaleSelect, Prefs, PrefsData } from '../prefs/prefs';
import '../container/container';
import '../table/table';
import '../description/description';
import '../footer/footer';
import '../copyIcon/copyIcon.css';
import '../tooltip/tooltip.css';
import './app.css';

declare global {
    interface Window {
        html_beautify: (text: string) => string;
    }
}

interface AppProps {
    language: I18NLanguage;
}

function formatText(text: string, typograf: InstanceType<typeof Typograf>, settings: PrefsData) {
    const options = {
        locale: prepareLocale(settings.locale),
        htmlEntity: { type: settings.mode, onlyInvisible: settings.onlyInvisible },
    };
    if (isJSON(text)) {
        return typografyJSON(text, value => typograf.execute(value, options));
    }
    let result = typograf.execute(text, options);
    if (isHTML(result) && window.html_beautify) {
        result = window.html_beautify(result);
    }
    return result;
}

export function App({ language }: AppProps) {
    const typograf = useMemo(() => {
        const instance = new Typograf({ locale: ['ru'] });
        instance.enableRule(config.rules.enabled);
        instance.disableRule(config.rules.disabled);
        return instance;
    }, []);
    const [text, setText] = useState(() => getHashParam('text') || config.text);
    const [settings, setSettings] = useState<PrefsData>(() => ({
        locale: config.locale,
        mode: config.mode,
        onlyInvisible: config.onlyInvisible,
        rules: config.rules,
    }));
    const [pair, setPair] = useState(() => ({ before: text, result: formatText(text, typograf, settings) }));
    const [tab, setTab] = useState<'editor' | 'prefs'>(() => isPrefsHash() ? 'prefs' : 'editor');
    const [resultType, setResultType] = useState<ResultType>('text');
    const [toast, setToast] = useState<{ text: string, type: 'ok' | 'error' } | null>(null);
    const formatted = useMemo(() => formatText(text, typograf, settings), [text, settings, typograf]);

    useEffect(() => {
        if (text.length < 10000) {
            setPair({ before: text, result: formatted });
            return;
        }
        const timer = window.setTimeout(() => setPair({ before: text, result: formatted }), 250);
        return () => window.clearTimeout(timer);
    }, [text, formatted]);

    useEffect(() => {
        document.body.style.overflowY = tab === 'prefs' ? 'hidden' : 'visible';
        return () => { document.body.style.overflowY = ''; };
    }, [tab]);

    useEffect(() => {
        const onHashChange = () => setTab(isPrefsHash() ? 'prefs' : 'editor');
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToast(null), 3000);
        return () => window.clearTimeout(timer);
    }, [toast]);

    function changeText(value: string) {
        config.text = value;
        setText(value);
    }

    function changeSettings(value: PrefsData) {
        config.locale = value.locale;
        config.mode = value.mode;
        config.onlyInvisible = value.onlyInvisible;
        config.rules = value.rules;
        setSettings(value);
    }

    function selectTab(next: 'editor' | 'prefs') {
        if (next === tab) return;
        setTab(next);
        if (next === 'prefs') {
            setPrefsHash();
            metrikaReachGoal('settings-open');
        } else {
            resetHash();
            metrikaReachGoal('settings-close');
        }
    }

    function copyResult() {
        if (copyTextToClipboard(formatted)) {
            setToast({ text: i18n('copied'), type: 'ok' });
        } else {
            setToast({ text: i18n('notSupportCopy'), type: 'error' });
        }
        metrikaReachGoal('copy-text');
    }

    function saveResult() {
        if (saveFile(formatted)) {
            metrikaReachGoal('save-text');
        } else {
            setToast({ text: i18n('notSupportSave'), type: 'error' });
        }
    }

    return <>
        <Header tab={tab} onSelect={selectTab} />
        <div class="container">
            <Prefs opened={tab === 'prefs'} language={language} typograf={typograf} value={settings} onChange={changeSettings} />
            <div class="input">
                <div class="table">
                    <div class="table__left">
                        <div class="input__head"><LocaleSelect value={settings.locale} onChange={value => {
                            changeSettings({ ...settings, locale: value });
                            metrikaReachGoal('select-locale', { changeLocale: value });
                        }} /></div>
                        <Input value={text} onChange={changeText} />
                    </div>
                    <Result before={pair.before} result={pair.result} type={resultType} onTypeChange={setResultType} actions={<>
                        <button type="button" class="copy-button button" onClick={copyResult}><span class="copy-icon" />{i18n('copy')}</button>
                        <button type="button" class="save-file-button button" onClick={saveResult}>{i18n('save')}</button>
                    </>} />
                </div>
            </div>
        </div>
        {toast && <div class={`tooltip tooltip_visible tooltip_type_${toast.type}`} role="status">{toast.text}</div>}
    </>;
}
