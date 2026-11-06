import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { getHashParam } from '../../../helpers/hash';
import { Typograf } from '../../../helpers/typograf';
import { trackMetrikaAction } from '../../../services/metrika';
import type { SettingsData } from '../../SettingsPanel/types';
import type { ResultType } from '../../ResultPanel/types';
import type { TooltipMessage } from '../../ui/Tooltip/types';
import { config } from '../../../lib/Config';
import { formatHtml } from '../utils';

export function useEditorState() {
    const [eyoLoaded, setEyoLoaded] = useState(() => Boolean(window.safeEyo));
    const typograf = useMemo(() => {
        const instance = new Typograf({ locale: ['ru'] });
        instance.enableRule(config.rules.enabled);
        instance.disableRule(config.rules.disabled);
        return instance;
    }, []);
    const [text, setText] = useState(() => getHashParam('text') || config.text);
    const [settings, setSettings] = useState<SettingsData>(() => ({
        locale: config.locale,
        mode: config.mode,
        onlyInvisible: config.onlyInvisible,
        rules: config.rules,
    }));
    const [pair, setPair] = useState(() => ({ before: text, result: formatHtml(text, typograf, settings) }));
    const [resultType, setResultType] = useState<ResultType>('text');
    const [toast, setToast] = useState<TooltipMessage | null>(null);
    const closeToast = useCallback(() => setToast(null), []);
    const changeSettings = useCallback((value: SettingsData) => {
        config.locale = value.locale;
        config.mode = value.mode;
        config.onlyInvisible = value.onlyInvisible;
        config.rules = value.rules;
        setSettings(value);
    }, []);
    const formatted = useMemo(() => formatHtml(text, typograf, settings), [text, settings, typograf, eyoLoaded]);

    useEffect(() => {
        const script = document.querySelector<HTMLScriptElement>('script[src*="/dist/eyo.js"]');
        const onLoad = () => {
            if (window.safeEyo) setEyoLoaded(true);
        };
        script?.addEventListener('load', onLoad);
        onLoad();
        return () => script?.removeEventListener('load', onLoad);
    }, []);

    useEffect(() => {
        if (text.length < 10000) {
            setPair({ before: text, result: formatted });
            return;
        }
        const timer = window.setTimeout(() => setPair({ before: text, result: formatted }), 250);
        return () => window.clearTimeout(timer);
    }, [text, formatted]);

    const changeText = useCallback((value: string) => {
        config.text = value;
        setText(value);
    }, []);

    const changeLocale = useCallback((value: string) => {
        changeSettings({ ...settings, locale: value });
        trackMetrikaAction('select-locale', value);
    }, [changeSettings, settings]);

    const showToast = useCallback((message: string, type: TooltipMessage['type']) => {
        setToast({ text: message, type });
    }, []);

    return {
        typograf,
        text,
        settings,
        pair,
        resultType,
        toast,
        formatted,
        setResultType,
        closeToast,
        changeSettings,
        changeText,
        changeLocale,
        showToast,
    };
}
