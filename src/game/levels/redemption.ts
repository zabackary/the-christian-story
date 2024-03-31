import { Match } from "../../framework/components/conditionals";
import { PIXEL_ART_SIZE } from "../gameRoot";
import labeledImageButton from "../utils/labeledImageButton";
import crossAnimationScene from "./redemption/crossAnimationScene";
import rocksGameScene from "./redemption/rocksGameScene";
import timelineScene from "./redemption/timelineScene";

export default function redemption(onComplete: () => void) {
  let sceneSwitcher: Match;
  return [
    (sceneSwitcher = new Match(
      {
        timelineScene: timelineScene(() => {
          sceneSwitcher.set("rocksGameScene");
        }),
        rocksGameScene: rocksGameScene(() => {
          sceneSwitcher.set("crossAnimationScene");
        }),
        crossAnimationScene: crossAnimationScene(onComplete),
      },
      "timelineScene"
    )),
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
