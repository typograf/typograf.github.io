import { Eyo } from 'eyo-kernel';
import { I18NKeys } from '../i18n/i18n';
import { noop } from '../helpers/noop';

const eyo = new Eyo();
let isReadyDict = false;

fetch('./dist/eyo.txt')
    .then(response => response.text())
    .then(dict => {
        eyo.dictionary.set(dict);
        isReadyDict = true;
    }).catch(noop);

export const eyoRule = {
    name: 'ru/other/eyo',
    handler: (text: string) => {
        return isReadyDict ? eyo.restore(text) : text;
    },
};

export const eyoKey: I18NKeys = {
    'en-US': 'Replacing the letter “E” with “Ё”',
    'ru': 'Замена буквы «Е» на «Ё»'
};

