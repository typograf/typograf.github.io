import $ from 'jquery';

import './tooltip.less';

export default class Tooltip {
    constructor(data) {
        data = data || {};
        this._timeout = data.timeout || 3000;
        this._dom = $('<div>', {'class': 'tooltip'});
        this._dom.appendTo('body');
    }

    show(text, type, autocloseable) {
        this._dom
            .attr('class', 'tooltip tooltip_visible tooltip_type_' + (type || 'ok'))
            .text(text);

        if (autocloseable) {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this.hide(), this._timeout);
        }
    }

    hide() {
        this._dom.removeClass('tooltip_visible');
    }

    destroy() {
        this._dom && this._dom.remove();
        delete this._dom;
    }
}
