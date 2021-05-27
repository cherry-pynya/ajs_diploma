import Character from './Character';

export default class Vampire extends Character {
  constructor(level, type = 'vampire') {
    super(level, type, 25);
    this.defence = 25;
    this.range = 2;
    this.steps = 2;
  }
}
