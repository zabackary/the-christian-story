import creation from "./levels/creation";
import fall from "./levels/fall";
import levelSelect from "./levels/levelSelect";
import redemption from "./levels/redemption";
import restoration from "./levels/restoration";
import StateRecreationMatch from "./utils/StateRecreationMatch";

export const PIXEL_ART_SIZE = 6;
export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 720;
export const FONT = '"Pixelify Sans"';
export const PROSE_FONT = '"Old Standard TT"';

export default function gameRoot() {
  const level = "select";
  let match: StateRecreationMatch;
  let hasOpened = false;
  return [
    (match = new StateRecreationMatch(
      {
        select: () =>
          levelSelect((id) => {
            match.set(id);
            hasOpened = true;
          }, hasOpened),
        creation: () =>
          creation(() => {
            match.set("select");
          }),
        fall: () =>
          fall(() => {
            match.set("select");
          }),
        redemption: () =>
          redemption(() => {
            match.set("select");
          }),
        restoration: () =>
          restoration(() => {
            match.set("select");
          }),
      },
      level
    )),
  ];
}
