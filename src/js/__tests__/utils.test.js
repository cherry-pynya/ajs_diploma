import { calcTileType } from '../utils';

const boardSize = 8;

test('0', () => {
  expect(calcTileType(0, boardSize)).toBe('top-left');
});

test('7', () => {
  expect(calcTileType(7, boardSize)).toBe('top-right');
});

test('63', () => {
  expect(calcTileType(63, boardSize)).toBe('bottom-right');
});

test('56', () => {
  expect(calcTileType(56, boardSize)).toBe('bottom-left');
});
test('1-6', () => {
  for (let i = 1; i <= 6; i += 1) {
    expect(calcTileType(i, boardSize)).toBe('top');
  }
});

test('57-62', () => {
  for (let i = 57; i <= 62; i += 1) {
    expect(calcTileType(i, boardSize)).toBe('bottom');
  }
});

test('left', () => {
  expect(calcTileType(8, boardSize)).toBe('left');
});

test('left', () => {
  expect(calcTileType(16, boardSize)).toBe('left');
});

test('left', () => {
  expect(calcTileType(32, boardSize)).toBe('left');
});

test('right', () => {
  expect(calcTileType(15, boardSize)).toBe('right');
});

test('right', () => {
  expect(calcTileType(23, boardSize)).toBe('right');
});

test('right', () => {
  expect(calcTileType(39, boardSize)).toBe('right');
});

test('center', () => {
  expect(calcTileType(30, boardSize)).toBe('center');
});

test('center', () => {
  expect(calcTileType(25, boardSize)).toBe('center');
});

test('center', () => {
  expect(calcTileType(41, boardSize)).toBe('center');
});
