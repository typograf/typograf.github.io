import type { useEditorSelection } from '../hooks/useEditorSelection';
import type { useTypographWithSelection } from '../hooks/useTypographWithSelection';
import type { EditorPanelProps } from '../types';

export type EditorActionsProps = Pick<EditorPanelProps, 'active' | 'text' | 'showToast'> & {
    selection: ReturnType<typeof useEditorSelection>;
    executeKeepingSelection: ReturnType<typeof useTypographWithSelection>;
};
