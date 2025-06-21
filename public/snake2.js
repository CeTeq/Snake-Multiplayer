const canvas = document.getElementById('plansza');
const context = canvas.getContext('2d');
const canvasMapa = document.getElementById('minimapa');
const contextMapa = canvasMapa.getContext('2d');

let klatka; //ID funkcji do setInterval
const grid = 16; //rozmiar siatki
let size = 200; //640x640px 40x40 pól
let szerokosc_planszy;
let wysokosc_planszy;
let snake;
let jablko;
let wynik = 0;
let gameover = false; //gdy jest rowny true - koniec gry
let socket;
let ruch;
let i = 0;
let napisy = [];
let plansza = new Map();
let plansza8 = new Map();
let plansza4 = new Map();
let plansza2 = new Map();
let minimapa = [];
let ipAddr;
let first = true;
let wiadomosc;
let snakeX;
let snakeY;
let admin = false;
let host = false;
let cooldown = 0;
let cooldown2 = 0;
let czy_start = false;
let czyWynik = false;
let haslo;
let przesuniecie = 0;
let fps = 0;
let fpsSuma = 0;
let fpsIle = 0;
let czas = new Date();
let wpisywanieHasla = false;
let id_napisow = 0;
//let sendMsg = document.getElementById('sendMsg');
const msg  = document.getElementById('msg');
const URL = 'ws://' + document.URL.slice(7, -3);
const ranking = document.getElementById('ranking');

const oczyP = new Image();
oczyP.src = "grafika/oczyP.png";
const oczyL = new Image();
oczyL.src = "grafika/oczyL.png";
const oczyG = new Image();
oczyG.src = "grafika/oczyG.png";
const oczyD = new Image();
oczyD.src = "grafika/oczyD.png";
// console.log(URL);

/*const rysunek = document.createElement('canvas');
rysunek.height = grid;
rysunek.width = grid;
const context2 = rysunek.getContext('2d');*/

function siatka() {
    context.lineWidth = 1;
    context.strokeStyle = '#111111';
    context.beginPath();

    for (let x = grid; x < grid * size; x += grid) {
        context.moveTo(x, 0);
        context.lineTo(x, grid * size);
    }

    for (let y = grid; y < grid * size; y += grid) {
        context.moveTo(0, y);
        context.lineTo(grid * size, y);
    }
    context.stroke();
}

const niebieskaPoswiata = document.createElement('canvas');
const nP = niebieskaPoswiata.getContext('2d');

const zielonaPoswiata = document.createElement('canvas');
const nZ = zielonaPoswiata.getContext('2d');


function Ustaw()
{
    fetch("wyniki.txt")
    .then((res) => res.text())
    .then((text) => {
        let tekst = text.split("\n");
        tekst.pop();
        let ind = 1;
        tekst.forEach( t => {
            document.getElementById("trwaleWyniki").innerHTML += `<span style="font-size: 20px;">${ind}</span>. <span id="n${id_napisow}"></span><br>`;
            document.getElementById(`n${id_napisow}`).textContent = t;
            // console.log(document.getElementById(`n${id_napisow}`).innerHTML);
            id_napisow++;
            ind++;
        })
     })
    .catch((e) => console.error(e));
}

function gameLoop() {
    loop();
    requestAnimationFrame(gameLoop);
}

function init() {
    //inicjalizacja gry
    ruch =  undefined;
    gameover = false;
    document.getElementById('wynik').innerHTML = 'Score: 0';

    requestAnimationFrame(gameLoop);
    //console.log('Uruchomiono gre');

    document.getElementById('nick').innerText = 'Nick: ' + document.getElementById('nickname').value;

    if(admin)
    {
        document.getElementById('nick').innerText += ' (admin)';
    }

    // Renderowanie efektu poświaty na pomocniczym canvas żeby przyspieszyc czas gdyż generowanie poswiaty jest bardzo kosztowne
    niebieskaPoswiata.width = grid+40;
    niebieskaPoswiata.height = grid+40;

    nP.lineWidth = 1;
    nP.strokeStyle = "white"; 
    nP.shadowColor = "cyan"; 
    nP.shadowBlur = 15;
    nP.strokeRect(20, 20, grid, grid);


    zielonaPoswiata.width = grid+40;
    zielonaPoswiata.height = grid+40;
    

    nZ.lineWidth = 1;
    nZ.strokeStyle = "green";
    nZ.shadowColor = "green"; 
    nZ.shadowBlur = 15;
    nZ.strokeRect(20, 20, grid, grid);
}

