import {
    grid,
    gracze,
    wysokosc_planszy,
    szerokosc_planszy,
} from '../serwer-snake.js';

export function isInGrid(klient) {
    let snake = gracze.get(klient);
    if (snake.x < 0) {
        snake.x = szerokosc_planszy - grid;
    } else if (snake.x >= szerokosc_planszy) {
        snake.x = 0;
    } else if (snake.y < 0) {
        snake.y = wysokosc_planszy - grid;
    } else if (snake.y >= wysokosc_planszy) {
        snake.y = 0;
    }
}
