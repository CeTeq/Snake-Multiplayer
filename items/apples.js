import { getRandomInt, gracze, grid, plan, szerokosc_planszy, wysokosc_planszy } from '../serwer-snake.js';

export let liczba_jablek = 100;
let zlote = 0
function goldenApple(eaten, klient) {
    let snake = gracze.get(klient)
    if(eaten) {
        zlote--
        plan.delete(10)
        console.log(plan.delete(goldenApple))
        snake.maxCells+=10;
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
export function apples(liczbaDodania, czyZmiana=true) 
{
    if(liczbaDodania > 0)
    {
        for (let i = 0; i < liczbaDodania; i++) {
        let jablko = {
            typ: 'jablko',
            kolor: 'red',
            x: getRandomInt(0, szerokosc_planszy) * grid,
            y: getRandomInt(0, wysokosc_planszy) * grid,
        };
        plan.set(jablko, jablko);
        }
    }
    else if(liczbaDodania < 0)
    {
        let i = 0;
        plan.forEach(el => {
            if(el.typ == "jablko")
            {
                plan.delete(el);
                i--;
            }

            if(i == liczbaDodania)
            {
                return;
            }
        })
    }

    if(czyZmiana)
    {
        liczba_jablek += liczbaDodania;
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
    }
    else goldenApple(isZlote, klient)
}
