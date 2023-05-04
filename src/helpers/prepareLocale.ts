export function prepareLocale(locale: string) {
    return locale === 'en' || locale === 'en-US' ? [ 'en-US' ] : [locale, 'en-US'];
}
