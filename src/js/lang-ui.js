import i18n from './i18n/index';
import localStorage from './lib/local-storage';

class LangUI {
    constructor() {
        this.defaultLang = 'ru';
        this.langs = [
            { value: 'ru', text: 'Rus' },
            { value: 'en-US', text: 'Eng' }
        ];

        this._elem = $('.lang-ui').click(e => {
            this._next();
            this.onChange(e, this.val());
        });

        this._langsByValue = {};
        this.langs.forEach(function(item, i) {
            this._langsByValue[item.value] = item;
            item.index = i;
        }, this);

        this.val(localStorage.getItem('settings.langUI') || this.defaultLang);
    }

    val(value) {
        if (typeof value !== 'undefined') {
            if (value === 'en') {
                value = 'en-US';
            }

            if (this._langsByValue[value]) {
                this._val = value;
                i18n.lang = value;
                localStorage.setItem('settings.langUI', value);

                this._update(value);

                return;
            }
        }

        return this._val;
    }

    _update() {
        this._elem.text(this._langsByValue[this.val()].text);
    }

    _next() {
        let index = this._langsByValue[this.val()].index + 1;
        if (index >= this.langs.length) {
            index = 0;
        }

        this.val(this.langs[index].value);
    }
}

export default new LangUI();
