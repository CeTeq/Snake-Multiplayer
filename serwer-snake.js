import { WebSocketServer } from 'ws';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { clientMessage } from './events/clientMessage.js';
import { colisions } from './checks/colisions.js';
import { isInGrid } from './checks/isInGrid.js';
import { gameUpdateMsg } from './messages/gameUpdate.js';
import { apples } from './items/apples.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const wss = new WebSocketServer({ port: 8080, host: '0.0.0.0' });

const app = express();
const port = 8000;

export let grid = 16;
export const gracze = new Map();
export let chat = [];
export let kolizje = [];
export let plan = new Map();
export let wysokosc_planszy = 40;
export let szerokosc_planszy = 40;

export let liczba = {
    tarcz: 0,
    przysp: 0,
    naboji: 0,
};

let fl = false;
const klienci = new Map();
let liczba_graczy = 0;
let pol = 0;
const fps = 10;
const predkosc_ruchu = 8;

let czy_gra;
const kolory = ['green', 'red', 'blue', 'orange', 'purple', 'yellow'];
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'snake.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

apples()

function randColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}
setInterval(loop, fps);
wss.on('connection', (ws) => {
    console.log('Nowe połączenie WebSocket');
    let nowykol = randColor();
    let rx = getRandomInt(0, szerokosc_planszy) * grid;
    let ry = getRandomInt(0, wysokosc_planszy) * grid;
    let snake = {
        nick: 'nick',
        typ: 'snake',
        kolor: nowykol,
        x: rx,
        y: ry,
        dx: grid,
        dy: 0,
        cells: [
            { x: rx, y: ry, typ: 'elsnake', snake:undefined},
            { x: rx-grid, y: ry, typ: 'elsnake', snake:undefined},
        ], //cialo węża
        maxCells: 2, //bierząca długość węża
        wynik: 0,
        ochrona: 20 * fps, 
        tarcze: 0,
        przysp: 0,
        tprzysp: 0,
        naboje: 0,
        gameover: false,
        czy_pierwszy: true,
    };

    gracze.set(ws, snake);
    klienci.set(ws, ws);
    liczba_graczy++;

    snake.cells.forEach((c) => {
        c.snake = snake;
        plan.set(c, c);
    });

    ws.on('message', (wia) => clientMessage(wia, ws)); // Obsługa wiadomości otrzymanych od klienta

    ws.on('close', () => {
        console.log('skasowano');
        chat.push('<span style="color: red;">Gracz ' + gracze.get(ws).nick + ' się rozłączył</span>');
        liczba_graczy--;
        gracze.get(ws).cells.forEach(function (el) {
            // Usuwanie wszystkich części gracza
            plan.delete(el);
        });

        gracze.delete(ws);
        klienci.delete(ws);
    });
});

let i = 0;
function loop() {

    i++;
    let plansz = [];
    let napisy = [];


    if(getRandomInt(0,2000) == 1 && liczba.tarcz < 1) //Generowanie tarcz
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

    if(getRandomInt(0,2000) == 1 && liczba.przysp < 1) //Generowanie przyśpieszeń
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

    if(getRandomInt(0,2000) == 1 && liczba.naboji < 1) //Generowanie naboji
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

    plan.forEach(function (el) {
        if(el.typ == "elsnake")
        {
            let t = {x:el.x, y:el.y, kolor:el.snake.kolor};
            plansz.push(t);
            if(el.snake.ochrona > 0)
            {
                let t2 = {x:el.x, y:el.y, kolor:"white", rodzaj:"strokeRect", kolor2:"cyan"};
                plansz.push(t2);
            }
            if(el.snake.tprzysp > 0)
            {
                let t2 = {x:el.x, y:el.y, kolor:"green", rodzaj:"strokeRect", kolor2:"green"};
                plansz.push(t2);
            }
        }
        else if(el.typ == "pocisk")
        {
            let t = {x:el.x, y:el.y, kolor:"black", rodzaj:"arc"};
            plansz.push(t);

            
            if(i%2 == 0)
            {
                el.x += el.dx;
                el.y += el.dy;
                el.zasieg--;
            }
            if(el.zasieg == 0)
            {
                plan.delete(el);
            }
        }
        else
        {
            plansz.push(el);
        }
    });

    gracze.forEach(function (el) {
        if(el.gameover == false)
        {
            napisy.push({
                n: el.nick,
                x: el.x,
                y: el.y,
                wynik: el.wynik,
            });
        }
    });

    kolizje.forEach((element) => {
        chat.push(element);
    });
    kolizje = [];

    klienci.forEach((klient) => {
        let snake = gracze.get(klient);


        if(snake.ochrona > 0)
        {
            snake.ochrona--;
        }
        if(snake.tprzysp > 0)
        {
            snake.tprzysp--;
        }

        gameUpdateMsg(klient, plansz, napisy);

        //Czyszczenie chatu

        if (snake.gameover) {
            return;
        }

        //Sprawdzamy czy kolizje dla danego węża
        plan.forEach((obiekt) => colisions(obiekt, klient));

        if (i < predkosc_ruchu && (snake.tprzysp == 0 || i%4!=0)) {
            return;
        }

        //Przesuwamy węża
        snake.x += snake.dx;
        snake.y += snake.dy;

        //Sprawdzamy czy wąż nie wyleciał poza plansze
        isInGrid(klient);

        //Aktualizujemy głowę węża
        snake.cells.unshift({
            x: snake.x,
            y: snake.y,
            typ: "elsnake",
            snake: snake,
        });
        plan.set(snake.cells[0], snake.cells[0]);

        //Przesuwamy ogon
        if (snake.cells.length > snake.maxCells) {
            plan.delete(snake.cells[snake.cells.length - 1]);
            snake.cells.pop();
        }

        gracze.set(klient, snake);
    });
    chat = [];

    klienci.forEach((kl) => {
        let sn = gracze.get(kl);
        if (sn.gameover) {
            kl.send(
                JSON.stringify({
                    typ: 'gameover',
                    wynik: sn.wynik,
                }),
            );

            sn.cells.forEach(function (el) {
                // Usuwanie wszystkich części gracza
                plan.delete(el);
            });
            liczba_graczy--;
        }
        });

    if (i == predkosc_ruchu) {
        //tempo poruszania sie
        i = 0;
    }
}
