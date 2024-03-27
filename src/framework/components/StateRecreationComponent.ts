import Asset from "../Asset";
import Component, { ComponentLike, UpdateInfo } from "./Component";
import { normalizeComponent } from "./FunctionComponent";

export default class StateRecreationComponent extends Component {
  currentInstance: Component;
  constructor(private rootComponent: () => ComponentLike) {
    super();
    this.currentInstance = normalizeComponent(rootComponent());
  }

  get assets(): Asset[] {
    return this.currentInstance.assets;
  }

  render(context: CanvasRenderingContext2D): Promise<void> {
    return this.currentInstance.render(context);
  }

  update(updateInfo: UpdateInfo): void {
    return this.currentInstance.update(updateInfo);
  }

  recreateState() {
    this.currentInstance = normalizeComponent(this.rootComponent());
  }
}
