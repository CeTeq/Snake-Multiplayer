import { chat, privChat, realneTps, grid, gracze, odliczanie_zmniejszania, battle_royal, czy_lobby, zakonczenie_gry, remis, wygrany_gracz, zrespawnuj, odliczanie_rozpoczecia, czas_odli_rozp, tps, liczba_klientow, liczba_graczy, szerokosc_planszy, wysokosc_planszy, przesuniecie } from '../serwer-snake.js';
import { kick, admins, host, title } from '../events/clientMessage.js';
import { czolowe_zderzenia } from '../checks/colisions.js';


export let zasiegWidoku = {
    x: 1000,
    y: 1000
};

export function gameUpdateMsg(klient, plansz8, plansz4, plansz2, napisy, jakieWyslanie) {
    let snake = gracze.get(klient);
    let t;
    let od = false;
    let h = false;
    let a = false;
    let tr;


    let planszaDoWyslania8 = [];
    let planszaDoWyslania4 = [];
    let planszaDoWyslania2 = [];
    let x1 = snake.x - zasiegWidoku.x;
    let y1 = snake.y - zasiegWidoku.y;
    let x2 = snake.x + zasiegWidoku.x;
    let y2 = snake.y + zasiegWidoku.y;


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


    /*planszaDoWyslania8.forEach(function (el) {
            el.x = el.x - x1;
            el.y = el.y - y1;
    });*/




    if(battle_royal)
    {
        tr = "Battle Royal";
    }
    else
    {
        tr = "Sandbox";
    }

    admins.forEach(ad => {
        if(ad == klient)
        {
            a = true;
        }
    });

    if(host.h == klient)
    {
        h = true;
    }
    
    if(czy_lobby)
    {
        t = "Oczekiwanie na graczy...";
    }
    else if(snake.gameover == false)
    {
        t = 'Wynik: ' + snake.wynik;
    }
    else if(snake.gameover == true)
    {
        t = 'Koniec gry!' + '<br>' + 'Wynik: ' + snake.wynik;
    }

    if(battle_royal && zakonczenie_gry == true)
    {
        if(remis)
        {
            t = 'Gracze ' + czolowe_zderzenia.snake1.nick + ' i ' + czolowe_zderzenia.snake2.nick + ' zremisowali!';
        }
        else
        {
            t = 'Gracz ' + wygrany_gracz.nick + ' Wygrał gre!';
        }
    }
    
    if((battle_royal && zrespawnuj) || kick == snake.nick)
    {
        od = true;
    }

    if(battle_royal && odliczanie_rozpoczecia < czas_odli_rozp)
    {
        t = 'Gra rozpocznie sie za ' + Math.floor(odliczanie_rozpoczecia/(tps*5) + 1) + 's';
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

        gracze.forEach( snake2 => {
            let czy = false;
            if(snake2 == snake)
            {
                czy = true;
            }
            mapa.push({x: snake2.x, y: snake2.y, kolor: snake2.kolor, czyJa: czy, rodzaj:"fillRect"});
        })

        if(odliczanie_zmniejszania < 200*tps && odliczanie_zmniejszania != 0) //czerwona linia na minimapie
        {
            mapa.push({x: szerokosc_planszy/4, y: wysokosc_planszy/4, kolor: "red", rodzaj:"strokeRect"});
        }

        if(odliczanie_zmniejszania < 200*tps && odliczanie_zmniejszania != 0) //czerwona linia na planszy
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
                napisy: napisy,
                wynik: snake.wynik,
                tarcze: snake.tarcze,
                przysp: snake.przysp,
                naboje: snake.naboje,
                snakeX: snake.x/16,
                snakeY: snake.y/16,
                ogracze: liczba_klientow,
                zgracze: liczba_graczy,
                czy_lobby: czy_lobby,
                minimapa: mapa,
                size: szerokosc_planszy,
                przesuniecie: przesuniecie,
                admin: a,
                host: h,
                tryb: tr,
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
                napisy: napisy,
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
