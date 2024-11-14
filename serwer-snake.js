import { WebSocketServer } from 'ws';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const wss = new WebSocketServer({ port: 8080, host: '0.0.0.0' });

const app = express();
const port = 8000;

let fl = false;
let gracze = new Map();
let klienci = new Map();
let liczba_graczy  = 0;
let pol = 0;
let grid = 16;
let wysokosc_planszy = 640;
let szerokosc_planszy = 640;
let plan = new Map();
let liczba_jablek = 4;
let chat = [];
let czy_gra;
let kolizje = []
const kolory = ['green', 'red', 'blue', 'orange', 'purple', 'yellow']
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'snake.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


function getRandomInt(min, max) {
    return Math.floor(Math.random()*(max - min)) + min;
}


for(let i=0; i<liczba_jablek; i++)
{
    let jablko = {
        typ: "jablko",
        kolor: "red",
        x: getRandomInt(0,25) * grid,
        y: getRandomInt(0,25) * grid,
    };
    plan.set(jablko, jablko);
}
function randColor() {
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}
setInterval(loop, 10);
wss.on('connection', (ws) => {
    console.log('Nowe połączenie WebSocket');
    let nowykol = randColor();
    let snake = {
        nick: "nick",
        typ: "csnake",
        kolor: nowykol,
        x: 160,
        y: 160,
        dx: grid,
        dy: 0,
        cells: [{x:160,y:160,kolor: nowykol,typ:"snake",nick:""}, {x:144,y:160,kolor: nowykol,typ:"snake",nick:""}], //cialo węża
        maxCells: 2, //bierząca długość węża
        wynik: 0,
        gameover: false,
        czy_pierwszy: true,
    };

    gracze.set(ws,snake);
    klienci.set(ws,ws);
    liczba_graczy++;

    snake.cells.forEach((c) => {
        plan.set(c,c);
    });

    ws.on('message', (wia) => {
        let wiad = JSON.parse(wia);
        let sn = gracze.get(ws);

        if(sn != undefined && sn.czy_pierwszy)
        {
            sn.nick = wiad.nick;
            sn.czy_pierwszy = false;
            gracze.set(ws,sn);
            chat.push("Gracz " + sn.nick + " dołączył do gry");
            sn.cells.forEach((c) => {
                c.nick = sn.nick;
            });
        }
        else
        {
            let klawisz = wiad.klawisz;
            let wiadomosc = wiad.wiadomosc;
            if(wiadomosc != undefined)
            {
                if(wiadomosc != null)
                {
                    chat.push(wiadomosc);
                }
            }
            else if(sn != undefined)
            {
                console.log('Klient wcisnal:', klawisz);
                if(gracze.get(ws) != undefined)
                {
                    let waz = gracze.get(ws);

                    if(klawisz == 'KeyD' && waz.dx >= 0)
                    {
                        waz.dx = grid;
                        waz.dy = 0;
                    }
                    if(klawisz == 'KeyA' && waz.dx <= 0)
                    {
                        waz.dx = -grid;
                        waz.dy = 0;
                    }
                    if(klawisz == 'KeyW' && waz.dy <= 0)
                    {
                        waz.dy = -grid;
                        waz.dx = 0;
                    }
                    if(klawisz == 'KeyS' && waz.dy >= 0)
                    {
                        waz.dy = grid;
                        waz.dx = 0;
                    }
                    gracze.set(ws,waz);
                }
            }
            
        }

    })

        // Obsługa wiadomości otrzymanych od klienta
    /*ws.on('message', (wia) => {
    let gracz = JSON.parse(wia);
    console.log('Otrzymano wiadomość od klienta:', gracz.message);
    
    
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Witaj, nowy kliencie!',
        serverTime: new Date()
    }));
    //wyslij();
    //console.log("wysłano");
    })*/
    

    ws.on("close", () => {
    console.log("skasowano");
    chat.push("Gracz się rozłączył");
    if(gracze.get(ws) != undefined)
    {
        chat.push("Gracz " + gracze.get(ws).nick + " się rozłączył");
        liczba_graczy--;
        gracze.get(ws).cells.forEach(function (el) // Usuwanie wszystkich części gracza
        {
            plan.delete(el);
        });
    }
    gracze.delete(ws);
    klienci.delete(ws);
    });

});

