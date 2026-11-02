import { Typograf } from '../../helpers/typograf';
import { emojiFlags } from '../../i18n/emojiFlags';
import { i18n } from '../../i18n/i18n';

interface LocaleSelectProps {
    value: string;
    onChange: (locale: string) => void;
}

export function LocaleSelect({ value, onChange }: LocaleSelectProps) {
    const locales = Typograf.getLocales().sort((a, b) => i18n('locale-' + a).localeCompare(i18n('locale-' + b)));
    return <span class="prefs__locale"><span>{i18n('locale')}</span>: <select class="prefs__set-locale" title={i18n('locale')} value={value} onChange={event => onChange(event.currentTarget.value)}>
        {locales.map(item => {
            const quotesData = Typograf.getData(`${item}/quote`) as { left: string; right: string };
            const quotes = quotesData.left + quotesData.right.split('').reverse().join('');
            return <option value={item} key={item}>{emojiFlags[item] || ''} {i18n('locale-' + item)} {quotes}</option>;
        })}
    </select></span>;
}
