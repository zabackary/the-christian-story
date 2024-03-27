import Component, { UpdateInfo } from "../components/Component";
import LifecycleCallbackComponent from "../components/LifecycleCallbackComponent";

export type ControllerObserver<T> = (updateOutput: T) => void;

export default abstract class Controller<T = void> {
  abstract updateCallback(updateInfo: UpdateInfo): T;

  private observers: ControllerObserver<T>[] = [];
  /**
   * Attaches a callback to be run whenever the controller's output changes
   * @param callback the callback to call
   * @returns {Controller<T>} the controller, for chaining
   */
  observe(callback: ControllerObserver<T>): this {
    this.observers.push(callback);
    return this;
  }

  /**
   * Returns a component to be rendered to listen for changes.
   */
  listener(): Component {
    return new LifecycleCallbackComponent(undefined, (updateInfo) => {
      const output = this.updateCallback(updateInfo);
      this.observers.forEach((observer) => {
        observer(output);
      });
    });
  }
}
