import { chat, gracze } from '../serwer-snake.js';

export function gameUpdateMsg(klient, plansz, napisy) {
    let snake = gracze.get(klient);
    if (snake) {
        klient.send(
            JSON.stringify({
                typ: 'plansza',
                plansza: plansz,
                chat: chat,
                napisy: napisy,
                wynik: snake.wynik,
            }),
        );
    } else {
        klient.send(
            JSON.stringify({
                typ: 'plansza',
                plansza: plansz,
                chat: chat,
                napisy: napisy,
                wynik: false,
            }),
        );
    }
}
