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
