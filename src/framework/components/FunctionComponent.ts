import Asset from "../Asset";
import Component, { UpdateInfo } from "./Component";

export type SyncRenderFunction = (context: CanvasRenderingContext2D) => void;
export type AsyncRenderFunction = (
  context: CanvasRenderingContext2D
) => Promise<void>;
export type RenderFunction = SyncRenderFunction | AsyncRenderFunction;
export type Renderable =
  | RenderFunction
  | Component
  | Renderable[]
  | (() => Renderable);

class ComponentGroup extends Component {
  constructor(private items: Component[]) {
    super();
  }
  get assets(): Asset[] {
    return this.items.flatMap((item) => item.assets);
  }
  async render(context: CanvasRenderingContext2D): Promise<void> {
    for (const item of this.items) {
      await item.render(context);
    }
  }
  update(updateInfo: UpdateInfo): void | undefined {
    this.items.forEach((item) => item.update(updateInfo));
  }
}

export default class FunctionComponent extends Component {
  constructor(private renderFunction: RenderFunction) {
    super();
  }

  get assets() {
    return [];
  }

  update(_updateInfo: UpdateInfo) {}

  async render(context: CanvasRenderingContext2D): Promise<void> {
    this.renderFunction(context);
  }
}

export function normalizeComponent(renderable: Renderable): Component {
  if (renderable instanceof Component) {
    return renderable;
  } else if (Array.isArray(renderable)) {
    return new ComponentGroup(
      renderable.map((item) => normalizeComponent(item))
    );
  }
  // Apparently, you can check whether a function needs arguments via its
  // [length property](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length)
  else if (renderable.length >= 1) {
    // it must be renderable since it takes an argument
    const narrowed: RenderFunction = renderable;
    return new FunctionComponent(narrowed);
  } else {
    // it's a 0-arg factory
    // @ts-expect-error we know it has 0 arguments
    const result: Renderable = renderable();
    return normalizeComponent(result);
  }
}
