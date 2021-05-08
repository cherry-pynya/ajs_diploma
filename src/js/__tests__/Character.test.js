import Character from '../Character';
import Magician from '../classes/Magician';

test('call with new Character()', () => {
  expect(() => {
    const char = new Character();
  }).toThrowError('Character must be calleb throug child');
});

test('call Magician', () => {
  const mage = new Magician();
  expect(mage).toEqual({
    attack: 40,
    defence: 10,
    health: 50,
    level: undefined,
    range: 4,
    steps: 1,
    type: 'magician',
  });
});