var i = 0;
function loop()
{
    gracze.forEach((element)=>{
        if(element.kolor === false) element.kolor = randColor()
    })

    i++;
    let plansz = [];
    let napisy = [];
    plan.forEach(function(el)
    {
        plansz.push(el);
        
    });

    gracze.forEach(function(el)
    {
        napisy.push({
            n:el.nick,
            x:el.x,
            y:el.y,
            wynik: el.wynik
        });
    });


    klienci.forEach((klient) => {
        let snake = gracze.get(klient);
        //console.log("p");
       /* klienci.forEach((wys) => {
            let sn = gracze.get(wys);
            if(sn != undefined)
            {
                sn.cells.forEach((kw) => {
                plan.push(kw);
                })
            }
        });*/
        kolizje.forEach((element)=>{
            chat.push(element)
        })
        kolizje = []
        if(snake) {
            klient.send(JSON.stringify({
                typ: "plansza",
                plansza: plansz,
                chat: chat,
                napisy: napisy,
                wynik: snake.wynik
            }));
        }
        else{
            klient.send(JSON.stringify({
                typ: "plansza",
                plansza: plansz,
                chat: chat,
                napisy: napisy,
                wynik: false
            }));
        }

        //Czyszczenie chatu

        

        if(i<8)
        {
            
            return;
        }

        if(snake == undefined)
        {
            return;
        }
         //Przesuwamy węża
         snake.x += snake.dx;
         snake.y += snake.dy;
       

        //Sprawdzamy czy wąż nie wyleciał poza plansze
        if(snake.x < 0)
        {
            snake.x = szerokosc_planszy - grid;
        }
        else if(snake.x >= szerokosc_planszy)
        {
            snake.x = 0;
        }
        else if(snake.y < 0)
        {
            snake.y = wysokosc_planszy - grid;
        }
        else if(snake.y >= wysokosc_planszy)
        {
            snake.y = 0;
        }

        //Aktualizujemy głowę węża
        snake.cells.unshift({x: snake.x, y: snake.y, kolor: snake.kolor, typ: "snake",nick: snake.nick});
        plan.set(snake.cells[0],snake.cells[0]);

        //Przesuwamy ogon 
        if(snake.cells.length > snake.maxCells)
        {
            plan.delete(snake.cells[snake.cells.length-1]);
            snake.cells.pop();
        }


        //Sprawdzamy czy kolizje dla danego węża
        plan.forEach(function (obiekt)
        {
            if(snake.cells[0].x === obiekt.x && snake.cells[0].y === obiekt.y && snake.cells[0] != obiekt) //Zderzyliśmy sie z jakimś obiektem
            {

                if(obiekt.typ == "snake")
                {
                    kolizje.push("Gracz " + snake.nick + " uderzył w: " + obiekt.nick);
                    console.log("Gracz " + snake.nick + " uderzył w: ", obiekt.nick);
                    snake.gameover = true;
                }
                else if(obiekt.typ == "jablko") //Wąż zjadł jabłko
                {
                    snake.maxCells++;
                    snake.wynik++;

                    //Losujemy nowe jabłko
                    obiekt.x = getRandomInt(0,40) * grid;
                    obiekt.y = getRandomInt(0,40) * grid;
                    console.log("Wąż zjadł jabłko");
                }
            }
        });


    gracze.set(klient,snake);

    })// forEach
    chat = [];
    kolizje

    klienci.forEach((kl) => {
        if(gracze.get(kl) != undefined)
        {
            let sn = gracze.get(kl);
            if(sn.gameover)
            {
                kl.send(JSON.stringify({
                    typ: "gameover",
                    wynik: sn.wynik
                }));

                sn.cells.forEach(function (el) // Usuwanie wszystkich części gracza
                {
                    plan.delete(el);
                });
                gracze.delete(kl);
                liczba_graczy--;
            }
        }
        
    });

    if(i == 8) //tempo poruszania sie
    {
        i=0;
    }
}