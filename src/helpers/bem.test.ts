import { describe, expect, test } from 'vitest';
import { block } from './bem';

describe('block', () => {
    test('returns the block name without an element or modifiers', () => {
        const b = block('header');
        expect(b()).toBe('header');
    });

    test('adds enabled block modifiers and skips disabled ones', () => {
        const b = block('prefs');
        expect(b({ opened: true, size: 0, theme: 'dark', hidden: false, absent: null, missing: undefined, empty: '' }))
            .toBe('prefs prefs_opened prefs_size_0 prefs_theme_dark');
    });

    test('returns an element without modifiers', () => {
        const b = block('header');
        expect(b('title')).toBe('header__title');
    });

    test('adds enabled element modifiers and skips disabled ones', () => {
        const b = block('header');
        expect(b('menu-item', { tab: 'editor', selected: true, hidden: false }))
            .toBe('header__menu-item header__menu-item_tab_editor header__menu-item_selected');
    });
});
