import { UpdateInfo } from "../../framework/components/Component";
import Container from "../../framework/components/Container";
import ImageComponent from "../../framework/components/ImageComponent";
import InterruptableAnimationController from "../../framework/controllers/InterruptableAnimationController";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FONT,
  PIXEL_ART_SIZE,
  PROSE_FONT,
} from "../gameRoot";
import labeledImageButton from "./labeledImageButton";

/**
 * Wraps lines on a canvas, TS version of https://stackoverflow.com/a/16599668
 *
 * @param ctx canvas rendering context
 * @param text the text to wrap
 * @param maxWidth width at which to wrap at
 * @returns the text separated by lines
 */
export function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export default class MessageComponent extends Container {
  private animationController: InterruptableAnimationController;

  public isShowing: boolean = false;

  constructor(title: string, body: string, compact: boolean = false) {
    const animationController = new InterruptableAnimationController(
      "ease-in-out",
      1000,
      0
    );
    let checkContainer: Container;
    const animatedContainer = new Container(
      [
        new ImageComponent("assets/shared/paper.png", {
          x: 0,
          y: 0,
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
        }),
        (ctx) => {
          ctx.fillStyle = "#333";
          ctx.font = `${compact ? 26 : 34}px ${FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillText(
            title,
            CANVAS_WIDTH / 2,
            (compact ? 25 : 28) * PIXEL_ART_SIZE
          );

          ctx.fillStyle = "#666";
          ctx.font = `${compact ? 12 : 22}px ${PROSE_FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          const paragraphLines = body
            .split("\n")
            .map((paragraph) =>
              wrapCanvasLines(ctx, paragraph, 70 * PIXEL_ART_SIZE)
            );
          let y = (compact ? 31 : 38) * PIXEL_ART_SIZE;
          for (const paragraph of paragraphLines) {
            for (const line of paragraph) {
              ctx.fillText(line, CANVAS_WIDTH / 2, y);
              y += compact ? 13 : 30;
            }
            y += compact ? 2 : 10;
          }
        },
      ],
      {
        x: 0,
        y: CANVAS_HEIGHT,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }
    );
    let backgroundAlpha = 0;
    super(
      [
        (ctx) => {
          const oldAlpha = ctx.globalAlpha;
          ctx.globalAlpha = oldAlpha * backgroundAlpha;
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.globalAlpha = oldAlpha;
        },
        (checkContainer = new Container(
          [
            labeledImageButton(
              "assets/shared/check.png",
              "assets/shared/check-pressed.png",
              [],
              () => {
                this.hide();
              },
              {
                x: 0,
                y: 0,
                width: 8 * PIXEL_ART_SIZE,
                height: 8 * PIXEL_ART_SIZE,
              }
            ),
          ],
          {
            x: CANVAS_WIDTH - 10 * PIXEL_ART_SIZE,
            y: 2 * PIXEL_ART_SIZE,
            width: 8 * PIXEL_ART_SIZE,
            height: 8 * PIXEL_ART_SIZE,
          }
        )),
        animatedContainer,
        animationController.listener(),
      ],
      {
        x: 0,
        y: 0,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }
    );
    animationController.observe((value) => {
      animatedContainer.setBounds({
        x: 0,
        y: CANVAS_HEIGHT * (1 - value),
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      });
      backgroundAlpha = value * 0.8;
      checkContainer.setOpacity(value);
    });
    this.animationController = animationController;
  }

  update(updateInfo: UpdateInfo): void {
    super.update(updateInfo);
    if (this.isShowing) {
      if (updateInfo.keyboard.pressedKey === "Escape") {
        this.hide();
      }
    }
  }

  show() {
    this.isShowing = true;
    this.animationController.animateTo(1);
  }

  hide() {
    if (this.isShowing) {
      this.isShowing = false;
      this.animationController.animateTo(0);
      this.closeObservers.forEach((item) => item());
    }
  }

  toggle() {
    if (this.isShowing) {
      this.hide();
    } else {
      this.show();
    }
  }

  private closeObservers: (() => void)[] = [];
  onClose(callback: () => void): this {
    this.closeObservers.push(callback);
    return this;
  }
}
