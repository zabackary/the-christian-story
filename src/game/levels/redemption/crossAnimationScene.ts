import Container from "../../../framework/components/Container";
import ImageComponent from "../../../framework/components/ImageComponent";
import TimeBasedAnimationController from "../../../framework/controllers/TimeBasedAnimationController";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PIXEL_ART_SIZE } from "../../gameRoot";
import MessageComponent from "../../utils/MessageComponent";
import {
  BIG_ROCK_HEIGHT,
  BIG_ROCK_VIRTUAL_HEIGHT,
  BIG_ROCK_WIDTHS,
} from "./RockPhysicsComponent";

export default function crossAnimationScene(onComplete: () => void) {
  let scrimAnimation: TimeBasedAnimationController;
  let cross: ImageComponent;
  let spotlightBackground: Container;
  let tombContainer: Container;
  let tombRockContainer: Container;
  let person: ImageComponent;

  const animations: (TimeBasedAnimationController | MessageComponent)[] = [
    new TimeBasedAnimationController("linear", 1, 0, 0, true),
    new MessageComponent(
      "So where's the hope?",
      "The truth of the Christian gospel is the hope that redemption and restoration bring.\n\nPress the check to continue."
    ),
    new TimeBasedAnimationController("linear", 2000, 0, 0),
    new TimeBasedAnimationController("ease-out", 2000, 0, 1).observe(
      (opacity) => {
        spotlightBackground.setOpacity(opacity);
        tombContainer.setOpacity(opacity);
      }
    ),
    new TimeBasedAnimationController("linear", 1500, 0, 0),
    new TimeBasedAnimationController(
      "ease-in-out",
      1000,
      0,
      30 * PIXEL_ART_SIZE
    ).observe((height) => {
      cross.setBounds({
        x: CANVAS_WIDTH / 2 - 10 * PIXEL_ART_SIZE,
        y: 4 * PIXEL_ART_SIZE + 30 * PIXEL_ART_SIZE - height,
        width: 20 * PIXEL_ART_SIZE,
        height,
      });
    }),
    new TimeBasedAnimationController("linear", 1500, 0, 0),
    new MessageComponent(
      "Redemption",
      "Recall what redemption meant before Jesus' time. For the Israelites, redemption meant that a person was brought back into their family with a *price*.\nJesus Christ was the ultimate price that was paid. Jesus Christ, the one and only son of God, came down to Earth as both man and God and died on the cross to pay the price for all our sins. This is the ultimate sacrifice, outweighing all of our transgressions and bringing us back into God's family."
    ),
    new TimeBasedAnimationController("linear", 1000, 0, 0),
    new TimeBasedAnimationController("ease-in-out", 1000, 0, 1).observe(
      (progress) => {
        tombRockContainer.setBounds({
          x:
            CANVAS_WIDTH / 2 -
            10 * PIXEL_ART_SIZE +
            progress * 20 * PIXEL_ART_SIZE,
        });
        // total turn radians = 2 * pi * (20 / (2 * pi * 10))
        tombRockContainer.setRotation(progress * 2);
      }
    ),
    new TimeBasedAnimationController(
      "ease-out",
      1000,
      50 * PIXEL_ART_SIZE,
      26 * PIXEL_ART_SIZE
    ).observe((y) => {
      person.setBounds({
        y,
      });
    }),
    new TimeBasedAnimationController("linear", 1000, 0, 0),
    new MessageComponent(
      "Redemption",
      "But not only that, He defeated death by rising from the grave. Three days later, Jesus rose from the dead, appearing to his disciples, and bringing healing to His creation and eternal life for the sons and daughters of God's family."
    ),
    new TimeBasedAnimationController("linear", 3000, 0, 0),
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

  return [
    new ImageComponent("assets/redemption/background.png", {
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    }),
    (spotlightBackground = new Container(
      [
        new ImageComponent("assets/redemption/background-spotlight.png", {
          x: 0,
          y: 0,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }),
      ],
      {
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }
    ).setOpacity(0)),
    new ImageComponent("assets/redemption/bigrock1.png", {
      x: CANVAS_WIDTH / 2 - (BIG_ROCK_WIDTHS[0] * PIXEL_ART_SIZE) / 2,
      y: 95 * PIXEL_ART_SIZE - BIG_ROCK_VIRTUAL_HEIGHT * PIXEL_ART_SIZE,
      width: BIG_ROCK_WIDTHS[0] * PIXEL_ART_SIZE,
      height: BIG_ROCK_HEIGHT * PIXEL_ART_SIZE,
    }),
    new ImageComponent("assets/redemption/bigrock2.png", {
      x: CANVAS_WIDTH / 2 - (BIG_ROCK_WIDTHS[1] * PIXEL_ART_SIZE) / 2,
      y: 95 * PIXEL_ART_SIZE - BIG_ROCK_VIRTUAL_HEIGHT * PIXEL_ART_SIZE * 2,
      width: BIG_ROCK_WIDTHS[1] * PIXEL_ART_SIZE,
      height: BIG_ROCK_HEIGHT * PIXEL_ART_SIZE,
    }),
    new ImageComponent("assets/redemption/bigrock3.png", {
      x: CANVAS_WIDTH / 2 - (BIG_ROCK_WIDTHS[2] * PIXEL_ART_SIZE) / 2,
      y: 95 * PIXEL_ART_SIZE - BIG_ROCK_VIRTUAL_HEIGHT * PIXEL_ART_SIZE * 3,
      width: BIG_ROCK_WIDTHS[2] * PIXEL_ART_SIZE,
      height: BIG_ROCK_HEIGHT * PIXEL_ART_SIZE,
    }),
    new ImageComponent("assets/redemption/bigrock4.png", {
      x: CANVAS_WIDTH / 2 - (BIG_ROCK_WIDTHS[3] * PIXEL_ART_SIZE) / 2,
      y: 95 * PIXEL_ART_SIZE - BIG_ROCK_VIRTUAL_HEIGHT * PIXEL_ART_SIZE * 4,
      width: BIG_ROCK_WIDTHS[3] * PIXEL_ART_SIZE,
      height: BIG_ROCK_HEIGHT * PIXEL_ART_SIZE,
    }),
    (cross = new ImageComponent("assets/redemption/cross.png", {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    })),
    (tombContainer = new Container(
      [
        new ImageComponent("assets/redemption/tomb.png", {
          x: CANVAS_WIDTH / 2 - 10 * PIXEL_ART_SIZE,
          y: 77 * PIXEL_ART_SIZE,
          width: 20 * PIXEL_ART_SIZE,
          height: 20 * PIXEL_ART_SIZE,
        }),
        new Container(
          [
            (person = new ImageComponent(
              "assets/shared/character/standing.png",
              {
                x: 0,
                y: 50 * PIXEL_ART_SIZE,
                width: 9 * PIXEL_ART_SIZE,
                height: 24 * PIXEL_ART_SIZE,
              }
            )),
          ],
          {
            x: CANVAS_WIDTH / 2 - 5 * PIXEL_ART_SIZE,
            y: 47 * PIXEL_ART_SIZE,
            width: 9 * PIXEL_ART_SIZE,
            height: 50 * PIXEL_ART_SIZE,
          }
        ),
        (tombRockContainer = new Container(
          [
            new ImageComponent("assets/redemption/tomb-rock.png", {
              x: 0,
              y: 0,
              width: 20 * PIXEL_ART_SIZE,
              height: 20 * PIXEL_ART_SIZE,
            }),
          ],
          {
            x: CANVAS_WIDTH / 2 - 10 * PIXEL_ART_SIZE,
            y: 77 * PIXEL_ART_SIZE,
            width: 20 * PIXEL_ART_SIZE,
            height: 20 * PIXEL_ART_SIZE,
          }
        )),
      ],
      {
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }
    )),
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
