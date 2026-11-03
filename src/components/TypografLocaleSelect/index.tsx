import type { TargetedEvent } from 'preact';
import { useCallback } from 'preact/hooks';
import { Typograf } from '../../helpers/typograf';
import { emojiFlags } from '../../i18n/emojiFlags';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import type { QuoteData, TypografLocaleSelectProps } from './types';
import './index.css';

const b = block('typograf-locale-select');

export function TypografLocaleSelect({ value, onChange }: TypografLocaleSelectProps) {
    const locales = Typograf.getLocales().sort((a, b) => i18n('locale-' + a).localeCompare(i18n('locale-' + b)));
    const changeLocale = useCallback((event: TargetedEvent<HTMLSelectElement>) => {
        onChange(event.currentTarget.value);
    }, [onChange]);

    return <span class={b()}><span>{i18n('locale')}</span>: <select class={b('set-locale')} title={i18n('locale')} value={value} onChange={changeLocale}>
        {locales.map(item => {
            const quotesData = Typograf.getData(`${item}/quote`) as QuoteData;
            const quotes = quotesData.left + quotesData.right.split('').reverse().join('');
            return <option value={item} key={item}>{emojiFlags[item] || ''} {i18n('locale-' + item)} {quotes}</option>;
        })}
    </select></span>;
}
