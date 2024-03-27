import Controller from "./Controller";
import { EASING_CURVES } from "./TimeBasedAnimationController";

export default class InterruptableAnimationController extends Controller<number> {
  private startTime: number = 0;
  private startValue: number;
  private targetValue: number;
  private value: number;

  constructor(
    private curve: keyof typeof EASING_CURVES,
    private durationMs: number,
    initialValue: number
  ) {
    super();
    this.startValue = initialValue;
    this.targetValue = initialValue;
    this.value = initialValue;
  }

  animateTo(newValue: number) {
    this.startValue = this.value;
    this.startTime = new Date().getTime();
    this.targetValue = newValue;
  }

  updateCallback(): number {
    // in theory, we can't jump back in time, so only clamping on the top bound
    const timeElapsedFraction = Math.min(
      1,
      (new Date().getTime() - this.startTime!) / this.durationMs
    );
    this.value =
      this.startValue +
      EASING_CURVES[this.curve](timeElapsedFraction) *
        (this.targetValue - this.startValue);
    return this.value;
  }
}
