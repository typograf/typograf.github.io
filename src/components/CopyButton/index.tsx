import copyTextToClipboard from 'copy-text-to-clipboard';
import { useCallback, useState } from 'preact/hooks';
import { block } from '../../helpers/bem';
import { i18n } from '../../i18n/i18n';
import { trackMetrikaAction } from '../../services/metrika';
import { IconButton } from '../IconButton';
import { Tooltip } from '../ui/Tooltip';
import type { TooltipMessage } from '../ui/Tooltip/types';
import type { CopyButtonProps } from './types';
import { getCopyExcerpt } from './utils';
import './index.css';

const b = block('copy-button');

export function CopyButton({ getContent, hasPartialSelection, disabled }: CopyButtonProps) {
    const [feedback, setFeedback] = useState<TooltipMessage | null>(null);
    const closeFeedback = useCallback(() => setFeedback(null), []);
    const copy = useCallback(() => {
        const { text, partial } = getContent();
        if (copyTextToClipboard(text)) {
            const excerpt = partial ? getCopyExcerpt(text) : undefined;
            const message = i18n(partial ? 'copied-selection' : 'copied-all');
            setFeedback({
                text: excerpt ? message + ':' : message,
                type: 'ok',
                excerpt,
            });
        } else {
            setFeedback({ text: i18n('notSupportCopy'), type: 'error' });
        }
        trackMetrikaAction('copy-text');
    }, [getContent]);

    return <div class={b('anchor')}>
        <IconButton buttonClass={b()} iconClass={b('icon')} disabled={disabled} label={i18n('copy')}
            title={i18n(hasPartialSelection ? 'copy-selection' : 'copy-all')} onClick={copy} />
        <Tooltip message={feedback} onClose={closeFeedback} anchored />
    </div>;
}
