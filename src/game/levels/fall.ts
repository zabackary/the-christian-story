import { PIXEL_ART_SIZE } from "../gameRoot";
import labeledImageButton from "../utils/labeledImageButton";
import outsideScene from "./fall/outsideScene";

export default function fall(onComplete: () => void) {
  return [
    outsideScene(() => {
      onComplete();
    }),
    labeledImageButton(
      "assets/shared/home.png",
      "assets/shared/home-pressed.png",
      (_ctx) => {},
      () => {
        onComplete();
      },
      {
        x: 12,
        y: 12,
        width: 8 * PIXEL_ART_SIZE,
        height: 8 * PIXEL_ART_SIZE,
      }
    ),
  ];
}
