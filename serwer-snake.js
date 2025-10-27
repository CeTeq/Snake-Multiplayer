import { WebSocketServer } from 'ws';
import express, { json } from 'express';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import { clientMessage, host, maksGraczyBot, opoznienieBot, czasDoZmiejszaniaPlanszy } from './events/clientMessage.js';
import { colisions, czolowe_zderzenia } from './checks/colisions.js';
import { isInGrid } from './checks/isInGrid.js';
import { gameUpdateMsg } from './messages/gameUpdate.js';
import { apples, liczba_jablek } from './items/apples.js';
import { generuj_boosty } from './items/boosts.js';
import { dodajWeza } from './addSnakes.js';
import { aktualizujBoty, dodajBota, liczba_botow, zmiejszLiczbeBotow } from './bots.js';

let portGry = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const port = 8000;
let port2 = 8079;
const ip = '0.0.0.0';


const argument = process.argv[2];
export let battle_royal = false;


const serwer = https.createServer({
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
    key: fs.readFileSync(path.join(__dirname, 'key.pem'))
    //cert: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/vps-ef6fd4d2.vps.ovh.net/fullchain.pem')),
    //key: fs.readFileSync(path.join(__dirname, '../../../etc/letsencrypt/live/vps-ef6fd4d2.vps.ovh.net/privkey.pem'))
}, app);


if(argument == undefined)
{
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'snake.html'));
    });


    serwer.listen(port, ip, () => {
    console.log(`Server is running on https://${ip}:${port}`);
    });

}
else
{
    port2 += parseInt(argument);
    serwer.listen(port2, ip, () => {
    console.log(`Server is running on https://${ip}:${port2}`);
    });
    battle_royal = true;
}




const wss = new WebSocketServer({ server: serwer });

export let grid = 16;
export const gracze = new Map();
export let chat = [];
export let privChat = [];
export let kolizje = [];
export let plan = new Map();
export let wysokosc_planszy = 200;
export let szerokosc_planszy = 200;
export let czasGrania = 0;

export function zmienRozmiarPlanszy(x, y)
{
    szerokosc_planszy = x;
    wysokosc_planszy = y;

    let ileUsunieto = 0;

    plan.forEach( el => {
        if(el.typ == "jablko" || el.typ == "naboje" || el.typ =="przysp" || el.typ == "tarcze")
        {
            if(el.typ == "jablko")
            {
                ileUsunieto++;
            }
            plan.delete(el);
        }
    });

    apples(ileUsunieto,false);
}



export let czy_lobby = battle_royal;
export let zakonczenie_gry = false;
export let wygrany_gracz = undefined;
export let czas_odli_rozp = 500;
export let odliczanie_rozpoczecia = czas_odli_rozp;
export let odliczanie_restartowania = 0;
export let odliczanie_zmniejszania = 0;
export let wymus_start = {
st: false,
};
export let liczba_graczy = 0;
export let liczba_klientow = 0;
export let remis = false;
export const tps = 16.7;
export let zrespawnuj = false;
export let przesuniecie = 0;
export let realneTps = 0;
export const klienci = new Map();
let min_graczy = 16;

let tpsSuma = 0;
let tpsIle = 0;

let size = 200;
let czas = new Date();
let fl = false;
let pol = 0;
const predkosc_ruchu = 8;

let czy_gra;
const kolory = ['green', 'red', 'blue', 'orange', 'purple', 'yellow'];


export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max+1 - min)) + min;
}

apples(liczba_jablek);


