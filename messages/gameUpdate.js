import { chat, gracze } from '../serwer-snake.js';

export function gameUpdateMsg(klient, plansz, napisy) {
    let snake = gracze.get(klient);
        klient.send(
            JSON.stringify({
                typ: 'plansza',
                plansza: plansz,
                chat: chat,
                napisy: napisy,
                wynik: snake.wynik,
                tarcze: snake.tarcze,
                przysp: snake.przysp,
                naboje: snake.naboje,
            }),
        );
}
