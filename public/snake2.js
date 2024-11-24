const canvas = document.getElementById('plansza');
const context = canvas.getContext('2d');
let klatka; //ID funkcji do setInterval
const grid = 16; //rozmiar siatki
let size = 200; //640x640px 40x40 pól
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
let ipAddr;
let first = true;
let wiadomosc;
let snakeX
let snakeY
let cooldown = 0;
let sendMsg = document.getElementById('sendMsg');
const URL = 'ws://' + document.URL.slice(7, -3) + '80';
const ranking = document.getElementById('ranking');
// console.log(URL);
ipAddr = URL;
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
    klatka = setInterval(loop, 20); //10fps
    //console.log('Uruchomiono gre');

    

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
    canvas.height = 200*grid;
    canvas.width = 200*grid;
    if (socket) 
    {
        socket.close();
    }
    socket = new WebSocket(ipAddr);
    
    socket.addEventListener('open', () => {
        // console.log('Połączono z WebSocket');
        socket.send(
            JSON.stringify({
                nick: document.getElementById('nickname').value,
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
                }
                else if(wiad.jakieWyslanie == '4')
                {
                    plansza4 = wiad.plansza4;
                    plansza2 = wiad.plansza2;
                }
                else if(wiad.jakieWyslanie == '2')
                {
                    plansza2 = wiad.plansza2;
                }



                plansza.clear();
                
                plansza8.forEach( el =>{
                    plansza.set(el,el);
                });
                plansza4.forEach( el =>{
                    plansza.set(el,el);
                });
                plansza2.forEach( el =>{
                    plansza.set(el,el);
                });
   
          
                snakeX = wiad.snakeX - screen.width/34
                snakeY = wiad.snakeY - screen.height/34

                wiad.chat.forEach((n) => {
                    document.getElementById('chat').innerHTML += n + '<br>';
                    chat.scrollTop = chat.scrollHeight;
                });
                wynik = wiad.wynik;
                napisy = wiad.napisy;
                document.getElementById('tarcze').innerHTML = 'Tarcze: ' + wiad.tarcze;
                document.getElementById('przyspieszenia').innerHTML = 'Przyśpieszenia: ' + wiad.przysp;
                document.getElementById('naboje').innerHTML = 'Naboje: ' + wiad.naboje;

            } else if (wiad.typ === 'gameover') {
                //Wiadomośc specjalna, informacja o przegranej
                gameover = true;
                wynik = wiad.wynik;
            }
        });
    });
}

document.getElementById('connect').addEventListener('click', () => {
    joinToGame();
});

document.getElementById('restart').addEventListener('click', () => {
    joinToGame();
    document.getElementById('restart').blur();
    first = true;
});

sendMsg.addEventListener('click', () => {
    wiadomosc =
        document.getElementById('nickname').value +
        ': ' +
        document.getElementById('msg').value;
    socket.send(
        JSON.stringify({
            wiadomosc: wiadomosc,
        }),
    );
    sendMsg.blur();
});
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

    canvas.style.transform = 'translateX(' + (-1) * snakeX*grid + 'px)'
    canvas.style.transform += 'translateY(' + (-1) * snakeY*grid + 'px)'
    lastY = snakeY
    lastX = snakeX
    //Czyścimy płótno
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Rysujemy kratkę
    siatka();

    //console.log('Wiadomość od serwera:', plansza[1]);






    if(cooldown > 0)
    {
        cooldown--;
    }

    window.addEventListener('keydown', (e) => {
        //Obłsuga klawiszy

        let klawisz = e.code;
        let nruch;
        let akcja = false;

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

        else if (klawisz == 'ControlLeft' || klawisz == 'ControlRight')
        {
            nruch = 'przysp';
            akcja = true;
        }
        else if (klawisz == 'Space')
        {
            nruch = 'strzal';
            akcja = true;
        }

        //console.log(klawisz); uwaga na to - laguje gre

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

    let planszaDoNarysowania;
        

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
            //context.lineWidth = 1;
            //context.strokeStyle = kwadrat.kolor;
            
            //context.shadowColor = kwadrat.kolor2;
            //context.shadowBlur = 5;
            //context.strokeRect(kwadrat.x, kwadrat.y, grid, grid);
            //context.shadowBlur = 0;
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

    if (!gameover) {
        document.getElementById('wynik').innerHTML = 'Wynik: ' + wynik;
    } //Koniec gry
    else {
        document.getElementById('wynik').innerHTML =
            'Koniec gry Wynik: ' + wynik;
        //clearInterval(klatka);
    }

    //wyświetlanie nicków
    context.fillStyle = 'white';
    context.font = '12px serif';

    napisy.forEach((nap) => {
        context.fillText(nap.n, nap.x, nap.y);
    });
}

