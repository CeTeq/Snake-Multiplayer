const canvas = document.getElementById('plansza');
const context = canvas.getContext('2d');
let klatka; //ID funkcji do setInterval
const grid = 16; //rozmiar siatki
let size = 40;
let snake;
let jablko;
let wynik = 0;
let gameover = false; //gdy jest rowny true - koniec gry
let socket;
let ruch;
let i = 0;
let napisy = [];
let ipAddr;
let first = true;
let wiadomosc;
let sendMsg = document.getElementById('sendMsg');
const URL = 'ws://' + document.URL.slice(7, -3) + '80';
const ranking = document.getElementById('ranking');
console.log(URL);
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

function init() {
    //inicjalizacja gry
    gameover = false;
    document.getElementById('wynik').innerHTML = 'Wynik: 0';

    console.log('Uruchomiono gre');
}

var plansza = new Map();

document.getElementById('connect').addEventListener('click', () => {
    // ipAddr = "ws://";
    // ipAddr += document.getElementById('ip').value
    document.getElementById('joinLobby').style.display = 'none';
    document.getElementById('game').style.display = 'initial';
    canvas.height = grid * size;
    canvas.width = grid * size;
    if (!socket) socket = new WebSocket(ipAddr);
    socket.addEventListener('open', () => {
        console.log('Połączono z WebSocket');
        socket.send(
            JSON.stringify({
                nick: document.getElementById('nickname').value,
            }),
        );
        socket.addEventListener('message', (wia) => {
            //Obsługa danych przesyłanych przez serwer
            let wiad = JSON.parse(wia.data);
            if (wiad.typ === 'plansza') {
                //Wiadomośc standardowa, czyli przesyłanie klatki gry
                if (first) {
                    restart_game();
                    first = false;
                }
                plansza = wiad.plansza;
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
});

function loop() {
    //Czyścimy płótno
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Rysujemy kratkę
    siatka();

    //console.log('Wiadomość od serwera:', plansza[1]);

    if (plansza == undefined) {
        console.log('brak planszy');
        return;
    }

    window.addEventListener('keydown', (e) => {
        //Obłsuga klawiszy

        let klawisz = e.code;
        let nruch;

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
        }

        else if (klawisz == 'ControlLeft' || klawisz == 'ControlRight')
        {
            nruch = 'przysp';
        }
        else if (klawisz == 'Space')
        {
            nruch = 'strzal';
        }

        //console.log(klawisz); uwaga na to - laguje gre

        if(nruch != ruch)
        {
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
        //Rysowanie całej gry: wszystko składa sie z róznokolorowych kwadratów
        if(kwadrat.rodzaj == undefined || kwadrat.rodzaj == "fillRect")
        {
            context.fillStyle = kwadrat.kolor;
            context.fillRect(kwadrat.x, kwadrat.y, grid - 1, grid - 1);
        }
        else if(kwadrat.rodzaj == "strokeRect")
        {
            context.lineWidth = 1;
            context.strokeStyle = kwadrat.kolor;
            context.shadowColor = kwadrat.kolor2;
            context.shadowBlur = 15;
            context.strokeRect(kwadrat.x, kwadrat.y, grid, grid);
            context.shadowBlur = 0;
        }
        else if(kwadrat.rodzaj == "arc")
        {
            context.beginPath();
            context.arc(kwadrat.x+grid/2, kwadrat.y+grid/2, grid/2, 0, 2 * Math.PI);
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

function restart_game() {
    init();
    clearInterval(klatka);
    klatka = setInterval(loop, 10); //10fps
}

