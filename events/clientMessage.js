import { chat, gracze, grid, plan, wymiaryPlanszy, wymus_start, liczba_graczy, battle_royal, czy_lobby, odliczanie_rozpoczecia, czas_odli_rozp, odliczanie_restartowania } from '../serwer-snake.js';
import { apples } from '../items/apples.js';
import { liczba } from '../items/boosts.js';
export let liczba_jablek = 0;
export let kick = null;
export let haslo = "k";
export let admins = [];


export function clientMessage(wia, ws) {
    wia = JSON.parse(wia);
    let sn = gracze.get(ws);

    if (sn.czy_pierwszy) 
    {
        sn.nick = wia.nick;
        sn.czy_pierwszy = false;
        if(wia.haslo == haslo)
        {
            admins.push(ws);
            console.log("haslo poprawne");
        }

        if(sn.gameover == false) chat.push('<span style="color: green;">Gracz ' + sn.nick + ' dołączył do gry</span>');
    } 
    else 
    {
        let ruch = wia.ruch;
        let wiadomosc = wia.wiadomosc;
        let czy_host = false;

        admins.forEach(host => {
            if(ws == host)
            {
                czy_host = true;
            }
        });

        if (wiadomosc != undefined && wiadomosc != null) {
                if(czy_host && wiadomosc.search('/') > 0) //Komendy
                {
                    let komenda = [];
                    komenda = wiadomosc.split(" ");

                    if(komenda[1] == "/kill") // kill
                    {
                        if(komenda[2] == "all")
                        {
                            gracze.forEach(gr => {
                            if(gr.gameover == false)
                            {
                                chat.push('<span style="color: red;">Gracz ' + gr.nick + ' zginął</span>');
                            }
                            gr.gameover = true;
                            
                            });
                        }
                        else
                        {
                            gracze.forEach(gr => {

                                if(gr.nick == komenda[2])
                                {
                                    chat.push('<span style="color: red;">Gracz ' + gr.nick + ' zginął</span>');
                                    gr.gameover = true;
                                }
                                });
                        }
                    }
                    else if(komenda[1] == "/kick")
                    {
                        kick = komenda[2];
                    }
                    else if(komenda[1] == "/clear")
                    {
                        plan.forEach(el => {
                            if(el.typ != "elsnake")
                            {
                                plan.delete(el);
                            }
                        });
                    }

               
                        
                    
                    //console.log(komenda[1]);
                }
                else
                {
                    chat.push(wiadomosc);
                }
        } 

        else if(czy_host && ruch == undefined && wia.akcjaHosta == "wystartuj" && liczba_graczy > 1)
        {
            wymus_start.st = true;
        }
        else if(czy_host && ruch == undefined && wia.akcjaHosta == "zmienTryb")
        {
            console.log("zmieniono tryb gry");
            if(battle_royal.t)
            {
                battle_royal.t = false;
            }
            else
            {
                battle_royal.t = true;
            }
        }
        else if(czy_host && ruch == undefined && wia.akcjaHosta == "zmien")
        {
            wymiaryPlanszy.szerokosc = wia.szerokosc_planszy;
            wymiaryPlanszy.wysokosc = wia.wysokosc_planszy;
            let temp = liczba_jablek;
            
            if(wia.jablka.search('d') > -1)
            {
                liczba_jablek = liczba_graczy - temp;

            }
            else
            {
                liczba_jablek = wia.jablka - temp;
            }

            if(liczba_jablek > 0) apples();
            liczba_jablek += temp;
        }

        else 
        {
            let snake = gracze.get(ws);

            if (ruch == 'p' && snake.dirX >= 0) {
                snake.dx = grid;
                snake.dy = 0;
            } else if (ruch == 'l' && snake.dirX <= 0) {
                snake.dx = -grid;
                snake.dy = 0;
            } else if (ruch == 'g' && snake.dirY <= 0 ) {
                snake.dy = -grid;
                snake.dx = 0;
            } else if (ruch == 'd' && snake.dirY >= 0) {
                snake.dy = grid;
                snake.dx = 0;
            }
            else if(ruch == 'tarcza' && snake.tarcze > 0)
            {
                snake.tarcze--;
                snake.ochrona = 250;
            }
            else if(ruch == 'przysp' && snake.przysp > 0)
            {
                snake.przysp--;
                snake.tprzysp = 250;
            }
            else if(ruch == 'strzal' && snake.naboje > 0)
            {
                snake.naboje--;
                let pocisk = {
                    typ: 'pocisk',
                    kolor: 'grey',
                    x: snake.x+snake.dx,
                    y: snake.y+snake.dy,
                    dx: snake.dx,
                    dy: snake.dy,
                    snake: snake,
                    zasieg: 30,
                };
                plan.set(pocisk, pocisk);
            }
            gracze.set(ws, snake);
        }
    }
}
