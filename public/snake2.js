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
let cooldown = 0;
let sendMsg = document.getElementById('sendMsg');
const URL = 'ws://' + document.URL.slice(7, -3) + '80';
const ranking = document.getElementById('ranking');
let host = false;
let wystartuj = false;
let wysokosc_planszy = 40;
let szerokosc_planszy = 40;

let uwysokosc_planszy = 40;
let uszerokosc_planszy = 40;

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

var plansza = new Map();
let wjablka = true;
let wszer = true;
let wwys = true;

function joinToGame()
{
    document.getElementById('joinLobby').style.display = 'none';
    document.getElementById('game').style.display = 'initial';



    document.getElementById("ranking").style.display = 'block';
    document.getElementById("wiadomosci").style.display = 'block';
    document.getElementById('restart').style.display = 'block';

    document.getElementById("tarcze").style.display = 'block';
    document.getElementById("przyspieszenia").style.display = 'block';
    document.getElementById("naboje").style.display = 'block';

    canvas.height = grid * size;
    canvas.width = grid * size;
    
    if (socket) 
    {
        socket.close();
    }
    socket = new WebSocket(ipAddr);

    
    socket.addEventListener('open', () => {
        console.log('Połączono z WebSocket');
        socket.send(
            JSON.stringify({
                nick: document.getElementById('nickname').value,
                haslo: document.getElementById("haslo").value,
            }),
            
        );
        

        socket.addEventListener('message', (wia) => {
            //Obsługa danych przesyłanych przez serwer
            let wiad = JSON.parse(wia.data);
            if (wiad.typ === 'plansza') {
                //Wiadomośc standardowa, czyli przesyłanie klatki gry
                host = wiad.host;
                if (first) {
                    
                    init();
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
                document.getElementById('wynik').innerHTML = wiad.tytul;
                document.getElementById('tryb').innerHTML = 'Tryb gry: ' + wiad.tryb;
                document.getElementById('nick').innerHTML = 'Nick: ' + document.getElementById('nickname').value;

                if(host)
                {
                    if(wiad.jablka != document.getElementById("zmienJablka").value && wjablka == false)
                        {
                            wjablka = true;
                        }
                        else if(wiad.jablka != document.getElementById("zmienJablka").value)
                        {
                            document.getElementById("zmienJablka").value = wiad.jablka;
                            wjablka = false;
                        }
                        else
                        {
                            wjablka = false;
                        }
    
    
                        if(wiad.szerokosc_planszy != document.getElementById("zmienX").value && wszer == false)
                        {
                            wszer = true;
                        }
                        else if(wiad.szerokosc_planszy != document.getElementById("zmienX").value)
                        {
                            document.getElementById("zmienX").value = wiad.szerokosc_planszy;
                            wszer = false;
                        }
                        else
                        {
                            wszer = false;
                        }
    
                        if(wiad.wysokosc_planszy != document.getElementById("zmienY").value && wwys == false)
                        {
                            wwys = true;
                        }
                        else if(wiad.wysokosc_planszy != document.getElementById("zmienY").value)
                        {
                            document.getElementById("zmienY").value = wiad.wysokosc_planszy;
                            wwys = false;
                        }
                        else
                        {
                            wwys = false;
                        }

                    //console.log("jesteś hostem");
                    document.getElementById("start").style.display = 'block';
                    document.getElementById("zmienTryb").style.display = 'block';
                    document.getElementById('nick').innerHTML += ' (host)';

                    document.getElementById("rozmiarX").style.display = 'block';
                    document.getElementById("zmienX").style.display = 'block';
                    document.getElementById("rozmiarY").style.display = 'block';
                    document.getElementById("zmienY").style.display = 'block';

                    document.getElementById("jablka").style.display = 'block';
                    document.getElementById("zmienJablka").style.display = 'block';

                    uwysokosc_planszy = document.getElementById("zmienY").value;
                    uszerokosc_planszy = document.getElementById("zmienX").value;

                    document.getElementById("ranking").style.left = '70%';
                    document.getElementById("ranking").style.top = '10%';
                    document.getElementById("restart").style.top = '88%';
                    document.getElementById("wiadomosci").style.top = '45%';
                    
                    socket.send(
                        JSON.stringify({
                            ruch: undefined,
                            akcjaHosta: "zmien",
                            wysokosc_planszy: uwysokosc_planszy,
                            szerokosc_planszy: uszerokosc_planszy,
                            jablka: document.getElementById("zmienJablka").value,
                        }),
                    );

                }

                if(canvas.height != wiad.wysokosc_planszy*grid || canvas.width != wiad.szerokosc_planszy*grid)
                {
                    console.log("s");
                    canvas.height = grid * wiad.wysokosc_planszy;
                    canvas.width = grid * wiad.szerokosc_planszy;
                }

                if(wiad.odswiez) //żądanie zrestartowania połączenia
                {
                    joinToGame();
                }
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

document.getElementById('start').addEventListener('click', () => {
    if(host)
    {
        document.getElementById('start').style.display = 'none';
        socket.send(
            JSON.stringify({
                ruch: undefined,
                akcjaHosta: "wystartuj",
            }),
        );
    }
});

document.getElementById('zmienTryb').addEventListener('click', () => {
    if(host)
    {
        // /document.getElementById('zmienTryb').style.display = 'none';
        socket.send(
            JSON.stringify({
                ruch: undefined,
                akcjaHosta: "zmienTryb",
            }),
        );
    }
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
    document.getElementById('msg').value = "";
    sendMsg.blur();
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

    //wyświetlanie nicków
    context.fillStyle = 'white';
    context.font = '12px serif';

    napisy.forEach((nap) => {
        context.fillText(nap.n, nap.x, nap.y);
    });
}

