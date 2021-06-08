/* eslint-disable guard-for-in */
/* eslint-disable consistent-return */
import Bowman from './classes/Bowman';
import Magician from './classes/Magician';
import Swordsman from './classes/Swordsman';
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
  return team.members;
}

function randomNum(a, b) {
  const min = Math.ceil(a);
  const max = Math.floor(b);
  return Math.floor(Math.random() * (max - min)) + min;
}

function choseLevel(a) {
  if (a === 2) return randomNum(1, 2);
  if (a === 3) return randomNum(1, 3);
  if (a === 4) return randomNum(1, 4);
}

export function generateRandon(level) {
  const char = randomNum(1, 4);
  const charLevevel = choseLevel(level);
  if (char === 1) {
    return new Bowman(charLevevel);
  }
  if (char === 2) {
    return new Magician(charLevevel);
  }
  if (char === 3) {
    return new Swordsman(charLevevel);
  }
}
