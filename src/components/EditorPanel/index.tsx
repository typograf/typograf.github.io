import { block } from '../../helpers/bem';
import { i18n } from '../../i18n/i18n';
import { SourceTextInput } from '../SourceTextInput';
import { TypografLocaleSelect } from '../TypografLocaleSelect';
import { ResultPanel } from '../ResultPanel';
import { EditorColumns } from '../EditorColumns';
import { EditorActions } from './EditorActions';
import { useEditorSelection } from './hooks/useEditorSelection';
import { useTypographWithSelection } from './hooks/useTypographWithSelection';
import { Checkbox } from '../ui/Checkbox';
import type { EditorPanelProps } from './types';
import './index.css';

const b = block('editor-panel');

export function EditorPanel({
    active, text, settings, pair, resultType, previewOpened, execute,
    changeText, changeLocale, changePreview, setResultType, showToast,
}: EditorPanelProps) {
    const selection = useEditorSelection(text);
    const executeKeepingSelection = useTypographWithSelection({
        textRef: selection.textRef,
        pair,
        execute,
        onRestore: selection.updateSelectionKind,
    });

    return <div class={b()}>
        <EditorColumns left={<>
            <div class={b('head')}>
                <TypografLocaleSelect value={settings.locale} onChange={changeLocale} />
                <label class={b('preview')}>
                    <Checkbox class={b('preview-toggle')} checked={previewOpened}
                        onChange={event => changePreview(event.currentTarget.checked)} />
                    {i18n('preview')}
                </label>
            </div>
            <SourceTextInput value={text} onChange={changeText} textRef={selection.textRef}
                onSelectionChange={selection.updateSelectionKind} />
        </>} right={previewOpened && <ResultPanel {...pair} text={text} type={resultType} onTypeChange={setResultType} />} />
        <EditorActions active={active} text={text} selection={selection} showToast={showToast}
            executeKeepingSelection={executeKeepingSelection} />
    </div>;
}
