import { Container } from '../Container';
import { Header } from '../Header';
import { SettingsPanel } from '../SettingsPanel';
import { Tooltip } from '../ui/Tooltip';
import { EditorPanel } from '../EditorPanel';
import { useEditorState } from './hooks/useEditorState';
import { useTab } from './hooks/useTab';
import { useTheme } from './hooks/useTheme';
import type { AppProps } from './types';
import './index.css';

export function App({ language }: AppProps) {
    const editor = useEditorState();
    const { tab, selectTab } = useTab();
    const { theme, changeTheme } = useTheme();

    return <>
        <Header tab={tab} onSelect={selectTab} theme={theme} onThemeChange={changeTheme} />
        <Container>
            <SettingsPanel opened={tab === 'prefs'} language={language} typograf={editor.typograf} value={editor.settings} onChange={editor.changeSettings} />
            <EditorPanel {...editor} active={tab === 'editor'} />
        </Container>
        <Tooltip message={editor.toast} onClose={editor.closeToast} />
    </>;
}
