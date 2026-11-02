import copyTextToClipboard from 'copy-text-to-clipboard';
import { i18n } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import { ActionIcon } from '../ActionIcon/ActionIcon';
import './CopyIcon.css';

interface CopyIconProps {
    getText: () => string;
    onFeedback: (text: string, type: 'ok' | 'error') => void;
}

export function CopyIcon({ getText, onFeedback }: CopyIconProps) {
    function copy() {
        if (copyTextToClipboard(getText())) {
            onFeedback(i18n('copied'), 'ok');
        } else {
            onFeedback(i18n('notSupportCopy'), 'error');
        }
        metrikaReachGoal('copy-text');
    }

    return <ActionIcon buttonClass="copy-button" iconClass="copy-icon" label={i18n('copy')} onClick={copy} />;
}
