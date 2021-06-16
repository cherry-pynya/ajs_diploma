import Bowman from './classes/Bowman';
import Swordsman from './classes/Swordsman';
import Magician from './classes/Magician';
import Daemon from './classes/Daemon';
import Undead from './classes/Undead';
import Vampire from './classes/Vampire';
import PositionedCharacter from './PositionedCharacter';

export default function reviveChar(obj) {
  const {
    level, type, attack, health,
  } = obj.character;
  const { position } = obj;
  if (type === 'undead') {
    const char = new Undead(level);
    char.attack = attack;
    char.level = level;
    char.health = health;
    return new PositionedCharacter(char, position);
  }
  if (type === 'bowman') {
    const char = new Bowman(level);
    char.attack = attack;
    char.level = level;
    char.health = health;
    return new PositionedCharacter(char, position);
  }
  if (type === 'swordsman') {
    const char = new Swordsman(level);
    char.attack = attack;
    char.level = level;
    char.health = health;
    return new PositionedCharacter(char, position);
  }
  if (type === 'magician') {
    const char = new Magician(level);
    char.attack = attack;
    char.level = level;
    char.health = health;
    return new PositionedCharacter(char, position);
  }
  if (type === 'daemon') {
    const char = new Daemon(level);
    char.attack = attack;
    char.level = level;
    char.health = health;
    return new PositionedCharacter(char, position);
  }
  if (type === 'vampire') {
    const char = new Vampire(level);
    char.attack = attack;
    char.level = level;
    char.health = health;
    return new PositionedCharacter(char, position);
  }
  return false;
}
