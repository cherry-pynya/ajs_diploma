function convertIndex(index) {
  if (Array.isArray(index)) {
    const row = index[0];
    const column = index[1];
    return row * 8 + column;
  }
  const row = Math.floor(index / 8);
  const colunm = index % 8;
  return [row, colunm];
}

test('9', () => {
  const a = convertIndex([1, 1]);
  expect(a).toBe(9);
});

test('31', () => {
  const a = convertIndex([3, 7]);
  expect(a).toBe(31);
});

test('[1, 1]', () => {
  const a = convertIndex(9);
  expect(a).toEqual([1, 1]);
});
