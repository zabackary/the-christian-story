import { ComponentLike, Rect, UpdateInfo, translateBounds } from "./Component";
import Container from "./Container";

export default class ScrollingContainer extends Container {
  scrollX: number = 0;
  scrollY: number = 0;

  constructor(children: ComponentLike[], bounds: Rect) {
    super(children, bounds);
  }

  async render(context: CanvasRenderingContext2D): Promise<void> {
    const oldAlpha = context.globalAlpha;
    context.globalAlpha = oldAlpha * this.opacity;
    await translateBounds(
      context,
      this.bounds,
      async () => {
        context.translate(
          this.inversionEffect ? this.scrollX : -this.scrollX,
          -this.scrollY
        );
        for (const child of this.children) {
          await child.render(context);
        }
        // translation reset by translateBounds
      },
      this.inversionEffect
    );
    context.globalAlpha = oldAlpha;
  }

  update(updateInfo: UpdateInfo) {
    if (this.disableChildUpdates) return;
    const translatedUpdateInfo = {
      ...updateInfo,
      mouse: {
        ...updateInfo.mouse,
        x: updateInfo.mouse.x - this.bounds.x + this.scrollX,
        y: updateInfo.mouse.y - this.bounds.y + this.scrollY,
      },
    };
    if (
      updateInfo.mouse.x < this.bounds.x ||
      updateInfo.mouse.x > this.bounds.x + this.bounds.width ||
      updateInfo.mouse.y < this.bounds.y ||
      updateInfo.mouse.y > this.bounds.y + this.bounds.height
    ) {
      translatedUpdateInfo.mouse.x = -1;
      translatedUpdateInfo.mouse.y = -1;
    }
    this.children.forEach((child) => {
      child.update(translatedUpdateInfo);
    });
  }

  setScroll(x: number, y: number) {
    this.scrollX = Math.floor(x);
    this.scrollY = Math.floor(y);
  }
}
