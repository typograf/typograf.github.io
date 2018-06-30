import str from '../lib/string';

function getFilename(text) {
    const
        ext = str.isHTML(text) ? 'html' : 'txt',
        file = str.stripTags(text).replace(/\s+/g, ' ').trim();

    return (str.truncate(file, 32) || 'text') + '.' + ext;
}

export default function saveFile(textToWrite, notSupportSave) {
    if (!window.Blob) {
        window.alert(notSupportSave);
        return;
    }

    const
        textFileAsBlob = new Blob([ textToWrite ], {type: 'text/plain'}),
        downloadLink = document.createElement('a');

    downloadLink.download = getFilename(textToWrite);
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
