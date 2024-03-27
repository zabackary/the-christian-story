import Component, {
  ComponentLike,
  Rect,
  UpdateInfo,
  translateBounds,
} from "./Component";
import { normalizeComponent } from "./FunctionComponent";

export default class Container extends Component {
  protected children: Component[];
  protected opacity: number = 1;
  protected inversionEffect: boolean = false;
  protected disableChildUpdates: boolean = false;

  constructor(children: ComponentLike[], protected bounds: Rect) {
    super();
    this.children = children.map((child) => normalizeComponent(child));
  }

  get assets() {
    return this.children.flatMap((child) => child.assets);
  }

  async render(context: CanvasRenderingContext2D): Promise<void> {
    const oldAlpha = context.globalAlpha;
    context.globalAlpha = oldAlpha * this.opacity;
    await translateBounds(
      context,
      this.bounds,
      async () => {
        for (const child of this.children) {
          await child.render(context);
        }
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
        x: updateInfo.mouse.x - this.bounds.x,
        y: updateInfo.mouse.y - this.bounds.y,
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

  setBounds(newBounds: Rect): this {
    this.bounds = newBounds;
    return this;
  }

  setOpacity(newOpacity: number): this {
    this.opacity = newOpacity;
    return this;
  }

  /**
   * Renders the contents flipped. DOES NOT CHANGE EVENTS (including mouse).
   * @param inverted Whether to flip horizontally
   */
  setInversionEffect(inverted: boolean): this {
    this.inversionEffect = inverted;
    return this;
  }

  setDisableChildUpdates(disabled: boolean): this {
    this.disableChildUpdates = disabled;
    return this;
  }
}
