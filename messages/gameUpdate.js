import { chat, gracze, czy_lobby, zakonczenie_gry, wygrany_gracz, czas_odli_rozp, odliczanie_restartowania, odliczanie_rozpoczecia, tps, host } from '../serwer-snake.js';

export function gameUpdateMsg(klient, plansz, napisy) {
    let snake = gracze.get(klient);
    let t;
    let od = false;
    let h;

    if(host == klient)
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
        t = 'Koniec Gry Wynik: ' + snake.wynik;
    }

    if(zakonczenie_gry == true)
    {
        t = 'Gracz ' + wygrany_gracz.nick + ' Wygrał gre!';
    }
    
    if(odliczanie_restartowania == 1)
    {
        od = true;
    }

    if(odliczanie_rozpoczecia < czas_odli_rozp)
    {
        t = 'Gra rozpocznie sie za ' + Math.floor(odliczanie_rozpoczecia/(tps*5) + 1) + 's';
    }

    klient.send(
        JSON.stringify({
            typ: 'plansza',
            tytul: t,
            plansza: plansz,
            chat: chat,
            napisy: napisy,
            wynik: snake.wynik,
            tarcze: snake.tarcze,
            przysp: snake.przysp,
            naboje: snake.naboje,
            odswiez: od,
            host: h,
        }),
    );
}

