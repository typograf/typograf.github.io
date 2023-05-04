import { saveFile } from '../../helpers/saveFile';
import { i18n } from '../../i18n/i18n';

import '../actionIcon/actionIcon';
import './saveFileIcon.css';

interface SaveFileIconParams {
    onClick: () => void;
    getText: () => string;
}

export class SaveFileIcon {
    private dom = document.querySelector<HTMLSpanElement>('.save-file-icon');

    constructor(private params: SaveFileIconParams) {
        if (this.dom) {
            this.dom.addEventListener('click', () => {
                const success = saveFile(this.params.getText());
                if (!success) {
                    i18n('notSupportSave');
                    return;
                }

                this.params.onClick();
            });
        }
    }
}
