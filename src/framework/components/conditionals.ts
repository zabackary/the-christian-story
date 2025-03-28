import Component, { ComponentLike, UpdateInfo } from "./Component";
import { normalizeComponent } from "./FunctionComponent";

export class Either extends Component {
  private ifTrue: Component;
  private ifFalse: Component;
  constructor(
    ifTrue: ComponentLike,
    ifFalse: ComponentLike,
    private condition: boolean = false
  ) {
    super();
    this.ifTrue = normalizeComponent(ifTrue);
    this.ifFalse = normalizeComponent(ifFalse);
  }

  get assets() {
    return [...this.ifTrue.assets, ...this.ifFalse.assets];
  }

  async render(context: CanvasRenderingContext2D): Promise<void> {
    if (this.condition) {
      await this.ifTrue.render(context);
    } else {
      await this.ifFalse.render(context);
    }
  }

  update(updateInfo: UpdateInfo) {
    if (this.condition) {
      this.ifTrue.update(updateInfo);
    } else {
      this.ifFalse.update(updateInfo);
    }
  }

  set(newCondition: boolean) {
    window.requestAnimationFrame(() => {
      this.condition = newCondition;
    });
  }
}

export class Match extends Component {
  protected map: Record<string, Component>;
  constructor(map: Record<string, ComponentLike>, private key: string) {
    super();
    if (!Object.hasOwn(map, key)) {
      throw new Error("supplied key to Match isn't in map");
    }
    this.map = Object.fromEntries(
      Object.entries<ComponentLike>(map).map(([k, v]) => [
        k,
        normalizeComponent(v),
      ])
    );
  }

  get assets() {
    return Object.values<Component>(this.map).flatMap(
      (component) => component.assets
    );
  }

  async render(context: CanvasRenderingContext2D): Promise<void> {
    await this.map[this.key].render(context);
  }

  update(updateInfo: UpdateInfo) {
    this.map[this.key].update(updateInfo);
  }

  set(newKey: string) {
    if (!Object.hasOwn(this.map, newKey)) {
      throw new Error("supplied key to Match isn't in map");
    }
    window.requestAnimationFrame(() => {
      this.key = newKey;
    });
  }
}
