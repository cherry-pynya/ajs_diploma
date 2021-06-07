export default class Team {
  constructor(members = []) {
    this.members = members;
  }

  add(character) {
    this.members.push(character);
  }

  [Symbol.iterator]() {
    const { members } = this;
    let index = 0;
    return {
      next() {
        if (index <= members.length) {
          const val = members[index];
          index += 1;
          return {
            value: val,
            done: false,
          };
        }
        return { done: true };
      },
    };
  }
}
