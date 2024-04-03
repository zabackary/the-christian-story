import { Rect } from "../../../framework/components/Component";
import Container from "../../../framework/components/Container";
import ImageComponent from "../../../framework/components/ImageComponent";
import ScrollingContainer from "../../../framework/components/ScrollingContainer";
import TimeBasedAnimationController from "../../../framework/controllers/TimeBasedAnimationController";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FONT,
  PIXEL_ART_SIZE,
} from "../../gameRoot";
import KeyboardSimplePhysicsController from "../../utils/KeyboardSimplePhysicsController";
import SeedComponent from "./SeedComponent";

export default function plantWidget(bounds: Rect) {
  let hintContainer: Container;
  let congratsContainer: Container;
  let characterContainer: Container;
  let scroller: ScrollingContainer;
  let seeds: SeedComponent;
  const hintOpacityAnimation = new TimeBasedAnimationController(
    "ease-in",
    1000,
    1,
    0
  );
  const congratsOpacityAnimation = new TimeBasedAnimationController(
    "ease-out",
    1000,
    0,
    1
  );
  const physicsController = new KeyboardSimplePhysicsController(
    {
      x: 200,
      y: 0,
      width: 15 * PIXEL_ART_SIZE,
      height: 40 * PIXEL_ART_SIZE,
    },
    {
      x: 0,
      y: 0,
      height: 79 * PIXEL_ART_SIZE,
      width: 120 * PIXEL_ART_SIZE * 2 + 62 * PIXEL_ART_SIZE,
    }
  ).observe((factor) => {
    characterContainer.setBounds(physicsController.characterHitBox);
    characterContainer.setInversionEffect(!physicsController.isFacingRight);
    seeds.setCharacterHitBox(
      physicsController.characterHitBox,
      physicsController.isFacingRight,
      physicsController.xVelocity,
      physicsController.yVelocity
    );
    const targetPosition = Math.min(
      Math.max(
        0,
        physicsController.characterHitBox.x +
          physicsController.characterHitBox.width / 2 -
          bounds.width / 2
      ),
      360 * PIXEL_ART_SIZE - bounds.width
    );
    scroller.setScroll(
      scroller.scrollX + (targetPosition - scroller.scrollX) * 0.05 * factor,
      0
    );
    physicsController.setEnableSpace(false);
    if (seeds.hasGrownSeeds() && !hintOpacityAnimation.started) {
      hintOpacityAnimation.start();
    }
    if (seeds.plantedOnHill() && !congratsOpacityAnimation.started) {
      congratsOpacityAnimation.start();
    }
  });
  hintOpacityAnimation.observe((value) => {
    hintContainer.setOpacity(value);
  });
  congratsOpacityAnimation.observe((value) => {
    congratsContainer.setOpacity(value);
  });
  return [
    new Container(
      [
        (scroller = new ScrollingContainer(
          [
            new ImageComponent("assets/creation/planting-background.png", {
              x: 0,
              y: 0,
              width: 120 * PIXEL_ART_SIZE,
              height: 120 * PIXEL_ART_SIZE,
            }),
            new ImageComponent("assets/creation/planting-background.png", {
              x: 120 * PIXEL_ART_SIZE,
              y: 0,
              width: 120 * PIXEL_ART_SIZE,
              height: 120 * PIXEL_ART_SIZE,
            }),
            new ImageComponent("assets/creation/planting-background-hill.png", {
              x: 240 * PIXEL_ART_SIZE,
              y: 0,
              width: 120 * PIXEL_ART_SIZE,
              height: 120 * PIXEL_ART_SIZE,
            }),
            (seeds = new SeedComponent(
              78 * PIXEL_ART_SIZE,
              physicsController.characterHitBox,
              true,
              0,
              0,
              120 * PIXEL_ART_SIZE * 2 + 62 * PIXEL_ART_SIZE,
              56 * PIXEL_ART_SIZE,
              120 * PIXEL_ART_SIZE * 2 + 93 * PIXEL_ART_SIZE
            )),
            (characterContainer = new Container(
              [
                new ImageComponent("assets/shared/character/standing.png", {
                  x: 0,
                  y: 0,
                  width: 15 * PIXEL_ART_SIZE,
                  height: 40 * PIXEL_ART_SIZE,
                }),
              ],
              physicsController.characterHitBox
            )),
          ],
          {
            x: 0,
            y: 0,
            width: bounds.width,
            height: bounds.height,
          }
        )),
        (hintContainer = new Container(
          [
            new ImageComponent("assets/creation/interact-hint.png", {
              width: 100 * PIXEL_ART_SIZE,
              height: 20 * PIXEL_ART_SIZE,
              x: CANVAS_WIDTH / 2 - (100 * PIXEL_ART_SIZE) / 2,
              y: CANVAS_HEIGHT - 30 * PIXEL_ART_SIZE,
            }),
            (ctx: CanvasRenderingContext2D) => {
              ctx.fillStyle = "#333";
              ctx.font = `14px ${FONT}`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(
                "God created us in His image to be caretakers of His creation.",
                bounds.width / 2,
                bounds.height - 24 * PIXEL_ART_SIZE
              );
              ctx.fillText(
                "Challenge: can you plant a tree on top of the hill by the far right sign?",
                bounds.width / 2,
                bounds.height - 16 * PIXEL_ART_SIZE
              );
              ctx.fillStyle = "#000";
              ctx.font = `24px ${FONT}`;
              ctx.fillText(
                "Press [SPACE] to plant a tree!",
                bounds.width / 2,
                bounds.height - 20 * PIXEL_ART_SIZE
              );
            },
          ],
          { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
        )),
        (congratsContainer = new Container(
          [
            new ImageComponent("assets/creation/interact-hint.png", {
              width: 100 * PIXEL_ART_SIZE,
              height: 20 * PIXEL_ART_SIZE,
              x: CANVAS_WIDTH / 2 - (100 * PIXEL_ART_SIZE) / 2,
              y: CANVAS_HEIGHT - 30 * PIXEL_ART_SIZE,
            }),
            (ctx: CanvasRenderingContext2D) => {
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#000";
              ctx.font = `24px ${FONT}`;
              ctx.fillText(
                "Wow, nice job! A brownie point for you!",
                bounds.width / 2,
                bounds.height - 20 * PIXEL_ART_SIZE
              );
            },
          ],
          { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
        )),
      ],
      bounds
    ),
    hintOpacityAnimation.listener(),
    physicsController.listener(),
    congratsOpacityAnimation.listener(),
  ];
}
