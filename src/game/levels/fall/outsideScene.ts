import { setGlobalWarp } from "../../../framework/Game";
import Container from "../../../framework/components/Container";
import ImageComponent from "../../../framework/components/ImageComponent";
import ScrollingContainer from "../../../framework/components/ScrollingContainer";
import TimeBasedAnimationController from "../../../framework/controllers/TimeBasedAnimationController";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PIXEL_ART_SIZE } from "../../gameRoot";
import InteractiveGameComponent, {
  rectsOverlap,
} from "../../utils/InteractiveGameComponent";
import KeyboardSimplePhysicsController from "../../utils/KeyboardSimplePhysicsController";
import MessageComponent from "../../utils/MessageComponent";
import SimplePhysicsController from "../../utils/SimplePhysicsController";

export default function outsideScene(onComplete: () => void) {
  let container: ScrollingContainer;
  let characterContainer: Container;
  let fruitContainer: Container;
  let night: Container;

  let serpent: InteractiveGameComponent;
  let serpentMsg: MessageComponent;
  let bird: InteractiveGameComponent;
  let birdMsg: MessageComponent;
  let bird2: InteractiveGameComponent;
  let bird2Msg: MessageComponent;
  let cross: InteractiveGameComponent;

  const unwarpAnimation = new TimeBasedAnimationController(
    "ease-in-out",
    2000,
    360,
    40
  );
  const warpAnimation = new TimeBasedAnimationController(
    "ease-in-out",
    5000,
    0,
    360
  )
    .observe((warp) => {
      setGlobalWarp(warpAnimation.finished ? unwarpAnimation.value : warp);
    })
    .onFinish(() => {
      unwarpAnimation.start();
    });

  let fruitShowing = false;
  const physicsController = new KeyboardSimplePhysicsController(
    {
      x: 100,
      y: 0,
      width: 15 * PIXEL_ART_SIZE,
      height: 40 * PIXEL_ART_SIZE,
    },
    {
      x: 0,
      y: 0,
      height: 79 * PIXEL_ART_SIZE,
      width: 360 * PIXEL_ART_SIZE,
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
    serpent.updatePlayerPosition(physicsController.characterHitBox);
    bird.updatePlayerPosition(physicsController.characterHitBox);
    bird2.updatePlayerPosition(physicsController.characterHitBox);
    cross.updatePlayerPosition(physicsController.characterHitBox);
    physicsController.setEnableSpace(
      !serpent.isHighlighted &&
        !bird.isHighlighted &&
        !bird2.isHighlighted &&
        !cross.isHighlighted
    );

    night.setOpacity(
      Math.max(
        0,
        Math.min(
          1,
          (physicsController.characterHitBox.x - 65 * PIXEL_ART_SIZE) /
            (30 * PIXEL_ART_SIZE)
        )
      )
    );

    if (
      !fruitShowing &&
      physicsController.characterHitBox.x > 100 * PIXEL_ART_SIZE
    ) {
      fruitShowing = true;
      fruitPhysicsController.characterHitBox = {
        x: 133 * PIXEL_ART_SIZE,
        y: 200,
        width: 8 * PIXEL_ART_SIZE,
        height: 8 * PIXEL_ART_SIZE,
      };
    }
  });
  const fruitPhysicsController = new SimplePhysicsController(
    {
      x: 0,
      y: 0,
      width: 8 * PIXEL_ART_SIZE,
      height: 8 * PIXEL_ART_SIZE,
    },
    {
      x: 0,
      y: 0,
      height: 79 * PIXEL_ART_SIZE,
      width: 360 * PIXEL_ART_SIZE,
    },
    0.5
  ).observe((_factor) => {
    fruitContainer.setBounds(fruitPhysicsController.characterHitBox);
    fruitContainer.setOpacity(fruitShowing ? 1 : 0);
    if (
      fruitShowing &&
      !warpAnimation.started &&
      rectsOverlap(
        fruitPhysicsController.characterHitBox,
        physicsController.characterHitBox
      )
    ) {
      warpAnimation.start();
      // start twisty animation? how? GLOBAL STATE?
    }
  });
  const scrimAnimation = new TimeBasedAnimationController(
    "ease-in",
    2000,
    0,
    1
  ).onFinish(onComplete);

  return [
    (container = new ScrollingContainer(
      [
        new ImageComponent("assets/fall/background-day.png", {
          x: 0,
          y: 0,
          width: 360 * PIXEL_ART_SIZE,
          height: 120 * PIXEL_ART_SIZE,
        }),
        (night = new Container(
          [
            new ImageComponent("assets/fall/background-night.png", {
              x: 0,
              y: 0,
              width: 360 * PIXEL_ART_SIZE,
              height: 120 * PIXEL_ART_SIZE,
            }),
          ],
          {
            x: 0,
            y: 0,
            width: 360 * PIXEL_ART_SIZE,
            height: 120 * PIXEL_ART_SIZE,
          }
        )),
        (serpent = new InteractiveGameComponent(
          "assets/fall/serpent.png",
          "assets/fall/serpent-highlighted.png",
          {
            x: 54 * PIXEL_ART_SIZE,
            y: 61 * PIXEL_ART_SIZE,
            width: 12 * PIXEL_ART_SIZE,
            height: 18 * PIXEL_ART_SIZE,
          },
          () => {
            serpentMsg.toggle();
          }
        )),
        (cross = new InteractiveGameComponent(
          "assets/fall/cross.png",
          "assets/fall/cross-highlighted.png",
          {
            x: 338 * PIXEL_ART_SIZE,
            y: 16 * PIXEL_ART_SIZE,
            width: 20 * PIXEL_ART_SIZE,
            height: 60 * PIXEL_ART_SIZE,
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
        (fruitContainer = new Container(
          [
            new ImageComponent("assets/fall/fruit.png", {
              x: 0,
              y: 0,
              width: 8 * PIXEL_ART_SIZE,
              height: 8 * PIXEL_ART_SIZE,
            }),
          ],
          fruitPhysicsController.characterHitBox
        )),
        (bird = new InteractiveGameComponent(
          "assets/fall/bird.png",
          "assets/fall/bird-highlighted.png",
          {
            x: 200 * PIXEL_ART_SIZE,
            y: 52 * PIXEL_ART_SIZE,
            width: 12 * PIXEL_ART_SIZE,
            height: 12 * PIXEL_ART_SIZE,
          },
          () => {
            birdMsg.toggle();
          }
        )),
        (bird2 = new InteractiveGameComponent(
          "assets/fall/bird2.png",
          "assets/fall/bird2-highlighted.png",
          {
            x: 250 * PIXEL_ART_SIZE,
            y: 52 * PIXEL_ART_SIZE,
            width: 12 * PIXEL_ART_SIZE,
            height: 12 * PIXEL_ART_SIZE,
          },
          () => {
            bird2Msg.toggle();
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
    (serpentMsg = new MessageComponent(
      "Serpent",
      "Over there is the Tree of the Knowledge of Good and Evil... If you eat it, you'll be able to tell bad from good like God!\nWhy don't you go walk to the right a little? Didn't God give you everything here to eat? Why is he holding that one tree back?\n\n<You can't love without a choice.>"
    )),
    (birdMsg = new MessageComponent(
      "Bird",
      "Squawk!\nSin isn't some *thing* -- it's a warping of God's reality, making us want to hide from His presence and making us have the wrong order of love -- taking rather than receiving God's provisions. Everything is still there, everything is still wholly God's creation, but it's out of place.\nSquawk! That's sin!"
    )),
    (bird2Msg = new MessageComponent(
      "Another bird",
      "Chirp!\nWhat have we done! What's left in God's creation plan? Is it all doomed?\nIs He going to destroy us and start over?\n...\nNo, He has a plan for us, starting with the cross over there.\nQuack! Uh, I mean, chirp!"
    )),
    (ctx: CanvasRenderingContext2D) => {
      const oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = oldAlpha * scrimAnimation.value;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = oldAlpha;
    },
    scrimAnimation.listener(),
    physicsController.listener(),
    fruitPhysicsController.listener(),
    warpAnimation.listener(),
    unwarpAnimation.listener(),
  ];
}
