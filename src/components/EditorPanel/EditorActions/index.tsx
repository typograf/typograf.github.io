import { useCallback, useEffect, useState } from 'preact/hooks';
import classNames from 'classnames';
import { block } from '../../../helpers/bem';
import { isMacPlatform } from '../../../helpers/browser';
import { i18n } from '../../../i18n/i18n';
import { CopyButton } from '../../CopyButton';
import { SaveFileButton } from '../../SaveFileButton';
import { ShareButton } from '../../ShareButton';
import { Button } from '../../ui/Button';
import type { EditorActionsProps } from './types';

const b = block('editor-panel');

export function EditorActions({ active, text, selection, showToast, executeKeepingSelection }: EditorActionsProps) {
    const { textRef, selectionKind, selectAll, getCopyContent } = selection;
    const getText = useCallback(() => text, [text]);
    const showSaveError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const executeAll = useCallback(() => executeKeepingSelection(), [executeKeepingSelection]);
    const executeSelected = useCallback(() => executeKeepingSelection(true), [executeKeepingSelection]);
    const keepInputFocus = useCallback((event: MouseEvent) => {
        if (event.button === 0 && document.activeElement === textRef.current &&
            event.target instanceof Element && event.target.closest('button')) {
            event.preventDefault();
        }
    }, [textRef]);
    const [isMac, setIsMac] = useState(false);
    const executeLabel = i18n('to-typograf');
    const executeSelectionLabel = i18n('to-typograf-selection');
    const shortcutModifier = isMac ? '⌘' : 'Ctrl';
    const ariaShortcutModifier = isMac ? 'Meta' : 'Control';

    useEffect(() => setIsMac(isMacPlatform()), []);
    useEffect(() => {
        if (!active || !text) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Enter' || event.defaultPrevented || event.isComposing ||
                event.repeat || event.altKey) return;
            const modifierPressed = isMac ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
            if (modifierPressed && executeKeepingSelection(event.shiftKey)) event.preventDefault();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [active, text, isMac, executeKeepingSelection]);

    return <div class={b('actions')} onMouseDown={keepInputFocus}>
        <Button type="button" class={classNames(b('execute'), 'button_type_action')} disabled={!text}
            onClick={executeAll}
            title={`${executeLabel} (${shortcutModifier} + Enter)`}
            aria-keyshortcuts={`${ariaShortcutModifier}+Enter`}>
            {executeLabel}
        </Button>
        <Button type="button" class={b('execute-selection', { hidden: selectionKind === 'none' })}
            onClick={executeSelected}
            title={`${executeSelectionLabel} (${shortcutModifier} + Shift + Enter)`}
            aria-keyshortcuts={`${ariaShortcutModifier}+Shift+Enter`}>
            {executeSelectionLabel}
        </Button>
        <Button type="button" class={b('select-all')} disabled={!text} onClick={selectAll}>
            {i18n('select-all-text')}
        </Button>
        <CopyButton getContent={getCopyContent} hasPartialSelection={selectionKind === 'partial'} disabled={!text} />
        <ShareButton getText={getText} />
        <SaveFileButton getText={getText} onError={showSaveError} />
    </div>;
}
