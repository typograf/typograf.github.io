import { LyamParams, hit, reachGoal } from 'lyam';

const counterId = '28700106';

export function metrikaHit() {
    hit(counterId);

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
    reachGoal(counterId, name, params);

    console.info('metrika: reachGoal', name, params);
}
