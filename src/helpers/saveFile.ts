import { isHTML, stripTags, truncate } from './string';

export function getFilename(text: string) {
    const ext = isHTML(text) ? 'html' : 'txt';
    const file = stripTags(text).replace(/\s+/g, ' ').trim();

    return (truncate(file, 32) || 'text') + '.' + ext;
}

export function saveFile(text: string): boolean {
    if (!window.Blob) {
        return false;
    }

    const textFileAsBlob = new Blob([ text ], { type: 'text/plain' });
    const downloadLink = document.createElement('a');

    downloadLink.download = getFilename(text);
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

    return true;
}
