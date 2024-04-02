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
import InteractiveGameComponent from "../../utils/InteractiveGameComponent";
import KeyboardSimplePhysicsController from "../../utils/KeyboardSimplePhysicsController";
import MessageComponent from "../../utils/MessageComponent";

export default function hallScene(onComplete: () => void) {
  let container: ScrollingContainer;
  let characterContainer: Container;
  let helpMsg: MessageComponent;
  let helpSign: InteractiveGameComponent;
  let hintContainer: Container;
  let lovePicture: InteractiveGameComponent;
  let loveMsg: MessageComponent;
  let exNihiloPicture: InteractiveGameComponent;
  let exNihiloMsg: MessageComponent;
  let door: InteractiveGameComponent;

  const scrimAnimation = new TimeBasedAnimationController(
    "ease-out",
    2000,
    0,
    1
  ).onFinish(onComplete);
  const hintOpacityAnimation = new TimeBasedAnimationController(
    "ease-in",
    1000,
    1,
    0
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
      y: 35 * PIXEL_ART_SIZE,
      height: 48 * PIXEL_ART_SIZE,
      width: 120 * PIXEL_ART_SIZE * 3,
    }
  ).observe((factor) => {
    characterContainer.setBounds(physicsController.characterHitBox);
    characterContainer.setInversionEffect(!physicsController.isFacingRight);
    const targetPosition = Math.min(
      Math.max(
        0,
        physicsController.characterHitBox.x +
          physicsController.characterHitBox.width / 2 -
          CANVAS_WIDTH / 2
      ),
      360 * PIXEL_ART_SIZE - CANVAS_WIDTH
    );
    container.setScroll(
      container.scrollX + (targetPosition - container.scrollX) * 0.05 * factor,
      0
    );
    helpSign.updatePlayerPosition(physicsController.characterHitBox);
    exNihiloPicture.updatePlayerPosition(physicsController.characterHitBox);
    lovePicture.updatePlayerPosition(physicsController.characterHitBox);
    door.updatePlayerPosition(physicsController.characterHitBox);
    physicsController.setEnableSpace(
      !helpSign.isHighlighted &&
        !exNihiloPicture.isHighlighted &&
        !lovePicture.isHighlighted &&
        !door.isHighlighted
    );
    if (!helpSign.isHighlighted && !hintOpacityAnimation.started) {
      hintOpacityAnimation.start();
    }
  });
  hintOpacityAnimation.observe((value) => {
    hintContainer.setOpacity(value);
  });
  return [
    (container = new ScrollingContainer(
      [
        new ImageComponent("assets/creation/hallway-background.png", {
          x: 0,
          y: 0,
          width: 120 * PIXEL_ART_SIZE,
          height: 120 * PIXEL_ART_SIZE,
        }),
        new ImageComponent("assets/creation/hallway-background.png", {
          x: 120 * PIXEL_ART_SIZE,
          y: 0,
          width: 120 * PIXEL_ART_SIZE,
          height: 120 * PIXEL_ART_SIZE,
        }),
        new ImageComponent("assets/creation/hallway-background.png", {
          x: 240 * PIXEL_ART_SIZE,
          y: 0,
          width: 120 * PIXEL_ART_SIZE,
          height: 120 * PIXEL_ART_SIZE,
        }),
        new ImageComponent("assets/creation/arrow.png", {
          x: 115 * PIXEL_ART_SIZE,
          y: 48 * PIXEL_ART_SIZE,
          width: 20 * PIXEL_ART_SIZE,
          height: 20 * PIXEL_ART_SIZE,
        }),
        (helpSign = new InteractiveGameComponent(
          "assets/creation/sign-help.png",
          "assets/creation/sign-help-highlighted.png",
          {
            x: 47 * PIXEL_ART_SIZE,
            y: 61 * PIXEL_ART_SIZE,
            width: 12 * PIXEL_ART_SIZE,
            height: 22 * PIXEL_ART_SIZE,
          },
          () => {
            helpMsg.toggle();
            if (!hintOpacityAnimation.started) {
              hintOpacityAnimation.start();
            }
          }
        )),
        (exNihiloPicture = new InteractiveGameComponent(
          "assets/creation/picture-fromnothing.png",
          "assets/creation/picture-fromnothing-highlighted.png",
          {
            x: 150 * PIXEL_ART_SIZE,
            y: 52 * PIXEL_ART_SIZE,
            width: 20 * PIXEL_ART_SIZE,
            height: 15 * PIXEL_ART_SIZE,
          },
          () => {
            exNihiloMsg.toggle();
          }
        )),
        (lovePicture = new InteractiveGameComponent(
          "assets/creation/picture-love.png",
          "assets/creation/picture-love-highlighted.png",
          {
            x: 230 * PIXEL_ART_SIZE,
            y: 52 * PIXEL_ART_SIZE,
            width: 20 * PIXEL_ART_SIZE,
            height: 15 * PIXEL_ART_SIZE,
          },
          () => {
            loveMsg.toggle();
          }
        )),
        (door = new InteractiveGameComponent(
          "assets/creation/door.png",
          "assets/creation/door-highlighted.png",
          {
            x: 310 * PIXEL_ART_SIZE,
            y: 40 * PIXEL_ART_SIZE,
            width: 20 * PIXEL_ART_SIZE,
            height: 40 * PIXEL_ART_SIZE,
          },
          () => {
            scrimAnimation.start();
          }
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
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
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
          ctx.fillStyle = "#000";
          ctx.font = `24px ${FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            "Press [SPACE] to interact!",
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - 20 * PIXEL_ART_SIZE
          );
        },
      ],
      { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
    )),
    (helpMsg = new MessageComponent(
      "Welcome",
      "Welcome to the first level of The Christian Story! Use WASD or the arrow keys to move about, and press SPACE to jump or interact with a highlighted object.\nHave fun learning about the four major parts of the Christian story through this game!\n\nReady? Click the check icon in the top-right corner of your screen and start exploring by walking right!"
    )),
    (exNihiloMsg = new MessageComponent(
      "Creation 'Ex Nihilo'",
      "'Ex nihilo' is Latin for 'from nothing'. Christians believe God created the entire universe not from any object that was there before, but out of His divine will, *from nothing*."
    )),
    (loveMsg = new MessageComponent(
      "But why create?",
      "God created us and the whole universe out of love for us to love Him and others. Out of His love, He created us to experience His love, to love those around us, and to love Him. This creation made love and relationships possible."
    )),
    (ctx: CanvasRenderingContext2D) => {
      const oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = oldAlpha * scrimAnimation.value;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = oldAlpha;
    },
    physicsController.listener(),
    hintOpacityAnimation.listener(),
    scrimAnimation.listener(),
  ];
}
