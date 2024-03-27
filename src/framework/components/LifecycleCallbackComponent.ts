import Component, { UpdateInfo } from "./Component";

export default class LifecycleCallbackComponent extends Component {
  constructor(
    private onRender?: () => void,
    private onUpdate?: (updateInfo: UpdateInfo) => void
  ) {
    super();
  }

  get assets() {
    return [];
  }

  update(updateInfo: UpdateInfo) {
    this.onUpdate?.(updateInfo);
  }

  async render(_context: CanvasRenderingContext2D): Promise<void> {
    this.onRender?.();
  }
}
