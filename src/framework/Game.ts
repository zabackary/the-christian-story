import Component, { ComponentLike, UpdateInfo } from "./components/Component";
import { normalizeComponent } from "./components/FunctionComponent";
import warpCtx from "./effects/warpCtx";

let globalWarp = 0;

export function setGlobalWarp(deg: number) {
  globalWarp = deg;
}

export default class Game {
  private context: CanvasRenderingContext2D;

  private mouseClickedEventQueue: true[] = [];
  private keyboardEventQueue: string[] = [];
  private pressingKeys: string[] = [];

  private mouseX: number = -1;
  private mouseY: number = -1;

  private rootComponent: Component;

  constructor(private canvas: HTMLCanvasElement, rootComponent: ComponentLike) {
    this.rootComponent = normalizeComponent(rootComponent);
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    this.context = canvas.getContext("2d")!;
  }

  registerHandlers() {
    this.canvas.addEventListener("click", () => {
      this.mouseClickedEventQueue.push(true);
    });
    window.addEventListener("keydown", (e) => {
      this.keyboardEventQueue.push(e.key);
      if (!this.pressingKeys.includes(e.key)) this.pressingKeys.push(e.key);
    });
    window.addEventListener("keyup", (e) => {
      this.pressingKeys.splice(this.pressingKeys.indexOf(e.key), 1);
    });
    this.canvas.addEventListener("mousemove", (e) => {
      this.mouseX = e.offsetX;
      this.mouseY = e.offsetY;
    });
  }

  async gameLoop() {
    this.context.reset();
    this.context.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.context.fillStyle = "#fff";
    this.context.fillRect(0, 0, 99999, 99999);
    this.context.imageSmoothingEnabled = false;
    const updateInfo: UpdateInfo = {
      mouse: {
        x: this.mouseX,
        y: this.mouseY,
        clicked: this.mouseClickedEventQueue.pop() ?? false,
      },
      keyboard: {
        pressedKey: this.keyboardEventQueue.pop() ?? null,
        pressingKeys: this.pressingKeys,
      },
    };
    this.rootComponent.update(updateInfo);
    await this.rootComponent.render(this.context);
    if (globalWarp !== 0) {
      warpCtx(this.context, this.context.canvas.height / 2, globalWarp, 0, 0);
    }
  }

  async loadAssets(statusCallback: (fraction: number) => void = () => {}) {
    let loadedCount = 0;
    statusCallback(0);
    await Promise.all(
      this.rootComponent.assets.map(async (asset) => {
        await asset.load();
        loadedCount += 1;
        statusCallback(loadedCount / this.rootComponent.assets.length);
      })
    );
    statusCallback(1);
  }

  async start() {
    await this.loadAssets();
    console.info("all assets loaded, starting loop");
    this.registerHandlers();
    const loop = async () => {
      await this.gameLoop();
      window.requestAnimationFrame(loop);
    };
    loop();
  }
}
