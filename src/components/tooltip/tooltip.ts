import './tooltip.css';

interface TooltipParams {
    timeout?: number;
}

const DEFAULT_TIMEOUT = 3000;

interface TooltipShowParams {
    text: string;
    type: string;
    autocloseable?: boolean;
}

export class Tooltip {
    private dom: HTMLDivElement;
    private timeout: number;
    private timer?: number;

    constructor(data?: TooltipParams) {
        this.timeout = data?.timeout || DEFAULT_TIMEOUT;

        this.dom = document.createElement('div');
        document.body.appendChild(this.dom);
    }

    show(params: TooltipShowParams) {
        const type = params.type || 'ok';
        this.dom.className = `tooltip tooltip_visible tooltip_type_${type}`;
        this.dom.innerText = params.text;

        if (params.autocloseable) {
            window.clearTimeout(this.timer);
            this.timer = window.setTimeout(() => this.hide(), this.timeout);
        }
    }

    hide() {
        window.clearTimeout(this.timer);
        this.dom.classList.remove('tooltip_visible');
    }
}
