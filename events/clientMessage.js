import { chat, gracze, grid } from '../serwer-snake.js';

export function clientMessage(wia, ws) {
    wia = JSON.parse(wia);
    let sn = gracze.get(ws);

    if (sn.czy_pierwszy) {
        sn.nick = wia.nick;
        sn.czy_pierwszy = false;
        gracze.set(ws, sn);
        chat.push('<span style="color: green;">Gracz ' + sn.nick + ' dołączył do gry</span>');
    } 
    else {
        let klawisz = wia.klawisz;
        let wiadomosc = wia.wiadomosc;
        if (wiadomosc != undefined) {
            if (wiadomosc != null) {
                chat.push(wiadomosc);
            }
        } 
        else {
            let waz = gracze.get(ws);

            if ((klawisz == 'KeyD' || klawisz == "ArrowRight") && waz.dx >= 0) {
                waz.dx = grid;
                waz.dy = 0;
            } else if ((klawisz == 'KeyA' || klawisz == "ArrowLeft") && waz.dx <= 0) {
                waz.dx = -grid;
                waz.dy = 0;
            } else if ((klawisz == 'KeyW' || klawisz == "ArrowUp") && waz.dy <= 0) {
                waz.dy = -grid;
                waz.dx = 0;
            } else if ((klawisz == 'KeyS' || klawisz == "ArrowDown") && waz.dy >= 0) {
                waz.dy = grid;
                waz.dx = 0;
            }
            gracze.set(ws, waz);
        }
    }
}
