import Controller from "./Controller";

export default class InitialUpdateSideEffectController extends Controller {
  constructor(private sideEffect: () => void) {
    super();
  }

  private hasRunSideEffect = false;
  updateCallback(): void {
    if (!this.hasRunSideEffect) {
      this.hasRunSideEffect = true;
      this.sideEffect();
    }
  }
}
