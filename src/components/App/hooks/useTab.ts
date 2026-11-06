import { useCallback, useEffect, useState } from 'preact/hooks';
import { resetHash, setAboutHash, setPrefsHash } from '../../../helpers/hash';
import { trackMetrikaAction } from '../../../services/metrika';
import { getTabFromHash } from '../utils';
import type { Tab } from '../types';

export function useTab() {
    const [tab, setTab] = useState<Tab>(getTabFromHash);
    const onHashChange = useCallback(() => setTab(getTabFromHash()), []);

    useEffect(() => {
        document.body.style.overflowY = tab === 'prefs' ? 'hidden' : 'visible';
        return () => { document.body.style.overflowY = ''; };
    }, [tab]);

    useEffect(() => {
        document.documentElement.dataset.tab = tab;
        return () => { delete document.documentElement.dataset.tab; };
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
            trackMetrikaAction('settings-open');
        } else if (next === 'about') {
            setAboutHash();
        } else {
            resetHash();
        }
        if (tab === 'prefs') trackMetrikaAction('settings-close');
    }, [tab]);

    return { tab, selectTab };
}
