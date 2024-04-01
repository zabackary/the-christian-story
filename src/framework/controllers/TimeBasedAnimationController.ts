import Controller from "./Controller";

export const EASING_CURVES = {
  sine: (input: number) => (-Math.cos(input * Math.PI) + 1) / 2,
  "sine-in": (input: number) => -Math.cos((input * Math.PI) / 2),
  "sine-out": (input: number) => Math.sin((input * Math.PI) / 2),
  "ease-in": (input: number) => input ** 3,
  "ease-out": (input: number) => 1 - (1 - input) ** 3,
  "ease-in-out": (input: number) =>
    input < 0.5 ? 4 * input ** 3 : 1 - (-2 * input + 2) ** 3 / 2,
  linear: (input: number) => input,
  "ease-out-elastic": (input: number) =>
    input === 0
      ? 0
      : input === 1
      ? 1
      : Math.pow(2, -10 * input) *
          Math.sin((input * 10 - 0.75) * ((2 * Math.PI) / 3)) +
        1,
} as const;

export default class TimeBasedAnimationController extends Controller<number> {
  started: boolean = false;
  finished: boolean = false;
  startTime: number | null = null;
  value: number;

  constructor(
    private curve: keyof typeof EASING_CURVES,
    private durationMs: number,
    private rangeMin: number,
    private rangeMax: number,
    private immediateStart: boolean = false,
    private repeat: boolean = false,
    private defaultCallbackValue: number | null = null
  ) {
    super();
    this.value = rangeMin;
  }

  private startObservers: (() => void)[] = [];
  onStart(callback: () => void): this {
    this.startObservers.push(callback);
    return this;
  }

  private finishObservers: (() => void)[] = [];
  onFinish(callback: () => void): this {
    this.finishObservers.push(callback);
    return this;
  }

  start() {
    this.started = true;
    this.finished = false;
    this.startTime = new Date().getTime();
    this.startObservers.forEach((item) => item());
  }

  private hasUpdated: boolean = false;
  updateCallback(): number {
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      if (this.immediateStart) {
        this.start();
      }
    }
    if (!this.started)
      return this.defaultCallbackValue !== null
        ? this.defaultCallbackValue
        : this.rangeMin;
    if (this.finished)
      return this.defaultCallbackValue !== null
        ? this.defaultCallbackValue
        : this.rangeMax;
    // in theory, we can't jump back in time, so only clamping on the top bound
    const timeElapsedFraction = Math.min(
      1,
      (new Date().getTime() - this.startTime!) / this.durationMs
    );
    if (timeElapsedFraction === 1) {
      if (this.repeat) {
        this.start();
      } else {
        this.finished = true;
        this.finishObservers.forEach((item) => item());
      }
    }
    this.value =
      this.rangeMin +
      EASING_CURVES[this.curve](timeElapsedFraction) *
        (this.rangeMax - this.rangeMin);
    return this.value;
  }
}
