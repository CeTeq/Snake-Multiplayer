import { getRandomInt, gracze, grid, plan, szerokosc_planszy, wysokosc_planszy } from '../serwer-snake.js';
import { liczba_jablek } from '../events/clientMessage.js';
let zlote = 0
let niebieskie = 0

function goldenApple(eaten, klient) {
    let snake = gracze.get(klient)
    if(eaten) {
        zlote--
        plan.delete('zlote')
        console.log(plan.delete(goldenApple))
        snake.maxCells+=1;
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
            plan.set('zlote', goldenApple);
            zlote++
        }
    }
}

function blueApple(eaten, klient) {
    let snake = gracze.get(klient)
    if (eaten) {
        niebieskie--
        plan.delete('niebieskie')
        if (Math.random() < 0.5) {
            if (snake.maxCells >= 12) {
                snake.maxCells = 2;
                if (snake.wynik <= 10) snake.wynik = 0
                else snake.wynik -= 10;
            }
        } else {
            snake.maxCells += 10
            snake.wynik += 10
        }
    }
    if(niebieskie === 0)
    {
        if (Math.random() < 1) {
            let blueApple = {
                typ: 'niebieskieJablko',
                kolor: 'blue',
                x: getRandomInt(0, szerokosc_planszy) * grid,
                y: getRandomInt(0, wysokosc_planszy) * grid,
            };
            plan.set('niebieskie', blueApple);
            niebieskie++
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

export function ateApple(klient, obiekt, isZlote, isNiebieskie) {
    let snake = gracze.get(klient)
    if (!isZlote) { //jeżeli nie jest złote
        snake.maxCells++;
        snake.wynik++;
        goldenApple(isZlote, klient)
        blueApple(isNiebieskie, klient)
        //Losujemy nowe jabłko
        obiekt.x = getRandomInt(0, szerokosc_planszy) * grid;
        obiekt.y = getRandomInt(0, wysokosc_planszy) * grid;
    }
    else if(isZlote) goldenApple(isZlote, klient)
    else if(isNiebieskie) blueApple(isNiebieskie, klient)
}

