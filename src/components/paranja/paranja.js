import $ from 'jquery';

import './paranja.less';

class Paranja {
    constructor() {
        this._dom = $('.paranja');
    }

    show() {
        this._dom.addClass('paranja_opened');
    }

    hide() {
        this._dom.removeClass('paranja_opened');
    }
}

export default new Paranja();
