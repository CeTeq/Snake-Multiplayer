import { getRandomInt, gracze, grid, plan, szerokosc_planszy, wysokosc_planszy } from '../serwer-snake.js';

export let liczba = {
    tarcz: 0,
    przysp: 0,
    naboji: 0,
};

export function generuj_boosty()
{
    if(getRandomInt(0,2000) == 1 && liczba.tarcz < 100) //Generowanie tarcz
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

    if(getRandomInt(0,2000) == 1 && liczba.przysp < 100) //Generowanie przyśpieszeń
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

    if(getRandomInt(0,2000) == 1 && liczba.naboji < 100) //Generowanie naboji
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