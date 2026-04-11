import { I18NKeys } from '../i18n/i18n';

declare global {
    interface Window {
        safeEyo: {
            restore: (text: string) => string;
        };
    }
}

export const eyoRule = {
    name: 'ru/other/eyo',
    handler: (text: string) => {
        return window.safeEyo ? window.safeEyo.restore(text) : text;
    },
};

export const eyoKey: I18NKeys = {
    'en-US': 'Replacing the letter “E” with “Ё”',
    'ru': 'Замена буквы «Е» на «Ё»'
};

