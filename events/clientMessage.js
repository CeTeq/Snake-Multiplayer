import { chat, gracze, grid, plan, liczba_klientow, wymus_start } from '../serwer-snake.js';

export let liczba_jablek = 100;
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
        }
    
        gracze.set(ws, sn);
        chat.push('<span style="color: green;">Gracz ' + sn.nick + ' dołączył do gry</span>');
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
            let komenda = [];
            komenda = wiadomosc.split(" ");

                if(czy_host && wiadomosc.search('/') > 0) //Komendy
                {
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

                    else if(komenda[1] == '/bsize')
                    {
                        //wymiaryPlanszy.szerokosc = komenda[2];
                       // wymiaryPlanszy.wysokosc = komenda[3];
                    }
                    else if(komenda[1] == '/apple')
                    {
                        let temp = liczba_jablek;
                        
                        if(komenda[2] == 'g')
                        {
                            liczba_jablek = liczba_graczy - temp;
            
                        }
                        else if(typeof komenda[2] == 'int')
                        {
                            liczba_jablek = komenda[2] - temp;
                        }
            
                        if(liczba_jablek > 0) apples();
                        liczba_jablek += temp;
                    }
                        
                    
                    //console.log(komenda[1]);
                }
                else if(komenda[1] == '/admin')
                {
                    if(komenda[2] == haslo)
                    {
                        admins.push(ws);
                    }
                }

                else
                {
                    chat.push(wiadomosc);
                }
        } 

        else if(czy_host && ruch == undefined && wia.wymus_start && liczba_klientow > 1)
        {
            wymus_start.st = true;
            console.log("wystartowano ręcznie");
        }
        else if(czy_host && ruch == undefined && wia.akcjaHosta == "zmienTryb")
        {
            console.log("zmieniono tryb gry");
            if(battle_royal)
            {
                battle_royal = false;
            }
            else
            {
                battle_royal = true;
            }
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
