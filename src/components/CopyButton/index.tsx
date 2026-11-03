import copyTextToClipboard from 'copy-text-to-clipboard';
import { useCallback } from 'preact/hooks';
import { block } from '../../helpers/bem';
import { i18n } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import { IconButton } from '../IconButton';
import type { CopyButtonProps } from './types';
import './index.css';

const b = block('copy-button');

export function CopyButton({ getText, onFeedback }: CopyButtonProps) {
    const copy = useCallback(() => {
        if (copyTextToClipboard(getText())) {
            onFeedback(i18n('copied'), 'ok');
        } else {
            onFeedback(i18n('notSupportCopy'), 'error');
        }
        metrikaReachGoal('copy-text');
    }, [getText, onFeedback]);

    return <IconButton buttonClass={b()} iconClass={b('icon')} label={i18n('copy')} onClick={copy} />;
}
