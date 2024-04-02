import Asset from "../../../framework/Asset";
import Component, {
  Rect,
  UpdateInfo,
  translateBounds,
} from "../../../framework/components/Component";
import { CANVAS_WIDTH, FONT, PIXEL_ART_SIZE } from "../../gameRoot";
import { rectsOverlap } from "../../utils/InteractiveGameComponent";

const ROCK_ASSET_PIXEL_SIZE = 24;
const INITIAL_CHARACTER_PIXEL_WIDTH = 15;
const INITIAL_CHARACTER_PIXEL_HEIGHT = 40;
const ROCK_SPEED_FACTOR = 0.02;
const BIG_ROCK_SPEED_FACTOR = 0.5;
const WALK_SPEED = 8;
const JUMP_SPEED = 18;
const PUSH_SPEED_FACTOR = 0.6;

export const SCORE_MULTIPLIER = 50;

const ROCK_FRICTION = 0.6;

const ROCK_MESSAGES = [
  // Exodus 20:2-17
  "false worship",
  "idolatry",
  "misusing God's name",
  "not taking sabbath",
  "not honoring parents",
  "murder",
  "adultery",
  "stealing",
  "lying",
  "coveting",

  // Galatians 5:19-21
  "sexual immorality",
  "impurity",
  "debauchery",
  // duplicate: idolatry
  "witchcraft",
  "hatred",
  "discord",
  "jealousy",
  "fits of rage",
  "selfish ambition",
  "dissensions",
  "factions",
  "envy",
  "drunkenness",
  "orgies",

  // 1 Corinthians 6:9-20
  // duplicate: sexual immorality
  // duplicate: idolatry
  // duplicate: adultery
  "homosexuality", // TODO: decide whether this is too controversial
  // duplicate: thieves
  "greed",
  "drunkenness",
  "slandering",
  "swindling",
];
const BIG_ROCK_MESSAGES = [
  "We're enslaved to sin.",
  "Evil powers attack us.",
  "We deserve God's wrath.",
  "We can't trust Him",
];
export const BIG_ROCK_VIRTUAL_HEIGHT = 16;
export const BIG_ROCK_HEIGHT = 20;
export const BIG_ROCK_WIDTHS = [150, 120, 80, 60];

interface Rock {
  rect: Rect;
  xvel: number;
  yvel: number;
  assetIndex: number;
  groundImpactTime: number | null;
  opacity: number;

  messageIndex: number;
}

interface BigRock {
  rect: Rect;
  yvel: number;
  index: number;
}

export default class RockPhysicsComponent extends Component {
  private rockAssets: Asset[] = [
    Asset.create("assets/redemption/rock1.png"),
    Asset.create("assets/redemption/rock2.png"),
    Asset.create("assets/redemption/rock3.png"),
  ];
  private bigRockAssets: Asset[] = [
    Asset.create("assets/redemption/bigrock1.png"),
    Asset.create("assets/redemption/bigrock2.png"),
    Asset.create("assets/redemption/bigrock3.png"),
    Asset.create("assets/redemption/bigrock4.png"),
  ];
  private characterAsset: Asset = Asset.create(
    "assets/shared/character/standing.png"
  );
  private liveIconAsset: Asset = Asset.create("assets/redemption/heart.png");

  get assets(): Asset[] {
    return [
      ...this.rockAssets,
      ...this.bigRockAssets,
      this.characterAsset,
      this.liveIconAsset,
    ];
  }

  public hiScore: number;

  constructor(private groundY: number) {
    super();
    this.hiScore = 0;
    this.reset();
  }

  private rocks!: Rock[];
  private bigRocks!: BigRock[];

  public level!: number;
  public remainingLives!: number;
  public characterHitBox!: Rect;
  public stopUpdating!: boolean;
  private lastGeneratedTime!: number;
  private nextGenerateDelay!: number;
  private immune!: boolean;
  private startTime!: number;
  public score!: number;
  private noLivesTime!: number | null;

  reset() {
    this.bigRocks = [];
    this.rocks = [];
    this.level = 1;
    this.remainingLives = 3;
    this.characterHitBox = {
      x:
        CANVAS_WIDTH / 2 - (INITIAL_CHARACTER_PIXEL_WIDTH * PIXEL_ART_SIZE) / 2,
      y: 0,
      width: INITIAL_CHARACTER_PIXEL_WIDTH * PIXEL_ART_SIZE,
      height: INITIAL_CHARACTER_PIXEL_HEIGHT * PIXEL_ART_SIZE,
    };
    this.lastGeneratedTime = 0;
    this.nextGenerateDelay = 1000;
    this.immune = false;
    this.stopUpdating = false;
    this.startTime = new Date().getTime();
    this.score = 0;
    this.noLivesTime = null;
    this.lastUpdate = new Date().getTime();
  }

