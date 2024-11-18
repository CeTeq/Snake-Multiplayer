import { grid, kolizje, getRandomInt, gracze, plan} from '../serwer-snake.js';
import { goldenApple } from '../items/goldenApple.js';
import { ateApple } from '../items/apples.js';

export function colisions(obiekt, klient) {
    let snake = gracze.get(klient);
    if (
        snake.cells[0].x === obiekt.x &&
        snake.cells[0].y === obiekt.y &&
        snake.cells[0] !== obiekt
    ) {
        //Zderzyliśmy sie z jakimś obiektem

        if (obiekt.typ == 'elsnake') {

            if(obiekt.snake == snake)
            {
                kolizje.push('<span style="color: yellow;">Gracz ' + snake.nick + ' uderzył w swój ogon</span>');
                //kolizje.push('<span style="color: yellow;">Gracz</span> <span style="color: aqua;">' + snake.nick + '</span><span style="color: yellow;"> uderzył w swój ogon</span>');
            }
            else if(obiekt == obiekt.snake.cells[0]) //Czołowe zdarzenie - obaj gracze giną
            {
                kolizje.push('<span style="color: yellow;">Gracze ' + snake.nick + ' i ' + obiekt.snake.nick + ' zderzyli się</span>');
                obiekt.snake.gameover = true;
            }
            else
            {
                kolizje.push('<span style="color: yellow;">Gracz ' + snake.nick + ' uderzył w gracza: ' + obiekt.snake.nick + '</span>');
                obiekt.snake.wynik += snake.wynik+2;
                obiekt.snake.maxCells += snake.wynik+2;
            }

            console.log('Gracz ' + snake.nick + ' uderzył w: ', obiekt.snake.nick);

            snake.gameover = true;
        } else if (obiekt.typ === 'jablko') {
            ateApple(klient, obiekt, false)
        } else if (obiekt.typ === 'zloteJablko') {
            ateApple(klient, obiekt, true)
        }
    }
}
