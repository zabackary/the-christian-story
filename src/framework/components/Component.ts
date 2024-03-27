import Asset from "../Asset";
import { Renderable } from "./FunctionComponent";

export interface UpdateInfo {
  mouse: {
    x: number;
    y: number;
    clicked: boolean;
  };
  keyboard: {
    pressedKey: string | null;
    pressingKeys: string[];
  };
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function translateBounds(
  context: CanvasRenderingContext2D,
  bounds: Rect,
  fn: () => Promise<void>,
  inverted: boolean = false
) {
  context.save();
  context.translate(bounds.x, bounds.y);
  if (inverted) context.transform(-1, 0, 0, 1, bounds.width, 0);
  context.beginPath();
  context.rect(0, 0, bounds.width, bounds.height);
  context.clip();
  await fn();
  context.restore();
}

export default abstract class Component {
  abstract get assets(): Asset[];
  abstract render(context: CanvasRenderingContext2D): Promise<void>;
  abstract update(updateInfo: UpdateInfo): void;
}

export type ComponentLike = Renderable | Renderable[];
