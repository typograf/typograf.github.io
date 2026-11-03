import type { EditorState } from '../App/types';

export type EditorPanelProps = Pick<EditorState,
    'text' | 'settings' | 'pair' | 'resultType' | 'formatted' |
    'changeText' | 'changeLocale' | 'setResultType' | 'showToast'>;
