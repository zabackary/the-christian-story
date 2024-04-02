import Asset from "../../../framework/Asset";
import Component, { UpdateInfo } from "../../../framework/components/Component";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PIXEL_ART_SIZE } from "../../gameRoot";

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
  RiversAnimation,
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

  public stage: PeopleSpreadStage = PeopleSpreadStage.PeopleGenerating;
  private people: Person[] = [];
  private churches: Church[] = [];
  private riverFrame: number | undefined;

  private nextPersonGenerateTime: number = 0;

  constructor() {
    super();
  }

  get assets(): Asset[] {
    return [
      this.oldEarthAsset,
      this.newEarthAsset,
      this.personAsset,
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

    context.save();
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
          this.stage = PeopleSpreadStage.PeopleComingTogether;
        }
        break;
      }
      case PeopleSpreadStage.PeopleComingTogether: {
        if (this.churches.length === 0) {
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
                  distanceFrom(a[1].position) - distanceFrom(b[1].position)
              );
              let churchIndex = 0;
              for (const church of churchesByDistance) {
                if (Math.random() > 0.7) {
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

          if (error / PEOPLE_NUMBER < 0.01) {
            this.stage = PeopleSpreadStage.PeopleHavingFire;
          }
        }
        break;
      }
      case PeopleSpreadStage.PeopleHavingFire: {
        let noFirePeople = 0;
        for (const person of this.people) {
          if (person.hasFire && person.fireFrame !== undefined) {
            person.fireFrame = this.frameCount % FIRE_FRAMES;
          } else if (Math.random() < 0.00007 * factor) {
            person.hasFire = true;
            person.fireFrame = 0;
          } else {
            noFirePeople++;
          }
        }
        if (noFirePeople === 0) {
          this.stage = PeopleSpreadStage.EarthReveal;
        }
        break;
      }
      case PeopleSpreadStage.EarthReveal: {
        let radii = 0;
        for (const church of this.churches) {
          church.revealRadius += 0.002 * factor;
          radii += church.revealRadius;
        }
        if (radii / this.churches.length > CANVAS_WIDTH) {
          this.stage = PeopleSpreadStage.RiversAnimation;
        }
        break;
      }
      case PeopleSpreadStage.RiversAnimation: {
        if (this.riversStartFrame === undefined) {
          this.riversStartFrame = this.frameCount;
        }
        this.riverFrame = Math.min(
          RIVER_FRAMES - 1,
          this.frameCount - this.riversStartFrame
        );
        break;
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
      targetOffset: (Math.random() - 0.5) / 10,
    });
  }

  private generateChurch() {
    this.churches.push({
      position: Math.random() * Math.PI * 2,
      revealRadius: 0,
    });
  }
}
