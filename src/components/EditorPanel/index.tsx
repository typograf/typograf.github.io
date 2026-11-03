import { useCallback } from 'preact/hooks';
import { block } from '../../helpers/bem';
import { SourceTextInput } from '../SourceTextInput';
import { TypografLocaleSelect } from '../TypografLocaleSelect';
import { ResultPanel } from '../ResultPanel';
import { EditorColumns } from '../EditorColumns';
import { CopyButton } from '../CopyButton';
import { SaveFileButton } from '../SaveFileButton';
import { ShareButton } from '../ShareButton';
import type { EditorPanelProps } from './types';
import './index.css';

const b = block('editor-panel');

export function EditorPanel({ text, settings, pair, resultType, formatted, changeText, changeLocale, setResultType, showToast }: EditorPanelProps) {
    const getText = useCallback(() => formatted, [formatted]);
    const showSaveError = useCallback((message: string) => showToast(message, 'error'), [showToast]);

    return <div class={b()}>
        <EditorColumns left={<>
            <div class={b('head')}><TypografLocaleSelect value={settings.locale} onChange={changeLocale} /></div>
            <SourceTextInput value={text} onChange={changeText} />
        </>} right={<ResultPanel before={pair.before} result={pair.result} type={resultType} onTypeChange={setResultType} actions={<>
                <CopyButton getText={getText} onFeedback={showToast} />
                <SaveFileButton getText={getText} onError={showSaveError} />
                <ShareButton getText={getText} />
            </>} />} />
    </div>;
}
