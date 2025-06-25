import { getRandomInt, tps, grid, gracze, klienci, battle_royal, czy_lobby, liczba_graczy, plan, liczba_klientow, szerokosc_planszy, wysokosc_planszy, zwiekszLiczbeGraczy, realneTps } from "./serwer-snake.js";

function randColor() {
    let r = Math.floor(Math.random() * 200 + 55).toString(16).padStart(2, '0');
    let g = Math.floor(Math.random() * 200 + 55).toString(16).padStart(2, '0');
    let b = Math.floor(Math.random() * 200 + 55).toString(16).padStart(2, '0');

    return '#' + r + g + b;
}


export function dodajWeza(ws)
{
    let nowykol = randColor();
        let rx = getRandomInt(0, szerokosc_planszy) * grid; //losujemy pozycje startową wężowi
        let ry = getRandomInt(0, wysokosc_planszy) * grid;
        let snake = {
            nick: 'nick',
            typ: 'snake',
            kolor: nowykol,
            x: rx,
            y: ry,
            dx: grid,
            dy: 0,
            dirX: grid,
            dirY: 0,
            cells: [
                { x: rx, y: ry, typ: 'elsnake', snake:undefined},
                { x: rx-grid, y: ry, typ: 'elsnake', snake:undefined},
            ], //cialo węża
            maxCells: 2, //bierząca długość węża
            wynik: 0,
            ochrona: 5 * realneTps, 
            tarcze: 0,
            przysp: 0,
            tprzysp: 0,
            naboje: 0,
            gameover: false,
            czy_pierwszy: true,
            bot: false,
        };
    
        gracze.set(ws, snake);
        klienci.set(ws, ws);
    
        if(battle_royal == false || czy_lobby == true)
        {
            zwiekszLiczbeGraczy();
    
            snake.cells.forEach((c) => {
                c.snake = snake;
                plan.set(c, c);
            });
        }
    
        else
        {
            snake.gameover = true;
            snake.cells = [];
        }

        return snake;
}


