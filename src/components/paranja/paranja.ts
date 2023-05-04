import './paranja.css';

interface ParanjaParams {
    onClick: () => void;
}

export class Paranja {
    private dom = document.querySelector('.paranja') as HTMLDivElement;
    constructor(params: ParanjaParams) {
        this.dom.addEventListener('click', () => {
            params.onClick();
        });
    }

    show() {
        this.dom.classList.add('paranja_visible');
    }

    hide() {
        this.dom.classList.remove('paranja_visible');
    }
}
