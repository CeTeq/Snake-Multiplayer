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
let czas = new Date();
//let sendMsg = document.getElementById('sendMsg');
const msg  = document.getElementById('msg');
const URL = 'ws://' + document.URL.slice(7, -3);
const ranking = document.getElementById('ranking');
// console.log(URL);

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

function init() {
    //inicjalizacja gry
    ruch =  undefined;
    gameover = false;
    document.getElementById('wynik').innerHTML = 'Wynik: 0';

    clearInterval(klatka);
    klatka = setInterval(loop, 10); //10fps
    //console.log('Uruchomiono gre');

    document.getElementById('nick').innerHTML = 'Nick: ' + document.getElementById('nickname').value;

    if(admin)
    {
        document.getElementById('nick').innerHTML += ' (admin)';
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

                    document.getElementById('tryb').innerHTML = 'Tryb gry: ' + wiad.tryb;
                    document.getElementById('tarcze').innerHTML = wiad.tarcze + ' ';
                    document.getElementById('przyspieszenia').innerHTML = wiad.przysp + ' ';
                    document.getElementById('naboje').innerHTML = wiad.naboje + ' ';
                    document.getElementById('wynik').innerHTML = wiad.tytul;

                    document.getElementById('ogracze').innerHTML = 'Gracze online: ' + wiad.ogracze;
                    document.getElementById('zgracze').innerHTML = 'Żywi gracze: ' + wiad.zgracze;

                    document.getElementById('tps').innerHTML = 'Tps: ' + wiad.tps;
                    document.getElementById('fps').innerHTML = 'Fps: ' + fps;

                    wiad.chat.forEach((n) => {

                        
                        n.forEach(czesc =>{

                            document.getElementById('chat').innerHTML += `<span style="color:${czesc.kolor};">${czesc.tekst}</span>`;
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
    if(!admin && t.split(" ")[0] == '/adm')
    {
        haslo = t.split(" ")[1];
    }

    if(t.split(" ")[0] == '/adm')
    {
        document.getElementById('msg').type = 'password';
    }
    else
    {
        document.getElementById('msg').type = 'text';
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

/*sendMsg.addEventListener('click', () => {
    wyslijWiadomosc();
});*/
let lastX
let lastY
let firstLoop = true
function loop() {
    if(firstLoop){
        canvas.style.transitionDuration = '220ms'
        firstLoop = false
    }
    else if(Math.abs(snakeX - lastX) > 1) canvas.style.transitionDuration = '220ms'
    else canvas.style.transitionDuration = '1s'

    if(snakeX !== lastX) 
    canvas.style.transform = 'translateX(' + (-1) * snakeX*grid + 'px)'

    if(snakeY !== lastY)
    canvas.style.transform += 'translateY(' + (-1) * snakeY*grid + 'px)'

    lastY = snakeY
    lastX = snakeX

    let czasTeraz = new Date();
    fps = Math.floor(1000 / (czasTeraz.getTime() - czas.getTime()), 1);
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
    napisy.forEach((element) => {
        ranking.innerHTML += element.n + ': ' + element.wynik + '<br>';
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

    if (!gameover && czyWynik) {
        document.getElementById('wynik').innerHTML = 'Wynik: ' + wynik;
    } //Koniec gry
    else if(czyWynik) {
        document.getElementById('wynik').innerHTML =
            'Koniec gry Wynik: ' + wynik;
        //clearInterval(klatka);
    }

    //wyświetlanie nicków
    context.fillStyle = 'white';
    context.font = '12px serif';

    napisy.forEach((nap) => {
        context.fillText(nap.n, nap.x+przesuniecie, nap.y+przesuniecie);
    });
}

