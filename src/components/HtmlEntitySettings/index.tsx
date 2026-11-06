import type { TargetedEvent } from 'preact';
import { useCallback } from 'preact/hooks';
import { i18n } from '../../i18n/i18n';
import { block } from '../../helpers/bem';
import { trackMetrikaAction } from '../../services/metrika';
import { getEntityExample } from './utils';
import type { EntityMode, HtmlEntitySettingsProps } from './types';
import './index.css';

const b = block('html-entity-settings');

export function HtmlEntitySettings({ mode, onlyInvisible, onChange }: HtmlEntitySettingsProps) {
    const changeMode = useCallback((event: TargetedEvent<HTMLSelectElement>) => {
        onChange({ mode: event.currentTarget.value as EntityMode, onlyInvisible });
        trackMetrikaAction('settings-select-html-entity');
    }, [onChange, onlyInvisible]);
    const changeOnlyInvisible = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        onChange({ mode, onlyInvisible: event.currentTarget.checked });
        trackMetrikaAction('settings-select-html-entity');
    }, [mode, onChange]);

    return <div class={b()}>
        <div class={b('html-entities')}>
            <span>{i18n('html-entities')}</span>:<br />
            <select class={b('set-mode')} title={i18n('html-entities')} value={mode || 'default'} onChange={changeMode}>
                <option value="default">UTF-8</option>
                <option value="name">{i18n('names')}</option>
                <option value="digit">{i18n('digits')}</option>
                <option value="js">JS</option>
            </select>
            <span class={b('invisible-symbols-container')} style={{ display: ['digit', 'name', 'js'].indexOf(mode || '') >= 0 ? 'inline-block' : 'none' }}>
                <input type="checkbox" class={b('only-invisible')} id="invisible-symbols" checked={onlyInvisible} onChange={changeOnlyInvisible} /> <label for="invisible-symbols">{i18n('invisible-symbols')}</label>
            </span><br />
            <div class={b('html-entities-example-container')}><span>{i18n('example')}</span>: <span class={b('html-entities-example')} dangerouslySetInnerHTML={{ __html: getEntityExample(mode, onlyInvisible) }} /></div>
        </div>
    </div>;
}
