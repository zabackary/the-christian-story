import { Rect, UpdateInfo } from "../../framework/components/Component";
import Controller from "../../framework/controllers/Controller";

/**
 * Just a simple physics controller.
 */
export default class SimplePhysicsController extends Controller<number> {
  public yVelocity: number = 0;
  public xVelocity: number = 0;
  public isWalking: boolean = false;
  public isFacingRight: boolean = true;

  constructor(
    public characterHitBox: Rect,
    public containerHitBox: Rect,
    protected bounceEffect: number = 0
  ) {
    super();
  }

  jumpCallback(_updateInfo: UpdateInfo) {}

  lateralMovementCallback(_updateInfo: UpdateInfo) {}

  private lastUpdate: number = 0;
  private hasUpdated: boolean = false;
  /**
   * @returns the factor to multiply movements by to maintain 60fps
   */
  updateCallback(updateInfo: UpdateInfo): number {
    const now = new Date().getTime();
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.lastUpdate = now;
    }
    const msPerFrame = 1000 / 60;
    const factor = (now - this.lastUpdate) / msPerFrame;

    // Jumping
    this.jumpCallback(updateInfo);

    // Falling
    this.yVelocity += 1 * factor;
    this.characterHitBox.y += this.yVelocity * factor;
    if (
      this.characterHitBox.y + this.characterHitBox.height >
      this.containerHitBox.y + this.containerHitBox.height
    ) {
      // gone through the floor!
      this.characterHitBox.y =
        this.containerHitBox.y +
        this.containerHitBox.height -
        this.characterHitBox.height;
      this.yVelocity = -this.yVelocity * this.bounceEffect;
    } else if (this.characterHitBox.y < this.containerHitBox.y) {
      // gone through the ceiling!
      this.characterHitBox.y = this.containerHitBox.y;
      this.yVelocity = 0;
    }

    // Walking
    this.isWalking = false;
    this.lateralMovementCallback(updateInfo);
    this.characterHitBox.x += this.xVelocity * factor;
    this.xVelocity = this.xVelocity * 0.8 * factor;
    if (
      this.characterHitBox.x + this.characterHitBox.width >
      this.containerHitBox.x + this.containerHitBox.width
    ) {
      // gone through the right wall!
      this.characterHitBox.x =
        this.containerHitBox.x +
        this.containerHitBox.width -
        this.characterHitBox.width;
    } else if (this.characterHitBox.x < this.containerHitBox.x) {
      // gone through the left wall!
      this.characterHitBox.x = this.containerHitBox.x;
    }

    this.lastUpdate = now;
    return factor;
  }
}
