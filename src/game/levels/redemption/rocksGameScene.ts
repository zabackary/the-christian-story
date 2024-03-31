import Container from "../../../framework/components/Container";
import ImageComponent from "../../../framework/components/ImageComponent";
import InitialUpdateSideEffectController from "../../../framework/controllers/InitialUpdateSideEffectController";
import TimeBasedAnimationController from "../../../framework/controllers/TimeBasedAnimationController";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FONT,
  PIXEL_ART_SIZE,
} from "../../gameRoot";
import labeledImageButton from "../../utils/labeledImageButton";
import RockPhysicsComponent, { SCORE_MULTIPLIER } from "./RockPhysicsComponent";

export default function rocksGameScene(onComplete: () => void) {
  let hintContainer: Container;
  let gameHintContainer: Container;
  let rocks: RockPhysicsComponent;
  let loseScreen: Container;

  const hintOpacityAnimation = new TimeBasedAnimationController(
    "ease-in",
    1000,
    1,
    0
  ).observe((value) => {
    hintContainer.setOpacity(value);
  });
  const gameHintOpacityStartAnimation = new TimeBasedAnimationController(
    "ease-out",
    1000,
    0,
    1,
    undefined,
    undefined,
    -1
  ).observe((value) => {
    if (value !== -1) gameHintContainer.setOpacity(value);
  });
  const gameHintOpacityEndAnimation = new TimeBasedAnimationController(
    "ease-in",
    1000,
    1,
    0,
    undefined,
    undefined,
    -1
  ).observe((value) => {
    if (value !== -1) gameHintContainer.setOpacity(value);
  });
  const loseScreenStartAnimation = new TimeBasedAnimationController(
    "ease-out",
    1000,
    0,
    1,
    undefined,
    undefined,
    -1
  ).observe((value) => {
    if (value !== -1) {
      loseScreen.setOpacity(value);
      loseScreen.setDisableChildUpdates(value !== 1);
    }
  });
  const loseScreenEndAnimation = new TimeBasedAnimationController(
    "ease-in",
    500,
    1,
    0,
    undefined,
    undefined,
    -1
  ).observe((value) => {
    if (value !== -1) {
      loseScreen.setOpacity(value);
      loseScreen.setDisableChildUpdates(value !== 1);
    }
  });
  const scrimAnimation = new TimeBasedAnimationController(
    "ease-out",
    2000,
    1,
    0,
    true
  );
  return [
    new InitialUpdateSideEffectController(() => {
      setTimeout(() => {
        hintOpacityAnimation.start();
        setTimeout(() => {
          gameHintOpacityStartAnimation.start();
          setTimeout(() => {
            gameHintOpacityEndAnimation.start();
          }, 3000);
        }, 1000);
      }, 3000);
    }).listener(),
    new ImageComponent("assets/redemption/background.png", {
      x: 0,
      y: 0,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    }),
    (rocks = new RockPhysicsComponent(95 * PIXEL_ART_SIZE).onDie(() => {
      loseScreenStartAnimation.start();
    })),
    (hintContainer = new Container(
      [
        new ImageComponent("assets/creation/interact-hint.png", {
          width: 100 * PIXEL_ART_SIZE,
          height: 20 * PIXEL_ART_SIZE,
          x: CANVAS_WIDTH / 2 - (100 * PIXEL_ART_SIZE) / 2,
          y: CANVAS_HEIGHT - 30 * PIXEL_ART_SIZE,
        }),
        (ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = "#000";
          ctx.font = `24px ${FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            "In our fallen world, we are constantly being",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 22 * PIXEL_ART_SIZE
          );
          ctx.fillText(
            "crushed by sin, in this case, literally.",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 18 * PIXEL_ART_SIZE
          );
        },
      ],
      { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
    )),
    (gameHintContainer = new Container(
      [
        new ImageComponent("assets/creation/interact-hint.png", {
          width: 100 * PIXEL_ART_SIZE,
          height: 20 * PIXEL_ART_SIZE,
          x: CANVAS_WIDTH / 2 - (100 * PIXEL_ART_SIZE) / 2,
          y: CANVAS_HEIGHT - 30 * PIXEL_ART_SIZE,
        }),
        (ctx: CanvasRenderingContext2D) => {
          ctx.fillStyle = "#000";
          ctx.font = `24px ${FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            "Dodge the rocks. You can shove them out of the",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 22 * PIXEL_ART_SIZE
          );
          ctx.fillText(
            "way, but eventually, you won't be able to.",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 18 * PIXEL_ART_SIZE
          );
        },
      ],
      { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
    )).setOpacity(0),
    (loseScreen = new Container(
      [
        (ctx: CanvasRenderingContext2D) => {
          const oldAlpha = ctx.globalAlpha;
          ctx.globalAlpha = oldAlpha * 0.8;
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.globalAlpha = oldAlpha;

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#ddd";
          ctx.font = `24px ${FONT}`;
          ctx.fillText(
            `Final score: ${rocks.score * SCORE_MULTIPLIER}  High score: ${
              rocks.hiScore * SCORE_MULTIPLIER
            }`,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 - 74
          );
          ctx.fillStyle = "#fff";
          ctx.font = `32px ${FONT}`;
          ctx.fillText(
            "You perished under the weight of your sins,",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2 - 36
          );
          ctx.fillText(
            "but there's still hope to be redeemed.",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2
          );
        },
        labeledImageButton(
          "assets/redemption/button.png",
          "assets/redemption/button-pressed.png",
          (ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = "#fff";
            ctx.font = `24px ${FONT}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              "Play again",
              (36 * PIXEL_ART_SIZE) / 2,
              (12 * PIXEL_ART_SIZE) / 2
            );
          },
          () => {
            loseScreenEndAnimation.start();
            rocks.reset();
          },
          {
            x: CANVAS_WIDTH / 2 - 40 * PIXEL_ART_SIZE,
            y: CANVAS_HEIGHT / 2 + 6 * PIXEL_ART_SIZE,
            width: 36 * PIXEL_ART_SIZE,
            height: 12 * PIXEL_ART_SIZE,
          }
        ),
        labeledImageButton(
          "assets/redemption/button.png",
          "assets/redemption/button-pressed.png",
          (ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = "#a00";
            ctx.font = `24px ${FONT}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              "Continue on",
              (36 * PIXEL_ART_SIZE) / 2,
              (12 * PIXEL_ART_SIZE) / 2
            );
          },
          async () => {
            loseScreenEndAnimation.start();
            await rocks.playBigRocksAnimation();
            onComplete();
          },
          {
            x: CANVAS_WIDTH / 2 + 4 * PIXEL_ART_SIZE,
            y: CANVAS_HEIGHT / 2 + 6 * PIXEL_ART_SIZE,
            width: 36 * PIXEL_ART_SIZE,
            height: 12 * PIXEL_ART_SIZE,
          }
        ),
      ],
      { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
    ).setOpacity(0)),
    (ctx: CanvasRenderingContext2D) => {
      const oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = oldAlpha * scrimAnimation.value;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = oldAlpha;
    },
    scrimAnimation.listener(),
    hintOpacityAnimation.listener(),
    gameHintOpacityStartAnimation.listener(),
    gameHintOpacityEndAnimation.listener(),
    loseScreenStartAnimation.listener(),
    loseScreenEndAnimation.listener(),
  ];
}