function joinToGame()
{
    // ipAddr = "ws://";
    // ipAddr += document.getElementById('ip').value
    document.getElementById('joinLobby').style.display = 'none';
    document.getElementById('game').style.display = 'initial';  


    document.getElementById("wynik").style.display = 'flex';
    document.getElementById("ppomoc").style.display = 'block';
    document.getElementById("ranking").style.display = 'block';
    document.getElementById("tranking").style.display = 'block';
    document.getElementById("wiadomosci").style.display = 'block';
    document.getElementById('restart').style.display = 'block';

    document.getElementById("dtarcze").style.display = 'block';
    document.getElementById("dprzyspieszenia").style.display = 'block';
    document.getElementById("dnaboje").style.display = 'block';

    canvas.height = size*grid;
    canvas.width = size*grid;

    canvasMapa.height = size;
    canvasMapa.width = size;

    if (socket) 
    {
        socket.close();
    }
    

    if(document.getElementById("ntryb").innerHTML == 'Battle Royal')
    {
        ipAddr = URL + '90';
    }
    else
    {
        ipAddr = URL + '80';
    }
    socket = new WebSocket(ipAddr);

    socket.addEventListener('open', () => {
        // console.log('Połączono z WebSocket');
        socket.send(
            JSON.stringify({
                nick: document.getElementById('nickname').value,
                haslo: haslo,
            }),
        );
        socket.addEventListener('message', (wia) => {
            //Obsługa danych przesyłanych przez serwer
            let wiad = JSON.parse(wia.data);
            // console.log(wiad)
            if (wiad.typ === 'plansza') {
                //Wiadomośc standardowa, czyli przesyłanie klatki gry
                if (first) {
                    init();
                    first = false;
                }


                if(wiad.jakieWyslanie == '8')
                {
                    plansza8 = wiad.plansza8;
                    plansza4 = wiad.plansza4;
                    plansza2 = wiad.plansza2;
                    minimapa = wiad.minimapa;
                    wynik = wiad.wynik;
                    napisy = wiad.napisy;
                    przesuniecie = wiad.przesuniecie;
                    let czy_lobby = wiad.czy_lobby;

                    if(wiad.size != size)
                    {
                        canvasMapa.height = wiad.size;
                        canvasMapa.width = wiad.size;
                    }
                    size = wiad.size;

                    document.getElementById('tryb').innerHTML = 'Game Mode: ' + wiad.tryb;
                    document.getElementById('tarcze').innerHTML = wiad.tarcze + ' ';
                    document.getElementById('przyspieszenia').innerHTML = wiad.przysp + ' ';
                    document.getElementById('naboje').innerHTML = wiad.naboje + ' ';
                    document.getElementById('wynik').innerHTML = wiad.tytul;

                    document.getElementById('ogracze').innerHTML = 'Online Players: ' + wiad.ogracze;
                    document.getElementById('zgracze').innerHTML = 'Players: ' + wiad.zgracze;

                    document.getElementById('tps').innerHTML = 'Tps: ' + wiad.tps;
                    document.getElementById('fps').innerHTML = 'Fps: ' + fps;

                    wiad.chat.forEach((n) => {
                        n.forEach(czesc =>{

                            document.getElementById('chat').innerHTML += `<span style="color:${czesc.kolor};" id="n${id_napisow}"></span>`;
                            document.getElementById(`n${id_napisow}`).innerText = czesc.tekst;
                            id_napisow++;
                        })
                        document.getElementById('chat').innerHTML +=  '<br>';

                        chat.scrollTop = chat.scrollHeight;
                    });

                    if(wiad.admin && admin == false)
                    {
                        admin = true;
                        document.getElementById('nick').innerHTML += ' (admin)';
                    }

                    if(wiad.host && host == false)
                    {
                        host = true;
                    }

                    if((admin || host) && czy_lobby && czy_start == false)
                    {
                        czy_start = true;
                        document.getElementById('start').style.display = 'block';
                    }

                    else if((admin || host) && czy_lobby == false && czy_start)
                    {
                        czy_start = false;
                        document.getElementById('start').style.display = 'none';
                    }
                }
                else if(wiad.jakieWyslanie == '4')
                {
                    plansza4 = wiad.plansza4;
                    plansza2 = wiad.plansza2;
                    napisy = wiad.napisy;
                }
                else if(wiad.jakieWyslanie == '2')
                {
                    plansza2 = wiad.plansza2;
                }


                plansza.clear();
                
                plansza8.forEach( el =>{
                    if(wiad.jakieWyslanie == '8')
                    {
                        el.x += przesuniecie;
                        el.y += przesuniecie;
                    }
                    plansza.set(el,el);
                });
                plansza4.forEach( el =>{
                    if(wiad.jakieWyslanie == '8' || wiad.jakieWyslanie == '4')
                    {
                        el.x += przesuniecie;
                        el.y += przesuniecie;
                    }
                    plansza.set(el,el);
                });
                plansza2.forEach( el =>{
                    el.x += przesuniecie;
                    el.y += przesuniecie;
                    plansza.set(el,el);
                });
                
                snakeX = wiad.snakeX+(przesuniecie/16) - screen.width/34
                snakeY = wiad.snakeY+(przesuniecie/16) - screen.height/34


                if(wiad.odswiez) //żądanie zrestartowania połączenia
                {
                    joinToGame();
                }

            } 
            else if (wiad.typ === 'gameover') {
                //Wiadomośc specjalna, informacja o przegranej
                gameover = true;
                wynik = wiad.wynik;
            }
        });
    });
}

