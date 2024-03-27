export default class Asset {
  #resolveImagePromise!: (img: HTMLImageElement) => void;
  #rejectImagePromise!: (reason: any) => void;
  #loaded: boolean = false;

  image: Promise<HTMLImageElement>;

  private constructor(public srcUri: string) {
    this.image = new Promise((resolve, reject) => {
      this.#resolveImagePromise = resolve;
      this.#rejectImagePromise = reject;
    });
  }

  load(): Promise<void> {
    if (this.#loaded) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = this.srcUri;
      img.onload = () => {
        this.#loaded = true;
        this.#resolveImagePromise(img);
        resolve();
      };
      img.onerror = (e) => {
        console.error("failed to load asset", this.srcUri);
        this.#rejectImagePromise(e);
        reject();
      };
    });
  }

  private static ASSET_STORE: Map<string, Asset> = new Map();
  static create(srcUri: string) {
    const cachedAsset = Asset.ASSET_STORE.get(srcUri);
    if (cachedAsset) {
      return cachedAsset;
    }
    const asset = new Asset(srcUri);
    Asset.ASSET_STORE.set(srcUri, asset);
    return asset;
  }
}
