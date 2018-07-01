import './prefs-rule.less';

export default function PrefsRule(props) {
    const name = props.name,
        lang = name.split('/')[0];

    return <div class="prefs-rule" title={props.name}>
        <label><input type="checkbox" class="prefs-rule__checkbox" checked={props.checked} onChange={props.onChange.bind(this, props.id)} /> {props.title}{
            lang === 'common' ? null : <span class="prefs-rule__lang">{lang}</span>
        }</label>
    </div>;
}
