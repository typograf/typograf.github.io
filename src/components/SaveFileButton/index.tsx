import { useCallback } from 'preact/hooks';
import { block } from '../../helpers/bem';
import { saveFile } from '../../helpers/saveFile';
import { i18n } from '../../i18n/i18n';
import { trackMetrikaAction } from '../../services/metrika';
import { IconButton } from '../IconButton';
import type { SaveFileButtonProps } from './types';
import './index.css';

const b = block('save-file-button');

export function SaveFileButton({ getText, onError }: SaveFileButtonProps) {
    const save = useCallback(() => {
        if (saveFile(getText())) {
            trackMetrikaAction('save-text');
        } else {
            onError(i18n('notSupportSave'));
        }
    }, [getText, onError]);

    return <IconButton buttonClass={b()} iconClass={b('icon')} label={i18n('save')} onClick={save} />;
}
