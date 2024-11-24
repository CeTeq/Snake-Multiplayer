import { chat, gracze } from '../serwer-snake.js';

export function gameUpdateMsg(klient, plansz8, plansz4, plansz2, napisy, jakieWyslanie) {
    let snake = gracze.get(klient);
    if(jakieWyslanie == '8')
    {
        klient.send(
            JSON.stringify({
                typ: 'plansza',
                jakieWyslanie: jakieWyslanie,
                plansza8: plansz8,
                plansza4: plansz4,
                plansza2: plansz2,
                chat: chat,
                napisy: napisy,
                wynik: snake.wynik,
                tarcze: snake.tarcze,
                przysp: snake.przysp,
                naboje: snake.naboje,
                snakeX: snake.x/16,
                snakeY: snake.y/16
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
                chat: chat,
                napisy: napisy,
                wynik: snake.wynik,
                tarcze: snake.tarcze,
                przysp: snake.przysp,
                naboje: snake.naboje,
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
                chat: chat,
                napisy: napisy,
                wynik: snake.wynik,
                tarcze: snake.tarcze,
                przysp: snake.przysp,
                naboje: snake.naboje,
            }),
        );
    }
}
