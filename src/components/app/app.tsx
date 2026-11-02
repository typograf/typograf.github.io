import { useEffect, useMemo, useState } from 'preact/hooks';
import { prepareLocale } from '../../helpers/prepareLocale';
import { getHashParam, isPrefsHash, resetHash, setPrefsHash } from '../../helpers/hash';
import { isJSON, typografyJSON } from '../../helpers/json';
import { isHTML } from '../../helpers/string';
import { Typograf } from '../../helpers/typograf';
import { I18NLanguage } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import { config } from './config';
import { Header } from '../header/header';
import { Input } from '../input/input';
import { Result, ResultType } from '../result/result';
import { Prefs } from '../prefs/prefs';
import { LocaleSelect } from '../prefs/localeSelect';
import type { PrefsData } from '../prefs/prefsTypes';
import { CopyIcon } from '../copyIcon/copyIcon';
import { SaveFileIcon } from '../saveFileIcon/saveFileIcon';
import { ShareIcon } from '../shareIcon/shareIcon';
import '../container/container';
import '../table/table';
import '../description/description';
import '../footer/footer';
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
                        <CopyIcon getText={() => formatted} onFeedback={(message, type) => setToast({ text: message, type })} />
                        <SaveFileIcon getText={() => formatted} onError={message => setToast({ text: message, type: 'error' })} />
                        <ShareIcon getText={() => formatted} />
                    </>} />
                </div>
            </div>
        </div>
        {toast && <div class={`tooltip tooltip_visible tooltip_type_${toast.type}`} role="status">{toast.text}</div>}
    </>;
}
