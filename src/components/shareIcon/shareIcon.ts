import { hideElement } from '../../helpers/dom';
import '../actionIcon/actionIcon';

import './shareIcon.css';

interface ShareIconParams {
    onClick: () => void;
    getText: () => string;
}

export class ShareIcon {
    private dom = document.querySelector<HTMLSpanElement>('.share-icon');

    constructor(private params: ShareIconParams) {
        if (!this.canShare()) {
            hideElement(this.dom);
            return;
        }

        if (this.dom) {
            this.dom.addEventListener('click', () => {
                this.shareText(this.params.getText());
                this.params.onClick();
            });
        }
    }

    private canShare() {
        if (!navigator.canShare || !navigator.canShare({
            text: 'Hello',
        })) {
            return false;
        }

        return true;
    }

    private shareText(text: string) {
        navigator.share({
            text,
        });
    }
}