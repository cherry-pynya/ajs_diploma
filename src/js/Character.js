export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: throw error if user use "new Character()"
    if (new.target === Character) throw new Error('Character must be calleb throug child');
  }

  vounded(damage) {
    this.health -= damage;
    return this.health;
  }
}