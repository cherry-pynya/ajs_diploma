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
    if (!Number.isInteger(damage) || damage < 0) {
      throw new Error('invalid damage value');
    };
    this.health -= damage;
    return this.health;
  }

  levelUp() {
    this.level += 1;
    this.health += 80;
    if (this.health > 100) this.health = 100;
    this.attack = Math.max(this.attack, ((this.attack * (1.8 - this.health)) / 100));
  }
}
