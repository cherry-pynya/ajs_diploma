import { template } from '../utils';

const values = [['mage 1', {
  level: 3,
  type: 'magician',
  health: 50,
  attack: 40,
  defence: 10,
  range: 4,
  steps: 1,
}, '🎖 3 ⚔ 40 🛡 10 ❤ 50'], ['undead 1', {
  level: 2,
  type: 'undead',
  health: 50,
  attack: 40,
  defence: 10,
  range: 1,
  steps: 4,
}, '🎖 2 ⚔ 40 🛡 10 ❤ 50'], ['demon 1', {
  level: 4,
  type: 'daemon',
  health: 50,
  attack: 10,
  defence: 40,
  range: 4,
  steps: 1,
}, '🎖 4 ⚔ 10 🛡 40 ❤ 50'], ['undead 2', {
  level: 2,
  type: 'undead',
  health: 50,
  attack: 40,
  defence: 10,
  range: 1,
  steps: 4,
}, '🎖 2 ⚔ 40 🛡 10 ❤ 50'],
];

describe('testing', () => {
  test.each(values)('if %s returns template', (_, value, expected) => {
    const result = template(value);
    expect(result).toBe(expected);
  });
});
