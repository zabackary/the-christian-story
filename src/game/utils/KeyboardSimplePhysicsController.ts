import { Rect, UpdateInfo } from "../../framework/components/Component";
import SimplePhysicsController from "./SimplePhysicsController";

/**
 * Just a simple physics controller controller by the keyboard.
 */
export default class KeyboardSimplePhysicsController extends SimplePhysicsController {
  constructor(
    characterHitBox: Rect,
    containerHitBox: Rect,
    bounceEffect: number = 0
  ) {
    super(characterHitBox, containerHitBox, bounceEffect);
  }

  private disableSpace: boolean = true;
  setDisableSpace(disableSpace: boolean) {
    this.disableSpace = disableSpace;
  }

  jumpCallback(updateInfo: UpdateInfo): void {
    if (
      (updateInfo.keyboard.pressedKey === " " && this.disableSpace) ||
      updateInfo.keyboard.pressedKey === "ArrowUp" ||
      updateInfo.keyboard.pressedKey === "w"
    ) {
      if (
        Math.round(this.characterHitBox.y + this.characterHitBox.height) ===
        Math.round(this.containerHitBox.y + this.containerHitBox.height)
      ) {
        // on the ground, can jump
        this.yVelocity = -15;
      }
    }
  }

  lateralMovementCallback(updateInfo: UpdateInfo): void {
    if (
      updateInfo.keyboard.pressingKeys.includes("ArrowLeft") ||
      updateInfo.keyboard.pressingKeys.includes("a")
    ) {
      this.xVelocity = -6;
      this.isWalking = true;
      this.isFacingRight = false;
    }
    if (
      updateInfo.keyboard.pressingKeys.includes("ArrowRight") ||
      updateInfo.keyboard.pressingKeys.includes("d")
    ) {
      this.xVelocity = 6;
      this.isWalking = true;
      this.isFacingRight = true;
    }
  }
}
