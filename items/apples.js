import { getRandomInt, gracze, grid, plan, wymiaryPlanszy } from '../serwer-snake.js';
import { liczba_jablek } from '../events/clientMessage.js';
let zlote = 0
let jablka = 0;
function goldenApple(eaten, klient) {
    let snake = gracze.get(klient)
    if(eaten) {
        zlote--
        plan.delete(10)
        console.log(plan.delete(goldenApple))
        snake.maxCells++;
        snake.wynik+=10;
    }
    if (zlote === 0) {
        if (Math.random() < 0.2) {
            let goldenApple = {
                typ: 'zloteJablko',
                kolor: 'yellow',
                x: getRandomInt(0, wymiaryPlanszy.szerokosc) * grid,
                y: getRandomInt(0, wymiaryPlanszy.wysokosc) * grid,
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
            x: getRandomInt(0, wymiaryPlanszy.szerokosc) * grid,
            y: getRandomInt(0, wymiaryPlanszy.wysokosc) * grid,
        };
        plan.set(jablko, jablko);
        jablka++;
    }
}

export function ateApple(klient, obiekt, isZlote) {
    let snake = gracze.get(klient)
    if (!isZlote) {
        snake.maxCells++;
        snake.wynik++;
        goldenApple(isZlote, klient)
        //Losujemy nowe jabłko
        obiekt.x = getRandomInt(0, wymiaryPlanszy.szerokosc) * grid;
        obiekt.y = getRandomInt(0, wymiaryPlanszy.wysokosc) * grid;

        if(jablka > liczba_jablek)
        {
            plan.delete(obiekt);
            jablka--;
        }
        console.log('Wąż zjadł jabłko');
    }
    else goldenApple(isZlote, klient)
}
