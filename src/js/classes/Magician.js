import Character from './Character';

export default class Magician extends Character {
  constructor(level, type = 'magician') {
    super(level, type);
    this.attack = 40;
    this.defence = 10;
    this.range = 4;
    this.steps = 1;
  }
}
