import { useEffect, useState } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import { ActionIcon } from '../ActionIcon/ActionIcon';
import './ShareIcon.css';

interface ShareIconProps {
    getText: () => string;
}

export function ShareIcon({ getText }: ShareIconProps) {
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        setSupported(typeof navigator.share === 'function' &&
            typeof navigator.canShare === 'function' && navigator.canShare({ text: 'Hello' }));
    }, []);

    async function share() {
        try {
            await navigator.share({ text: getText(), title: 'Typograf' });
            metrikaReachGoal('share-text');
        } catch {
            // The user can dismiss the native share dialog.
        }
    }

    return supported ? <ActionIcon buttonClass="share-button" iconClass="action-icon share-icon" label={i18n('share')} onClick={share} /> : null;
}
