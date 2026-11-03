import { useCallback, useEffect, useState } from 'preact/hooks';
import { isPrefsHash, resetHash, setPrefsHash } from '../../../helpers/hash';
import { metrikaReachGoal } from '../../../services/metrika';
import type { Tab } from '../types';

export function useTab() {
    const [tab, setTab] = useState<Tab>(() => isPrefsHash() ? 'prefs' : 'editor');
    const onHashChange = useCallback(() => setTab(isPrefsHash() ? 'prefs' : 'editor'), []);

    useEffect(() => {
        document.body.style.overflowY = tab === 'prefs' ? 'hidden' : 'visible';
        return () => { document.body.style.overflowY = ''; };
    }, [tab]);

    useEffect(() => {
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, [onHashChange]);

    const selectTab = useCallback((next: Tab) => {
        if (next === tab) return;
        setTab(next);
        if (next === 'prefs') {
            setPrefsHash();
            metrikaReachGoal('settings-open');
        } else {
            resetHash();
            metrikaReachGoal('settings-close');
        }
    }, [tab]);

    return { tab, selectTab };
}
