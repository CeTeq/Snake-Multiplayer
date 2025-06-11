import { getRandomInt, gracze, grid, plan, szerokosc_planszy, wysokosc_planszy } from '../serwer-snake.js';

export let liczba = {
    tarcz: 0,
    przysp: 0,
    naboji: 0,
};

export let opoznienie = {
    tarcz: 2000,
    przysp: 2000,
    naboji: 2000,
};

export let maks = {
    tarcz: 100,
    przysp: 100,
    naboji: 100,
};

export function generuj_boosty()
{
    if(getRandomInt(0,opoznienie.tarcz) == 1 && liczba.tarcz < maks.tarcz) //Generowanie tarcz
    {
        let tarcza = {
            typ: 'tarcza',
            kolor: 'cyan',
            x: getRandomInt(0, szerokosc_planszy) * grid,
            y: getRandomInt(0, wysokosc_planszy) * grid,
        };
        plan.set(tarcza, tarcza);
        liczba.tarcz++;
    }

    if(getRandomInt(0,opoznienie.przysp) == 1 && liczba.przysp < maks.przysp) //Generowanie przyśpieszeń
    {
        let przy = {
            typ: 'przysp',
            kolor: 'green',
            x: getRandomInt(0, szerokosc_planszy) * grid,
            y: getRandomInt(0, wysokosc_planszy) * grid,
        };
        plan.set(przy, przy);
        liczba.przysp++;
    }

    if(getRandomInt(0,opoznienie.naboji) == 1 && liczba.naboji < maks.naboji) //Generowanie naboji
    {
        let nab = {
            typ: 'naboje',
            kolor: '#6c3c0c',
            x: getRandomInt(0, szerokosc_planszy) * grid,
            y: getRandomInt(0, wysokosc_planszy) * grid,
        };
        plan.set(nab, nab);
        liczba.naboji++;
    }
}