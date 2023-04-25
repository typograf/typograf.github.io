import { hit, reachGoal } from 'lyam';

const counterId = '28700106';

export function metrikaHit() {
    hit(counterId);

    console.info('metrika: hit');
}

export type MetrikaGoal =
    'save-text' |
    'copy-text' |
    'share-text' |
    'switch-lang' |
    'settings-click-rule' |
    'settings-click-group-rule' |
    'settings-select-all-rules' |
    'settings-select-html-entity' |
    'settings-select-locale' |
    'settings-default' |
    'settings-open' |
    'settings-close';

export function metrikaReachGoal(name: MetrikaGoal, params?: any) {
    reachGoal(counterId, name, params);

    console.info('metrika: reachGoal', name, params);
}
