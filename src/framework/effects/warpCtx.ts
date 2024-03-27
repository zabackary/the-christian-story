/**
 * Real logic in this file from
 * https://github.com/soquel/warp.js
 */

/**
 * Warps one pixel around according to `angle`
 *
 * @private
 * @param {object} input_img source image
 * @param {object} output_img destination image
 * @param {number} inp_x source pixel x coordinate (i.e. taken from input_img)
 * @param {number} inp_y source pixel y coordinate (i.e. taken from input_img)
 * @param {number} x destination pixel x coordinate (i.e. this is where the source pixel will land)
 * @param {number} y destination pixel y coordinate (i.e. this is where the source pixel will land)
 * @param {number} angle rotation angle
 * @param {number} dist (optional) distance to center of deformation
 *
 */
function _warp_pixel(
  input_img: ImageData,
  output_img: ImageData,
  inp_x: number,
  inp_y: number,
  x: number,
  y: number,
  angle: number,
  dist: number,
  centerX: number,
  centerY: number
) {
  var r = dist;

  var a = Math.atan2(inp_y - centerY, inp_x - centerX);
  angle += a;

  // compute the pixel to copy from
  // "| 0" clamps to int
  var src_x = (centerX + Math.cos(angle) * r) | 0;
  var src_y = (centerY + Math.sin(angle) * r) | 0;

  // calculate actual positions in pixel arrays
  var src_pos = (src_y * input_img.width + src_x) * 4;
  var dest_pos = (y * output_img.width + x) * 4;

  // finish if we fall outside the boundary of original canvas
  if (
    src_x > output_img.width ||
    src_x < 0 ||
    src_pos > input_img.data.length ||
    src_pos < 0
  ) {
    return;
  }

  // copy all 4 pixel bytes (RGBA)
  for (var i = 0; i < 4; i++)
    output_img.data[dest_pos + i] = input_img.data[src_pos + i];
}

export default function warpCtx(
  ctx: CanvasRenderingContext2D,
  radius: number,
  setAngleDeg: number,
  left: number,
  top: number
) {
  // deg2rad
  const setAngle = (setAngleDeg * Math.PI) / 180;

  const input_img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Default function (can be overriden) which controls the deformation
  //in terms of distance to origin (center)
  //
  // @param {number} d from 0.0 to 1.0 telling how far along are we from the center (0.0 in the center, 1.0 at the edge of warp radius)
  // @returns {number} from 0.0 to 1.0 telling how much to rotate at this distance (0.0 no rotation, 1.0 full rotation)
  var func = (d: number) => 1.0 - d;

  const centerX = img.width / 2;
  const centerY = img.height / 2;

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      // calc position in input canvas
      const inp_x = x + left;
      const inp_y = y + top;

      const xd = centerX - inp_x;
      const yd = centerY - inp_y;

      const dist = Math.sqrt(xd * xd + yd * yd);

      if (dist < radius) {
        // calc amount of rotation at this
        // distance (according to provided func())
        const angle = setAngle * func(dist / radius);

        // pass the distance to avoid calculating
        // it yet again in the function
        _warp_pixel(
          input_img,
          img,
          inp_x,
          inp_y,
          x,
          y,
          angle,
          dist,
          centerX,
          centerY
        );
      }
    }
  }

  ctx.putImageData(img, 0, 0);
}
