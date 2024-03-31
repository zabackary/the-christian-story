import ImageComponent from "../../../framework/components/ImageComponent";
import ScrollingContainer from "../../../framework/components/ScrollingContainer";
import TimeBasedAnimationController from "../../../framework/controllers/TimeBasedAnimationController";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PIXEL_ART_SIZE } from "../../gameRoot";
import MessageComponent from "../../utils/MessageComponent";

export default function timelineScene(onComplete: () => void) {
  let scrimAnimation: TimeBasedAnimationController;
  const animations: (TimeBasedAnimationController | MessageComponent)[] = [
    new TimeBasedAnimationController("linear", 1000, 0, 0, true),
    new TimeBasedAnimationController(
      "sine",
      2500,
      240 * PIXEL_ART_SIZE,
      0,
      undefined,
      undefined,
      -1
    ).observe((x) => {
      if (x !== -1) container.setScroll(x, 0);
    }),
    new TimeBasedAnimationController("linear", 1000, 0, 0),
    new MessageComponent(
      "Back to 1400 BC...",
      "To understand what redemption is, we need to jump back over to the Old Testament. What is the Old Testament, you may ask? The Bible is split into two halves: the Old Testament, which tells the tale of Israel, God's chosen people, and the New Testament, which talks about the life of Jesus and His sacrifice on the cross.\n\nPress the check in the top right to continue."
    ),
    new MessageComponent(
      "Back to 1400 BC...",
      "In the times of the Israelites, way back in 1400 BC, we see an interesting relationship take place: from the member of a household to his/her patriarch, the oldest male in the extended family. This patriarch had a duty to *redeem* any of his family members if they were to run into trouble (like poverty or captivity) -- he would have to pay a price to free them, and bring them back into the family.\n\nPress the check in the top right to continue."
    ),
    new TimeBasedAnimationController("linear", 1000, 0, 0),
    new TimeBasedAnimationController(
      "sine",
      2500,
      0,
      240 * PIXEL_ART_SIZE,
      undefined,
      undefined,
      -1
    ).observe((x) => {
      if (x !== -1) container.setScroll(x, 0);
    }),
    new TimeBasedAnimationController("linear", 2000, 0, 0),
    new MessageComponent(
      "Over in 33 AD!",
      "Hey, a cross! Now that we know what redemption meant in the OT, we can look at the ultimate redemption in the NT through a little game!"
    ),
    new TimeBasedAnimationController("linear", 1000, 0, 0),
    (scrimAnimation = new TimeBasedAnimationController(
      "ease-in",
      2000,
      0,
      1
    ).onFinish(onComplete)),
  ];
  animations.forEach((animation, i) => {
    if (i > 0) {
      const startCurrent = () => {
        if (animation instanceof TimeBasedAnimationController) {
          animation.start();
        } else {
          setTimeout(() => animation.show(), 0);
        }
      };
      const previous = animations[i - 1];
      if (previous instanceof TimeBasedAnimationController) {
        previous.onFinish(() => {
          startCurrent();
        });
      } else {
        previous.onClose(() => {
          startCurrent();
        });
      }
    }
  });

  let container: ScrollingContainer;
  return [
    (container = new ScrollingContainer(
      [
        new ImageComponent("assets/redemption/timeline.png", {
          x: 0,
          y: 0,
          width: 360 * PIXEL_ART_SIZE,
          height: CANVAS_HEIGHT,
        }),
      ],
      { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
    ).setScroll(240 * PIXEL_ART_SIZE, 0)),
    ...animations.map((animation) =>
      animation instanceof TimeBasedAnimationController
        ? animation.listener()
        : animation
    ),
    (ctx: CanvasRenderingContext2D) => {
      const oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = oldAlpha * scrimAnimation.value;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = oldAlpha;
    },
    scrimAnimation.listener(),
  ];
}
