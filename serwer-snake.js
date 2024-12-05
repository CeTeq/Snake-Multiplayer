import { WebSocketServer } from 'ws';
import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { clientMessage, host } from './events/clientMessage.js';
import { colisions, czolowe_zderzenia } from './checks/colisions.js';
import { isInGrid } from './checks/isInGrid.js';
import { gameUpdateMsg } from './messages/gameUpdate.js';
import { apples } from './items/apples.js';
import { generuj_boosty } from './items/boosts.js';

let portGry = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const argument = process.argv[2];

if(argument == 'b')
{
    portGry = 8090;
}

const wss = new WebSocketServer({ port: portGry, host: '0.0.0.0' });

const app = express();
const port = 8000;

export let grid = 16;
export const gracze = new Map();
export let chat = [];
export let privChat = [];
export let kolizje = [];
export let plan = new Map();
export let wysokosc_planszy = 200;
export let szerokosc_planszy = 200;

export let battle_royal = false;

if(argument == 'b')
{
    battle_royal = true;
}

export let czy_lobby = battle_royal;
export let zakonczenie_gry = false;
export let wygrany_gracz = undefined;
export let czas_odli_rozp = 250;
export let odliczanie_rozpoczecia = czas_odli_rozp;
export let odliczanie_restartowania = 0;
export let odliczanie_zmniejszania = 0;
export let wymus_start = {
st: false,
};
export let liczba_graczy = 0;
export let liczba_klientow = 0;
export let remis = false;
export const tps = 10;
export let zrespawnuj = false;
export let przesuniecie = 0;
export let realneTps = 0;
let min_graczy = 100;

let size = 200;
let czas = new Date();
let fl = false;
const klienci = new Map();
let pol = 0;
const predkosc_ruchu = 8;

let czy_gra;
const kolory = ['green', 'red', 'blue', 'orange', 'purple', 'yellow'];

if(argument != 'b')
{
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'snake.html'));
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

apples()

function randColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}
setInterval(loop, tps);
wss.on('connection', (ws) => {
    console.log('Nowe połączenie WebSocket');
    let nowykol = randColor();
    let rx = getRandomInt(0, szerokosc_planszy) * grid; //lpsujemy pozycje startową wężowi
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
        ochrona: 20 * tps, 
        tarcze: 0,
        przysp: 0,
        tprzysp: 0,
        naboje: 0,
        gameover: false,
        czy_pierwszy: true,
    };

    gracze.set(ws, snake);
    klienci.set(ws, ws);

    if(battle_royal == false || czy_lobby == true)
    {
        liczba_graczy++;

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

    liczba_klientow++;


    ws.on('message', (wia) => clientMessage(wia, ws)); // Obsługa wiadomości otrzymanych od klienta

    ws.on('close', () => {
        console.log('Gracz ' + gracze.get(ws).nick + ' się rozłączył');

        if(host.h == ws)
        {
            host.h = undefined;
        }
        
        
        if(gracze.get(ws).gameover == false)
        {
            let temp = [];
            temp.push({tekst:'Gracz ', kolor:"red"});
            temp.push({tekst:gracze.get(ws).nick, kolor:gracze.get(ws).kolor});
            temp.push({tekst:'  wyszedł z gry', kolor:"red"});

            chat.push(temp);
            //chat.push('<span style="color: red;">Gracz ' + gracze.get(ws).nick + ' wyszedł z gry</span>');
        }

        if(gracze.get(ws).cells.length > 0)
        {
            liczba_graczy--;
            gracze.get(ws).cells.forEach(function (el) {
                // Usuwanie wszystkich części gracza
                plan.delete(el);
            });
        }

        gracze.delete(ws);
        klienci.delete(ws);
        liczba_klientow--;
    });
});

