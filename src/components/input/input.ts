import { hideElement, showElement } from '../../helpers/dom';
import '../textarea/textarea';

import './input.css';

interface InputParams {
    isMobile: boolean;
    onChange: () => void;
}

export class Input {
    private domText = document.querySelector('.input__text') as HTMLTextAreaElement;
    private domClear = document.querySelector<HTMLDivElement>('.input__clear');
    private domExecute = document.querySelector<HTMLDivElement>('.input__execute');

    constructor(private params: InputParams) {
        this.bindEvents();
    }

    setValue(value: string) {
        this.domText.value = value;
        this.updateClear();
    }

    getValue() {
        return this.domText.value;
    }

    private bindEvents() {
        if (this.domClear) {
            this.domClear.addEventListener('click', () => {
                this.setValue('');
                this.domText.focus();
                this.params.onChange();
            });
        }

        if (this.params.isMobile) {
            if (this.domExecute) {
                this.domExecute.addEventListener('click', () => {
                    this.params.onChange();
                });
            }
        } else {
            this.domText.addEventListener('input', this.handleInput);
        }

        this.domText.addEventListener('input', this.updateClear);
    }

    private updateClear = () => {
        const value = this.getValue();
        if (value.length > 0) {
            showElement(this.domClear);
        } else {
            hideElement(this.domClear);
        }
    }

    private handleInput = () => {
        this.params.onChange();
    }
}