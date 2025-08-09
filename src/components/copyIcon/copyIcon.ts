import copyTextToClipboard from 'copy-text-to-clipboard';
import { i18n } from '../../i18n/i18n';
import { Tooltip } from '../tooltip/tooltip';

import '../actionIcon/actionIcon';

import './copyIcon.css';

interface CopyIconParams {
    onClick: () => void;
    getText: () => string;
}

export class CopyIcon {
    private dom = document.querySelector<HTMLSpanElement>('.copy-button') || document.querySelector<HTMLSpanElement>('.copy-icon');

    private tooltip = new Tooltip();

    constructor(private params: CopyIconParams) {
        if (this.dom) {
            this.dom.addEventListener('click', () => {
                if (copyTextToClipboard(this.params.getText())) {
                    this.tooltip.show({
                        text: i18n('copied'),
                        type: 'ok',
                        autocloseable: true,
                    });
                } else {
                    this.tooltip.show({
                        text: i18n('notSupportCopy'),
                        type: 'error',
                        autocloseable: true,
                    });
                }

                this.params.onClick();
            });
        }
    }
}