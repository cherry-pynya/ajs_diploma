import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level, type = 'swordsman') {
    super(level, type);
    this.attack = 25;
    this.defence = 25;
    this.range = 1;
    this.steps = 4;
  }
}
