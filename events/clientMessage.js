import { chat, gracze, grid } from '../serwer-snake.js';

export function clientMessage(wia, ws) {
    wia = JSON.parse(wia);
    let sn = gracze.get(ws);

    if (sn != undefined && sn.czy_pierwszy) {
        sn.nick = wia.nick;
        sn.czy_pierwszy = false;
        gracze.set(ws, sn);
        chat.push('Gracz ' + sn.nick + ' dołączył do gry');
        sn.cells.forEach((c) => {
            c.nick = sn.nick;
        });
    } else {
        let klawisz = wia.klawisz;
        let wiadomosc = wia.wiadomosc;
        if (wiadomosc != undefined) {
            if (wiadomosc != null) {
                chat.push(wiadomosc);
            }
        } else if (sn != undefined) {
            console.log('Klient wcisnal:', klawisz);
            if (gracze.get(ws) != undefined) {
                let waz = gracze.get(ws);

                if (klawisz == 'KeyD' && waz.dx >= 0) {
                    waz.dx = grid;
                    waz.dy = 0;
                } else if (klawisz == 'KeyA' && waz.dx <= 0) {
                    waz.dx = -grid;
                    waz.dy = 0;
                } else if (klawisz == 'KeyW' && waz.dy <= 0) {
                    waz.dy = -grid;
                    waz.dx = 0;
                } else if (klawisz == 'KeyS' && waz.dy >= 0) {
                    waz.dy = grid;
                    waz.dx = 0;
                }
                gracze.set(ws, waz);
            }
        }
    }
}
