import { debounce } from 'throttle-debounce';

import { makeDiff } from '../diff/diff';
import { highlightEntity } from '../highlightEntity/highlightEntity';
import { hideElement, showElement } from '../../helpers/dom';

import './result.css';

const DEFAULT_RESULT_TYPE = 'text';
type RESULT_TYPE = 'text' | 'html' | 'diff';

export class Result {
    private domTextContainer = document.querySelector<HTMLTextAreaElement>('.result__text');
    private domHtmlContainer = document.querySelector<HTMLDivElement>('.result__html');
    private domDiffContainer = document.querySelector<HTMLDivElement>('.result__diff');

    private domTextRadio = document.querySelector<HTMLInputElement>('.result__as-text');
    private domHtmlRadio = document.querySelector<HTMLInputElement>('.result__as-html');
    private domDiffRadio = document.querySelector<HTMLInputElement>('.result__as-diff');

    private type!: RESULT_TYPE;
    private lastResult = '';

    constructor() {
        if (this.domTextRadio) {
            this.domTextRadio.checked = true;
        }

        this.bindEvents();
        this.setType(DEFAULT_RESULT_TYPE);
    }

    update = (value: string, result: string) => {
        if (result !== this.lastResult) {
            if (this.domTextContainer) {
                this.domTextContainer.value = result;
            }

            if (this.domHtmlContainer) {
                this.domHtmlContainer.innerHTML = highlightEntity(result);
            }

            if (this.domDiffContainer) {
                this.domDiffContainer.innerHTML = makeDiff(value, result);
            }
        }

        this.lastResult = value;
    }

    updateWithDebounce = debounce(250, this.update)

    private setType(type: RESULT_TYPE) {
        this.type = type;

        hideElement(this.domTextContainer);
        hideElement(this.domHtmlContainer);
        hideElement(this.domDiffContainer);

        if (type === 'diff') {
            showElement(this.domDiffContainer);
            if (this.domDiffRadio) {
                this.domDiffRadio.checked = true;
            }
        } else if (type === 'html') {
            showElement(this.domHtmlContainer);
            if (this.domHtmlRadio) {
                this.domHtmlRadio.checked = true;
            }
        } else {
            showElement(this.domTextContainer);
            if (this.domTextRadio) {
                this.domTextRadio.checked = true;
            }
        }
    }

    private bindEvents() {
        this.domTextRadio?.addEventListener('click', () => {
            this.type = 'text';
            this.setType(this.type);
        });

        this.domHtmlRadio?.addEventListener('click', () => {
            this.type = 'html';
            this.setType(this.type);
        });

        this.domDiffRadio?.addEventListener('click', () => {
            this.type = 'diff';
            this.setType(this.type);
        });
    }
}
