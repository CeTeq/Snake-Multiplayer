import { grid, kolizje, plan, getRandomInt, gracze } from '../serwer-snake.js';

export function colisions(obiekt, klient) {
    let snake = gracze.get(klient);
    if (
        snake.cells[0].x === obiekt.x &&
        snake.cells[0].y === obiekt.y &&
        snake.cells[0] != obiekt
    ) {
        //Zderzyliśmy sie z jakimś obiektem
        if (obiekt.typ == 'snake') {
            kolizje.push('Gracz ' + snake.nick + ' uderzył w: ' + obiekt.nick);
            console.log('Gracz ' + snake.nick + ' uderzył w: ', obiekt.nick);
            snake.gameover = true;
        } else if (obiekt.typ == 'jablko') {
            //Wąż zjadł jabłko
            snake.maxCells++;
            snake.wynik++;

            //Losujemy nowe jabłko
            obiekt.x = getRandomInt(0, 40) * grid;
            obiekt.y = getRandomInt(0, 40) * grid;
            console.log('Wąż zjadł jabłko');
        }
    }
}
