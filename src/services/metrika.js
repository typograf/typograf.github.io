import { hit, reachGoal } from 'lyam';

const counterId = '28700106';

export function metrikaHit() {
    hit(counterId);

    console.info('metrika: hit');
}

export function metrikaReachGoal(name, params) {
    reachGoal(counterId, name, params);

    console.info('metrika: reachGoal', name, params);
}
