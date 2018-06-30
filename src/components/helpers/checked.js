export default function checked(dom, checked) {
    if (arguments.length === 2) {
        if (typeof checked === 'undefined') {
            dom.indeterminate = true;
        } else {
            dom.indeterminate = false;
            dom.checked = checked;
        }
        return dom;
    } else {
        return dom.checked;
    }
}
