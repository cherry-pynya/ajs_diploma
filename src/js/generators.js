import Team from './Team';
/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  const randomTypes = Math.floor(Math.random() * allowedTypes.length);
  const level = Math.floor(1 + Math.random() * maxLevel);
  yield new allowedTypes[randomTypes](level);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = new Team();
  for (let i = 0; i < characterCount; i += 1) {
    const character = characterGenerator(allowedTypes, maxLevel).next().value;
    team.add(character);
  }
  return team;
}
