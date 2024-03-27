import Container from "../../framework/components/Container";
import DynamicImageComponent from "../../framework/components/DynamicImageComponent";
import ScrollingContainer from "../../framework/components/ScrollingContainer";
import InterruptableAnimationController from "../../framework/controllers/InterruptableAnimationController";
import TimeBasedAnimationController from "../../framework/controllers/TimeBasedAnimationController";
import { CANVAS_HEIGHT, CANVAS_WIDTH, FONT, PIXEL_ART_SIZE } from "../gameRoot";
import MessageComponent from "../utils/MessageComponent";
import labeledImageButton from "../utils/labeledImageButton";

export default function levelSelect(
  onSelect: (id: string) => void,
  hasOpened: boolean
) {
  const frameUris = Array.from(
    { length: 9 },
    (_, i) => `assets/loading/${i + 1}.png`
  );
  const buttonsFadeInAnimation = new TimeBasedAnimationController(
    "ease-out",
    hasOpened ? 1 : 500,
    0,
    1
  );
  const titleAnimation = new TimeBasedAnimationController(
    "ease-out-elastic",
    hasOpened ? 1 : 1500,
    -65,
    42
  );
  let bgimg: DynamicImageComponent;
  let innerContainer: ScrollingContainer;
  let titleContainer: Container;
  let scrollBtns: Container;
  let aboutButton: Container;
  let writtenPortionButton: Container;
  let aboutMsg: MessageComponent;
  let writtenPortionMsg: MessageComponent;

  const levelButton = (id: string, label: string, y: number) =>
    labeledImageButton(
      `assets/level-select/${id}.png`,
      `assets/level-select/${id}-pressed.png`,
      (ctx) => {
        ctx.fillStyle = "#555";
        ctx.font = `18px ${FONT}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, 10 * PIXEL_ART_SIZE, (20 * PIXEL_ART_SIZE) / 2);
      },
      () => {
        console.info("clicked level:", id);
        onSelect(id);
      },
      {
        x: 18,
        y,
        width: 30 * PIXEL_ART_SIZE,
        height: 20 * PIXEL_ART_SIZE,
      }
    );
  const catalogAnimation = new InterruptableAnimationController(
    "ease-in-out",
    600,
    0
  );
  return [
    new TimeBasedAnimationController(
      "linear",
      hasOpened ? 1 : 1000,
      1,
      frameUris.length - 1,
      true
    )
      .observe((frame) => {
        bgimg.setVisibleImage(frameUris[Math.floor(frame)]);
      })
      .onFinish(() => {
        buttonsFadeInAnimation.start();
        titleAnimation.start();
      })
      .listener(),
    buttonsFadeInAnimation
      .observe((opacity) => {
        innerContainer.setOpacity(opacity);
        scrollBtns.setOpacity(opacity);
        aboutButton.setOpacity(opacity);
        writtenPortionButton.setOpacity(opacity);
      })
      .listener(),
    titleAnimation
      .observe((yPos) => {
        titleContainer.setBounds({
          x: CANVAS_WIDTH / 2 - (100 * PIXEL_ART_SIZE) / 2,
          y: yPos,
          width: 100 * PIXEL_ART_SIZE,
          height: 100,
        });
      })
      .listener(),
    catalogAnimation
      .observe((yPos) => {
        innerContainer.setScroll(0, yPos);
      })
      .listener(),
    (bgimg = new DynamicImageComponent(frameUris, frameUris[0], {
      x: CANVAS_WIDTH / 2 - (100 * PIXEL_ART_SIZE) / 2,
      y: CANVAS_HEIGHT / 2 - (80 * PIXEL_ART_SIZE) / 2,
      width: 100 * PIXEL_ART_SIZE,
      height: 80 * PIXEL_ART_SIZE,
    })),
    (titleContainer = new Container(
      [
        (ctx) => {
          ctx.fillStyle = "#000";
          ctx.font = `36px ${FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText("The Christian Story", (100 * PIXEL_ART_SIZE) / 2, 0);
          ctx.fillStyle = "#777";
          ctx.font = `24px ${FONT}`;
          ctx.fillText(
            "An interactive game by Zachary C.",
            (100 * PIXEL_ART_SIZE) / 2,
            42
          );
        },
      ],
      {
        x: CANVAS_WIDTH / 2 - (100 * PIXEL_ART_SIZE) / 2,
        y: -300,
        width: 100 * PIXEL_ART_SIZE,
        height: 100,
      }
    )),
    (innerContainer = new ScrollingContainer(
      [
        (ctx) => {
          ctx.fillStyle = "#ccc";
          ctx.font = `24px ${FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText("Chapters", 108, 30);
        },
        levelButton("creation", "Creation", 72),
        levelButton("fall", "The Fall", 204),
        levelButton("redemption", "Redemption", 336),
        levelButton("restoration", "Restoration", 468),
      ],
      {
        x: CANVAS_WIDTH / 2 - (30 * PIXEL_ART_SIZE) / 2,
        y: CANVAS_HEIGHT / 2 - (80 * PIXEL_ART_SIZE) / 2 + 36,
        width: 100 * PIXEL_ART_SIZE,
        height: 408,
      }
    )),
    (scrollBtns = new Container(
      [
        labeledImageButton(
          "assets/level-select/up.png",
          "assets/level-select/up-pressed.png",
          (_ctx) => {},
          () => {
            catalogAnimation.animateTo(0);
          },
          {
            x: 0,
            y: 0,
            width: 5 * PIXEL_ART_SIZE,
            height: 5 * PIXEL_ART_SIZE,
          }
        ),
        labeledImageButton(
          "assets/level-select/down.png",
          "assets/level-select/down-pressed.png",
          (_ctx) => {},
          () => {
            catalogAnimation.animateTo(264);
          },
          {
            x: 8 * PIXEL_ART_SIZE,
            y: 0,
            width: 5 * PIXEL_ART_SIZE,
            height: 5 * PIXEL_ART_SIZE,
          }
        ),
      ],
      {
        x: CANVAS_WIDTH / 2 - 24,
        y: CANVAS_HEIGHT / 2 + (80 * PIXEL_ART_SIZE) / 2 - 24,
        width: 18 * PIXEL_ART_SIZE,
        height: 5 * PIXEL_ART_SIZE,
      }
    )),
    (aboutButton = labeledImageButton(
      "assets/level-select/about.png",
      "assets/level-select/about-pressed.png",
      (ctx: CanvasRenderingContext2D) => {
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#333";
        ctx.font = `16px ${FONT}`;
        ctx.fillText("About", 10 * PIXEL_ART_SIZE, 4 * PIXEL_ART_SIZE);
      },
      () => {
        aboutMsg.show();
      },
      {
        x: 4 * PIXEL_ART_SIZE,
        y: CANVAS_HEIGHT - 12 * PIXEL_ART_SIZE,
        width: 8 * PIXEL_ART_SIZE,
        height: 8 * PIXEL_ART_SIZE,
      },
      400
    )),
    (writtenPortionButton = labeledImageButton(
      "assets/level-select/written.png",
      "assets/level-select/written-pressed.png",
      (ctx: CanvasRenderingContext2D) => {
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#333";
        ctx.font = `16px ${FONT}`;
        ctx.fillText(
          "Written Portion",
          10 * PIXEL_ART_SIZE,
          4 * PIXEL_ART_SIZE
        );
      },
      () => {
        writtenPortionMsg.show();
      },
      {
        x: 36 * PIXEL_ART_SIZE,
        y: CANVAS_HEIGHT - 12 * PIXEL_ART_SIZE,
        width: 8 * PIXEL_ART_SIZE,
        height: 8 * PIXEL_ART_SIZE,
      },
      400
    )),
    (aboutMsg = new MessageComponent(
      "About",
      "This game was designed, drawn, and developed by Zachary C. for a project for Christian Academy in Japan's Intro to Christianity class. It makes use of TypeScript and HTML5 Canvas for rendering, and GIMP was used to create the assets.\nScriptures taken from the Holy Bible, New International Version®, NIV®. Copyright © 1973, 1978, 1984, 2011 by Biblica, Inc.™ Used by permission of Zondervan. All rights reserved worldwide. www.zondervan.com The “NIV” and “New International Version” are trademarks registered in the United States Patent and Trademark Office by Biblica, Inc.™"
    )),
    (writtenPortionMsg = new MessageComponent(
      "Written Portion",
      "TODO: write it :("
    )),
  ];
}
