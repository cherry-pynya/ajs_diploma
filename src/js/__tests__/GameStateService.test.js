import GameStateService from '../GameStateService';

test('GameStateService load test', () => {
  const state = new GameStateService(localStorage);
  state.save({ 1: 1 });
  const result = state.load();
  expect(result).toEqual({ 1: 1 });
});
