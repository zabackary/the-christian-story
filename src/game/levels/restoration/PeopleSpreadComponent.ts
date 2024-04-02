import Asset from "../../../framework/Asset";
import Component, { UpdateInfo } from "../../../framework/components/Component";
import TimeBasedAnimationController from "../../../framework/controllers/TimeBasedAnimationController";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FONT,
  PIXEL_ART_SIZE,
} from "../../gameRoot";

const FIRE_FRAMES = 6;
const RIVER_FRAMES = 10;
const SPARKLE_FRAMES = 9;

const EARTH_RADIUS = 50;

const PEOPLE_NUMBER = 20;

enum PeopleSpreadStage {
  PeopleGenerating,
  PeopleComingTogether,
  PeopleHavingFire,
  EarthReveal,
  EarthSpaceReveal,
  RiversAnimation,
}

enum MessageState {
  NoMessage,
  FadingIn,
  Showing,
  FadingOut,
}

interface Person {
  /** in radians */
  startPosition: number;
  position: number;
  animationProgress: number;
  hasFire: boolean;
  churchIndex?: number;
  fireFrame?: number;
  targetOffset: number;
}

interface Church {
  position: number;
  revealRadius: number;
  revealRadiusVelocity: number;
}

const angularDistance = (a: number, b: number) =>
  ((((a - b + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) -
  Math.PI;

export default class PeopleSpreadComponent extends Component {
  private oldEarthAsset: Asset = Asset.create(
    "assets/restoration/old_earth.png"
  );
  private newEarthAsset: Asset = Asset.create(
    "assets/restoration/new_earth.png"
  );
  private treeAsset: Asset = Asset.create("assets/restoration/tree.png");
  private hintAsset: Asset = Asset.create("assets/creation/interact-hint.png");
  private personAsset: Asset = Asset.create("assets/restoration/person.png");
  private earthRiverAssets: Asset[] = Array.from(
    { length: RIVER_FRAMES },
    (_, i) => Asset.create(`assets/restoration/earth_river/earth_river${i}.png`)
  );
  private personFlamesAssets: Asset[] = Array.from(
    { length: FIRE_FRAMES },
    (_, i) =>
      Asset.create(`assets/restoration/person_flames/person_flames_${i}.png`)
  );
  private sparkleAssets: Asset[] = Array.from(
    { length: SPARKLE_FRAMES },
    (_, i) => Asset.create(`assets/shared/sparkle/sparkle${i}.png`)
  );

  private nextStage: PeopleSpreadStage = PeopleSpreadStage.PeopleGenerating;
  public stage: PeopleSpreadStage = PeopleSpreadStage.PeopleGenerating;
  private people: Person[] = [];
  private churches: Church[] = [];
  private riverFrame: number | undefined;
  private earthRevealSize: number = 0;

  private messageState: MessageState = MessageState.NoMessage;
  private message: string | undefined;
  private messageOutAnimation = new TimeBasedAnimationController(
    "ease-in",
    1000,
    1,
    0
  );
  private messageInAnimation = new TimeBasedAnimationController(
    "ease-out",
    1000,
    0,
    1
  );

  private showMessage(msg: string) {
    this.message = msg;
    this.messageState = MessageState.FadingIn;
    this.messageInAnimation.start();
  }
  private hideMessage() {
    this.messageState = MessageState.FadingOut;
    this.messageOutAnimation.start();
  }

  private nextPersonGenerateTime: number = 0;

  constructor() {
    super();
  }

  get assets(): Asset[] {
    return [
      this.oldEarthAsset,
      this.newEarthAsset,
      this.personAsset,
      this.hintAsset,
      this.treeAsset,
      ...this.earthRiverAssets,
      ...this.personFlamesAssets,
      ...this.sparkleAssets,
    ];
  }

  async render(context: CanvasRenderingContext2D): Promise<void> {
    context.drawImage(
      await this.oldEarthAsset.image,
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );

    await this.renderNewEarth(context);

    for (const person of this.people) {
      context.save();
      context.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      context.rotate(person.position);
      context.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
      context.drawImage(
        person.fireFrame === undefined
          ? await this.personAsset.image
          : await this.personFlamesAssets[person.fireFrame].image,
        CANVAS_WIDTH / 2 - 2.5 * PIXEL_ART_SIZE,
        1 * PIXEL_ART_SIZE,
        5 * PIXEL_ART_SIZE,
        9 * PIXEL_ART_SIZE
      );
      context.restore();
    }

    let messageOpacity = 0;
    if (this.messageState === MessageState.FadingIn) {
      messageOpacity = this.messageInAnimation.updateCallback();
      if (messageOpacity === 1) {
        this.messageState = MessageState.Showing;
      }
    } else if (this.messageState === MessageState.FadingOut) {
      messageOpacity = this.messageOutAnimation.updateCallback();
      if (messageOpacity === 0) {
        this.messageState = MessageState.NoMessage;
      }
    } else if (this.messageState === MessageState.Showing) {
      messageOpacity = 1;
    }
    const oldAlpha = context.globalAlpha;
    context.globalAlpha = oldAlpha * messageOpacity;
    context.drawImage(
      await this.hintAsset.image,
      CANVAS_WIDTH / 2 - (100 * PIXEL_ART_SIZE) / 2,
      CANVAS_HEIGHT - 30 * PIXEL_ART_SIZE,
      100 * PIXEL_ART_SIZE,
      20 * PIXEL_ART_SIZE
    );
    context.fillStyle = "#000";
    context.font = `24px ${FONT}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      this.message ?? "undefined",
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 20 * PIXEL_ART_SIZE,
      90 * PIXEL_ART_SIZE
    );
    context.globalAlpha = oldAlpha;
  }

  private async renderNewEarth(
    context: CanvasRenderingContext2D
  ): Promise<void> {
    context.save();
    context.beginPath();
    context.arc(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      EARTH_RADIUS * PIXEL_ART_SIZE + this.earthRevealSize,
      0,
      2 * Math.PI
    );
    context.clip();
    context.beginPath();
    for (const church of this.churches) {
      const x =
        Math.cos(church.position - Math.PI / 2) *
          EARTH_RADIUS *
          PIXEL_ART_SIZE +
        CANVAS_WIDTH / 2;
      const y =
        Math.sin(church.position - Math.PI / 2) *
          EARTH_RADIUS *
          PIXEL_ART_SIZE +
        CANVAS_HEIGHT / 2;
      context.moveTo(x, y);
      context.arc(x, y, church.revealRadius, 0, 2 * Math.PI);
    }
    context.clip();
    context.drawImage(
      this.riverFrame === undefined
        ? await this.newEarthAsset.image
        : await this.earthRiverAssets[this.riverFrame].image,
      0,
      0,
      CANVAS_WIDTH,
      CANVAS_HEIGHT
    );
    if (this.riverFrame !== undefined) {
      context.drawImage(
        await this.treeAsset.image,
        CANVAS_WIDTH / 2 - 7.5 * PIXEL_ART_SIZE,
        4 * PIXEL_ART_SIZE +
          20 * PIXEL_ART_SIZE -
          20 * PIXEL_ART_SIZE * (this.riverFrame / 9),
        15 * PIXEL_ART_SIZE,
        20 * PIXEL_ART_SIZE * (this.riverFrame / 9)
      );
    }
    context.restore();
  }

  private riversStartFrame: number | undefined;

  /** updated at 5fps */
  private frameCount: number = 0;
  private lastUpdate: number = 0;
  private hasUpdated: boolean = false;
  private lastFrameCountUpdate: number = 0;
  update(_updateInfo: UpdateInfo): void {
    const now = new Date().getTime();
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.lastUpdate = now;
    }
    const msPerFrame = 1000 / 60;
    const factor = (now - this.lastUpdate) / msPerFrame;
    if (now - this.lastFrameCountUpdate > 1000 / 5) {
      this.lastFrameCountUpdate = now;
      this.frameCount++;
    }

    switch (this.stage) {
      case PeopleSpreadStage.PeopleGenerating: {
        if (now >= this.nextPersonGenerateTime) {
          // TODO: change back
          this.nextPersonGenerateTime = now + Math.random() * 500;
          this.nextPersonGenerateTime = now + 100;
          this.generatePerson();
        }
        if (this.people.length > PEOPLE_NUMBER) {
          this.nextStage = PeopleSpreadStage.PeopleComingTogether;
          this.stage = PeopleSpreadStage.PeopleComingTogether;
        }
        break;
      }
      case PeopleSpreadStage.PeopleComingTogether: {
        if (this.churches.length === 0) {
          this.showMessage(
            "The people of God come together to form the church"
          );
          const churchesCount = Math.floor(3 + Math.random() * 5);
          for (let i = 0; i < churchesCount; i++) {
            this.generateChurch();
          }
        } else {
          let error = 0;
          for (const person of this.people) {
            if (person.churchIndex === undefined) {
              const distanceFrom = (position: number) =>
                angularDistance(position, person.startPosition);
              const churchesByDistance = [...this.churches.entries()].sort(
                (a, b) =>
                  Math.abs(distanceFrom(a[1].position)) -
                  Math.abs(distanceFrom(b[1].position))
              );
              let churchIndex = 0;
              for (const church of churchesByDistance) {
                if (Math.random() < 0.9) {
                  churchIndex = church[0];
                  break;
                }
              }
              person.churchIndex = churchIndex;
            }

            // animationProgress is jumping
            person.animationProgress =
              1 - (1 - person.animationProgress) * 0.99995 ** factor;
            // interpolate
            const target =
              this.churches[person.churchIndex].position + person.targetOffset;
            const cosine =
              (1 - person.animationProgress) * Math.cos(person.startPosition) +
              person.animationProgress * Math.cos(target);
            const sine =
              (1 - person.animationProgress) * Math.sin(person.startPosition) +
              person.animationProgress * Math.sin(target);
            person.position = Math.atan2(sine, cosine);
            error += Math.abs(angularDistance(person.position, target));
          }

          if (this.nextStage === this.stage && error / PEOPLE_NUMBER < 0.01) {
            this.nextStage = PeopleSpreadStage.PeopleHavingFire;
            this.hideMessage();
            setTimeout(() => {
              this.showMessage("The Holy Spirit fills their hearts...");
              this.stage = PeopleSpreadStage.PeopleHavingFire;
            }, 2000);
          }
        }
        break;
      }
      case PeopleSpreadStage.PeopleHavingFire: {
        let noFirePeople = 0;
        for (const person of this.people) {
          if (!person.hasFire) {
            if (Math.random() < 0.00004 * factor) {
              person.hasFire = true;
              person.fireFrame = 0;
            } else {
              noFirePeople++;
            }
          }
        }
        if (this.nextStage === this.stage && noFirePeople === 0) {
          this.nextStage = PeopleSpreadStage.EarthReveal;
          this.hideMessage();
          setTimeout(() => {
            this.showMessage("...and the new heaven and new earth appear");
            this.stage = PeopleSpreadStage.EarthReveal;
          }, 2000);
        }
        break;
      }
      case PeopleSpreadStage.EarthReveal: {
        let radii = 0;
        for (const church of this.churches) {
          church.revealRadiusVelocity += 0.0000001 * factor;
          church.revealRadius += church.revealRadiusVelocity * factor;
          radii += church.revealRadius;
        }
        if (
          this.nextStage === this.stage &&
          radii / this.churches.length > CANVAS_WIDTH
        ) {
          this.nextStage = PeopleSpreadStage.EarthSpaceReveal;
          setTimeout(() => {
            this.stage = PeopleSpreadStage.EarthSpaceReveal;
          }, 1000);
        }
        break;
      }
      case PeopleSpreadStage.EarthSpaceReveal: {
        this.earthRevealSize += 0.006 * factor;
        if (
          this.nextStage === this.stage &&
          this.earthRevealSize >
            (CANVAS_WIDTH / 2 - EARTH_RADIUS * PIXEL_ART_SIZE) * 2
        ) {
          this.stage = PeopleSpreadStage.RiversAnimation;
          this.nextStage = PeopleSpreadStage.RiversAnimation;
          this.hideMessage();
          setTimeout(() => {
            this.showMessage(
              "The river of the water of life waters the tree of life"
            );
            this.stage = PeopleSpreadStage.RiversAnimation;
          }, 2000);
        }
        break;
      }
      case PeopleSpreadStage.RiversAnimation: {
        if (this.riversStartFrame === undefined) {
          this.riversStartFrame = this.frameCount;
          setTimeout(() => {
            this.hideMessage();
            setTimeout(() => {
              this.showMessage(
                "Thank you for playing! Press the button to return"
              );
            }, 1000);
          }, 6000);
        }
        this.riverFrame = Math.min(
          RIVER_FRAMES - 1,
          this.frameCount - this.riversStartFrame
        );
        break;
      }
    }
    for (const person of this.people) {
      if (person.hasFire && person.fireFrame !== undefined) {
        person.fireFrame = this.frameCount % FIRE_FRAMES;
      }
    }
  }

  private generatePerson() {
    const position = Math.random() * Math.PI * 2;
    this.people.push({
      animationProgress: 0,
      hasFire: false,
      position,
      startPosition: position,
      targetOffset: (Math.random() - 0.5) / 5,
    });
  }

  private generateChurch() {
    this.churches.push({
      position: Math.random() * Math.PI * 2,
      revealRadius: 0,
      revealRadiusVelocity: 0,
    });
  }
}
