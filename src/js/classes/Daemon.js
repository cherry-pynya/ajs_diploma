import Character from './Character';

export default class Daemon extends Character {
  constructor(level, type = 'daemon') {
    super(level, type, 10);
    this.defence = 40;
    this.range = 4;
    this.steps = 1;
  }
}