function zapiszWynik(snake)
{
    let dane;
    let wyniki = [];
    let wyniki2 = [];
    let nieistnieje = false;

    
   try {
    dane = fs.readFileSync(__dirname + '/public/wyniki.txt', 'utf8');
   } catch (error) {
    nieistnieje = true;
   } 

    if(nieistnieje == false)
    {
        wyniki = dane.split('\n');
        wyniki.push(`${snake.nick}: ${snake.wynik}`);
        wyniki.forEach( w => {
            let t = w.split(" ");
            if(t[0] != undefined && t[1] != undefined)
            {
                wyniki2.push({wynik:t[1], nick:t[0]});
            }

        })

        wyniki2.sort((a, b) => b.wynik - a.wynik);

        if(wyniki2.length > 50)
        {
            wyniki2.pop();
        }

        let doZapisania = '';
        let ind = 1;
        wyniki2.forEach( w => {
            if(w.wynik > 0)
            {
                doZapisania += w.nick;
                doZapisania +=  " ";
                doZapisania += String(w.wynik);
                doZapisania += '\n';
            }
            ind++;
        })
        
        try {
            fs.writeFileSync(__dirname + '/public/wyniki.txt', doZapisania);
        } catch (error) {
            
        }
    }
}

setInterval(loop, tps);

export function zwiekszLiczbeGraczy() 
{
    liczba_graczy++;
    liczba_klientow++;
}