  async render(context: CanvasRenderingContext2D): Promise<void> {
    await translateBounds(
      context,
      this.characterHitBox,
      async () => {
        context.drawImage(
          await this.characterAsset.image,
          0,
          0,
          this.characterHitBox.width,
          this.characterHitBox.height
        );
      },
      !this.characterIsFacingRight
    );

    for (const rock of this.rocks) {
      const oldAlpha = context.globalAlpha;
      context.globalAlpha = oldAlpha * rock.opacity;
      context.drawImage(
        await this.rockAssets[rock.assetIndex].image,
        rock.rect.x,
        rock.rect.y,
        rock.rect.width,
        rock.rect.height
      );
      context.fillStyle = "#fff";
      context.font = `16px ${FONT}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        ROCK_MESSAGES[rock.messageIndex],
        rock.rect.x + rock.rect.width / 2,
        rock.rect.y + rock.rect.height / 2,
        rock.rect.width - 4 * PIXEL_ART_SIZE
      );
      context.globalAlpha = oldAlpha;
    }

    for (const bigRock of this.bigRocks) {
      context.drawImage(
        await this.bigRockAssets[bigRock.index].image,
        bigRock.rect.x,
        bigRock.rect.y,
        bigRock.rect.width,
        BIG_ROCK_HEIGHT * PIXEL_ART_SIZE
      );
      context.fillStyle = "#fff";
      context.font = `24px ${FONT}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        BIG_ROCK_MESSAGES[bigRock.index],
        bigRock.rect.x + bigRock.rect.width / 2,
        bigRock.rect.y + bigRock.rect.height / 2,
        bigRock.rect.width
      );
    }

    for (let i = 0; i < this.remainingLives; i++) {
      context.drawImage(
        await this.liveIconAsset.image,
        CANVAS_WIDTH - 12 * PIXEL_ART_SIZE - 10 * PIXEL_ART_SIZE * i,
        4 * PIXEL_ART_SIZE,
        8 * PIXEL_ART_SIZE,
        8 * PIXEL_ART_SIZE
      );
    }

