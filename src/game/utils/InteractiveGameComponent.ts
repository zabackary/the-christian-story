import Asset from "../../framework/Asset";
import Component, {
  Rect,
  UpdateInfo,
} from "../../framework/components/Component";

export function rectsOverlap(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export default class InteractiveGameComponent extends Component {
  private normal: Asset;
  private highlighted: Asset;

  constructor(
    normalUri: string,
    highlightedUri: string,
    private bounds: Rect,
    private onOpen: () => void
  ) {
    super();
    this.normal = Asset.create(normalUri);
    this.highlighted = Asset.create(highlightedUri);
  }

  get assets(): Asset[] {
    return [this.normal, this.highlighted];
  }

  public isHighlighted: boolean = false;

  async render(context: CanvasRenderingContext2D): Promise<void> {
    context.drawImage(
      await (this.isHighlighted ? this.highlighted.image : this.normal.image),
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );
  }

  update(updateInfo: UpdateInfo): void {
    if (this.isHighlighted && updateInfo.keyboard.pressedKey === " ") {
      this.onOpen();
    }
  }

  updatePlayerPosition(position: Rect): void {
    this.isHighlighted = rectsOverlap(position, this.bounds);
  }
}
