import Asset from "../Asset";
import Component, { Rect, UpdateInfo } from "./Component";

export default class ImageComponent extends Component {
  asset: Asset;

  constructor(imageUri: string, private bounds: Rect) {
    super();
    this.asset = Asset.create(imageUri);
  }

  get assets() {
    return [this.asset];
  }

  update(_updateInfo: UpdateInfo): void | undefined {}

  async render(context: CanvasRenderingContext2D): Promise<void> {
    context.drawImage(
      await this.asset.image,
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );
  }

  setBounds(newBounds: Partial<Rect>) {
    this.bounds = { ...this.bounds, ...newBounds };
  }
}
