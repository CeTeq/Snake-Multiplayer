import {
    grid,
    gracze,
    wymiaryPlanszy,
} from '../serwer-snake.js';

export function isInGrid(klient) {
    let snake = gracze.get(klient);
    if (snake.x < 0) {
        snake.x = wymiaryPlanszy.szerokosc*grid - grid;
    } else if (snake.x >= wymiaryPlanszy.szerokosc*grid) {
        snake.x = 0;
    } else if (snake.y < 0) {
        snake.y = wymiaryPlanszy.wysokosc*grid - grid;
    } else if (snake.y >= wymiaryPlanszy.wysokosc*grid) {
        snake.y = 0;
    }
}
