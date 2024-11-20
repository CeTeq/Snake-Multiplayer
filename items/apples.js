import { getRandomInt, gracze, grid, plan, szerokosc_planszy, wysokosc_planszy } from '../serwer-snake.js';
let liczba_jablek = 4
let zlote = 0
function goldenApple(eaten, klient) {
    let snake = gracze.get(klient)
    if(eaten) {
        zlote--
        plan.delete(10)
        console.log(plan.delete(goldenApple))
        snake.maxCells+=100;
        snake.wynik+=10;
    }
    if (zlote === 0) {
        if (Math.random() < 0.2) {
            let goldenApple = {
                typ: 'zloteJablko',
                kolor: 'yellow',
                x: getRandomInt(0, szerokosc_planszy) * grid,
                y: getRandomInt(0, wysokosc_planszy) * grid,
            };
            plan.set(10, goldenApple);
            zlote++
        }
    }
}
export function apples() {
    for (let i = 0; i < liczba_jablek; i++) {
        let jablko = {
            typ: 'jablko',
            kolor: 'red',
            x: getRandomInt(0, szerokosc_planszy) * grid,
            y: getRandomInt(0, wysokosc_planszy) * grid,
        };
        plan.set(jablko, jablko);
    }
}

export function ateApple(klient, obiekt, isZlote) {
    let snake = gracze.get(klient)
    if (!isZlote) {
        snake.maxCells++;
        snake.wynik++;
        goldenApple(isZlote, klient)
        //Losujemy nowe jabłko
        obiekt.x = getRandomInt(0, szerokosc_planszy) * grid;
        obiekt.y = getRandomInt(0, wysokosc_planszy) * grid;
        console.log('Wąż zjadł jabłko');
    }
    else goldenApple(isZlote, klient)
}
