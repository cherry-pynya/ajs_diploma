import Character from './Character';

export default class Bowman extends Character {
  constructor(level, type = 'bowman') {
    super(level, type);
    this.attack = 25;
    this.defence = 25;
    this.range = 2;
    this.steps = 2;
  }
}
