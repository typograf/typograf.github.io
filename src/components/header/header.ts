import './header.css';

import SnowFlakes from 'magic-snowflakes';
import 'magic-snowflakes/dist/index.css';

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

        const snowflakes = new SnowFlakes({
            container: this.snow,
            color: '#ffffff',
            count: 20,
            speed: 0.3,
            height: 300,
        });

        snowflakes.start();
    }
}