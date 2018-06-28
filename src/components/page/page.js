import i18n from '../i18n';

import './page.less';

var body = document.body;
body.classList.remove('transition_no');

export default {
    isMobile: body.classList.contains('page_mobile'),
    updateTitle() {
        document.title = i18n('typograf');
    }
};
