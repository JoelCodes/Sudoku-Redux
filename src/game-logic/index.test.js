import { reducer, initialState } from "./index";
import { setupGame, placeNumber, removeNumber } from "./actions";
import _ from "lodash";

const defaultGame = [
  [5, 3, , , 7, , , ,],
  [6, , , 1, 9, 5, , ,],
  [, 9, 8, , , , , 6],
  [8, , , , 6, , , , 3],
  [4, , , 8, , 3, , , 1],
  [7, , , , 2, , , , 6],
  [, 6, , , , , 2, 8],
  [, , , 4, 1, 9, , , 5],
  [, , , , 8, , , 7, 9]
];
const basicRegions = _(_.range(0, 9, 3))
  .flatMap(x => {
    return _.range(0, 9, 3).map(y => [x, y]);
  })
  .map(([startX, startY]) => {
    return _(_.range(startX, startX + 3))
      .flatMap(x => {
        return _.range(startY, startY + 3).map(y => [x, y]);
      })
      .value();
  })
  .value();

describe("game logic", () => {
  describe("reducer", () => {
    describe("setupGame", () => {
      it("takes in sizes, starting numbers, and regions, returning a grid", () => {
        const setupMove = reducer(
          initialState,
          setupGame(defaultGame, basicRegions)
        );
        expect(setupMove.grid.length).toBe(9);
        expect(setupMove.grid[0].length).toBe(9);
        expect(setupMove.grid[0][0].number).toBe(5);
        expect(setupMove.grid[0][0].static).toBeTruthy();
        expect(setupMove.grid[0][3].number).toBeUndefined();
        expect(setupMove.grid[0][3].static).toBeFalsy();
        for (const row of setupMove.grid) {
          for (const cell of row) {
            expect(cell.hints).toEqual([]);
            expect(cell.conflicts).toEqual([]);
          }
        }
        expect(setupMove.regions.length).toBe(9);
        const regionWith43 = setupMove.regions.find(region =>
          region.some(point => point[0] === 4 && point[1] === 3)
        );
        expect(regionWith43).toContainEqual([3, 4]);
      });
    });
    describe("placeNumber", () => {
      const basicGame = reducer(
        initialState,
        setupGame(defaultGame, basicRegions)
      );

      it("changes a number", () => {
        const afterMove = reducer(basicGame, placeNumber(2, [0, 2]));
        expect(afterMove.grid[0][2].number).toBe(2);
      });
      it("ignores a static square", () => {
        const afterMove = reducer(basicGame, placeNumber(2, [0, 0]));
        expect(afterMove).toEqual(basicGame);
      });
      it("recognizes a complete puzzle");
      it("marks a row conflict", () => {
        const afterMove = reducer(basicGame, placeNumber(5, [0, 8]));
        expect(afterMove.grid[0][0].conflicts).toContainEqual([0, 8]);
        expect(afterMove.grid[0][8].number).toBe(5);
        expect(afterMove.grid[0][8].conflicts).toContainEqual([0, 0]);
      });

      it("marks a column conflict", () => {
        const afterMove = reducer(basicGame, placeNumber(5, [8, 0]));
        expect(afterMove.grid[0][0].conflicts).toContainEqual([8, 0]);
        expect(afterMove.grid[8][0].number).toBe(5);
        expect(afterMove.grid[8][0].conflicts).toContainEqual([0, 0]);
      });
      it("marks a region conflict", () => {
        const afterMove = reducer(basicGame, placeNumber(3, [2, 0]));
        expect(afterMove.grid[0][1].conflicts).toContainEqual([2, 0]);
        expect(afterMove.grid[2][0].number).toBe(3);
        expect(afterMove.grid[2][0].conflicts).toContainEqual([0, 1]);
      });
      it("clears conflicts if possible", () => {
        const conflict = reducer(basicGame, placeNumber(3, [2, 0]));
        const withoutConflict = reducer(conflict, placeNumber(1, [2, 0]));
        expect(withoutConflict.grid[0][1].conflicts).not.toContainEqual([2, 0]);
        expect(withoutConflict.grid[2][0].conflicts).not.toContainEqual([0, 1]);
      });
    });
    describe("removeNumber", () => {
      const basicGame = reducer(
        initialState,
        setupGame(defaultGame, basicRegions)
      );

      it("removes a value", () => {
        const afterMove = reducer(basicGame, placeNumber(2, [0, 2]));
        const afterRemove = reducer(afterMove, removeNumber([0, 2]));
        expect(afterRemove.grid[0][2].number).toBeUndefined();
      });
      it("ignores a static value", () => {
        const afterRemove = reducer(basicGame, removeNumber([0, 0]));
        expect(afterRemove).toBe(basicGame);
      });
      it("clears a conflict if possible", () => {
        const conflict = reducer(basicGame, placeNumber(3, [2, 0]));
        const afterRemove = reducer(conflict, removeNumber([2, 0]));
        expect(afterRemove.grid[0][1].conflicts).not.toContainEqual([2, 0]);
        expect(afterRemove.grid[2][0].conflicts).toEqual([]);
      });
    });
    describe("addHint");
    describe("removeHint");
    describe("reset");
  });
});
