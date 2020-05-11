export function copyText(text) {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    let success = true;
    try {
        document.execCommand('copy');
    } catch (e) {
        success = false;
    }

    document.body.removeChild(textarea);

    return success;
}
