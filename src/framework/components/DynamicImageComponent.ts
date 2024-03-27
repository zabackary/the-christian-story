import Asset from "../Asset";
import Component, { Rect, UpdateInfo } from "./Component";

export default class DynamicImageComponent extends Component {
  private prefetchedAssets: Record<string, Asset>;

  constructor(
    assetsToPrefetch: string[],
    private visibleImage: string,
    private bounds: Rect
  ) {
    super();
    this.prefetchedAssets = {};
    assetsToPrefetch.forEach((asset) => {
      this.prefetchedAssets[asset] = Asset.create(asset);
    });
  }

  get assets() {
    return Object.values(this.prefetchedAssets);
  }

  update(_updateInfo: UpdateInfo): void | undefined {}

  async render(context: CanvasRenderingContext2D): Promise<void> {
    context.drawImage(
      await (this.prefetchedAssets[this.visibleImage]?.image ??
        Asset.create(this.visibleImage).image),
      this.bounds.x,
      this.bounds.y,
      this.bounds.width,
      this.bounds.height
    );
  }

  setBounds(newBounds: Rect) {
    this.bounds = newBounds;
  }

  setVisibleImage(newVisibleImage: string) {
    this.visibleImage = newVisibleImage;
  }
}
