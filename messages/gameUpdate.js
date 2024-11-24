import { czolowe_zderzenia } from '../checks/colisions.js';
import { chat, gracze, remis, czy_lobby, wymiaryPlanszy,  battle_royal, zakonczenie_gry, wygrany_gracz, czas_odli_rozp, odliczanie_restartowania, odliczanie_rozpoczecia, tps } from '../serwer-snake.js';
import { kick, hosts, liczba_jablek } from '../events/clientMessage.js';

export function gameUpdateMsg(klient, plansz, napisy) {
    let snake = gracze.get(klient);
    let t;
    let od = false;
    let h = false;
    let tr;

    if(battle_royal.t)
    {
        tr = "Battle Royal";
    }
    else
    {
        tr = "Sandbox";
    }

    
    hosts.forEach(host => {
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

    if(battle_royal.t && zakonczenie_gry == true)
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
    
    if((battle_royal.t && odliczanie_restartowania == 1) || kick == snake.nick || kick == 'all')
    {
        od = true;
    }

    if(battle_royal.t && odliczanie_rozpoczecia < czas_odli_rozp)
    {
        t = 'Gra rozpocznie sie za ' + Math.floor(odliczanie_rozpoczecia/(tps*5) + 1) + 's';
    }

    klient.send(
        JSON.stringify({
            typ: 'plansza',
            tytul: t,
            plansza: plansz,
            wysokosc_planszy: wymiaryPlanszy.wysokosc,
            szerokosc_planszy: wymiaryPlanszy.szerokosc,
            chat: chat,
            napisy: napisy,
            wynik: snake.wynik,
            tarcze: snake.tarcze,
            przysp: snake.przysp,
            naboje: snake.naboje,
            odswiez: od,
            host: h,
            tryb: tr,
            jablka: liczba_jablek,
        }),
    );
}

