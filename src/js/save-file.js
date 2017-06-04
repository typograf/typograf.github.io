var str = require('./string');

module.exports = {
    getFilename: function(text) {
        var ext = str.isHTML(text) ? 'html' : 'txt';
        var file = str.stripTags(text).replace(/\s+/g, ' ').trim();

        return (str.truncate(file, 32) || 'text') + '.' + ext;
    },
    save: function(textarea, notSupportSave) {
        if (!window.Blob) {
            window.alert(notSupportSave);
            return;
        }

        var textToWrite = textarea.value,
            textFileAsBlob = new Blob([textToWrite], {type:'text/plain'}),
            downloadLink = document.createElement('a');

        downloadLink.download = this.getFilename(textToWrite);
        downloadLink.innerHTML = 'Download File';

        if (window.webkitURL) {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = function() {
                document.body.removeChild(downloadLink);
            };
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();
    }
};
