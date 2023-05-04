import './header.css';

interface HeaderParams {
    onClick: () => void;
}

export class Header {
    private dom = document.querySelector('.header') as HTMLDivElement;

    constructor(params: HeaderParams) {
        this.dom.addEventListener('click', () => {
            params.onClick();
        });
    }
}