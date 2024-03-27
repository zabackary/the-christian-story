import { ComponentLike, Rect } from "../../framework/components/Component";
import Container from "../../framework/components/Container";
import DynamicImageComponent from "../../framework/components/DynamicImageComponent";
import LifecycleCallbackComponent from "../../framework/components/LifecycleCallbackComponent";

export default function labeledImageButton(
  src: string,
  hoveredSrc: string,
  label: ComponentLike,
  onClick: () => void,
  bounds: Rect,
  boundsWidthExtension: number = 0
) {
  const image = new DynamicImageComponent([src, hoveredSrc], src, {
    ...bounds,
    x: 0,
    y: 0,
  });
  return new Container(
    [
      image,
      new LifecycleCallbackComponent(undefined, (updateInfo) => {
        if (
          updateInfo.mouse.x > 0 &&
          updateInfo.mouse.x < bounds.width &&
          updateInfo.mouse.y > 0 &&
          updateInfo.mouse.y < bounds.height
        ) {
          image.setVisibleImage(hoveredSrc);
          if (updateInfo.mouse.clicked) {
            onClick();
          }
        } else {
          image.setVisibleImage(src);
        }
      }),
      label,
    ],
    {
      ...bounds,
      width: bounds.width + boundsWidthExtension,
    }
  );
}