function wyslijWiadomosc()
{
    let t = document.getElementById('msg').value;
    if(t == '') 
    {
        return;
    }

    wiadomosc = t;
    socket.send(
        JSON.stringify({
            wiadomosc: wiadomosc,
        }),
    );
    if(!admin && wpisywanieHasla)
    {
        haslo = t;
    }

    
    if(wpisywanieHasla)
    {
        wpisywanieHasla = false;
        document.getElementById('msg').type = 'text';
    }

    if(t.split(" ")[0] == '/adm')
    {
        document.getElementById('msg').type = 'password';
        wpisywanieHasla = true;
    }
    document.getElementById('msg').value = "";
    //sendMsg.blur();
}

document.getElementById('connect').addEventListener('click', () => {
    joinToGame();
});

document.getElementById('restart').addEventListener('click', () => {
    joinToGame();
    document.getElementById('restart').blur();
    first = true;
});


document.getElementById('zmienTryb').addEventListener('click', () => {
    let tryb = document.getElementById('ntryb').innerHTML;
    if(tryb == 'Battle Royal')
    {
        document.getElementById('ntryb').innerHTML = "Sandbox";
    }
    else
    {
        document.getElementById('ntryb').innerHTML =  'Battle Royal';
    }
});


document.getElementById('start').addEventListener('click', () => {
    if(admin || host)
    {
        socket.send(
            JSON.stringify({
                ruch: undefined,
                wymus_start: true,
            }),
        );
    }
});

let twyn = false;
let tpom = false;

document.getElementById('ptrwaleWyniki').addEventListener('click', (event) => {
    event.stopPropagation();
    if(!twyn)
    {
        twyn = true;
        document.getElementById('trwaleWyniki').style.display = 'block';
        if(tpom)
        {
            tpom = false;
            document.getElementById('pomoc').style.display = 'none';
        }
    }
    else
    {
        twyn = false;
        document.getElementById('trwaleWyniki').style.display = 'none';
    }
});

document.getElementById('ppomoc').addEventListener('click', (event) => {
    event.stopPropagation();
    if(!tpom)
    {
        tpom = true;
        document.getElementById('pomoc').style.display = 'block';
        if(twyn)
        {
            twyn = false;
            document.getElementById('trwaleWyniki').style.display = 'none';
        }
    }
    else
    {
        tpom = false;
        document.getElementById('pomoc').style.display = 'none';
    }
});


document.addEventListener('click', () => {
    document.getElementById('trwaleWyniki').style.display = 'none';
    document.getElementById('pomoc').style.display = 'none';
    tpom = false;
    twyn = false;
});







/*sendMsg.addEventListener('click', () => {
    wyslijWiadomosc();
});*/

let dfps =  document.getElementById("fps");
let dtps = document.getElementById("tps");
let dogracze = document.getElementById("ogracze");
let drestart = document.getElementById("restart");
let dtryb = document.getElementById("tryb");

