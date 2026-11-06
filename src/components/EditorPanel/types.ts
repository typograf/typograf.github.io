import type { RefObject } from 'preact';
import type { EditorState } from '../App/types';
import type { TextSelection } from '../SourceTextInput/types';

export type EditorPanelProps = Pick<EditorState,
    'text' | 'settings' | 'pair' | 'resultType' | 'previewOpened' | 'execute' |
    'changeText' | 'changeLocale' | 'changePreview' | 'setResultType' | 'showToast'> & { active: boolean };

export type TypographWithSelectionOptions = Pick<EditorPanelProps, 'pair' | 'execute'> & {
    textRef: RefObject<HTMLTextAreaElement | null>;
    onRestore: (input: HTMLTextAreaElement) => void;
};

export interface PendingSelection {
    selection: TextSelection;
    selectedOnly: boolean;
}

export type SelectionKind = 'none' | 'partial' | 'all';
