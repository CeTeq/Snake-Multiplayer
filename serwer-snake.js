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
export let wysokosc_planszy = grid * 40;
export let szerokosc_planszy = grid * 40;

let fl = false;
const klienci = new Map();
let liczba_graczy = 0;
let pol = 0;

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
setInterval(loop, 10);
wss.on('connection', (ws) => {
    console.log('Nowe połączenie WebSocket');
    let nowykol = randColor();
    let snake = {
        nick: 'nick',
        typ: 'csnake',
        kolor: nowykol,
        x: 160,
        y: 160,
        dx: grid,
        dy: 0,
        cells: [
            { x: 160, y: 160, kolor: nowykol, typ: 'snake', nick: '' },
            { x: 144, y: 160, kolor: nowykol, typ: 'snake', nick: '' },
        ], //cialo węża
        maxCells: 2, //bierząca długość węża
        wynik: 0,
        gameover: false,
        czy_pierwszy: true,
    };

    gracze.set(ws, snake);
    klienci.set(ws, ws);
    liczba_graczy++;

    snake.cells.forEach((c) => {
        plan.set(c, c);
    });

    ws.on('message', (wia) => clientMessage(wia, ws)); // Obsługa wiadomości otrzymanych od klienta

    ws.on('close', () => {
        console.log('skasowano');
        chat.push('Gracz się rozłączył');
        if (gracze.get(ws) != undefined) {
            chat.push('Gracz ' + gracze.get(ws).nick + ' się rozłączył');
            liczba_graczy--;
            gracze.get(ws).cells.forEach(function (el) {
                // Usuwanie wszystkich części gracza
                plan.delete(el);
            });
        }
        gracze.delete(ws);
        klienci.delete(ws);
    });
});

var i = 0;
function loop() {
    gracze.forEach((element) => {
        if (element.kolor === false) element.kolor = randColor();
    });

    i++;
    let plansz = [];
    let napisy = [];
    plan.forEach(function (el) {
        plansz.push(el);
    });

    gracze.forEach(function (el) {
        napisy.push({
            n: el.nick,
            x: el.x,
            y: el.y,
            wynik: el.wynik,
        });
    });

    klienci.forEach((klient) => {
        let snake = gracze.get(klient);

        kolizje.forEach((element) => {
            chat.push(element);
        });
        kolizje = [];
        gameUpdateMsg(klient, plansz, napisy);

        //Czyszczenie chatu

        if (i < 8) {
            return;
        }

        if (snake == undefined) {
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
            kolor: snake.kolor,
            typ: 'snake',
            nick: snake.nick,
        });
        plan.set(snake.cells[0], snake.cells[0]);

        //Przesuwamy ogon
        if (snake.cells.length > snake.maxCells) {
            plan.delete(snake.cells[snake.cells.length - 1]);
            snake.cells.pop();
        }

        //Sprawdzamy czy kolizje dla danego węża
        plan.forEach((obiekt) => colisions(obiekt, klient));

        gracze.set(klient, snake);
    });
    chat = [];

    klienci.forEach((kl) => {
        if (gracze.get(kl) != undefined) {
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
                gracze.delete(kl);
                liczba_graczy--;
            }
        }
    });

    if (i == 8) {
        //tempo poruszania sie
        i = 0;
    }
}