wss.on('connection', (ws, req) => {
    console.log('Nowe połączenie WebSocket z adresu: ' + req.socket.remoteAddress);
    let czyTrwa = false;

    if(battle_royal == true && czy_lobby == false)
    {
        czyTrwa = true;
    }
    
    ws.send(                    //Pierwsza wiadomość do klienta
        JSON.stringify({
        typ: 'pierwsza',
        czyTrwaGra: czyTrwa,
    }),);

    let snake = dodajWeza(ws);
    snake.ip = req.socket.remoteAddress;

    ws.on('message', (wia) => clientMessage(wia, ws)); // Obsługa wiadomości otrzymanych od klienta

    ws.on('close', () => {
        let snake = gracze.get(ws);
        console.log('Gracz ' + snake.nick + ' wyszedł z gry');

        if(host.h == ws)
        {
            host.h = undefined;
        }
        
        
        if(snake.gameover == false)
        {
            let temp = [];
            temp.push({tekst:snake.nick, kolor:snake.kolor});
            temp.push({tekst:'  left the game', kolor:"red"});

            chat.push(temp);
        }

        if(snake.cells.length > 0)
        {
            zapiszWynik(snake);
            liczba_graczy--;
            snake.cells.forEach(function (el) {
                // Usuwanie wszystkich części gracza
                plan.delete(el);
            });
        }

        let czasTeraz = new Date();
        if(snake.ip != "89.73.44.51")
        {
            czasGrania += czasTeraz - snake.czas;
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
    let nickiAdmina = [];

    let czasTeraz = new Date();
    tpsSuma += Math.floor(1000 / (czasTeraz.getTime() - czas.getTime()), 1);
    tpsIle++;

    if(tpsIle > 30)
    {
        realneTps = Math.floor(tpsSuma/tpsIle,1);
        tpsIle=0;
        tpsSuma=0;
    }

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

        if(szerokosc_planszy > 25)
        {
            odliczanie_zmniejszania = czasDoZmiejszaniaPlanszy * realneTps;
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
        odliczanie_zmniejszania = czasDoZmiejszaniaPlanszy * realneTps;
    }

    if(odliczanie_restartowania > 0)
    {
        odliczanie_restartowania--;
    }

        
    if(odliczanie_restartowania == 1)
    {
        wygrany_gracz.gameover = true;
        wygrany_gracz = undefined;
        zakonczenie_gry = false;
        czy_lobby = true;
        wymus_start.st = false;
        zrespawnuj = true
        szerokosc_planszy = size;
        wysokosc_planszy = size;
        przesuniecie = 0;
        remis = false;

        plan.forEach( el => {
            if(el.typ == 'jablko')
            {
                plan.delete(el);
            }
        });

        apples(liczba_jablek, false);
    }

    if(battle_royal && czy_lobby == false && zakonczenie_gry == false)
    {
        //console.log(liczba_graczy);
        if(liczba_graczy == 1)
        {
            zakonczenie_gry = true;
            odliczanie_zmniejszania = 0;

            gracze.forEach(gr => {
                if(gr.gameover == false)
                {
                    wygrany_gracz = gr;
                }
            });

            let temp = [];
            temp.push({tekst:wygrany_gracz.nick, kolor:wygrany_gracz.kolor});
            temp.push({tekst:'  won the game', kolor:"yellow"});

            chat.push(temp);

            //chat.push('<span style="color: yellow;">Gracz ' + wygrany_gracz.nick + ' wygrał gre</span>');
            odliczanie_restartowania = 500;
        }
        else if(liczba_graczy == 0)
        {
            zakonczenie_gry = true;
            odliczanie_zmniejszania = 0;
            remis = true;

            let temp = [];
            temp.push({tekst:czolowe_zderzenia.snake1.nick, kolor:czolowe_zderzenia.snake1.kolor});
            temp.push({tekst:' and ', kolor:'yellow'});
            temp.push({tekst:czolowe_zderzenia.snake2.nick, kolor:czolowe_zderzenia.snake2.kolor});
            temp.push({tekst:' tied', kolor:"yellow"});

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


    if(liczba_graczy < maksGraczyBot && (battle_royal == false || liczba_graczy-liczba_botow >= 1 || liczba_botow < 5) && (battle_royal == false || czy_lobby == true))
    {
        let czy = getRandomInt(1,opoznienieBot);
        if(czy == 1)
        {
            dodajBota();
        }
    }


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
            if(el.typ == "elsnake" && el.snake.tprzysp <= 4)
            {
                //console.log("normalne")
                let t = {x:el.x, y:el.y, kolor:el.snake.kolor};
                plansz8.push(t);
                if(el.snake.ochrona > 0) //dodanie białej otoczki wężowi jeśli ma efekt ochrony
                {
                    let t2 = {x:el.x, y:el.y, kolor:"white", rodzaj:"strokeRect", kolor2:"cyan"};
                    plansz8.push(t2);
                }

                if(el == el.snake.cells[0])
                {
                    let kierunek;

                    if(el.snake.dirX > 0)
                    {
                        kierunek = "prawo";
                    }
                    else if(el.snake.dirX < 0)
                    {
                         kierunek = "lewo";
                    }
                    else if(el.snake.dirY > 0)
                    {
                         kierunek = "dol";
                    }
                    else if(el.snake.dirY < 0)
                    {
                         kierunek = "gora";
                    }

                    let t = {x:el.x, y:el.y, rodzaj:"oczy", obrot:kierunek};
                    plansz8.push(t);
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
                //console.log("przyspieszone" + el.snake.tprzysp)
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
        aktualizujBoty();

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
                kolor: el.kolor,
                wynik: el.wynik,
                kierunekX: el.dx,
                kierunekY: el.dy,
            });
            
            let t = "";
            if(el.bot)
            {
                t = "(bot)";
            }
            nickiAdmina.push({ //Napisy admina; admin widzi kto jest botem
                n: t + el.nick,
                x: el.x,
                y: el.y,
                kolor: el.kolor,
                wynik: el.wynik,
                kierunekX: el.dx,
                kierunekY: el.dy,
            });
        }
    });


    klienci.forEach((kl) => {
        let snake = gracze.get(kl);
        if (snake.gameover) {
           
            if(!Number.isInteger(kl) && odliczanie_restartowania == 0 && czy_lobby == false)
            {
                 kl.send(
                    JSON.stringify({
                    typ: 'gameover',
                    wynik: snake.wynik,
                }),);
                
            }
            else if(Number.isInteger(kl)) //to jest bot
            {
                gracze.delete(kl);
                klienci.delete(kl);
                liczba_klientow--;
                zmiejszLiczbeBotow();
            }
            
            snake.cells.forEach(function (el) {
                // Usuwanie wszystkich części gracza
                plan.delete(el);
            });
            if(snake.cells.length > 0)
            {
                zapiszWynik(snake);
                liczba_graczy--;
            }
            snake.cells = [];
            
        }

        if(host.h == undefined)
        {
            host.h = kl;
        }
        gameUpdateMsg(kl, plansz8, plansz4, plansz2, napisy, nickiAdmina, jakieWyslanie);
        });


    if (i == predkosc_ruchu) {
        chat = [];
        privChat = [];
        zrespawnuj = false
        //tempo poruszania sie
        i = 0;
    }
}


