import { grid, kolizje, getRandomInt, gracze, plan, chat} from '../serwer-snake.js';
import { goldenApple } from '../items/goldenApple.js';
import { ateApple } from '../items/apples.js';
import { liczba } from '../items/boosts.js';

export let czolowe_zderzenia = {
    snake1: undefined,
    snake2: undefined,
}

export function colisions(obiekt, klient) {
    let snake = gracze.get(klient);
    if (
        snake.cells[0].x === obiekt.x &&
        snake.cells[0].y === obiekt.y &&
        snake.cells[0] !== obiekt
    ) {
        //Głowa węza zderzyła sie z jakimś obiektem

        if (obiekt.typ == 'elsnake' && snake.ochrona == 0 && obiekt.snake.ochrona == 0) {

            if(obiekt.snake == snake)
            {
                let temp = [];
                temp.push({tekst:'Gracz ', kolor:"red"});
                temp.push({tekst:snake.nick, kolor:snake.kolor});
                temp.push({tekst:' uderzył w swój ogon', kolor:"red"});

                chat.push(temp);
                //kolizje.push('<span style="color: red;">Gracz ' + snake.nick + ' uderzył w swój ogon</span>');
            }
            else if(obiekt == obiekt.snake.cells[0]) //Czołowe zdarzenie - obaj gracze giną
            {
                let temp = [];
                temp.push({tekst:'Gracze ', kolor:"red"});
                temp.push({tekst:snake.nick, kolor:snake.kolor});
                temp.push({tekst:'i', kolor:'red'});
                temp.push({tekst:obiekt.snake.nick, kolor:obiekt.snake.kolor});
                temp.push({tekst:'  zremisowali', kolor:"red"});

                chat.push(temp);
                //kolizje.push('<span style="color: red;">Gracze ' + snake.nick + ' i ' + obiekt.snake.nick + ' zderzyli się</span>');
                obiekt.snake.gameover = true;
                czolowe_zderzenia.snake1 = snake;
                czolowe_zderzenia.snake2 = obiekt.snake;
            }
            else
            {
                let temp = [];
                temp.push({tekst:'Gracz ', kolor:"red"});
                temp.push({tekst:snake.nick, kolor:snake.kolor});
                temp.push({tekst:' uderzył w gracza: ', kolor:'red'});
                temp.push({tekst:obiekt.snake.nick, kolor:obiekt.snake.kolor});

                chat.push(temp);
                //kolizje.push('<span style="color: red;">Gracz ' + snake.nick + ' uderzył w gracza: ' + obiekt.snake.nick + '</span>');
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
        else if(obiekt.typ === 'tarcza')
        {
            snake.tarcze++;
            plan.delete(obiekt);
            liczba.tarcz--;
        }
        else if(obiekt.typ === 'przysp')
        {
            snake.przysp++;
            plan.delete(obiekt);
            liczba.przysp--;
        }
        else if(obiekt.typ === 'naboje')
        {
            snake.naboje++;
            plan.delete(obiekt);
            liczba.naboji--;
        }
        else if(obiekt.typ == 'pocisk' && obiekt.snake != snake && snake.ochrona == 0)
        {
            let temp = [];
            temp.push({tekst:'Gracz ', kolor:"red"});
            temp.push({tekst:obiekt.snake.nick, kolor:obiekt.snake.kolor});
            temp.push({tekst:' zastrzelił gracza: ', kolor:'red'});
            temp.push({tekst:snake.nick, kolor:snake.kolor});

            chat.push(temp);

            //kolizje.push('<span style="color: red;">Gracz ' + obiekt.snake.nick + ' zastrzelił gracza: ' + snake.nick + '</span>');
            obiekt.snake.wynik += snake.wynik+2;
            obiekt.snake.maxCells += snake.wynik+2;
            snake.gameover = true;

            plan.delete(obiekt);
        }
    }
    else if(snake.cells[1].x === obiekt.x && snake.cells[1].y === obiekt.y && snake.cells[1] !== obiekt) //Jeśli drugi człon węża skolidował z jakimś obiektem
    {
        if(obiekt.typ == 'pocisk' && obiekt.snake != snake && snake.ochrona == 0)
        {
            let temp = [];
            temp.push({tekst:'Gracz ', kolor:"red"});
            temp.push({tekst:obiekt.snake.nick, kolor:obiekt.snake.kolor});
            temp.push({tekst:' zastrzelił gracza: ', kolor:'red'});
            temp.push({tekst:snake.nick, kolor:snake.kolor});

            chat.push(temp);
            //kolizje.push('<span style="color: red;">Gracz ' + obiekt.snake.nick + ' zastrzelił gracza: ' + snake.nick + '</span>');
            obiekt.snake.wynik += snake.wynik+2;
            obiekt.snake.maxCells += snake.wynik+2;
            snake.gameover = true;

            plan.delete(obiekt);
        }
    }

}
