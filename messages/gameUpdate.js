import { chat, gracze, battle_royal, czy_lobby, zakonczenie_gry, remis, wygrany_gracz, zrespawnuj, odliczanie_rozpoczecia, czas_odli_rozp, tps, liczba_klientow, liczba_graczy, szerokosc_planszy, wysokosc_planszy } from '../serwer-snake.js';
import { kick, admins, liczba_jablek } from '../events/clientMessage.js';
import { czolowe_zderzenia } from '../checks/colisions.js';

export function gameUpdateMsg(klient, plansz8, plansz4, plansz2, napisy, jakieWyslanie) {
    let snake = gracze.get(klient);
    let t;
    let od = false;
    let h = false;
    let tr;


    if(battle_royal)
    {
        tr = "Battle Royal";
    }
    else
    {
        tr = "Sandbox";
    }

    admins.forEach(host => {
        if(host == klient)
        {
            h = true;
        }
    });
    
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
        t = 'Koniec Gry Wynik: ' + snake.wynik;
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
    
    if((battle_royal && zrespawnuj) || kick == snake.nick || kick == 'all')
    {
        od = true;
    }

    if(battle_royal && odliczanie_rozpoczecia < czas_odli_rozp)
    {
        t = 'Gra rozpocznie sie za ' + Math.floor(odliczanie_rozpoczecia/(tps*5) + 1) + 's';
    }
    
    if(jakieWyslanie == '8')
    {
        let mapa = [];

        gracze.forEach( snake2 => {
            let czy = false;
            if(snake2 == snake)
            {
                czy = true;
            }
            mapa.push({x: snake2.x, y: snake2.y, kolor: snake2.kolor, czyJa: czy});
        })

        klient.send(
            JSON.stringify({
                tytul: t,
                typ: 'plansza',
                jakieWyslanie: jakieWyslanie,
                plansza8: plansz8,
                plansza4: plansz4,
                plansza2: plansz2,
                chat: chat,
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
                szerokosc_planszy: szerokosc_planszy,
                wysokosc_planszy: wysokosc_planszy,
                admin: h,
                tryb: tr,
            }),
        );
    }
    else if(jakieWyslanie == '4')
    {
        klient.send(
            JSON.stringify({
                typ: 'plansza',
                jakieWyslanie: jakieWyslanie,
                plansza4: plansz4,
                plansza2: plansz2,
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
                plansza2: plansz2,
                napisy: napisy,
            }),
        );
    }
}
