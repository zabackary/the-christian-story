import Container from "../../../framework/components/Container";
import ImageComponent from "../../../framework/components/ImageComponent";
import ScrollingContainer from "../../../framework/components/ScrollingContainer";
import InterruptableAnimationController from "../../../framework/controllers/InterruptableAnimationController";
import TimeBasedAnimationController from "../../../framework/controllers/TimeBasedAnimationController";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FONT,
  PIXEL_ART_SIZE,
  PROSE_FONT,
} from "../../gameRoot";
import { wrapCanvasLines } from "../../utils/MessageComponent";
import labeledImageButton from "../../utils/labeledImageButton";
import plantWidget from "./plantWidget";

function day(
  title: string,
  image: string,
  description: string,
  transformY: number,
  textColor: string = "#fff"
) {
  return [
    new ImageComponent(image, {
      x: 0,
      y: transformY,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    }),
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = textColor;
      ctx.font = `34px ${FONT}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(title, 12, 120 + transformY);

      ctx.font = `22px ${PROSE_FONT}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const paragraphLines = description
        .split("\n")
        .map((paragraph) =>
          wrapCanvasLines(ctx, paragraph, 70 * PIXEL_ART_SIZE)
        );
      let y = 140 + transformY;
      for (const paragraph of paragraphLines) {
        for (const line of paragraph) {
          ctx.fillStyle = textColor;
          ctx.fillText(line, 12, y);
          y += 30;
        }
        y += 10;
      }
    },
  ];
}

export default function sevenDaysScene(onComplete: () => void) {
  let plantContainer: Container;
  let slideIndex = 0;
  const animator = new InterruptableAnimationController("ease-in-out", 500, 0);
  let container: ScrollingContainer;
  animator.observe((pos) => container.setScroll(0, pos));
  const scrimAnimation = new TimeBasedAnimationController(
    "ease-in",
    2000,
    1,
    0,
    true
  );
  const days = [
    day(
      "Day 1: Light and Darkness",
      "assets/creation/day-1.png",
      "\"And God said, 'Let there be light,' and there was light.\" (Genesis 1:3)\nGod created light and darkness from the bleak nothingness of nothing.",
      0,
      "#000"
    ),
    day(
      "Day 2: Sea and Sky",
      "assets/creation/day-2.png",
      "\"And God said, 'Let there be a vault between the waters to separate water from water.'\" (Genesis 1:6)\nWith a single word, God created the seas and the sky we know today.",
      CANVAS_HEIGHT
    ),
    day(
      "Day 3: Dry Land and Vegetation",
      "assets/creation/day-3.png",
      "\"And God said, 'Let the water under the sky be gathered to one place, and let dry ground appear.' And it was so.\" (Genesis 1:9)\n\"Then God said, 'Let the land produce vegetation: seed-bearing plants and trees on the land that bear fruit with seed in it, according to their various kinds.'\" (Genesis 1:11)\nHe continues creating plants and trees, the first form of life. No matter what Christians believe in regards to evolution, we all believe God created and inspired life as we know it.",
      CANVAS_HEIGHT * 2
    ),
    day(
      "Day 4: Sun, Moon, and Stars",
      "assets/creation/day-4.png",
      '"God made two great lights—the greater light to govern the day and the lesser light to govern the night. He also made the stars." (Genesis 1:16)\nGod created both the Sun and Moon to give light to us and his creation, as well as the soon-to-be created animals.',
      CANVAS_HEIGHT * 3,
      "#89c0fa"
    ),
    day(
      "Day 5: Birds and Fish",
      "assets/creation/day-5.png",
      "\"And God said, 'Let the water teem with living creatures, and let birds fly above the earth across the vault of the sky.'\" (Genesis 1:20)\nGod created living creatures in the water and air, preparing the way for life on land (SDG 15!) and us!",
      CANVAS_HEIGHT * 4
    ),
    day(
      "Day 6: Life on Land",
      "assets/creation/day-6a.png",
      "\"And God said, 'Let the land produce living creatures according to their kinds: the livestock, the creatures that move along the ground, and the wild animals, each according to its kind.'\" (Genesis 1:24)\nGod continues to create more life, bringing joy to his creation, but there still can't be love -- animals, birds, and fish aren't the same as humans when it comes to loving one another and ultimately, God.",
      CANVAS_HEIGHT * 5
    ),
    day(
      "Day 6: Mankind",
      "assets/creation/day-6b.png",
      '"God created mankind in his own image, in the image of God he created them; male and female he created them." (Genesis 1:27)\nFinally, God creates us! But we\'re a little different from the other creatures on Earth -- we\'re created *in God\'s image* to "fill the earth and subdue it" (Genesis 1:28). God calls us to take care of His creation and be people of His image.\nPress the button to play a short game.',
      CANVAS_HEIGHT * 6
    ),
    (plantContainer = new Container(
      [
        plantWidget({
          x: 0,
          y: 0,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }),
      ],
      {
        x: 0,
        y: CANVAS_HEIGHT * 7,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }
    )),
  ];
  plantContainer.setDisableChildUpdates(true);
  return [
    (container = new ScrollingContainer(
      [
        ...days,
        new Container(
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
                "Press the arrow to continue.",
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT - 20 * PIXEL_ART_SIZE
              );
            },
          ],
          { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }
        ),
      ],
      {
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }
    )),
    labeledImageButton(
      "assets/level-select/down.png",
      "assets/level-select/down-pressed.png",
      (ctx) => {
        ctx.fillStyle = "#fff";
        ctx.font = `16px ${FONT}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText("Continue", 7 * PIXEL_ART_SIZE, 2.5 * PIXEL_ART_SIZE);
      },
      () => {
        plantContainer.setDisableChildUpdates(slideIndex !== 6);
        if (slideIndex >= days.length - 1) {
          onComplete();
        } else {
          slideIndex++;
          animator.animateTo(slideIndex * CANVAS_HEIGHT);
        }
      },
      {
        x: CANVAS_WIDTH / 2 - 2 * PIXEL_ART_SIZE,
        y: CANVAS_HEIGHT - 50,
        width: 5 * PIXEL_ART_SIZE,
        height: 5 * PIXEL_ART_SIZE,
      },
      100
    ),
    (ctx: CanvasRenderingContext2D) => {
      const oldAlpha = ctx.globalAlpha;
      ctx.globalAlpha = oldAlpha * scrimAnimation.value;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = oldAlpha;
    },
    animator.listener(),
    scrimAnimation.listener(),
  ];
}
