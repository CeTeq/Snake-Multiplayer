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
let klawisz;
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
				if (wiad.wynik) wynik = wiad.wynik;
				napisy = wiad.napisy;
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

		if (e.code != klawisz) {
			socket.send(
				JSON.stringify({
					klawisz: e.code,
				}),
			);
			if (wiadomosc) wiadomosc = undefined;
		}
		klawisz = e.code;
	});
	ranking.innerHTML = '';
	napisy.sort((a, b) => b.wynik - a.wynik);
	napisy.forEach((element) => {
		ranking.innerHTML += element.n + ': ' + element.wynik + '<br>';
	});

	plansza.forEach(function (kwadrat) {
		//Rysowanie całej gry: wszystko składa sie z róznokolorowych kwadratów
		context.fillStyle = kwadrat.kolor;
		context.fillRect(kwadrat.x, kwadrat.y, grid - 1, grid - 1);
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
	context.font = '10px serif';

	napisy.forEach((nap) => {
		context.fillText(nap.n, nap.x, nap.y);
		console.log(nap.n);
	});
}

function restart_game() {
	init();
	clearInterval(klatka);
	klatka = setInterval(loop, 10); //10fps
}

function restart_game() {
	init();
	clearInterval(klatka);
	klatka = setInterval(loop, 10); //10fps
}
