import { useCallback, useMemo, useState } from 'preact/hooks';
import { getHashParam } from '../../../helpers/hash';
import { Typograf } from '../../../helpers/typograf';
import { trackMetrikaAction } from '../../../services/metrika';
import type { SettingsData } from '../../SettingsPanel/types';
import type { ResultType } from '../../ResultPanel/types';
import type { TextSelection } from '../../SourceTextInput/types';
import type { TooltipMessage } from '../../ui/Tooltip/types';
import { config } from '../../../lib/Config';
import { formatHtml } from '../utils';

export function useEditorState() {
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
    const [previewOpened, setPreviewOpened] = useState(() => config.preview);
    const [resultType, setResultType] = useState<ResultType>('html');
    const [pair, setPair] = useState({ before: '', result: '' });
    const [toast, setToast] = useState<TooltipMessage | null>(null);
    const closeToast = useCallback(() => setToast(null), []);
    const changeSettings = useCallback((value: SettingsData) => {
        config.locale = value.locale;
        config.mode = value.mode;
        config.onlyInvisible = value.onlyInvisible;
        config.rules = value.rules;
        setSettings(value);
    }, []);

    const changeText = useCallback((value: string) => {
        config.text = value;
        setText(value);
    }, []);

    const execute = useCallback((selection?: Pick<TextSelection, 'start' | 'end'>) => {
        let start = selection?.start ?? 0;
        let end = selection?.end ?? text.length;
        if (start === end) return;
        if (selection) {
            // A textarea counts CRLF as one character, but stored text can retain both.
            for (let index = text.indexOf('\r\n'); index !== -1 && index < end; index = text.indexOf('\r\n', index + 2)) {
                if (index < start) start++;
                end++;
            }
        }
        const formatted = formatHtml(text.slice(start, end), typograf, settings);
        const result = text.slice(0, start) + formatted + text.slice(end);
        changeText(result);
        setPair({ before: text, result });
    }, [changeText, text, typograf, settings]);

    const changePreview = useCallback((opened: boolean) => {
        config.preview = opened;
        setPreviewOpened(opened);
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
        previewOpened,
        resultType,
        toast,
        execute,
        setResultType,
        closeToast,
        changeSettings,
        changeText,
        changeLocale,
        changePreview,
        showToast,
    };
}
