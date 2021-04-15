import themes from './themes';
import { generateTeam } from './generators';
import Bowman from './classes/Bowman';
import Swordsman from './classes/Swordsman';
import Magician from './classes/Magician';
import Daemon from './classes/Daemon';
import Undead from './classes/Undead';
import Vampire from './classes/Vampire';
import PositionedCharacter from './PositionedCharacter';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = gamePlay.boardSize;
  }

  init() {
    // рисуем поле
    this.gamePlay.drawUi(themes.prairie);
    // создаем команды
    const userTeam = generateTeam([Bowman, Magician, Swordsman], 4, 2);
    const enemyTeam = generateTeam([Daemon, Undead, Vampire], 4, 2);
    console.log(userTeam, enemyTeam);
    // расставляем персонажей
    const positions = [];
    for (let i = 0; i < userTeam.members.length; i += 1) {
      const placedChar = new PositionedCharacter(userTeam.members[i], this.getPlayerPosition());
      positions.push(placedChar);
    }
    for (let i = 0; i < enemyTeam.members.length; i += 1) {
      const placedChar = new PositionedCharacter(enemyTeam.members[i], this.getEnemyPosition());
      positions.push(placedChar);
    }
    console.log(positions);
    // рисуем расставленных персонажей
    this.gamePlay.redrawPositions(positions);
    // листенер для клетки
    this.gamePlay.
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  // генерация позиций игрока
  getPlayerPosition() {
    const field = this.boardSize ** 2;
    const index = Math.floor(Math.random() * field);
    if (index % this.boardSize === 0 || index % this.boardSize === 1) {
      return index;
    }
    return this.getPlayerPosition();
  }

  // генерация позиций врага
  getEnemyPosition() {
    const field = this.boardSize ** 2;
    const index = Math.floor(Math.random() * field);
    if (
      (index + 1) % this.boardSize === 0
      || (index + 1) % this.boardSize === this.boardSize - 1
    ) {
      return index;
    }
    return this.getEnemyPosition();
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
