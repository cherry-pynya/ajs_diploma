/* eslint-disable array-callback-return */
import themes from './themes';
import { generateTeam, generateRandon } from './generators';
import Bowman from './classes/Bowman';
import Swordsman from './classes/Swordsman';
import Magician from './classes/Magician';
import Daemon from './classes/Daemon';
import Undead from './classes/Undead';
import Vampire from './classes/Vampire';
import PositionedCharacter from './PositionedCharacter';
import cursors from './cursors';
import GamePlay from './GamePlay';
import GameState from './GameState';
import GameStateService from './GameStateService';
import { isEvil, isOrder } from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.boardSize = gamePlay.boardSize;
    this.turn = 0;
    this.selectedChar = undefined;
    this.level = 1;
    this.localStorage = new GameStateService(localStorage);
    if (this.level === 1) this.theme = themes.prairie;
    if (this.level === 2) this.theme = themes.desert;
    if (this.level === 3) this.theme = themes.arctic;
    if (this.level === 4) this.theme = themes.mountain;
  }

  init() {
    // рисуем поле
    this.gamePlay.drawUi(this.theme);
    // создаем команды
    const userTeam = generateTeam([Bowman, Magician, Swordsman], 4, 2);
    const enemyTeam = generateTeam([Daemon, Undead, Vampire], 4, 2);
    // расставляем персонажей
    const userArr = [];
    const enemyArr = [];
    for (let i = 0; i < userTeam.members.length; i += 1) {
      const placedChar = new PositionedCharacter(
        userTeam.members[i],
        this.getPlayerPosition(),
      );
      userArr.push(placedChar);
    }
    for (let i = 0; i < enemyTeam.members.length; i += 1) {
      const placedChar = new PositionedCharacter(
        enemyTeam.members[i],
        this.getEnemyPosition(),
      );
      enemyArr.push(placedChar);
    }
    // рисуем расставленных персонажей
    userArr.sort((a, b) => a.position - b.position);
    for (let i = 0; i < userArr.length; i += 1) {
      if (userArr[i + 1]) {
        if (userArr[i].position === userArr[i + 1].position) {
          userArr[i + 1].position = this.getPlayerPosition();
        }
      }
    }
    enemyArr.sort((a, b) => a.position - b.position);
    for (let i = 0; i < enemyArr.length; i += 1) {
      if (enemyArr[i + 1]) {
        if (enemyArr[i].position === enemyArr[i + 1].position) {
          enemyArr[i + 1].position = this.getEnemyPosition();
        }
      }
    }
    this.positions = [...enemyArr, ...userArr];
    this.gamePlay.redrawPositions(this.positions);
    // листенеры для клеток
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    const newGameBtn = document.querySelector('button[data-id=action-restart]');
    newGameBtn.addEventListener('click', () => {
      this.level = 1;
      this.turn = 0;
      this.gamePlay.addNewGameListener(this.init());
    });
    const saveBtn = document.querySelector('button[data-id=action-save]');
    saveBtn.addEventListener('click', () => {
      localStorage.clear();
      const save = GameState.from(this);
      this.localStorage.save(save);
    });
    const loadBtn = document.querySelector('button[data-id=action-load]');
    loadBtn.addEventListener('click', () => {
      const { theme, positions, level } = this.localStorage.load();
      this.theme = theme;
      this.positions = positions;
      this.level = level;
      this.gamePlay.drawUi(this.theme);
      this.gamePlay.redrawPositions(this.positions);
    });
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
    for (let i = 0; i < this.positions.length; i += 1) {
      if (
        index === this.positions[i].position
        && isOrder(this.positions[i])
      ) {
        for (let a = 0; a < this.boardSize ** 2 - 1; a += 1) {
          this.gamePlay.deselectCell(a);
        }
        this.gamePlay.selectCell(index);
        this.selectedChar = this.positions.find((item) => {
          if (item.position === index) {
            if (isEvil(item)) {
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
      this.positions.forEach((el) => {
        if (
          (isOrder(el))
          && el.position === index
        ) {
          const {
            level,
            attack,
            defence,
            health,
          } = el.character;
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
          const {
            level,
            attack,
            defence,
            health,
          } = this.positions[
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
    if (isOrder(selectedChar)) {
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
        if (!(column - i >= this.boardSize)) array.push(this.convertIndex([row, column + i]));
        array.push(this.convertIndex([row + i, column]));
        array.push(this.convertIndex([row - i, column]));
        if (row - i >= 0 && column + i < this.boardSize) {
          array.push(this.convertIndex([row - i, column + i]));
        }
        if (row + i < this.boardSize && column + i < this.boardSize) {
          array.push(this.convertIndex([row + i, column + i]));
        }
        if (row + i < this.boardSize && column - i >= 0) {
          array.push(this.convertIndex([row + i, column - i]));
        }
        if (row - i >= 0 && column - i >= 0) array.push(this.convertIndex([row - i, column - i]));
      }
      return array.filter((el) => el >= 0).filter((el) => !othersPositions.includes(el));
    }
    if (isEvil(selectedChar)) {
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
        array.push(this.convertIndex([row - i, column]));
        if (!(row + i >= this.boardSize)) array.push(this.convertIndex([row + i, column]));
        if (row - i >= 0 && column + i < this.boardSize) {
          array.push(this.convertIndex([row - i, column + i]));
        }
        if (row + i < this.boardSize && column + i < this.boardSize) {
          array.push(this.convertIndex([row + i, column + i]));
        }
        if (row + i < this.boardSize && column - i >= 0) {
          array.push(this.convertIndex([row + i, column - i]));
        }
        if (row - i >= 0 && column - i >= 0) array.push(this.convertIndex([row - i, column - i]));
      }
      return array.filter((el) => el >= 0).filter((el) => !othersPositions.includes(el));
    }
    return false;
  }

  canAttack(selectedChar, index) {
    // получаем координаты врага, которого можно атаковать
    if (selectedChar === undefined) return false;
    const curretPosition = this.convertIndex(selectedChar.position);
    const { range } = selectedChar.character;
    const target = this.convertIndex(index);
    const arr = [];
    if (this.turn === 0) {
      this.positions.forEach((el) => {
        if (isEvil(el)) arr.push(el.position);
      });
    } else if (this.turn === 1) {
      this.positions.forEach((el) => {
        if (isOrder(el)) arr.push(el.position);
      });
    }
    if (
      (curretPosition[0] === target[0]
        && Math.abs(curretPosition[1] - target[1]) <= range) // Горизонталь
        || (curretPosition[1] === target[1]
        && Math.abs(curretPosition[0] - target[0]) <= range) // Вертикаль
        || (Math.abs(curretPosition[1] - target[1]) <= range
        && Math.abs(curretPosition[0] - target[0]) <= range)
    ) {
      // Диагональ
      for (let i = 0; i <= arr.length; i += 1) {
        if (this.convertIndex(target) === arr[i]) return this.convertIndex(target);
      }
    }
    return false;
  }

  moveChar(selectedChar, index) {
    selectedChar.ways.forEach((e) => {
      if (index === e) {
        this.positions.splice(this.positions.indexOf(selectedChar), 1);
        // eslint-disable-next-line no-param-reassign
        selectedChar.position = index;
        // eslint-disable-next-line no-param-reassign
        delete selectedChar.ways;
        // eslint-disable-next-line no-param-reassign
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
        this.checkWinner();
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
          // eslint-disable-next-line no-param-reassign
          delete selectedChar.ways;
          // eslint-disable-next-line no-param-reassign
          delete selectedChar.targets;
          this.positions.push(selectedChar);
          this.gamePlay.redrawPositions(this.positions);
          this.selectedChar = undefined;
        }
        if (enemy.character.health <= 0) {
          this.positions.splice(this.positions.indexOf(selectedChar), 1);
          // eslint-disable-next-line no-param-reassign
          delete selectedChar.ways;
          // eslint-disable-next-line no-param-reassign
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
        this.checkWinner();
        for (let a = 0; a < this.boardSize ** 2 - 1; a += 1) {
          this.gamePlay.deselectCell(a);
        }
      });
    }
  }

  ai() {
    if (this.turn === 1) {
      const aiTeam = this.positions.filter((item) => {
        if (isEvil(item)) return item;
      });
      const userTeam = this.positions.filter((item) => {
        if (isOrder(item)) return item;
      });
      let attacked = false;
      aiTeam.forEach((el) => {
        if (!attacked) {
          for (let i = 0; i < userTeam.length; i += 1) {
            if (!attacked) {
              if (this.canAttack(el, userTeam[i].position)) {
                const target = this.positions.find((item) => {
                  if (item.position === this.canAttack(el, userTeam[i].position)) return item;
                });
                const { defence } = target.character;
                const { attack } = el.character;
                attacked = true;
                const damage = Math.max(attack - defence, attack * 0.1);
                this.gamePlay.showDamage(target.position, damage).then(() => {
                  target.character.vounded(damage);
                  if (target.character.health > 0) {
                    this.gamePlay.redrawPositions(this.positions);
                  }
                  if (target.character.health < 0) {
                    this.positions.splice(this.positions.indexOf(target), 1);
                    this.gamePlay.redrawPositions(this.positions);
                  }
                });
              }
            }
          }
        }
      });
      let moved = false;
      if (!attacked) {
        aiTeam.forEach((el) => {
          if (!moved) {
            const arr = this.canWalk(el);
            const original = el.position;
            for (let i = 0; i < arr.length; i += 1) {
              for (let a = 0; a < userTeam.length; a += 1) {
                // eslint-disable-next-line no-param-reassign
                el.position = arr[i];
                if (this.canAttack(el, userTeam[a].position)) {
                  this.gamePlay.redrawPositions(this.positions);
                  moved = true;
                  return false;
                }
              }
            }
            if (!moved) {
              // eslint-disable-next-line no-param-reassign
              el.position = original;
              const userPos = [];
              userTeam.forEach((item) => userPos.push(item.position));
              const index = (Math.random() * (userPos.length - 0) + 0);
              const victim = userPos[index];
              const goTo = arr.reduce((prev, curr) => (Math.abs(curr - victim) < Math.abs(prev - victim) ? curr : prev));
              // eslint-disable-next-line no-param-reassign
              el.position = goTo;
              this.gamePlay.redrawPositions(this.positions);
              moved = true;
            }
          }
        });
      }
    }
    this.turn = 0;
  }

  checkWinner() {
    const arrUser = this.positions.filter((item) => {
      if (isOrder(item)) return true;
    });
    if (arrUser.length === 0) this.playerLost();
    const arrAi = this.positions.filter((item) => {
      if (isEvil(item)) return true;
    });
    if (arrAi.length === 0) this.playerWon();
  }

  playerLost() {
    GamePlay.showMessage('You lost');
    this.init();
  }

  playerWon() {
    this.level += 1;
    GamePlay.showMessage(`You won ${this.level - 1} round`);
    if (this.level === 2) {
      this.positions.forEach((item) => {
        item.character.levelUp();
      });
      const char = new PositionedCharacter(
        generateRandon(this.level),
        this.getPlayerPosition(),
      );
      this.positions.push(char);
      const enemyTeam = generateTeam(
        [Daemon, Undead, Vampire],
        4,
        this.positions.length + 2,
      );
      for (let i = 0; i < enemyTeam.members.length; i += 1) {
        const placedChar = new PositionedCharacter(
          enemyTeam.members[i],
          this.getEnemyPosition(),
        );
        this.positions.push(placedChar);
      }
      this.theme = themes.desert;
      this.gamePlay.drawUi(this.theme);
      this.gamePlay.redrawPositions(this.positions);
    }
    if (this.level === 3) {
      this.positions.forEach((item) => {
        item.character.levelUp();
      });
      const char = new PositionedCharacter(
        generateRandon(this.level),
        this.getPlayerPosition(),
      );
      this.positions.push(char);
      const enemyTeam = generateTeam(
        [Daemon, Undead, Vampire],
        4,
        this.positions.length + 2,
      );
      for (let i = 0; i < enemyTeam.members.length; i += 1) {
        const placedChar = new PositionedCharacter(
          enemyTeam.members[i],
          this.getEnemyPosition(),
        );
        this.positions.push(placedChar);
      }
      this.theme = themes.arctic;
      this.gamePlay.drawUi(this.theme);
      this.gamePlay.redrawPositions(this.positions);
    }
    if (this.level === 4) {
      this.positions.forEach((item) => {
        item.character.levelUp();
      });
      const char = new PositionedCharacter(
        generateRandon(this.level),
        this.getPlayerPosition(),
      );
      this.positions.push(char);
      const enemyTeam = generateTeam(
        [Daemon, Undead, Vampire],
        4,
        this.positions.length + 2,
      );
      for (let i = 0; i < enemyTeam.members.length; i += 1) {
        const placedChar = new PositionedCharacter(
          enemyTeam.members[i],
          this.getEnemyPosition(),
        );
        this.positions.push(placedChar);
      }
      this.theme = themes.mountain;
      this.gamePlay.drawUi(this.theme);
      this.gamePlay.redrawPositions(this.positions);
    }
    if (this.level === 5) {
      GamePlay.showMessage('game over, you win');
      this.level = 1;
      this.theme = themes.prairie;
      this.init();
    }
  }
}
