module.exports = function(textarea, notSupportSave) {
    if(!window.Blob) {
        alert(notSupportSave);
        return;
    }

    var textToWrite = textarea.value,
        textFileAsBlob = new Blob([textToWrite], {type:'text/plain'}),
        fileNameToSaveAs = 'text.txt',
        downloadLink = document.createElement('a');

    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = 'Download File';

    if(window.webkitURL != null) {
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
};
