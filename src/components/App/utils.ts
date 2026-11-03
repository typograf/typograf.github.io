import { isAboutHash, isPrefsHash } from '../../helpers/hash';
import type { Tab } from './types';

export function getTabFromHash(): Tab {
    if (isPrefsHash()) return 'prefs';
    if (isAboutHash()) return 'about';
    return 'editor';
}
