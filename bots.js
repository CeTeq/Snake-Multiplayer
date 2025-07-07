import { dodajWeza } from "./addSnakes.js";
import { getRandomInt, gracze, klienci, grid, chat, plan} from "./serwer-snake.js";

export let liczba_botow = 0;
let botId = 0; 
const nicki = [
  'de zzz', 'XxSlitherxX', 'Player', 'VIXENP', 'NomNom9000',
  'bertus', 'TailWhip42', '123456', 'Ourobot', '8888',
  'SnekDaddy', 'MRB!Gnutus', 'Moi', 'Worminator', 'Player',
  ':d', 'FeederX', 'Longboi69', 'zxcvb', 'Symblize',
  'ZapTail', 'HyperWorm', 'Playerr', 'SerpentX', 'Snakey420',
  'exist', 'Player', 'Alex', 'noob', 'im innocent',
  'eris', 'Onkel', 'bigtoe', 'lpoak', 'LePookie',
  'Player', 'SlowAndDeadly', 'rebml', 'Fast & Furious', 'asdfg',
  'twoja stara', 'Gdraco', ':)', 'VenomaX', 'wwas',
  'qwerty', 'Chompster', 'Bush', 'li', 'Playersss',
  'Skibidi', 'GHOST', 'Player', 'szeptunka', 'Volans',
  'otti', 'Wiggler99', 'Wombel', 'Megg', 'g',
  'Bubu', 'ZoomNom', 'mosssy', 'blubber', 'ghut',
  'SlitherMe', 'hu', 'Bomber', 'legend56', '1003',
  'Blue', 'gogo', 'CruncherX', 'Luzik', 'Player',
  'taklaci', 'Crocodilo Bombardilo', 'das', 'glazik', 'sdsdxs',
  'aniridia', '123', 'twuj Stary', 'Calz', 'SnekRush',
  'vvv', 'Player', 'Player', 'Turboss', 'kep4uk',
  'sododo', 'eva', 'NomStorm', 'Player', 'madara',
  '[...]', 'zzzz', 'conor', 'ionide', 'shrey',
  'Barney', 'Player', 'Mistake', 'SnakeFX', 'KRONER'
];

export function zmiejszLiczbeBotow()
{
    liczba_botow--;
}

export function dodajBota()
{
    //console.log('Nowy bot');
    let snake = dodajWeza(botId);
    botId++;
    liczba_botow++;

    let ktoryNick = getRandomInt(0,100);
    snake.nick = nicki[ktoryNick];
    snake.bot = true;

    let t = [];
    t.push({tekst:snake.nick, kolor:snake.kolor});
    t.push({tekst:' joined to the game', kolor:"green"});

    chat.push(t);
}

export function aktualizujBoty()
{
     klienci.forEach((kl) => {
        if(Number.isInteger(kl)) //sprawdzanie czy to jest bot
        {
            let snake = gracze.get(kl);

            let czyRuch = getRandomInt(1,20);
            if(czyRuch == 1)
            {
                let ruch = getRandomInt(1,4);

                 if (ruch == '1' && snake.dirX >= 0)
                {
                    snake.dx = grid;
                    snake.dy = 0;
                } 
                else if (ruch == '2' && snake.dirX <= 0)
                {
                    snake.dx = -grid;
                    snake.dy = 0;
                } 
                else if (ruch == '3' && snake.dirY <= 0 )
                {
                    snake.dy = -grid;
                    snake.dx = 0;
                } 
                else if (ruch == '4' && snake.dirY >= 0)
                {
                    snake.dy = grid;
                    snake.dx = 0;
                }
            }


            let czyAkcja = getRandomInt(1,20);
            if(czyAkcja == 1)
            {
                let akcja = getRandomInt(1,3);

                if(akcja == '1' && snake.tarcze > 0)
                {
                    snake.tarcze--;
                    snake.ochrona = 250;
                }
                else if(akcja == '2' && snake.przysp > 0)
                {
                    snake.przysp--;
                    snake.tprzysp = 250;
                }
                else if(akcja == '3' && snake.naboje > 0)
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
               // console.log(akcja);
            }
        }
        });
}