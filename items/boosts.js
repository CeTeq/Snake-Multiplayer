import { getRandomInt, gracze, grid, plan, wymiaryPlanszy } from '../serwer-snake.js';

export let liczba = {
    tarcz: 0,
    przysp: 0,
    naboji: 0,
};

export function generuj_boosty()
{
    if(getRandomInt(0,2000) == 1 && liczba.tarcz < 1) //Generowanie tarcz
    {
        let tarcza = {
            typ: 'tarcza',
            kolor: 'cyan',
            x: getRandomInt(0, wymiaryPlanszy.szerokosc) * grid,
            y: getRandomInt(0, wymiaryPlanszy.wysokosc) * grid,
        };
        plan.set(tarcza, tarcza);
        liczba.tarcz++;
    }

    if(getRandomInt(0,2000) == 1 && liczba.przysp < 1) //Generowanie przyśpieszeń
    {
        let przy = {
            typ: 'przysp',
            kolor: 'green',
            x: getRandomInt(0, wymiaryPlanszy.szerokosc) * grid,
            y: getRandomInt(0, wymiaryPlanszy.wysokosc) * grid,
        };
        plan.set(przy, przy);
        liczba.przysp++;
    }

    if(getRandomInt(0,2000) == 1 && liczba.naboji < 1) //Generowanie naboji
    {
        let nab = {
            typ: 'naboje',
            kolor: '#6c3c0c',
            x: getRandomInt(0, wymiaryPlanszy.szerokosc) * grid,
            y: getRandomInt(0, wymiaryPlanszy.wysokosc) * grid,
        };
        plan.set(nab, nab);
        liczba.naboji++;
    }
}