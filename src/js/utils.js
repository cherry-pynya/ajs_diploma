/* eslint-disable no-param-reassign */
export function calcTileType(index, boardSize) {
  if (index === 0) {
    return 'top-left';
  }
  if (index === boardSize - 1) {
    return 'top-right';
  }
  if (index === boardSize ** 2 - boardSize) {
    return 'bottom-left';
  }
  if (index === boardSize ** 2 - 1) {
    return 'bottom-right';
  }
  if (index > 0 && index < boardSize) {
    return 'top';
  }
  if (index > boardSize ** 2 - boardSize && index < boardSize ** 2 - 1) {
    return 'bottom';
  }
  if (index % boardSize === 0) {
    return 'left';
  }
  if (index % boardSize === 7) {
    return 'right';
  }
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

export function isEvil(char) {
  if (char.character.type === 'daemon'
  || char.character.type === 'vampire'
  || char.character.type === 'undead') return true;
  return false;
}

export function isOrder(char) {
  if (char.character.type === 'magician'
  || char.character.type === 'swordsman'
  || char.character.type === 'bowman') return true;
  return false;
}

export function convertToArr(index) {
  const row = Math.floor(index / 8);
  const colunm = index % 8;
  return [row, colunm];
}

export function convertToIndex(index) {
  const row = index[0];
  const column = index[1];
  return row * 8 + column;
}

export function sortPositions(arr) {
  arr.sort((a, b) => a.position - b.position);
  for (let i = 0; i < arr.length; i += 1) {
    if (arr[i + 1]) {
      if (arr[i].position === arr[i + 1].position) {
        if (isEvil(arr[i + 1])) {
          arr[i + 1].position = this.getEnemyPosition();
        }
        if (isOrder(arr[i + 1])) {
          arr[i + 1].position = this.getPlayerPosition();
        }
      }
    }
  }
  return arr;
}

export function template(char) {
  const {
    level,
    attack,
    defence,
    health,
  } = char;
  return `${'\u{1F396}'} ${level} ${'\u{2694}'} ${attack} ${'\u{1F6E1}'} ${defence} ${'\u2764'} ${health}`;
}
