import './header.css';

interface HeaderParams {
    onClick: () => void;
}

export class Header {
    private dom = document.querySelector('.header') as HTMLDivElement;
    private snow: HTMLDivElement;

    constructor(params: HeaderParams) {
        this.dom.addEventListener('click', () => {
            params.onClick();
        });

        this.snow = document.createElement('div');
        this.snow.className = 'header__snow';

        this.dom.appendChild(this.snow);
    }
}