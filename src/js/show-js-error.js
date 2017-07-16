require('show-js-error/dist/show-js-error.custom').init({
    title: 'JavaScript error',
    userAgent: navigator.userAgent,
    sendText: 'Send 🐛',
    templateDetailedMessage: '```{message}```',
    sendUrl: 'https://github.com/typograf/typograf.github.io/issues/new?title={title}&body={body}'
});