let lastX
let lastY
let firstLoop = true
let dodatkoweInfo = false;
let lastTransition = '';
let animationFrame;
let isAnimating = false;
function loop() {
    const targetX = -snakeX * grid;
    const targetY = -snakeY * grid;
    
    // Ustal czas trwania animacji
    let newTransition = '1s';
    if (firstLoop || Math.abs(snakeX - lastX) > 1) {
        newTransition = '220ms';
    }
    
    // Aktualizuj transitionDuration TYLKO gdy się zmienia
    if (newTransition !== lastTransition) {
        canvas.style.transitionDuration = newTransition;
        lastTransition = newTransition;
    }
    
    // Zastosuj transformację (użyj translate3d)
    canvas.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
    
    // Zapisz poprzednie pozycje
    lastY = snakeY;
    lastX = snakeX;
    firstLoop = false;

    let czasTeraz = new Date();
    fpsSuma += Math.floor(1000 / (czasTeraz.getTime() - czas.getTime()), 1);
    fpsIle++;

    if(fpsIle > 60)
    {
        fps = Math.floor(fpsSuma/fpsIle,1);
        fpsIle=0;
        fpsSuma=0;
    }
    czas = new Date();


    //Czyścimy płótno
    context.clearRect(0, 0, canvas.width, canvas.height);

    contextMapa.clearRect(0, 0, canvasMapa.width, canvasMapa.height);

    //Rysujemy kratkę
    siatka();

    //console.log('Wiadomość od serwera:', plansza[1]);



    if(cooldown > 0)
    {
        cooldown--;
    }
    if(cooldown2 > 0)
    {
        cooldown2--;
    }

    window.addEventListener('keydown', (e) => {
        //Obłsuga klawiszy

        let klawisz = e.code;
        let nruch;
        let akcja = false;

        if(document.activeElement != msg)
        {
            if (klawisz == 'KeyD' || klawisz == "ArrowRight")
            {
                nruch = "p";
            } 
            else if (klawisz == 'KeyA' || klawisz == "ArrowLeft")
            {
                nruch = "l";
            } 
            else if (klawisz == 'KeyW' || klawisz == "ArrowUp") 
            {
                nruch = "g";
            }
            else if (klawisz == 'KeyS' || klawisz == "ArrowDown") 
            {
                nruch = "d";
            }
    
            else if (klawisz == 'ShiftLeft' || klawisz == 'ShiftRight')
            {
                nruch = 'tarcza';
                akcja = true;
            }
    
            else if (klawisz == 'KeyQ')
            {
                nruch = 'przysp';
                akcja = true;
            }
            else if (klawisz == 'Space')
            {
                nruch = 'strzal';
                akcja = true;
            }
            
        } 
        
        else if (klawisz == 'Enter' && cooldown2 == 0)
        {
            wyslijWiadomosc();
            cooldown2 = 1;
        }    


        if(klawisz == 'KeyE' && cooldown2 == 0 && document.activeElement != msg)
        {
            if(dodatkoweInfo == false)
            {
                dodatkoweInfo = true;
                dfps.style.display = 'block';
                dtps.style.display = 'block';
                dogracze.style.display = 'block';
                dtryb.style.display = 'block';
                drestart.style.top = "18%";
            }
            else
            {
                dodatkoweInfo = false;
                dfps.style.display = 'none';
                dtps.style.display = 'none';
                dogracze.style.display = 'none';
                dtryb.style.display = 'none';
                drestart.style.top = "7%";
            }
            cooldown2 = 1;
        }           

        /*else if (klawisz == 'KeyO')
        {
            document.getElementById("wynik").style.display = 'none';
            document.getElementById("ranking").style.display = 'none';
            document.getElementById("tranking").style.display = 'none';
            document.getElementById("wiadomosci").style.display = 'none';
            document.getElementById('restart').style.display = 'none';

            document.getElementById("dtarcze").style.display = 'none';
            document.getElementById("dprzyspieszenia").style.display = 'none';
            document.getElementById("dnaboje").style.display = 'none';

            document.getElementById("nick").style.display = 'none';
            document.getElementById("fps").style.display = 'none';
            document.getElementById("tps").style.display = 'none';
            document.getElementById('ogracze').style.display = 'none';

            document.getElementById("zgracze").style.display = 'none';
            document.getElementById("minimapa").style.display = 'none';
            document.getElementById("tryb").style.display = 'none';
        }*/
    

        //console.log(klawisz); //uwaga na to - laguje gre

        if(nruch != ruch || (akcja == true && cooldown == 0))
        {   
            cooldown = 25;
            socket.send(
                JSON.stringify({
                    ruch: nruch,
                }),
            );
        }

        ruch = nruch;

        if (wiadomosc)
        {
            wiadomosc = undefined;
        }
    });
    ranking.innerHTML = '';
    napisy.sort((a, b) => b.wynik - a.wynik);

    let ind = 1;
    napisy.forEach((element) => {
        ranking.innerHTML += `<span style="font-size: 20px;">${ind}</span>` + `. <span id=n${id_napisow}></span>: ` + element.wynik + '<br>';
        document.getElementById(`n${id_napisow}`).textContent = element.n;
        id_napisow++;
        ind++;
    });

        

    plansza.forEach(function (kwadrat) {
        //Rysowanie całej gry: wszystko składa sie z róznokolorowych kszałtów
        if(kwadrat.rodzaj == undefined || kwadrat.rodzaj == "fillRect") //Rysujemy kwadrat
        {
            context.fillStyle = kwadrat.kolor;
            context.fillRect(kwadrat.x, kwadrat.y, grid - 1, grid - 1);
        }
        else if(kwadrat.rodzaj == "strokeRect") //Rysujemy kwadrat pusty w środku
        {
            if(kwadrat.kolor2 == "cyan")
            {
                context.drawImage(niebieskaPoswiata, kwadrat.x-20, kwadrat.y-20);
            }
            else if(kwadrat.kolor2 == "green")
            {
                context.drawImage(zielonaPoswiata, kwadrat.x-20, kwadrat.y-20);
            }
            else
            {
                if(kwadrat.grubosc != undefined) context.lineWidth = kwadrat.grubosc;

                else
                context.lineWidth =  1;

                context.strokeStyle = kwadrat.kolor;
            
                context.strokeRect(kwadrat.x, kwadrat.y, kwadrat.roz, kwadrat.roz);
             //context.shadowColor = kwadrat.kolor2;
            //context.shadowBlur = 5;
            //context.shadowBlur = 0;
            }
        } 
        else if(kwadrat.rodzaj == "arc") //Rysujemy koło
        {
            context.beginPath();
            context.arc(kwadrat.x+grid/2, kwadrat.y+grid/2, grid/3, 0, 2 * Math.PI);
            context.fillStyle = kwadrat.kolor;
            context.fill();
           // context.stroke()
        }
        else if(kwadrat.rodzaj == "oczy")
        {
            switch (kwadrat.obrot) {
                case "prawo":
                     context.drawImage(oczyP, kwadrat.x, kwadrat.y);
                    break;
               case "lewo":
                     context.drawImage(oczyL, kwadrat.x, kwadrat.y);
                    break;
                case "gora":
                     context.drawImage(oczyG, kwadrat.x, kwadrat.y);
                    break;
                case "dol":
                     context.drawImage(oczyD, kwadrat.x, kwadrat.y);
                    break;
            }
            
            
            /*context2.drawImage(oczy, 0, 0);
            context2.rotate((45 * Math.PI) / 180);
            context.drawImage(rysunek, kwadrat.x, kwadrat.y);*/
        }
    });

    minimapa.forEach(function (kwadrat) {
        //Rysowanie minimapy
        if(kwadrat.rodzaj == undefined || kwadrat.rodzaj == "fillRect")
        {
            contextMapa.fillStyle = kwadrat.kolor;
        
            if(kwadrat.czyJa == true)
            {
                contextMapa.fillRect(kwadrat.x/16, kwadrat.y/16, 7, 7);
            }
            else
            {
                contextMapa.fillRect(kwadrat.x/16, kwadrat.y/16, 5, 5);
            }
        }

        else if(kwadrat.rodzaj == "strokeRect") //Rysujemy ostrzezenie przed zmniejszającą się planszą
        {
            contextMapa.lineWidth = 1;
            contextMapa.strokeStyle = kwadrat.kolor;
            
            contextMapa.strokeRect(kwadrat.x, kwadrat.y, size/2, size/2);
        } 
    });

    //wyświetlanie nicków
    context.fillStyle = 'white';
    context.font = '12px serif';

    napisy.forEach((nap) => {
        context.fillText(nap.n, nap.x+przesuniecie, nap.y+przesuniecie);
    });
}

