import Asset from "../../../framework/Asset";
import Component, {
  Rect,
  UpdateInfo,
} from "../../../framework/components/Component";
import { PIXEL_ART_SIZE } from "../../gameRoot";

export default class SeedComponent extends Component {
  private seedAsset: Asset = Asset.create("assets/creation/seed.png");
  private saplingAsset: Asset = Asset.create("assets/creation/sapling.png");
  private treeAsset: Asset = Asset.create("assets/creation/tree.png");
  private treeWithFruitAsset: Asset = Asset.create(
    "assets/creation/tree-with-fruit.png"
  );
  private seeds: {
    x: number;
    y: number;
    xvel: number;
    yvel: number;
    stage: number;
    changeTime: number | null;
  }[] = [];

  constructor(
    private groundY: number,
    private characterHitBox: Rect,
    private characterFacingRight: boolean,
    private characterXVel: number,
    private characterYVel: number,
    private hillX: number,
    private hillY: number,
    private prizeX: number
  ) {
    super();
  }

  setCharacterHitBox(
    rect: Rect,
    facingRight: boolean,
    characterXVel: number,
    characterYVel: number
  ) {
    this.characterHitBox = rect;
    this.characterFacingRight = facingRight;
    this.characterXVel = characterXVel;
    this.characterYVel = characterYVel;
  }

  get assets(): Asset[] {
    return [
      this.seedAsset,
      this.saplingAsset,
      this.treeAsset,
      this.treeWithFruitAsset,
    ];
  }

  async render(context: CanvasRenderingContext2D): Promise<void> {
    for (const seed of this.seeds) {
      if (seed.stage === 0) {
        // just a seed
        context.drawImage(
          await this.seedAsset.image,
          seed.x - 1 * PIXEL_ART_SIZE,
          seed.y - 1 * PIXEL_ART_SIZE,
          3 * PIXEL_ART_SIZE,
          3 * PIXEL_ART_SIZE
        );
      } else if (seed.stage === 1) {
        // growing...
      } else if (seed.stage === 2) {
        // a sapling
        context.drawImage(
          await this.saplingAsset.image,
          seed.x - 15 * PIXEL_ART_SIZE,
          seed.y - 40 * PIXEL_ART_SIZE,
          30 * PIXEL_ART_SIZE,
          40 * PIXEL_ART_SIZE
        );
      } else if (seed.stage === 3) {
        // full-grown
        context.drawImage(
          await this.treeAsset.image,
          seed.x - 15 * PIXEL_ART_SIZE,
          seed.y - 40 * PIXEL_ART_SIZE,
          30 * PIXEL_ART_SIZE,
          40 * PIXEL_ART_SIZE
        );
      } else if (seed.stage === 4) {
        // with fruit
        context.drawImage(
          await this.treeWithFruitAsset.image,
          seed.x - 15 * PIXEL_ART_SIZE,
          seed.y - 40 * PIXEL_ART_SIZE,
          30 * PIXEL_ART_SIZE,
          40 * PIXEL_ART_SIZE
        );
      }
    }
  }

  private lastUpdate: number = 0;
  private lastGeneratedTime: number = 0;
  private hasUpdated: boolean = false;
  update(updateInfo: UpdateInfo): void {
    const now = new Date().getTime();
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.lastUpdate = now;
    }
    const msPerFrame = 1000 / 60;
    const factor = (now - this.lastUpdate) / msPerFrame;

    seedLoop: for (const seed of this.seeds) {
      if (seed.stage === 0) {
        seed.yvel += 0.5 * factor;
        seed.y += seed.yvel;
        seed.x += seed.xvel;

        if (seed.x > this.hillX && seed.y > this.hillY + PIXEL_ART_SIZE * 3) {
          seed.x = this.hillX;
          seed.xvel = -seed.xvel;
        }

        if (
          seed.y > this.groundY ||
          (seed.y > this.hillY && seed.x > this.hillX)
        ) {
          seed.y = seed.x > this.hillX ? this.hillY : this.groundY;
          for (const otherSeed of this.seeds) {
            if (
              otherSeed.stage > 0 &&
              seed.x > otherSeed.x - 80 &&
              seed.x < otherSeed.x + 80
            ) {
              // overlaps with other tree
              seed.stage = -1;
              continue seedLoop;
            }
          }
          seed.stage = 1;
          seed.changeTime = now;
        }
      } else if (seed.stage === 1 && now - (seed.changeTime ?? 0) > 2000) {
        seed.stage = 2;
        seed.changeTime = now;
      } else if (seed.stage === 2 && now - (seed.changeTime ?? 0) > 2000) {
        seed.stage = 3;
        seed.changeTime = now;
      } else if (seed.stage === 3 && now - (seed.changeTime ?? 0) > 1000) {
        seed.stage = 4;
        seed.changeTime = now;
      }
    }

    this.lastUpdate = now;

    if (
      updateInfo.keyboard.pressedKey === " " &&
      now - this.lastGeneratedTime > 1000
    ) {
      this.generateSeedAt(
        this.characterFacingRight
          ? this.characterHitBox.x + 13 * PIXEL_ART_SIZE
          : this.characterHitBox.x + 2 * PIXEL_ART_SIZE,
        this.characterHitBox.y + 26 * PIXEL_ART_SIZE,
        this.characterFacingRight
      );
      this.lastGeneratedTime = now;
    }
  }

  generateSeedAt(x: number, y: number, facingRight: boolean): void {
    this.seeds.push({
      x,
      y,
      xvel: this.characterXVel + (facingRight ? 2 : -2),
      yvel: this.characterYVel - 5,
      stage: 0,
      changeTime: null,
    });
  }

  hasSeeds() {
    return this.seeds.length > 0;
  }

  hasGrownSeeds() {
    return this.seeds[0]?.stage ?? 0 > 1;
  }

  plantedOnHill() {
    return (
      this.seeds.findIndex((seed) => seed.x > this.prizeX && seed.stage > 1) >
      -1
    );
  }
}
