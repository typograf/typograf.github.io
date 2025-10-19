import { LyamParams, hit, notBounce, reachGoal, params } from 'lyam';

const COUNTER_ID = '28700106';
const NOT_BOUNCE_TIMEOUT = 15000; // 15 сек.

export function startMetrika() {
    hit(COUNTER_ID);

    setTimeout(() => {
        notBounce(COUNTER_ID);
    }, NOT_BOUNCE_TIMEOUT);

    trackJs();

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

export function metrikaParams(lyamParams: LyamParams) {
    params(COUNTER_ID, lyamParams);

    console.info('metrika: params', lyamParams);
}

function trackJs() {
    window.addEventListener('error', event => {
        if (!event) {
            return;
        }

        const message = event.message || event.error?.message || 'no_message';
        const stack = event.error?.stack || (event.filename + ':' + event.lineno + ':' + event.colno) || 'no_stack';
        const path: string[] = [
            'JS errors',
            message,
            stack,
        ];

        const data: { [key: string]: unknown; } = {};
        let pointer = data;
        let i: number;

        for (i = 0; i < path.length - 1; i++) {
            const item = path[i];
            pointer = pointer[item] = {};
        }

        pointer[path[i]] = 1;

        metrikaParams(data);
    });
}