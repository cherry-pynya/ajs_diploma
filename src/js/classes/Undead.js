import Character from './Character';

export default class Undead extends Character {
  constructor(level, type = 'undead') {
    super(level, type, 40);
    this.defence = 10;
    this.range = 1;
    this.steps = 4;
  }
}
