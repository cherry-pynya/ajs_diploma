import themes from './themes';
import { generateTeam } from './generators';
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
    this.selectedChar = undefined;
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
    // рисуем расставленных персонажей
    this.positions = positions;
    this.gamePlay.redrawPositions(positions);
    // листенеры для клеток
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
    for (let i = 0; i < this.positions.length; i += 1) {
      if (
        index === this.positions[i].position &&
        this.positions[i].character.type !== 'vampire' &&
        this.positions[i].character.type !== 'undead' &&
        this.positions[i].character.type !== 'daemon'
      ) {
        for (let a = 0; a < this.boardSize ** 2 - 1; a += 1) {
          this.gamePlay.deselectCell(a);
        }
        this.gamePlay.selectCell(index);
        this.selectedChar = this.positions.find((item) => {
          if (item.position === index) {
            if (
              item.character.type === 'vampire' ||
              item.character.type === 'undead' ||
              item.character.type === 'daemon'
            ) {
              GamePlay.showError('This character is not playable');
              return undefined;
            }
            return item.character;
          }
        });
        this.selectedChar.ways = this.canWalk(this.selectedChar);
        this.selectedChar.targets = this.canAttack(this.selectedChar);
      }
    }
    if (this.selectedChar !== undefined) {
      this.moveChar(this.selectedChar, index);
      this.atack(this.selectedChar, index);
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    if (this.selectedChar) {
      this.gamePlay.setCursor(cursors.notallowed);
      Array.from(this.positions).forEach((e) => {
        if (
          (e.character.type === 'bowman' ||
            e.character.type === 'swordsman' ||
            e.character.type === 'magician') &&
          e.position === index
        ) {
          const { level, attack, defence, health } = e.character;
          const message = `${'\u{1F396}'} ${level} ${'\u{2694}'} ${attack} ${'\u{1F6E1}'} ${defence} ${'\u2764'} ${health}`;
          this.gamePlay.showCellTooltip(message, index);
          this.gamePlay.setCursor(cursors.pointer);
        }
      });
      const greenCell = document.getElementsByClassName('cell');
      Array.from(greenCell).forEach((element) => {
        if (element.classList.contains('selected-green')) {
          element.classList.remove('selected-green');
          element.classList.remove('selected');
        }
      });
      this.selectedChar.ways.forEach((element) => {
        if (element === index) {
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green');
        }
      });
      if (this.canAttack(this.selectedChar, index)) {
        this.gamePlay.setCursor(cursors.crosshair);
      }
    } else {
      for (let i = 0; i < this.positions.length; i += 1) {
        if (index === this.positions[i].position) {
          const { level, attack, defence, health } = this.positions[
            i
          ].character;
          const message = `${'\u{1F396}'} ${level} ${'\u{2694}'} ${attack} ${'\u{1F6E1}'} ${defence} ${'\u2764'} ${health}`;
          this.gamePlay.showCellTooltip(message, index);
          this.gamePlay.setCursor(cursors.pointer);
        }
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  // вспомогательные методы
  convertIndex(index) {
    // конвертирует индекс клетки в формат [x, y] и наоборот
    if (Array.isArray(index)) {
      const row = index[0];
      const column = index[1];
      return row * this.boardSize + column;
    }
    const row = Math.floor(index / this.boardSize);
    const colunm = index % this.boardSize;
    return [row, colunm];
  }

  canWalk(selectedChar) {
    // получаем массив с возможными ячейками для передвидения
    const curretPosition = this.convertIndex(selectedChar.position);
    const othersPositions = [];
    Array.from(this.positions).forEach((e) => {
      othersPositions.push(e.position);
    });
    const { steps } = selectedChar.character;
    const array = [];
    for (let i = 1; i <= steps; i += 1) {
      const row = curretPosition[0];
      const column = curretPosition[1];
      if (column - i >= 0) array.push(this.convertIndex([row, column - i]));
      if (!(column - i >= this.boardSize))
        array.push(this.convertIndex([row, column + i]));
      array.push(this.convertIndex([row + i, column]));
      array.push(this.convertIndex([row - i, column]));
      if (row - i >= 0 && column + i < this.boardSize)
        array.push(this.convertIndex([row - i, column + i]));
      if (row + i < this.boardSize && column + i < this.boardSize)
        array.push(this.convertIndex([row + i, column + i]));
      if (row + i < this.boardSize && column - i >= 0)
        array.push(this.convertIndex([row + i, column - i]));
      if (row - i >= 0 && column - i >= 0)
        array.push(this.convertIndex([row - i, column - i]));
    }
    return array.filter((el) => !othersPositions.includes(el));
  }

  canAttack(selectedChar, index) {
    // получаем координаты врага, которого можно атаковать
    if (selectedChar === undefined) return false;
    const curretPosition = this.convertIndex(selectedChar.position);
    const { range } = selectedChar.character;
    const target = this.convertIndex(index);
    const arr = [];
    if (this.turn === 0) {
      Array.from(this.positions).forEach((e) => {
        if (
          e.character.type === 'daemon' ||
          e.character.type === 'vampire' ||
          e.character.type === 'undead'
        )
          arr.push(e.position);
      });
    } else if (this.turn === 1) {
      Array.from(this.positions).forEach((e) => {
        if (
          e.character.type === 'swordsman' ||
          e.character.type === 'magician' ||
          e.character.type === 'bowman'
        )
          arr.push(e.position);
      });
    }
    if (
      (curretPosition[0] === target[0] &&
        Math.abs(curretPosition[1] - target[1]) <= range) || // Горизонталь
      (curretPosition[1] === target[1] &&
        Math.abs(curretPosition[0] - target[0]) <= range) || // Вертикаль
      (Math.abs(curretPosition[1] - target[1]) <= range &&
        Math.abs(curretPosition[0] - target[0]) <= range)
    ) {
      // Диагональ
      for (let i = 0; i <= arr.length; i += 1) {
        if (this.convertIndex(target) === arr[i])
          return this.convertIndex(target);
      }
    }
    return false;
  }

  moveChar(selectedChar, index) {
    selectedChar.ways.forEach((e) => {
      if (index === e) {
        this.positions.splice(this.positions.indexOf(selectedChar), 1);
        selectedChar.position = index;
        delete selectedChar.ways;
        delete selectedChar.targets;
        this.positions.push(selectedChar);
        this.gamePlay.redrawPositions(this.positions);
        this.selectedChar = undefined;
        if (this.turn === 0) {
          this.turn = 1;
        } else {
          this.turn = 0;
        }
        this.ai();
        for (let a = 0; a < this.boardSize ** 2 - 1; a += 1) {
          this.gamePlay.deselectCell(a);
        }
      }
    });
  }

  atack(selectedChar, index) {
    const target = this.canAttack(selectedChar, index);
    if (target) {
      const enemy = this.positions.find((item) => {
        if (item.position === target) return item;
      });
      const { defence } = enemy.character;
      const { attack } = selectedChar.character;
      const damage = Math.max(attack - defence, attack * 0.1);
      this.gamePlay.showDamage(target, damage).then(() => {
        enemy.character.vounded(damage);
        if (enemy.character.health > 0) {
          this.positions.splice(this.positions.indexOf(selectedChar), 1);
          delete selectedChar.ways;
          delete selectedChar.targets;
          this.positions.push(selectedChar);
          this.gamePlay.redrawPositions(this.positions);
          this.selectedChar = undefined;
        }
        if (enemy.character.health <= 0) {
          this.positions.splice(this.positions.indexOf(selectedChar), 1);
          delete selectedChar.ways;
          delete selectedChar.targets;
          this.positions.push(selectedChar);
          this.positions.splice(this.positions.indexOf(enemy), 1);
          this.gamePlay.redrawPositions(this.positions);
          this.selectedChar = undefined;
        }
        if (this.turn === 0) {
          this.turn = 1;
        } else {
          this.turn = 0;
        }
        this.ai();
        for (let a = 0; a < this.boardSize ** 2 - 1; a += 1) {
          this.gamePlay.deselectCell(a);
        }
      });
    }
  }

  ai() {
    if (this.turn === 1) {
      const aiTeam = this.positions.filter((item) => {
        if (
          item.character.type === 'daemon' ||
          item.character.type === 'vampire' ||
          item.character.type === 'undead'
        )
          return item;
      });
      const userTeam = this.positions.filter((item) => {
        if (
          item.character.type === 'bowman' ||
          item.character.type === 'swordsman' ||
          item.character.type === 'magician'
        )
          return item;
      });
      userTeam.sort((a, b) => {
        return a.character.defence - b.character.defence;
      });
      const arr = [];
      let killOrder = false;
      let targetIndex = 0;
      let atacker = 0;
      for (let i = 0; i < userTeam.length; i += 1) {
        arr.push(userTeam[i].position);
      }
      aiTeam.sort((a, b) => {
        return b.character.attack - a.character.attack;
      });
      for (let i = 0; i < aiTeam.length; i += 1) {
        for (let a = 0; a < arr.length; a += 1) {
          if (this.canAttack(aiTeam[i], arr[a])) {
            killOrder = true;
            targetIndex = arr[a];
            atacker = aiTeam[i];
          }
        }
      }
      if (killOrder) this.atack(atacker, targetIndex);
      console.log(this.turn);
    }
    this.turn = 0;
  }
}