    const oldCompositeOperation = context.globalCompositeOperation;
    context.globalCompositeOperation = "difference";
    context.fillStyle = "#fff";
    context.font = `28px ${FONT}`;
    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillText(
      `Level ${this.level}`,
      CANVAS_WIDTH - 4 * PIXEL_ART_SIZE,
      18 * PIXEL_ART_SIZE
    );
    context.fillText(
      `${this.score * SCORE_MULTIPLIER}`,
      CANVAS_WIDTH - 4 * PIXEL_ART_SIZE,
      24 * PIXEL_ART_SIZE
    );
    context.fillText(
      `HI: ${this.hiScore * SCORE_MULTIPLIER}`,
      CANVAS_WIDTH - 4 * PIXEL_ART_SIZE,
      30 * PIXEL_ART_SIZE
    );
    context.globalCompositeOperation = oldCompositeOperation;
  }

  private lastUpdate: number = 0;
  private hasUpdated: boolean = false;
  update(updateInfo: UpdateInfo): void {
    const now = new Date().getTime();
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.lastUpdate = now;
    }
    const msPerFrame = 1000 / 60;
    const factor = (now - this.lastUpdate) / msPerFrame;

    this.lastUpdate = now;

    // don't do updates if we died
    if (this.stopUpdating) return;

    this.level = Math.ceil((now - this.startTime) / 10000);

    this.bigRocks.forEach((bigRock) => {
      bigRock.yvel += BIG_ROCK_SPEED_FACTOR * factor;
      bigRock.rect.y += bigRock.yvel;
      if (bigRock.rect.y + bigRock.rect.height > this.groundY) {
        bigRock.yvel = 0;
        bigRock.rect.y = this.groundY - bigRock.rect.height;
      }
      this.bigRocks.forEach((otherBigRock) => {
        if (
          otherBigRock !== bigRock &&
          rectsOverlap(bigRock.rect, otherBigRock.rect)
        ) {
          bigRock.yvel = 0;
          bigRock.rect.y = otherBigRock.rect.y - bigRock.rect.height;
        }
      });
    });

    this.rocks.forEach((rock) => {
      rock.yvel += ROCK_SPEED_FACTOR * factor;
    });
    this.rocks.forEach((rock, i) => {
      rock.rect.y += rock.yvel;
      if (rock.rect.y + rock.rect.height > this.groundY) {
        rock.yvel = 0;
        rock.rect.y = this.groundY - rock.rect.height;
        if (rock.groundImpactTime === null) rock.groundImpactTime = now;
      }
      this.rocks.forEach((otherRock, otherI) => {
        if (otherRock !== rock && rectsOverlap(rock.rect, otherRock.rect)) {
          if (otherI > i) return;
          rock.yvel = 0;
          rock.rect.y = otherRock.rect.y - rock.rect.height;
          if (rock.groundImpactTime === null) rock.groundImpactTime = now;
        }
      });
      if (
        this.immune &&
        rectsOverlap(this.characterHitBox, rock.rect) &&
        rock.yvel > this.characterYVelocity
      ) {
        rock.yvel = 0;
        rock.rect.y = this.characterHitBox.y - rock.rect.height;
        if (rock.groundImpactTime === null) rock.groundImpactTime = now;
      }
      if (rock.yvel !== 0) rock.groundImpactTime = null;

      if (rock.groundImpactTime !== null) rock.xvel *= ROCK_FRICTION ** factor;
      rock.rect.x += rock.xvel;

      for (const otherRock of this.rocks) {
        if (otherRock !== rock && rectsOverlap(rock.rect, otherRock.rect)) {
          if (rock.xvel > otherRock.xvel) {
            // we're going right into them
            rock.xvel = 0;
            rock.rect.x = otherRock.rect.x - rock.rect.width;
          } else if (rock.xvel < otherRock.xvel) {
            // we're going left into them
            rock.xvel = 0;
            rock.rect.x = otherRock.rect.x + otherRock.rect.width;
          }
        }
      }

      for (const bigRock of this.bigRocks) {
        if (rectsOverlap(rock.rect, bigRock.rect)) {
          this.rocks.splice(i, 1);
          return;
        }
      }

      if (rock.opacity !== 1) {
        rock.opacity -= 0.02 * factor;
        if (rock.opacity <= 0) {
          this.score += this.level;
          if (this.score > this.hiScore) this.hiScore = this.score;
          this.rocks.splice(i, 1);
        }
      }

      if (
        rock.groundImpactTime !== null &&
        rock.opacity === 1 &&
        now - rock.groundImpactTime > 1000 * this.level
      ) {
        rock.opacity = 0.9999;
      }
    });

    if (
      now - this.lastGeneratedTime > this.nextGenerateDelay &&
      now - this.startTime > 5000 &&
      this.remainingLives > 0
    ) {
      this.nextGenerateDelay = 500 + Math.random() * (1000 / this.level);
      this.lastGeneratedTime = now;
      this.generateRock();
    }

    this.updateCharacter(updateInfo, now, factor);
  }

  public characterYVelocity: number = 0;
  public characterXVelocity: number = 0;
  public characterIsWalking: boolean = false;
  public characterIsFacingRight: boolean = true;

  private isOnGround = false;
  updateCharacter(updateInfo: UpdateInfo, now: number, factor: number) {
    if (this.bigRocks.length > 0) {
      // we're in the big rocks phase
      // don't update us
      return;
    }

    // Jumping
    // disable walking if we have no lives
    if (this.remainingLives > 0) {
      if (
        updateInfo.keyboard.pressedKey === " " ||
        updateInfo.keyboard.pressedKey === "ArrowUp" ||
        updateInfo.keyboard.pressedKey === "w"
      ) {
        if (this.isOnGround) {
          // on the ground, can jump
          this.characterYVelocity = -JUMP_SPEED; // higher for this level
        }
      }
    }

    // Falling
    this.characterYVelocity += 0.8 * factor; // less for this level
    this.characterHitBox.y += this.characterYVelocity * factor;
    this.isOnGround = false;
    if (this.characterHitBox.y + this.characterHitBox.height > this.groundY) {
      // gone through the floor!
      this.characterHitBox.y = this.groundY - this.characterHitBox.height;
      this.characterYVelocity = 0;
      this.isOnGround = true;
    }
    let beingSquished = false;
    for (const rock of this.rocks) {
      if (rectsOverlap(rock.rect, this.characterHitBox)) {
        if (rock.rect.y < this.characterHitBox.y) {
          // rock is falling on us, uh oh
          // if we're jumping, just stop the jump
          if (this.characterYVelocity < 0) this.characterYVelocity = 0;
          // if they're too small already, no squishing occurs
          const squished =
            rock.rect.y + rock.rect.height - this.characterHitBox.y;
          this.characterHitBox.height -= squished;
          this.characterHitBox.y += squished;
          beingSquished = true;
          // if they're now too small, they lose a life and get immunity
          if (
            this.characterHitBox.height <
            INITIAL_CHARACTER_PIXEL_HEIGHT * PIXEL_ART_SIZE * 0.75
          ) {
            // they lose a life, I guess?
            if (this.remainingLives > 0) this.remainingLives--;
            // they become immune to getting hit until they can move around
            // assuming they have lives
            if (this.remainingLives > 0) this.immune = true;
            else {
              // we wait to be crushed
              // time out in 2000 ms and starts squishing self
              if (this.noLivesTime === null) this.noLivesTime = now;
            }
          }
        } else {
          // we are falling on rock
          this.characterHitBox.y = rock.rect.y - this.characterHitBox.height;
          this.characterYVelocity = 0;
          this.isOnGround = true;
        }
      }
    }

    // start squishing self if timing out
    if (now - (this.noLivesTime ?? Number.POSITIVE_INFINITY) > 2000) {
      const squished = (PIXEL_ART_SIZE / 2) * factor;
      this.characterHitBox.height -= squished;
      this.characterHitBox.y += squished;
      beingSquished = true;
    }
    if (this.characterHitBox.height <= 0) {
      // we die
      this.stopUpdating = true;
      this.dieObservers.forEach((listener) => listener());
    }

    if (
      !beingSquished &&
      this.characterHitBox.height <
        INITIAL_CHARACTER_PIXEL_HEIGHT * PIXEL_ART_SIZE
    ) {
      const change = PIXEL_ART_SIZE * factor;
      const newRect = {
        ...this.characterHitBox,
        height: this.characterHitBox.height + change,
        y: this.characterHitBox.y - change,
      };
      // if this change doesn't cause an overlay
      if (!this.rocks.some((rock) => rectsOverlap(rock.rect, newRect))) {
        // apply it
        this.characterHitBox = newRect;
        // there's space now, so immunity isn't needed
        this.immune = false;
      }
    } else if (!beingSquished) {
      this.characterHitBox.height =
        INITIAL_CHARACTER_PIXEL_HEIGHT * PIXEL_ART_SIZE;
    }

    // Walking
    this.characterIsWalking = false;
    // disable walking if we have no lives
    if (this.remainingLives > 0) {
      if (
        updateInfo.keyboard.pressingKeys.includes("ArrowLeft") ||
        updateInfo.keyboard.pressingKeys.includes("a")
      ) {
        this.characterXVelocity = -WALK_SPEED;
        this.characterIsWalking = true;
        this.characterIsFacingRight = false;
      }
      if (
        updateInfo.keyboard.pressingKeys.includes("ArrowRight") ||
        updateInfo.keyboard.pressingKeys.includes("d")
      ) {
        this.characterXVelocity = WALK_SPEED;
        this.characterIsWalking = true;
        this.characterIsFacingRight = true;
      }
    }
    this.characterHitBox.x += this.characterXVelocity * factor;
    this.characterXVelocity = this.characterXVelocity * 0.8 ** factor;
    for (const rock of this.rocks) {
      if (rectsOverlap(rock.rect, this.characterHitBox)) {
        if (this.characterXVelocity > 0) {
          // we're going right into the rock
          // undo the movement and redo it in the slower fashion
          this.characterHitBox.x = rock.rect.x - this.characterHitBox.width;
          // this.characterHitBox.x += this.characterXVelocity * factor;
          // push the rock
          rock.xvel = this.characterXVelocity * PUSH_SPEED_FACTOR;
        } else if (this.characterXVelocity < 0) {
          // we're going left into the rock
          // undo the movement and redo it in the slower fashion
          this.characterHitBox.x = rock.rect.x + rock.rect.width;
          // this.characterHitBox.x += this.characterXVelocity * factor;
          // push the rock
          rock.xvel = this.characterXVelocity * PUSH_SPEED_FACTOR;
        }
      }
    }
    if (
      this.characterHitBox.x + this.characterHitBox.width >
      CANVAS_WIDTH + this.characterHitBox.width / 2
    ) {
      // gone through the right wall! (allowed up until a certain point)
      this.characterHitBox.x =
        CANVAS_WIDTH -
        this.characterHitBox.width +
        this.characterHitBox.width / 2;
    } else if (this.characterHitBox.x < -this.characterHitBox.width / 2) {
      // gone through the left wall!
      this.characterHitBox.x = -this.characterHitBox.width / 2;
    }
  }

  generateRock(): void {
    const spaces = this.findSpaceInLayer();
    const space = spaces[Math.floor(Math.random() * spaces.length)];
    // skewing the outputs towards the ends so we can fit more rocks
    const x =
      space[0] +
      Math.floor(
        ((Math.cos(Math.random() * Math.PI) + 1) / 2) * (space[1] - space[0])
      );
    this.generateRockAt(x);
  }

  /**
   * @returns a list of ranges where there's space in the top layer
   */
  private findSpaceInLayer(layer: number = 1): [number, number][] {
    const rocksInCurrentLayer: Rock[] = [];
    const nextLayerY =
      this.groundY - (layer + 1) * (ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE);
    const layerY =
      this.groundY - layer * (ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE);
    for (const rock of this.rocks) {
      if (rock.rect.y <= layerY && rock.rect.y > nextLayerY) {
        rocksInCurrentLayer.push(rock);
      }
    }
    rocksInCurrentLayer.sort((a, b) => a.rect.x - b.rect.x);
    if (rocksInCurrentLayer.length === 0) {
      return [[0, CANVAS_WIDTH - ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE]];
    }
    const ranges: [number, number][] = [];
    if (
      rocksInCurrentLayer[0].rect.x >
      ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE
    ) {
      ranges.push([
        0,
        rocksInCurrentLayer[0].rect.x - ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE,
      ]);
    }
    rocksInCurrentLayer.forEach(
      ({ rect: { x: rockX, width: rockWidth } }, i) => {
        // get the x coor of the next rock from the left, else the right wall
        const nextRockX = rocksInCurrentLayer[i + 1]?.rect.x ?? CANVAS_WIDTH;
        // can we fit both the current rock's width and a new one?
        if (nextRockX - rockX > ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE * 2) {
          // there's space in between the rocks
          ranges.push([rockX + rockWidth, nextRockX - rockWidth]);
        }
      }
    );
    // TODO: verify whether the space has any obstructions (i.e., rocks above
    // blocking it)
    if (ranges.length === 0) {
      // no more space in the layer
      // try again with the next layer
      return this.findSpaceInLayer(layer + 1);
    }
    return ranges;
  }

  private generateRockAt(x: number): void {
    this.rocks.push({
      rect: {
        x,
        y: -(ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE),
        width: ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE,
        height: ROCK_ASSET_PIXEL_SIZE * PIXEL_ART_SIZE,
      },
      xvel: 0,
      yvel: 1,
      groundImpactTime: null,
      assetIndex: Math.floor(Math.random() * this.rockAssets.length),
      opacity: 1,
      messageIndex: Math.floor(Math.random() * ROCK_MESSAGES.length),
    });
  }

  private dieObservers: (() => void)[] = [];
  onDie(callback: () => void): this {
    this.dieObservers.push(callback);
    return this;
  }

  private generateBigRock(index: number): void {
    const width = BIG_ROCK_WIDTHS[index] * PIXEL_ART_SIZE;
    const height = BIG_ROCK_HEIGHT * PIXEL_ART_SIZE;
    this.bigRocks.push({
      rect: {
        x: CANVAS_WIDTH / 2 - width / 2,
        y: -height,
        width,
        height: BIG_ROCK_VIRTUAL_HEIGHT * PIXEL_ART_SIZE,
      },
      yvel: 5,
      index,
    });
  }

  async playBigRocksAnimation(): Promise<void> {
    this.stopUpdating = false;
    this.generateBigRock(0);
    await new Promise((r) => setTimeout(r, 2000));
    this.generateBigRock(1);
    await new Promise((r) => setTimeout(r, 2000));
    this.generateBigRock(2);
    await new Promise((r) => setTimeout(r, 2000));
    this.generateBigRock(3);
    await new Promise((r) => setTimeout(r, 4000));
  }
}
