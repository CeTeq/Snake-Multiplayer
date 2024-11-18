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
        if (obiekt.typ === 'snake') {
            kolizje.push('Gracz ' + snake.nick + ' uderzył w: ' + obiekt.nick);
            console.log('Gracz ' + snake.nick + ' uderzył w: ', obiekt.nick);
            snake.gameover = true;
        } else if (obiekt.typ === 'jablko') {
            ateApple(klient, obiekt, false)
        } else if (obiekt.typ === 'zloteJablko') {
            ateApple(klient, obiekt, true)
        }
    }
}
