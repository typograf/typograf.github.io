var GetText = require('./get-text');

module.exports = {
    init: function(data) {
        this._elem = data.elem;
        this._elem.click(this._onClick.bind(this));

        this._onChange = data.onChange;

        this._langsByValue = {};
        this.langs.forEach(function(item, i) {
            this._langsByValue[item.value] = item;
            item.index = i;
        }, this);

        this.val(localStorage.getItem('settings.langUI') || 'ru');
    },
    val: function(value) {
        if (typeof value !== 'undefined') {
            if (value === 'en') {
                value = 'en-US';
            }

            if (this._langsByValue[value]) {
                this._val = value;
                GetText.setLang(value);
                localStorage.setItem('settings.langUI', value);

                this._update(value);

                return;
            }
        }

        return this._val;
    },
    _onClick: function(e) {
        this._next();
        this._onChange(e, this.val());
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
    },
    langs: [
        { value: 'ru', text: 'Rus' },
        { value: 'en-US', text: 'Eng' }
    ]
};
