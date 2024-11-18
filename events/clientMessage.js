import { chat, gracze, grid, plan } from '../serwer-snake.js';

export function clientMessage(wia, ws) {
    wia = JSON.parse(wia);
    let sn = gracze.get(ws);

    if (sn.czy_pierwszy) 
    {
        sn.nick = wia.nick;
        sn.czy_pierwszy = false;
        gracze.set(ws, sn);
        chat.push('<span style="color: green;">Gracz ' + sn.nick + ' dołączył do gry</span>');
    } 
    else 
    {
        let ruch = wia.ruch;
        let wiadomosc = wia.wiadomosc;
        if (wiadomosc != undefined) {
            if (wiadomosc != null) {
                chat.push(wiadomosc);
            }
        } 
        else 
        {
            let waz = gracze.get(ws);

            if (ruch == 'p' && waz.dx >= 0) {
                waz.dx = grid;
                waz.dy = 0;
            } else if (ruch == 'l' && waz.dx <= 0) {
                waz.dx = -grid;
                waz.dy = 0;
            } else if (ruch == 'g' && waz.dy <= 0) {
                waz.dy = -grid;
                waz.dx = 0;
            } else if (ruch == 'd' && waz.dy >= 0) {
                waz.dy = grid;
                waz.dx = 0;
            }
            else if(ruch == 'tarcza' && waz.tarcze > 0)
            {
                waz.tarcze--;
                waz.ochrona = 250;
            }
            else if(ruch == 'przysp' && waz.przysp > 0)
            {
                waz.przysp--;
                waz.tprzysp = 250;
            }
            else if(ruch == 'strzal' && waz.naboje > 0)
            {
                waz.naboje--;
                let pocisk = {
                    typ: 'pocisk',
                    kolor: 'grey',
                    x: waz.x,
                    y: waz.y,
                    dx: waz.dx,
                    dy: waz.dy,
                    snake: waz,
                    zasieg: 30,
                };
                plan.set(pocisk, pocisk);
            }
            gracze.set(ws, waz);
        }
    }
}
