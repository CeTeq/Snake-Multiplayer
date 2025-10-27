import { Filter } from 'bad-words';
import { apples, liczba_jablek } from '../items/apples.js';
import { opoznienie, maks, liczba } from '../items/boosts.js';
import { zasiegWidoku } from '../messages/gameUpdate.js';
import { chat, gracze, grid, plan, liczba_klientow, wymus_start, privChat, liczba_graczy, zmienRozmiarPlanszy, realneTps, czasGrania } from '../serwer-snake.js';
import { dodajBota, liczba_botow } from '../bots.js';

export let kick = null;
export let haslo = "kaptur9";
export let admins = [];
export let opoznienieBot = 250;
export let maksGraczyBot = 32;
export let oczekujacyAdmini = new Map;
export let czasDoZmiejszaniaPlanszy = 120; // w sekundach
export let sumaGraczy = 0;
export let host = {
    h:undefined,
};
export let title = {
    napis:"",
    zywotnosc:0
};

const komendy = ['broyal','kill','clear','effect','mapsize','cells','spawn','set','render','title','bot','stat'];

export function clientMessage(wia, ws) {
    wia = JSON.parse(wia);
    let sn = gracze.get(ws);

    if (sn.czy_pierwszy) 
    {
        let filtr = new Filter();
        sn.nick = filtr.clean(wia.nick);
        console.log(filtr.clean(wia.nick));
        sn.czy_pierwszy = false;
        if(wia.haslo == haslo)
        {
            admins.push(ws);
        }
    
        gracze.set(ws, sn);
        let t = [];
        t.push({tekst:sn.nick, kolor:sn.kolor});
        t.push({tekst:' joined to the game', kolor:"green"});

        chat.push(t);

        if(sn.ip != "89.73.44.51")
        {
            sumaGraczy++;
        }
       // chat.push('<span style="color: green;">Gracz ', + sn.nick + ' dołączył do gry</span>');
    } 
    else 
    {
        let ruch = wia.ruch;
        let wiadomosc = wia.wiadomosc;
        let czy_admin = false;
        let czy_oczekujacy = false;

       

        admins.forEach(ad => {
            if(ws == ad)
            {
                czy_admin = true;
            }
        });

        oczekujacyAdmini.forEach(ad => {
            if(ws == ad)
            {
                czy_oczekujacy = true;
            }
        });

        if (wiadomosc != undefined && wiadomosc != null) {
            let komenda = [];
            komenda = wiadomosc.split(" ");
                if(czy_oczekujacy)
                {
                    oczekujacyAdmini.delete(ws);
                    if(wiadomosc == haslo)
                    {
                        admins.push(ws);
                        let temp = [];
                        temp.push({tekst:'Hasło poprawne!', kolor:'grey'});

                        privChat.push({gr:sn, wiad:temp});
                    }
                    else
                    {
                        let temp = [];
                        temp.push({tekst:'Błędne hasło!', kolor:'grey'});

                        privChat.push({gr:sn, wiad:temp});
                    }
                }
                else if(czy_admin && wiadomosc.search('/') >= 0) //Komendy
                {
                    if(komenda[0] == "/kill") // kill
                    {
                        if(komenda[1] == "all")
                        {
                            gracze.forEach(gr => {
                            if(gr.gameover == false && gr != sn)
                            {
                                let temp = [];
                                temp.push({tekst:gr.nick, kolor:gr.kolor});
                                temp.push({tekst:' was slain', kolor:"red"});

                                chat.push(temp);
                                gr.gameover = true;
                                //chat.push('<span style="color: red;">Gracz ' + gr.nick + ' zginął</span>');
                            }
                            
                            });
                        }
                        else if(komenda[1] == "bot")
                        {
                            gracze.forEach(gr => {
                            if(gr.gameover == false && gr.bot)
                            {
                                let temp = [];
                                temp.push({tekst:gr.nick, kolor:gr.kolor});
                                temp.push({tekst:' was slain', kolor:"red"});

                                chat.push(temp);
                                gr.gameover = true;
                                //chat.push('<span style="color: red;">Gracz ' + gr.nick + ' zginął</span>');
                            }                            
                            });
                        }
                        else
                        {
                            gracze.forEach(gr => {

                                if(gr.nick == komenda[1])
                                {
                                    let temp = [];
                                    temp.push({tekst:gr.nick, kolor:gr.kolor});
                                    temp.push({tekst:' was slain', kolor:"red"});

                                    chat.push(temp);
                                    //chat.push('<span style="color: red;">Gracz ' + gr.nick + ' zginął</span>');
                                    gr.gameover = true;
                                }
                                });
                        }
                    }
                    else if(komenda[0] == "/help")
                    {
                        let t = [];
                        t.push({tekst:'Dostępne komendy:', kolor:'grey'});
    
                        privChat.push({gr:sn, wiad:t});

                        komendy.forEach(kom => {
                            let temp = [];
                            temp.push({tekst:'/' + kom, kolor:'grey'});
        
                            privChat.push({gr:sn, wiad:temp});
                        })
                    }
                    else if(komenda[0] == "/stat")
                    {
                        let t = [];
                        let t2 = [];
                        let s = czasGrania/(sumaGraczy-(liczba_graczy-liczba_botow))/1000;
                        let m = Math.floor(s/60,1);
                        s = Math.floor(s%60,2);
                        t.push({tekst:'Suma graczy: ' + sumaGraczy, kolor:'grey'});
                        t2.push({tekst:'Średni czas gry: ' + m + "m " + s + "s", kolor:'grey'});
    
                        privChat.push({gr:sn, wiad:t});
                        privChat.push({gr:sn, wiad:t2});
                    }
                    else if(komenda[0] == "/kick")
                    {
                        //kick = komenda[2];
                    }
                    else if(komenda[0] == "/clear")
                    {
                        plan.forEach(el => {
                            if(el.typ != "elsnake" && el.typ != "jablko")
                            {
                                plan.delete(el);

                                if(el.typ == "przysp")
                                {
                                    liczba.przysp--;
                                }
                                else if(el.typ == "tarcza")
                                {
                                    liczba.tarcz--;
                                }
                                else if(el.typ == "naboje")
                                {
                                    liczba.naboji--;
                                }
                            }
                        });
                    }
                    else if(komenda[0] == '/start')
                    {
                        wymus_start.st = true;
                    }

                    else if(komenda[0] == "/effect" || komenda[0] == "/ef")
                    {
                        if(komenda[1] == 'speed')
                        {
                            if(komenda.length > 3)
                            {
                                gracze.forEach(gr => {

                                if(gr.nick == komenda[2])
                                {
                                    gr.tprzysp = komenda[3]*realneTps;
                                }
                                });
                            }
                            else
                            {
                                sn.tprzysp = komenda[2]*realneTps;
                            }
                        }
                        else if(komenda[1] == 'shield')
                        {
                            if(komenda.length > 3)
                            {
                                gracze.forEach(gr => {

                                if(gr.nick == komenda[2])
                                {
                                    gr.ochrona = komenda[3]*realneTps;
                                }
                                });
                            }
                            else
                            {
                                sn.ochrona = komenda[2]*realneTps;
                            }
                        }
                    }

                    else if(komenda[0] == "/cells")
                    {
                        if(komenda.length > 2)
                        {
                            gracze.forEach(gr => {

                            if(gr.nick == komenda[1])
                            {
                                for(let i =0; i<gr.maxCells; i++)
                                {
                                    if(i > komenda[2])
                                    {
                                        plan.delete(gr.cells[gr.cells.length-1]);
                                        gr.cells.pop();
                                    }
                                }

                                gr.maxCells = komenda[2];
                            }
                            });
                        }
                        else
                        {
                            for(let i =0; i<sn.maxCells; i++)
                            {
                                if(i >= komenda[1])
                                {
                                    plan.delete(sn.cells[sn.cells.length-1]);
                                    sn.cells.pop();
                                }
                            }

                            sn.maxCells = komenda[1];
                        }
        
                    }

                    else if(komenda[0] == "/render")
                    {
                        if(komenda.length > 2)
                        {
                            zasiegWidoku.x = parseInt(komenda[1]);
                            zasiegWidoku.y = parseInt(komenda[2]);
                        }
                        else if(komenda.length == 2)
                        {
                            zasiegWidoku.x = parseInt(komenda[1]);
                            zasiegWidoku.y = parseInt(komenda[1]);
                        }
                    }

                    else if(komenda[0] == "/title")
                    {
                        title.napis = komenda[1];
                        title.zywotnosc = komenda[2];
                    }

                    else if(komenda[0] == '/mapsize')
                    {
                        if(komenda.length == 2)
                        {
                            zmienRozmiarPlanszy(komenda[1],komenda[1]);
                        }
                        else if(komenda.length > 2)
                        {
                            zmienRozmiarPlanszy(komenda[1],komenda[2]);
                        }
                    }
                    else if(komenda[0] == '/spawn')
                    {
                        if(komenda[1] == 'apl')
                        {
                            let jablkaDoDodania;
                        
                            if(komenda[2] == 'g')
                            {
                                jablkaDoDodania = liczba_graczy - liczba_jablek;
                
                            }
                            else
                            {
                                jablkaDoDodania = parseInt(komenda[2]) - liczba_jablek;
                            }

                
                            apples(jablkaDoDodania);
                        }

                        else if(komenda[1] == 'ammo')
                        {
                           opoznienie.naboji = parseInt(komenda[2]);
                           if(komenda.length > 3)
                           {
                                maks.naboji = parseInt(komenda[3]);
                           }
                        }
                        else if(komenda[1] == 'shield')
                        {
                            opoznienie.tarcz = parseInt(komenda[2]);
                           if(komenda.length > 3)
                           {
                                maks.tarcz = parseInt(komenda[3]);
                           }
                        }
                        else if(komenda[1] == 'speed')
                        {
                             opoznienie.przysp = parseInt(komenda[2]);
                           if(komenda.length > 3)
                           {
                                maks.przysp = parseInt(komenda[3]);
                           }
                        }
                        else if(komenda[1] == 'bot')
                        {
                             maksGraczyBot = parseInt(komenda[2]);
                           if(komenda.length > 3)
                           {
                                opoznienieBot = parseInt(komenda[3]);
                           }
                        }
                    }
                    else if(komenda[0] == '/set')
                    {
                        if(komenda[1] == 'ammo')
                        {
                            if(komenda.length > 3)
                            {
                                gracze.forEach(gr => {

                                if(gr.nick == komenda[2])
                                {
                                    gr.naboje = komenda[3];
                                }
                                });
                            }
                            else
                            {
                                sn.naboje = parseInt(komenda[2]);
                            }
                        }
                        else if(komenda[1] == 'shield')
                        {
                            if(komenda.length > 3)
                            {
                                gracze.forEach(gr => {

                                if(gr.nick == komenda[2])
                                {
                                    gr.tarcze = komenda[3];
                                }
                                });
                            }
                            else
                            {
                                sn.tarcze = parseInt(komenda[2]);
                            }
                        }
                        else if(komenda[1] == 'speed')
                        {
                            if(komenda.length > 3)
                            {
                                gracze.forEach(gr => {

                                if(gr.nick == komenda[2])
                                {
                                    gr.przysp = komenda[3];
                                }
                                });
                            }
                            else
                            {
                                sn.przysp = parseInt(komenda[2]);
                            }
                        }
                    }

                    else if(komenda[0] == '/bot')
                    {
                        dodajBota();
                    }

                    else if(komenda[0] == '/broyal')
                    {
                        if(komenda.length > 1)
                        {
                            czasDoZmiejszaniaPlanszy = komenda[1];
                            console.log(czasDoZmiejszaniaPlanszy);
                        }
                    }
                        
                }
                

                else if(komenda[0] == '/adm')
                {
                    oczekujacyAdmini.set(ws,ws);

                    let temp = [];
                    temp.push({tekst:'Podaj hasło: ', kolor:'grey'});

                    privChat.push({gr:sn, wiad:temp});
                }


                else //wysłanie wiadomości przez gracza na chat
                {
                    let temp = [];
                    let filtr = new Filter();

                    temp.push({tekst:sn.nick, kolor:sn.kolor});

                    wiadomosc = filtr.clean(wiadomosc);
                    temp.push({tekst:`: ${wiadomosc}`, kolor:"white"});

                    chat.push(temp);
                }
        } 

        else if((czy_admin || ws == host.h) && ruch == undefined && wia.wymus_start)
        {
            wymus_start.st = true;
            //console.log("wystartowano ręcznie");
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
        }
    }
}