let i = 0;
function loop() {

    i++;
    let plansz8 = [];
    let plansz4 = [];
    let plansz2 = [];
    let napisy = [];

    let czasTeraz = new Date();
    realneTps = Math.floor(1000 / (czasTeraz.getTime() - czas.getTime()), 1);
    czas = new Date();

    if(odliczanie_zmniejszania == 1)
    {
        przesuniecie += szerokosc_planszy*grid/4;
        plan.forEach( el => {
            el.x -= szerokosc_planszy*grid/4;
            el.y -= wysokosc_planszy*grid/4;
        })

        gracze.forEach( el => {
            el.x -= szerokosc_planszy*grid/4;
            el.y -= wysokosc_planszy*grid/4;
        })

        szerokosc_planszy /= 2;
        wysokosc_planszy /= 2;

        if(szerokosc_planszy > 50)
        {
            odliczanie_zmniejszania = 100 * tps;
        }
    }

    if(odliczanie_zmniejszania > 0)
    {
        odliczanie_zmniejszania--;
    }

    if(czy_lobby == false)
    {
        generuj_boosty();
    }

    if(battle_royal == false)
    {
        czy_lobby = false;
        wygrany_gracz = undefined;
        odliczanie_rozpoczecia = czas_odli_rozp;
        odliczanie_restartowania = 0;
        wymus_start.st = false;
    }

    if((liczba_graczy >= min_graczy || wymus_start.st) && czy_lobby)
    {
        odliczanie_rozpoczecia--;
    }

    if(odliczanie_rozpoczecia == 0)
    {
        czy_lobby = false;
        wymus_start.st = false;
        odliczanie_rozpoczecia = czas_odli_rozp;
        odliczanie_zmniejszania = 100 * tps;
    }

    if(odliczanie_restartowania > 0)
    {
        odliczanie_restartowania--;
    }

    if(odliczanie_restartowania == 2)
    {
        wygrany_gracz.gameover = true;
    }
        
    if(odliczanie_restartowania == 1)
    {
        wygrany_gracz = undefined;
        zakonczenie_gry = false;
        czy_lobby = true;
        wymus_start.st = false;
        zrespawnuj = true
        szerokosc_planszy = size;
        wysokosc_planszy = size;
        przesuniecie = 0;
    }

    if(battle_royal && czy_lobby == false && zakonczenie_gry == false)
    {
        //console.log(liczba_graczy);
        if(liczba_graczy == 1)
        {
            zakonczenie_gry = true;

            gracze.forEach(gr => {
                if(gr.gameover == false)
                {
                    wygrany_gracz = gr;
                }
            });

            let temp = [];
            temp.push({tekst:'Gracz ', kolor:"yellow"});
            temp.push({tekst:wygrany_gracz.nick, kolor:wygrany_gracz.kolor});
            temp.push({tekst:'  wygrał gre', kolor:"yellow"});

            chat.push(temp);

            //chat.push('<span style="color: yellow;">Gracz ' + wygrany_gracz.nick + ' wygrał gre</span>');
            odliczanie_restartowania = 500;
        }
        else if(liczba_graczy == 0)
        {
            zakonczenie_gry = true;
            remis = true;

            let temp = [];
            temp.push({tekst:'Gracze ', kolor:"yellow"});
            temp.push({tekst:czolowe_zderzenia.snake1.nick, kolor:czolowe_zderzenia.snake1.kolor});
            temp.push({tekst:'i', kolor:'yellow'});
            temp.push({tekst:czolowe_zderzenia.snake2.nick, kolor:czolowe_zderzenia.snake2.kolor});
            temp.push({tekst:'  zremisowali', kolor:"yellow"});

            chat.push(temp);

            //chat.push('<span style="color: yellow;">Gracze ' + czolowe_zderzenia.snake1.nick + ' i ' + czolowe_zderzenia.snake2.nick + ' zremisowali</span>');
            odliczanie_restartowania = 500;
            wygrany_gracz = czolowe_zderzenia.snake1;
        }
    }
    

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

        

        if (snake.gameover  || czy_lobby) {
            return;
        }

        //Sprawdzamy czy kolizje dla danego węża
        plan.forEach((obiekt) => colisions(obiekt, klient));

        //tempo poruszania sie
        if (i < predkosc_ruchu && (snake.tprzysp == 0 || i%4!=0)) {
            return;
        }

        //Przesuwamy węża
        snake.x += snake.dx;
        snake.y += snake.dy;

        snake.dirX = snake.dx;
        snake.dirY = snake.dy;

        snake.moved = true;

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

    let jakieWyslanie = null;
    plan.forEach(function (el) {
        if(i == predkosc_ruchu) // raz na predkosc_ruchu tickow, raz na 8 ticków
        {
            if(el.typ == "elsnake" && el.snake.tprzysp == 0)
            {
                let t = {x:el.x, y:el.y, kolor:el.snake.kolor};
                plansz8.push(t);
                if(el.snake.ochrona > 0) //dodanie białej otoczki wężowi jeśli ma efekt ochrony
                {
                    let t2 = {x:el.x, y:el.y, kolor:"white", rodzaj:"strokeRect", kolor2:"cyan"};
                    plansz8.push(t2);
                }
            }
            else if(el.typ != "elsnake" && el.typ != 'pocisk')
            {
                plansz8.push(el);
            }

        }
        if(i%4==0) // raz na 4 ticki
        {
            if(el.typ == "elsnake" && el.snake.tprzysp > 0)
            {
                let t = {x:el.x, y:el.y, kolor:el.snake.kolor};
                plansz4.push(t);
                if(el.snake.ochrona > 0) //dodanie białej otoczki wężowi jeśli ma efekt ochrony
                {
                    let t2 = {x:el.x, y:el.y, kolor:"white", rodzaj:"strokeRect", kolor2:"cyan"};
                    plansz4.push(t2);
                }

                //dodanie zielonej otoczki wężowi jeśli ma efekt przyśpieszenia
                let t2 = {x:el.x, y:el.y, kolor:"green", rodzaj:"strokeRect", kolor2:"green"};
                plansz4.push(t2);

            }
        }
        if(i%2 == 0) // raz na 2 ticki
        {
            if(el.typ == "pocisk")
            {
                let t = {x:el.x, y:el.y, kolor:el.kolor, rodzaj:"arc"};
                plansz2.push(t);
    
                
                if(i%2 == 0) //przesuwanie pocisku
                {
                    el.x += el.dx;
                    el.y += el.dy;
                    el.zasieg--;
                }
                if(el.zasieg == 0) //usuniecie pocisku po przeleceniu ustalone dystansu
                {
                    plan.delete(el);
                }
            }
        }
       
    });

    if(i == predkosc_ruchu)
    {
        jakieWyslanie = '8';

    }
    else if(i%4 == 0) jakieWyslanie = '4';
    else if(i%2 == 0) jakieWyslanie = '2';
    else jakieWyslanie = '1';
    
    gracze.forEach(function (el) {
        if(el.gameover == false)
        {
            napisy.push({
                n: el.nick,
                x: el.x,
                y: el.y,
                wynik: el.wynik,
                kierunekX: el.dx,
                kierunekY: el.dy,
            });
        }
    });


    klienci.forEach((kl) => {
        let snake = gracze.get(kl);
        if (snake.gameover) {
            kl.send(
                JSON.stringify({
                    typ: 'gameover',
                    wynik: snake.wynik,
                }),
            );
            
            snake.cells.forEach(function (el) {
                // Usuwanie wszystkich części gracza
                plan.delete(el);
            });
            if(snake.cells.length > 0)
            {
                liczba_graczy--;
                try {
                    fs.writeFileSync('./wyniki.json', JSON.stringify({nick:snake.nick, wynik:snake.wynik}));
                } catch (err) {
                    console.error(err)
                }
            }
            snake.cells = [];
            
        }

        if(host.h == undefined)
        {
            host.h = kl;
        }
        gameUpdateMsg(kl, plansz8, plansz4, plansz2, napisy, jakieWyslanie);
        });


    if (i == predkosc_ruchu) {
        chat = [];
        privChat = [];
        zrespawnuj = false
        //tempo poruszania sie
        i = 0;
    }
}


