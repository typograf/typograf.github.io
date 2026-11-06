import { useCallback, useEffect, useState } from 'preact/hooks';
import { block } from '../../helpers/bem';
import { i18n } from '../../i18n/i18n';
import { trackMetrikaAction } from '../../services/metrika';
import { IconButton } from '../IconButton';
import type { ShareButtonProps } from './types';
import './index.css';

const b = block('share-button');

export function ShareButton({ getText }: ShareButtonProps) {
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        setSupported(typeof navigator.share === 'function' &&
            typeof navigator.canShare === 'function' && navigator.canShare({ text: 'Hello' }));
    }, []);

    const share = useCallback(async () => {
        try {
            await navigator.share({ text: getText(), title: 'Typograf' });
            trackMetrikaAction('share-text');
        } catch {
            // The user can dismiss the native share dialog.
        }
    }, [getText]);

    return supported ? <IconButton buttonClass={b()} iconClass={b('icon')} label={i18n('share')} onClick={share} /> : null;
}
