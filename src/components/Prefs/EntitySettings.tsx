import { i18n } from '../../i18n/i18n';
import { metrikaReachGoal } from '../../services/metrika';
import type { PrefsData } from './prefsTypes';
import { getEntityExample } from './prefsUtils';

interface EntitySettingsProps {
    mode: PrefsData['mode'];
    onlyInvisible: boolean;
    onChange: (value: Pick<PrefsData, 'mode' | 'onlyInvisible'>) => void;
}

export function EntitySettings({ mode, onlyInvisible, onChange }: EntitySettingsProps) {
    return <div class="prefs__mode prefs__item">
        <div class="prefs__html-entities">
            <span>{i18n('html-entities')}</span>:<br />
            <select class="prefs__set-mode" title={i18n('html-entities')} value={mode || 'default'} onChange={event => {
                onChange({ mode: event.currentTarget.value as PrefsData['mode'], onlyInvisible });
                metrikaReachGoal('settings-select-html-entity');
            }}>
                <option value="default">UTF-8</option>
                <option value="name">{i18n('names')}</option>
                <option value="digit">{i18n('digits')}</option>
                <option value="js">JS</option>
            </select>
            <span class="prefs__invisible-symbols-container" style={{ display: ['digit', 'name', 'js'].indexOf(mode || '') >= 0 ? 'inline-block' : 'none' }}>
                <input type="checkbox" class="prefs__only-invisible" id="invisible-symbols" checked={onlyInvisible} onChange={event => {
                    onChange({ mode, onlyInvisible: event.currentTarget.checked });
                    metrikaReachGoal('settings-select-html-entity');
                }} /> <label for="invisible-symbols">{i18n('invisible-symbols')}</label>
            </span><br />
            <div class="prefs__html-entities-example-container"><span>{i18n('example')}</span>: <span class="prefs__html-entities-example" dangerouslySetInnerHTML={{ __html: getEntityExample(mode, onlyInvisible) }} /></div>
        </div>
    </div>;
}
