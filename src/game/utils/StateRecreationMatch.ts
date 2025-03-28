import { ComponentLike } from "../../framework/components/Component";
import StateRecreationComponent from "../../framework/components/StateRecreationComponent";
import { Match } from "../../framework/components/conditionals";

export default class StateRecreationMatch extends Match {
  protected declare map: Record<string, StateRecreationComponent>;
  constructor(map: Record<string, () => ComponentLike>, key: string) {
    const modifiedMap = Object.fromEntries<StateRecreationComponent>(
      Object.entries(map).map(([k, v]) => [k, new StateRecreationComponent(v)])
    );
    super(modifiedMap, key);
  }

  set(newKey: string) {
    window.requestAnimationFrame(() => {
      super.set(newKey);
      this.map[newKey].recreateState();
    });
  }
}
