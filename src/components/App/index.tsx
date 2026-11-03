import { Container } from '../Container';
import { Header } from '../Header';
import { SettingsPanel } from '../SettingsPanel';
import { Tooltip } from '../ui/Tooltip';
import { EditorPanel } from '../EditorPanel';
import { useEditorState } from './hooks/useEditorState';
import { useTab } from './hooks/useTab';
import type { AppProps } from './types';
import './index.css';

export function App({ language }: AppProps) {
    const editor = useEditorState();
    const { tab, selectTab } = useTab();

    return <>
        <Header tab={tab} onSelect={selectTab} />
        <Container>
            <SettingsPanel opened={tab === 'prefs'} language={language} typograf={editor.typograf} value={editor.settings} onChange={editor.changeSettings} />
            <EditorPanel {...editor} />
        </Container>
        <Tooltip message={editor.toast} onClose={editor.closeToast} />
    </>;
}
