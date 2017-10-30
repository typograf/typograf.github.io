var i18n = require('./i18n');
var localStorage = require('./lib/local-storage');
var Block = {
    defaultLang: 'ru',
    langs: [
        { value: 'ru', text: 'Rus' },
        { value: 'en-US', text: 'Eng' }
    ],
    init: function() {
        this._elem = $('.lang-ui').click(function(e) {
            this._next();
            this.onChange(e, this.val());
        }.bind(this));

        this._langsByValue = {};
        this.langs.forEach(function(item, i) {
            this._langsByValue[item.value] = item;
            item.index = i;
        }, this);

        this.val(localStorage.getItem('settings.langUI') || this.defaultLang);
    },
    val: function(value) {
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
    },
    _update: function() {
        this._elem.text(this._langsByValue[this.val()].text);
    },
    _next: function() {
        var index = this._langsByValue[this.val()].index + 1;
        if (index >= this.langs.length) {
            index = 0;
        }

        this.val(this.langs[index].value);
    }
};

Block.init();

module.exports = Block;
