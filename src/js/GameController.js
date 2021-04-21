import themes from './themes';
import { generateTeam , possibleMovements} from './generators';
import Bowman from './classes/Bowman';
import Swordsman from './classes/Swordsman';
import Magician from './classes/Magician';
import Daemon from './classes/Daemon';
import Undead from './classes/Undead';
import Vampire from './classes/Vampire';
import PositionedCharacter from './PositionedCharacter';
import cursors from './cursors';
import GamePlay from './GamePlay';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = gamePlay.boardSize;
    this.turn = 0;
    this.theme = themes.prairie;
  }

  init() {
    // рисуем поле
    this.gamePlay.drawUi(this.theme);
    // создаем команды
    const userTeam = generateTeam([Bowman, Magician, Swordsman], 4, 2);
    const enemyTeam = generateTeam([Daemon, Undead, Vampire], 4, 2);
    console.log(userTeam, enemyTeam);
    // расставляем персонажей
    const positions = [];
    for (let i = 0; i < userTeam.members.length; i += 1) {
      const placedChar = new PositionedCharacter(
        userTeam.members[i],
        this.getPlayerPosition()
      );
      positions.push(placedChar);
    }
    for (let i = 0; i < enemyTeam.members.length; i += 1) {
      const placedChar = new PositionedCharacter(
        enemyTeam.members[i],
        this.getEnemyPosition()
      );
      positions.push(placedChar);
    }
    console.log(positions);
    // рисуем расставленных персонажей
    this.positions = positions;
    this.gamePlay.redrawPositions(positions);
    //листенеры для клеток
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
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
      (index + 1) % this.boardSize === 0 ||
      (index + 1) % this.boardSize === this.boardSize - 1
    ) {
      return index;
    }
    return this.getEnemyPosition();
  }

  onCellClick(index) {
    // TODO: react to click
    const selectedChar = this.positions.find((i) => {
      if (i.position === index) {
        if (i.character.type === 'vampire' || i.character.type === 'undead' || i.character.type === 'daemon') {
          GamePlay.showError('This character is not playable');
          return false;
        }
        return i.character;
      }
    });
    if (selectedChar !== undefined) {
      for (let i = 0; i < (this.boardSize ** 2 - 1); i += 1) {
        this.gamePlay.deselectCell(i);
      }
      this.gamePlay.selectCell(index);
      const whertogo = possibleMovements(selectedChar);
      console.log(whertogo);
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    for (let i = 0; i < this.positions.length; i += 1) {
      if (index === this.positions[i].position) {
        const { level, attack, defence, health } = this.positions[i].character;
        const message = `${'\u{1F396}'} ${level} ${'\u{2694}'} ${attack} ${'\u{1F6E1}'} ${defence} ${'\u2764'} ${health}`;
        this.gamePlay.showCellTooltip(message, index);
        this.gamePlay.setCursor(cursors.pointer);
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }
}
