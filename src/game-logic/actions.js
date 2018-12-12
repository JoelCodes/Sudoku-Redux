import { SETUP_GAME, PLACE_NUMBER, REMOVE_NUMBER } from "./types";

export function setupGame(defaults, regions) {
  return { type: SETUP_GAME, defaults, regions };
}
export function placeNumber(number, square) {
  return { type: PLACE_NUMBER, number, square };
}

export function removeNumber(square) {
  return { type: REMOVE_NUMBER, square };
}
