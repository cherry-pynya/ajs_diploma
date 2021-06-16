/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable consistent-return */
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
import {
  isEvil,
  isOrder,
  convertToArr,
  convertToIndex,
  sortPositions,
  template,
} from './utils';
import reviveChar from './reviveChar';

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
    this.userArr = [];
    this.enemyArr = [];
    for (let i = 0; i < userTeam.length; i += 1) {
      const placedUserChar = new PositionedCharacter(
        userTeam[i],
        this.getPlayerPosition(),
      );
      const placedEnemyChar = new PositionedCharacter(
        enemyTeam[i],
        this.getEnemyPosition(),
      );
      this.userArr.push(placedUserChar);
      this.enemyArr.push(placedEnemyChar);
    }
    // рисуем расставленных персонажей
    this.positions = sortPositions([...this.enemyArr, ...this.userArr]);
    this.gamePlay.redrawPositions(this.positions);
    // листенеры для клеток
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.initButtons();
  }

  newGameBtn() {
    const newGameBtn = document.querySelector('button[data-id=action-restart]');
    newGameBtn.addEventListener('click', () => {
      const gamePlay = new GamePlay();
      gamePlay.bindToDOM(document.querySelector('#game-container'));
      const stateService = new GameStateService(localStorage);
      const gameCtrl = new GameController(gamePlay, stateService);
      gameCtrl.init();
    });
  }

  saveBtn() {
    const saveBtn = document.querySelector('button[data-id=action-save]');
    saveBtn.addEventListener('click', () => {
      localStorage.clear();
      const save = GameState.from(this);
      this.localStorage.save(save);
    });
  }

  loadBtn() {
    const loadBtn = document.querySelector('button[data-id=action-load]');
    loadBtn.addEventListener('click', () => {
      if (this.localStorage.load() === null) {
        GamePlay.showMessage('No saved Game');
        return false;
      }
      const { theme, positions, level } = this.localStorage.load();
      this.theme = theme;
      this.positions = positions;
      this.positions = this.positions.map((el) => reviveChar(el));
      this.level = level;
      this.gamePlay.drawUi(this.theme);
      this.gamePlay.redrawPositions(this.positions);
      this.initButtons();
    });
  }

  initButtons() {
    this.loadBtn();
    this.saveBtn();
    this.newGameBtn();
  }

  // генерация позиций игрока
  getPlayerPosition() {
    const field = this.boardSize ** 2;
    const index = Math.floor(Math.random() * field);
    if (index % this.boardSize === 0 || index % this.boardSize === 1) {
      for (let i = 0; i < this.userArr.length; i += 1) {
        if (index === this.userArr[i].position) return false;
      }
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
      for (let i = 0; i < this.enemyArr.length; i += 1) {
        if (index === this.enemyArr[i].position) return false;
      }
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
          const message = template(el.character);
          this.gamePlay.showCellTooltip(message, index);
          this.gamePlay.setCursor(cursors.pointer);
        } else if (
          (isEvil(el))
          && el.position === index
        ) {
          const message = template(el.character);
          this.gamePlay.showCellTooltip(message, index);
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
          const message = template(this.positions[i].character);
          this.gamePlay.showCellTooltip(message, index);
          this.gamePlay.setCursor(cursors.pointer);
        }
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    if (document.querySelector('.selected-green') !== null) {
      document.querySelector('.selected-green').classList.remove('selected');
      document.querySelector('.selected-green').classList.remove('selected-green');
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  canWalk(selectedChar) {
    // получаем массив с возможными ячейками для передвидения
    if (isOrder(selectedChar)) {
      const curretPosition = convertToArr(selectedChar.position);
      const othersPositions = [];
      Array.from(this.positions).forEach((e) => {
        othersPositions.push(e.position);
      });
      const { steps } = selectedChar.character;
      const array = [];
      for (let i = 1; i <= steps; i += 1) {
        const row = curretPosition[0];
        const column = curretPosition[1];
        if (column - i >= 0) array.push(convertToIndex([row, column - i]));
        if (!(column - i >= this.boardSize)) array.push(convertToIndex([row, column + i]));
        array.push(convertToIndex([row + i, column]));
        array.push(convertToIndex([row - i, column]));
        if (row - i >= 0 && column + i < this.boardSize) {
          array.push(convertToIndex([row - i, column + i]));
        }
        if (row + i < this.boardSize && column + i < this.boardSize) {
          array.push(convertToIndex([row + i, column + i]));
        }
        if (row + i < this.boardSize && column - i >= 0) {
          array.push(convertToIndex([row + i, column - i]));
        }
        if (row - i >= 0 && column - i >= 0) array.push(convertToIndex([row - i, column - i]));
      }
      return array.filter((el) => el >= 0).filter((el) => !othersPositions.includes(el));
    }
    if (isEvil(selectedChar)) {
      const curretPosition = convertToArr(selectedChar.position);
      const othersPositions = [];
      Array.from(this.positions).forEach((e) => {
        othersPositions.push(e.position);
      });
      const { steps } = selectedChar.character;
      const array = [];
      for (let i = 1; i <= steps; i += 1) {
        const row = curretPosition[0];
        const column = curretPosition[1];
        if (column - i >= 0) array.push(convertToIndex([row, column - i]));
        array.push(convertToIndex([row - i, column]));
        if (!(row + i >= this.boardSize)) array.push(convertToIndex([row + i, column]));
        if (row - i >= 0 && column + i < this.boardSize) {
          array.push(convertToIndex([row - i, column + i]));
        }
        if (row + i < this.boardSize && column + i < this.boardSize) {
          array.push(convertToIndex([row + i, column + i]));
        }
        if (row + i < this.boardSize && column - i >= 0) {
          array.push(convertToIndex([row + i, column - i]));
        }
        if (row - i >= 0 && column - i >= 0) array.push(convertToIndex([row - i, column - i]));
      }
      return array.filter((el) => el >= 0).filter((el) => !othersPositions.includes(el));
    }
    return false;
  }

  canAttack(selectedChar, index) {
    // получаем координаты врага, которого можно атаковать
    if (selectedChar === undefined) return false;
    const curretPosition = convertToArr(selectedChar.position);
    const { range } = selectedChar.character;
    const target = convertToArr(index);
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
        if (convertToIndex(target) === arr[i]) return convertToIndex(target);
      }
    }
    return false;
  }

  moveChar(selectedChar, index) {
    selectedChar.ways.forEach((el) => {
      if (!(index === el)) return;
      this.positions.splice(this.positions.indexOf(selectedChar), 1);
      selectedChar.position = index;
      delete selectedChar.ways;
      delete selectedChar.targets;
      this.positions.push(selectedChar);
      this.gamePlay.redrawPositions(this.positions);
      this.initButtons();
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
      const promise = this.gamePlay.showDamage(target, damage);
      promise.then(() => {
        enemy.character.vounded(damage);
        if (enemy.character.health > 0) {
          this.positions.splice(this.positions.indexOf(selectedChar), 1);
          delete selectedChar.ways;
          delete selectedChar.targets;
          this.positions.push(selectedChar);
          this.gamePlay.redrawPositions(this.positions);
        }
        if (enemy.character.health <= 0) {
          this.positions.splice(this.positions.indexOf(selectedChar), 1);
          delete selectedChar.ways;
          delete selectedChar.targets;
          this.positions.push(selectedChar);
          this.positions.splice(this.positions.indexOf(enemy), 1);
          this.gamePlay.redrawPositions(this.positions);
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
      this.selectedChar = undefined;
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
                  setTimeout(() => {
                    target.character.vounded(damage);
                    if (target.character.health > 0) {
                      this.gamePlay.redrawPositions(this.positions);
                    }
                    if (target.character.health < 0) {
                      this.positions.splice(this.positions.indexOf(target), 1);
                      this.gamePlay.redrawPositions(this.positions);
                    }
                  }, 10000);
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
                el.position = arr[i];
                if (this.canAttack(el, userTeam[a].position)) {
                  this.gamePlay.redrawPositions(this.positions);
                  this.initButtons();
                  moved = true;
                  return false;
                }
              }
            }
            if (!moved) {
              el.position = original;
              const userPos = [];
              userTeam.forEach((item) => userPos.push(item.position));
              const index = (Math.random() * (userPos.length - 0) + 0);
              const victim = userPos[index];
              const goTo = arr.reduce((prev, curr) => (Math.abs(curr - victim) < Math.abs(prev - victim) ? curr : prev));
              el.position = goTo;
              this.gamePlay.redrawPositions(this.positions);
              this.initButtons();
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
    if (this.level === 2) {
      this.positions.forEach((item) => {
        item.character.levelUp();
        item.position = this.getPlayerPosition();
      });
      const char = new PositionedCharacter(
        generateRandon(this.level),
        this.getPlayerPosition(),
      );
      this.positions.push(char);
      const enemyTeam = generateTeam(
        [Daemon, Undead, Vampire],
        4,
        this.positions.length + 1,
      );
      for (let i = 0; i < enemyTeam.length; i += 1) {
        const placedChar = new PositionedCharacter(
          enemyTeam[i],
          this.getEnemyPosition(),
        );
        this.positions.push(placedChar);
      }
      this.theme = themes.desert;
      this.gamePlay.drawUi(this.theme);
      this.gamePlay.redrawPositions(this.positions);
      this.initButtons();
    }
    if (this.level === 3) {
      this.positions.forEach((item) => {
        item.character.levelUp();
        item.position = this.getPlayerPosition();
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
      for (let i = 0; i < enemyTeam.length; i += 1) {
        const placedChar = new PositionedCharacter(
          enemyTeam[i],
          this.getEnemyPosition(),
        );
        this.positions.push(placedChar);
      }
      this.theme = themes.arctic;
      this.gamePlay.drawUi(this.theme);
      this.gamePlay.redrawPositions(this.positions);
      this.initButtons();
    }
    if (this.level === 4) {
      this.positions.forEach((item) => {
        item.character.levelUp();
        item.position = this.getPlayerPosition();
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
      for (let i = 0; i < enemyTeam.length; i += 1) {
        const placedChar = new PositionedCharacter(
          enemyTeam[i],
          this.getEnemyPosition(),
        );
        this.positions.push(placedChar);
      }
      this.theme = themes.mountain;
      this.gamePlay.drawUi(this.theme);
      this.gamePlay.redrawPositions(this.positions);
      this.initButtons();
    }
    if (this.level <= 4) {
      GamePlay.showMessage(`You won ${this.level - 1} round`);
    }
    if (this.level === 5) {
      GamePlay.showMessage('game over, you win');
      this.level = 1;
      this.theme = themes.prairie;
      this.init();
    }
  }
}
