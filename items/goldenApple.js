import { getRandomInt, grid, plan } from '../serwer-snake.js';

export function goldenApple() {
    if (Math.random() < 0.5 / 100) {
        let goldenApple = {
            typ: 'zloteJablko',
            kolor: 'yellow',
            x: getRandomInt(0, wymiaryPlanszy.szerokosc) * grid,
            y: getRandomInt(0, wymiaryPlanszy.szerokosc) * grid,
        };
        plan.set(goldenApple, goldenApple);
    }
}
