export default class Team {
  constructor(members = []) {
    this.members = members;
  }

  add(character) {
    this.members.push(character);
  }
}
