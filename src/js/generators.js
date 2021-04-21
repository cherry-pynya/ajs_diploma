import Team from './Team';
/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  const randomTypes = Math.floor(Math.random() * allowedTypes.length);
  const level = Math.floor(1 + Math.random() * maxLevel);
  yield new allowedTypes[randomTypes](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = new Team();
  for (let i = 0; i < characterCount; i += 1) {
    const character = characterGenerator(allowedTypes, maxLevel).next().value;
    team.add(character);
  }
  return team;
}

function countMoves(char) {
  if (char.character.type === 'swordsman' || char.character.type === 'undead') {
    return 4;
  }
  if (char.character.type === 'bowman' || char.character.type === 'vampire') {
    return 2;
  }
  if (char.character.type === 'magician' || char.character.type === 'daemon') {
    return 1;
  }
}

function createBoard(boardSize) {
  const arr = [];
  for (let i = 0; i < boardSize ** 2; i += 1) {
    arr.push(i);
  }
  return arr;
}

export function possibleMovements(char, boardSize = 8) {
  const moves = countMoves(char);
  console.log(moves);
  const currentPosition = char.position;
  const possiblePositions = [];
  const board = createBoard(boardSize);
  for (let i = 0; i <= board.length; i += 1) {
    if (i < currentPosition && i >= currentPosition - moves) {
      possiblePositions.push(i);
    }
    if (i > currentPosition && i <= currentPosition + moves) {
      possiblePositions.push(i);
    }
    //if (i < currentPosition && i <= currentPosition - moves) {
    //  possiblePositions.push(i);
    //}
    //if (i > currentPosition && i <= currentPosition + moves) {
    //  possiblePositions.push(i);
    //}
  }
  return possiblePositions;
}
