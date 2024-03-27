import { PIXEL_ART_SIZE } from "../gameRoot";
import labeledImageButton from "../utils/labeledImageButton";

export default function redemption(onComplete: () => void) {
  return [
    labeledImageButton(
      "assets/level-select/down.png",
      "assets/level-select/down-pressed.png",
      (_ctx) => {},
      () => {
        onComplete();
      },
      {
        x: 0,
        y: 0,
        width: 5 * PIXEL_ART_SIZE,
        height: 5 * PIXEL_ART_SIZE,
      }
    ),
  ];
}
