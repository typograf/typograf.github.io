import type { I18NLanguage } from '../../i18n/i18n';
import type { useEditorState } from './hooks/useEditorState';

export interface AppProps {
    language: I18NLanguage;
}

export type Tab = 'editor' | 'prefs';

export type EditorState = ReturnType<typeof useEditorState>;

declare global {
    interface Window {
        html_beautify: (text: string) => string;
    }
}
