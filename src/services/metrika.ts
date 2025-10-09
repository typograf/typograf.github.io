import { LyamParams, hit, notBounce, reachGoal } from 'lyam';

const COUNTER_ID = '28700106';
const NOT_BOUNCE_TIMEOUT = 15000; // 15 сек.

export function startMetrika() {
    hit(COUNTER_ID);

    setTimeout(() => {
        notBounce(COUNTER_ID);
    }, NOT_BOUNCE_TIMEOUT);

    console.info('metrika: hit');
}

export type MetrikaGoal =
    'save-text' |
    'copy-text' |
    'share-text' |
    'select-locale' |
    'switch-lang' |
    'settings-click-rule' |
    'settings-click-group-rule' |
    'settings-select-all-rules' |
    'settings-select-html-entity' |
    'settings-default' |
    'settings-open' |
    'settings-close';

export function metrikaReachGoal(name: MetrikaGoal, params?: LyamParams) {
    reachGoal(COUNTER_ID, name, params);

    console.info('metrika: reachGoal', name, params);
}
