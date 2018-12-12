import { createReducer } from "redux-create-reducer";
import { SETUP_GAME, PLACE_NUMBER, REMOVE_NUMBER } from "./types";
import produce from "immer";

export const initialState = {};
function setupGameReducer(state, { defaults, regions }) {
  return {
    ...state,
    regions,
    grid: [...new Array(9)].map((a, x) => {
      return [...new Array(9)].map((a, y) => {
        if (defaults[x][y]) {
          return {
            number: defaults[x][y],
            hints: [],
            conflicts: [],
            static: true
          };
        }
        return { hints: [], conflicts: [] };
      });
    })
  };
}

function placeNumberReducer(state, { number, square: [x, y] }) {
  return produce(state, draft => {
    const square = draft.grid[x][y];
    if (square.static || square.number === number) {
      return;
    }
    for (const [cx, cy] of square.conflicts || []) {
      const otherSquare = draft.grid[cx][cy];
      otherSquare.conflicts = otherSquare.conflicts.filter(
        ([px, py]) => px !== x || py !== y
      );
    }
    const conflicts = [];
    for (let i = 0; i < 9; i++) {
      const rowSquare = draft.grid[x][i];
      if (i !== y && rowSquare.number === number) {
        rowSquare.conflicts = [...rowSquare.conflicts, [x, y]];
        conflicts.push([x, i]);
      }
    }
    for (let i = 0; i < 9; i++) {
      const colSquare = draft.grid[i][y];
      if (i !== x && colSquare.number === number) {
        colSquare.conflicts = [...colSquare.conflicts, [x, y]];
        conflicts.push([i, y]);
      }
    }
    const region = draft.regions.find(region =>
      region.some(p => p[0] === x && p[1] === y)
    );
    for (const point of region.filter(([px, py]) => px !== x || py !== y)) {
      const [px, py] = point;
      const regSquare = draft.grid[px][py];
      if (regSquare.number === number) {
        regSquare.conflicts = [...regSquare.conflicts, [x, y]];
        conflicts.push(point);
      }
    }
    square.number = number;

    square.conflicts = conflicts;
  });
}

function removeNumberReducer(state, { square: [x, y] }) {
  return produce(state, draft => {
    const square = draft.grid[x][y];
    if (square.static) return;
    for (const [cx, cy] of square.conflicts) {
      const conflictSquare = draft.grid[cx][cy];
      conflictSquare.conflicts = square.conflicts.filter(
        ([cx, cy]) => cx !== x || cy !== y
      );
    }
    delete square.number;
    square.conflicts = [];
  });
}
export const reducer = createReducer(initialState, {
  [SETUP_GAME]: setupGameReducer,
  [PLACE_NUMBER]: placeNumberReducer,
  [REMOVE_NUMBER]: removeNumberReducer
});
