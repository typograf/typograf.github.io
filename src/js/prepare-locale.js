module.exports = function(locale) {
    return locale === 'en' || locale === 'en-US' ? ['en-US'] : [locale, 'en-US'];
};
