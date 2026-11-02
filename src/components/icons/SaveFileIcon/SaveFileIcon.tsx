import { saveFile } from '../../../helpers/saveFile';
import { i18n } from '../../../i18n/i18n';
import { metrikaReachGoal } from '../../../services/metrika';
import { ActionIcon } from '../ActionIcon/ActionIcon';
import './SaveFileIcon.css';

interface SaveFileIconProps {
    getText: () => string;
    onError: (text: string) => void;
}

export function SaveFileIcon({ getText, onError }: SaveFileIconProps) {
    function save() {
        if (saveFile(getText())) {
            metrikaReachGoal('save-text');
        } else {
            onError(i18n('notSupportSave'));
        }
    }

    return <ActionIcon buttonClass="save-file-button" iconClass="action-icon save-file-icon" label={i18n('save')} onClick={save} />;
}
