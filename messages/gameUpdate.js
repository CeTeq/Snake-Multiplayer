import { chat, privChat, realneTps, grid, gracze, odliczanie_zmniejszania, battle_royal, czy_lobby, zakonczenie_gry, remis, wygrany_gracz, zrespawnuj, odliczanie_rozpoczecia, czas_odli_rozp, tps, liczba_klientow, liczba_graczy, szerokosc_planszy, wysokosc_planszy, przesuniecie } from '../serwer-snake.js';
import { kick, admins, host, title, oczekujacyAdmini } from '../events/clientMessage.js';
import { czolowe_zderzenia } from '../checks/colisions.js';
import { liczba_botow } from '../bots.js';


export let zasiegWidoku = {
    x: 1000,
    y: 1000
};

export function gameUpdateMsg(klient, plansz8, plansz4, plansz2, napisy, nickiAdmina, jakieWyslanie) {
    if(Number.isInteger(klient)) //Zapobieganie próbie wysyłaniu botom danych tak jakby to byli gracze
    {
        return;
    }

    let snake = gracze.get(klient);
    let t;
    let od = false;
    let h = false;
    let a = false;
    let tr;
    let wpisywanieHasla = false;
    let nickiDoWyslania = [];                  

    let planszaDoWyslania8 = [];
    let planszaDoWyslania4 = [];
    let planszaDoWyslania2 = [];

    let x1 = snake.x - zasiegWidoku.x;
    let y1 = snake.y - zasiegWidoku.y;
    let x2 = snake.x + zasiegWidoku.x;
    let y2 = snake.y + zasiegWidoku.y;

    admins.forEach(ad => { //sprawdzamy czy aktualny gracz jest adminem
        if(ad == klient)
        {                                                                                       
            a = true;
        }
    });


    plansz8.forEach(function (el) {
        if((el.x > x1 && el.x < x2 && el.y > y1 && el.y < y2))
        {
            //console.log(snake.x, zasiegWidoku.x, x1, x2, el.x);
            //console.log(x1,x2,y1,y2,el.x, el.y);
            planszaDoWyslania8.push(el);
        }
    });

    plansz4.forEach(function (el) {
        if(el.x > x1 && el.x < x2 && el.y > y1 && el.y < y2)
        {
            planszaDoWyslania4.push(el);
        }
    });
    
    plansz2.forEach(function (el) {
        if(el.x > x1 && el.x < x2 && el.y > y1 && el.y < y2)
        {
            planszaDoWyslania2.push(el);
        }
    });



     oczekujacyAdmini.forEach(ad => {
            if(klient == ad)
            {
                wpisywanieHasla = true;
            }
    });

    let gr="", gr2="", gr3="";
    if(a)
    {
        nickiDoWyslania = nickiAdmina;
        gr = "Żywi Gracze: " + (liczba_graczy-liczba_botow);
        gr2 = "Gracze: " + liczba_graczy;
        gr3 = "Boty: " + liczba_botow;

    }
    else
    {
        nickiDoWyslania = napisy;
    }

    if(battle_royal)
    {
        tr = "Battle Royal";
    }
    else
    {
        tr = "Sandbox";
    }


    /*if(host.h == klient)
    {
        h = true;
    }*/
    
    if(czy_lobby)
    {
        t = "Waiting for players...";
    }
    else if(snake.gameover == false)
    {
        t = 'Score: ' + snake.wynik;
    }
    else if(snake.widz)
    {
        t = 'You are spectator<br>the game is in progress';
    }
    else if(snake.gameover == true )
    {
        t = 'Game over!' + '<br>' + 'Score: ' + snake.wynik;
    }

    if(battle_royal && zakonczenie_gry == true)
    {
        if(remis)
        {
            t = czolowe_zderzenia.snake1.nick + ' and ' + czolowe_zderzenia.snake2.nick + ' tied!';
        }
        else
        {
            t = wygrany_gracz.nick + ' won the game!';
        }
    }
    
    if((battle_royal && zrespawnuj) || kick == snake.nick)
    {
        od = true;
    }

    if(battle_royal && odliczanie_rozpoczecia < czas_odli_rozp)
    {
        t = 'The game will start in ' + Math.floor(odliczanie_rozpoczecia/realneTps+1.5) + 's';
    }

    if(title.napis != "")
    {
        t += "<br>" + title.napis;
        if(title.zywotnosc == 0)
        {
            title.napis = "";
        }
        title.zywotnosc--;
    }
    

    if(jakieWyslanie == '8') 
    {
        let mapa = [];
        let chatDo = structuredClone(chat);

        privChat.forEach( pr => {
            if(pr.gr == snake)
            {
                chatDo.push(pr.wiad);
            }
        });

        gracze.forEach( snake2 => { // Gracze na minimapie
            if(snake2.gameover == false)
            {
                let czy = false;
                if(snake2 == snake)
                {
                    czy = true;
                }
                mapa.push({x: snake2.x, y: snake2.y, kolor: snake2.kolor, czyJa: czy, rodzaj:"fillRect"});
            }
        })

        if(odliczanie_zmniejszania < 40*realneTps && odliczanie_zmniejszania != 0) //czerwona linia na minimapie
        {
            mapa.push({x: szerokosc_planszy/4, y: wysokosc_planszy/4, kolor: "red", rodzaj:"strokeRect"});
        }

        if(odliczanie_zmniejszania < 40*realneTps && odliczanie_zmniejszania != 0) //czerwona linia na planszy
        {
            planszaDoWyslania8.push({x: szerokosc_planszy*grid/4, y: wysokosc_planszy*grid/4, kolor: "red", rodzaj:"strokeRect", roz:szerokosc_planszy/2*grid});
        }

        planszaDoWyslania8.push({x: 2, y: 2, kolor: "grey", rodzaj:"strokeRect", roz:szerokosc_planszy*grid-4, grubosc:3}); //Granica mapy

        klient.send(
            JSON.stringify({
                tytul: t,
                typ: 'plansza',
                jakieWyslanie: jakieWyslanie,
                plansza8: planszaDoWyslania8,
                plansza4: planszaDoWyslania4,
                plansza2: planszaDoWyslania2,
                chat: chatDo,
                odswiez: od,
                napisy: nickiDoWyslania,
                wynik: snake.wynik,
                tarcze: snake.tarcze,
                przysp: snake.przysp,
                naboje: snake.naboje,
                snakeX: snake.x/16,
                snakeY: snake.y/16,
                gracze: gr,
                gracze2: gr2,
                gracze3: gr3,
                czy_lobby: czy_lobby,
                minimapa: mapa,
                size: szerokosc_planszy,
                przesuniecie: przesuniecie,
                admin: a,
                wpisywanie: wpisywanieHasla,
                host: h,
                tryb: tr,
                zakonczenie_gry: zakonczenie_gry,
                tps: realneTps,
            }),
        );
    }
    else if(jakieWyslanie == '4')
    {
        klient.send(
            JSON.stringify({
                typ: 'plansza',
                jakieWyslanie: jakieWyslanie,
                plansza4: planszaDoWyslania4,
                plansza2: planszaDoWyslania2,
                napisy: nickiDoWyslania,
            }),
        );
    }
    else if(jakieWyslanie == '2')
    {
        klient.send(
            JSON.stringify({
                typ: 'plansza',
                jakieWyslanie: jakieWyslanie,
                plansza2: planszaDoWyslania2,
            }),
        );
    }
}
