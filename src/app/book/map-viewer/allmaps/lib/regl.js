const glslGDALGCPTransform = `
vec2 GDALGCPTransform (float x2_mean, float  y2_mean, float[10] adfFromGeoX, float[10] adfFromGeoY, int nOrder, vec2 point) {
  vec2 transformedPoint = CRS_georef(point.x - x2_mean, point.y - y2_mean,
    adfFromGeoX, adfFromGeoY, nOrder);

  return transformedPoint;
}`

const glslCRSgeoref = `
vec2 CRS_georef (float e1, float n1, float[10] E, float[10] N, int order) {
  float e3 = 0.0;
  float e2n = 0.0;
  float en2 = 0.0;
  float n3 = 0.0;
  float e2 = 0.0;
  float en = 0.0;
  float n2 = 0.0;

  float e;
  float n;

  if (order == 1) {
    e = E[0] + E[1] * e1 + E[2] * n1;
    n = N[0] + N[1] * e1 + N[2] * n1;

    return vec2(e, n);
  } else if (order == 2) {
    e2 = e1 * e1;
    n2 = n1 * n1;
    en = e1 * n1;

    e = E[0]      + E[1] * e1 + E[2] * n1 +
      E[3] * e2 + E[4] * en + E[5] * n2;

    n = N[0]      + N[1] * e1 + N[2] * n1 +
      N[3] * e2 + N[4] * en + N[5] * n2;

    return vec2(e, n);
  } else if (order == 3) {
    e2  = e1 * e1;
    en  = e1 * n1;
    n2  = n1 * n1;
    e3  = e1 * e2;
    e2n = e2 * n1;
    en2 = e1 * n2;
    n3  = n1 * n2;

    e = E[0]      +
        E[1] * e1 + E[2] * n1  +
        E[3] * e2 + E[4] * en  + E[5] * n2  +
        E[6] * e3 + E[7] * e2n + E[8] * en2 + E[9] * n3;
    n = N[0]      +
        N[1] * e1 + N[2] * n1  +
        N[3] * e2 + N[4] * en  + N[5] * n2  +
        N[6] * e3 + N[7] * e2n + N[8] * en2 + N[9] * n3;

    return vec2(e, n);
  } else {
    return vec2(0, 0);
  }
}`

// geoRefImageSize = getGeoRefImageSize(annotation)

export function createDrawCommand (regl,
  maxTiles,
  canvasSize, imageSize, tileSize,
  texture, imagePositions, tilePositions, scaleFactors,
  hTransformArg) {
  return regl({
    viewport: {
      x: 0,
      y: 0,
      width: canvasSize[0],
      height: canvasSize[1]
    },
    blend: {
      enable: true
    },
    frag: `
      precision highp float;
      uniform sampler2D texture;
      uniform sampler2D imagePositions;
      uniform sampler2D tilePositions;
      uniform sampler2D scaleFactors;

      varying vec2 p;

      uniform vec2 u_geoRefSize;

      uniform vec2 u_southWest;
      uniform vec2 u_northEast;

      uniform int u_tileCount;
      uniform vec2 textureSize;

      uniform vec2 tileSize;

      uniform float u_x2_mean;
      uniform float u_y2_mean;

      uniform float u_adfFromGeoX[10];
      uniform float u_adfFromGeoY[10];
      uniform int u_nOrder;

      uniform bool visible;

      ${glslCRSgeoref}
      ${glslGDALGCPTransform}

      void main (void) {
        float min_lat = u_southWest.y;
        float min_lon = u_southWest.x;

        float max_lat = u_northEast.y;
        float max_lon = u_northEast.x;

        float div_lat = max_lat - min_lat;
        float div_lon = max_lon - min_lon;

        float input_x = min_lat + div_lat * (1.0 - p.y);
        float input_y = min_lon + div_lon * (1.0 - p.x);

        vec2 point = vec2(input_x, input_y);

        vec2 tr = GDALGCPTransform(u_x2_mean, u_y2_mean, u_adfFromGeoX, u_adfFromGeoY, u_nOrder, point);

        float width = u_geoRefSize.x;
        float height = u_geoRefSize.y;

        if (tr.x < 0.0 || tr.x >= width || tr.y < 0.0 || tr.y >= height) {
          gl_FragColor = vec4(0, 0, 0, 0);
        } else {
          float texturePixelX = 0.0;
          float texturePixelY = 0.0;

          float diffX = 0.0;
          float diffY = 0.0;

          float scaleFactor = 0.0;

          bool found = false;
          int tileIndex = 0;

          for (int tileIndex = 0; tileIndex < ${maxTiles}; tileIndex += 1) {
            if (tileIndex < u_tileCount) {
              vec4 imagePosition = texture2D(imagePositions, vec2((1.0 / float(u_tileCount - 1)) * float(tileIndex), 0));

              float tileRegionX = imagePosition.r * width;
              float tileRegionY = imagePosition.g * height;
              float tileRegionWidth = imagePosition.b * width;
              float tileRegionHeight = imagePosition.a * height;

              if (tr.x >= tileRegionX && tr.x < tileRegionX + tileRegionWidth
                && tr.y >= tileRegionY && tr.y < tileRegionY + tileRegionHeight) {

                found = true;

                scaleFactor = texture2D(scaleFactors, vec2((1.0 / float(u_tileCount - 1)) * float(tileIndex), 0)).r * 256.0;

                diffX = (tr.x - tileRegionX) / scaleFactor;
                diffY = (tr.y - tileRegionY) / scaleFactor;

                vec4 tilePosition = texture2D(tilePositions, vec2((1.0 / float(u_tileCount - 1)) * float(tileIndex), 0));

                texturePixelX = tilePosition.r + diffX / textureSize.x;
                texturePixelY = tilePosition.g + diffY / textureSize.y;
              }
            }
          }

          if (found == true && visible) {
            vec4 color = texture2D(texture, vec2(texturePixelX, texturePixelY));
            gl_FragColor = vec4(color.rgb, 1.0 * color.a);
          } else {
            gl_FragColor = vec4(0.0, 0, 0, 0);
          }
        }
      }
    `,
    vert: `
      precision highp float;
      attribute vec2 position;
      varying vec2 p;

      void main () {
        p = position;

        gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
      }
    `,

    attributes: {
      position: [-2, 0, 0, -2, 2, 2]
    },
    count: 3,

    uniforms: {
      texture,
      tilePositions,
      imagePositions,
      scaleFactors,

      u_geoRefSize: () => imageSize,

      tileSize,
      visible: regl.prop('visible'),
      textureSize: regl.prop('textureSize'),

      u_southWest: regl.prop('southWest'),
      u_northEast: regl.prop('northEast'),

      u_tileCount: regl.prop('tileCount'),

      u_x2_mean: () => hTransformArg.x2Mean,
      u_y2_mean: () => hTransformArg.y2Mean,

      'u_adfFromGeoX[0]': hTransformArg.adfFromGeoX[0],
      'u_adfFromGeoX[1]': hTransformArg.adfFromGeoX[1],
      'u_adfFromGeoX[2]': hTransformArg.adfFromGeoX[2],
      'u_adfFromGeoX[3]': 0.0,
      'u_adfFromGeoX[4]': 0.0,
      'u_adfFromGeoX[5]': 0.0,
      'u_adfFromGeoX[6]': 0.0,
      'u_adfFromGeoX[7]': 0.0,
      'u_adfFromGeoX[8]': 0.0,
      'u_adfFromGeoX[9]': 0.0,

      'u_adfFromGeoY[0]': hTransformArg.adfFromGeoY[0],
      'u_adfFromGeoY[1]': hTransformArg.adfFromGeoY[1],
      'u_adfFromGeoY[2]': hTransformArg.adfFromGeoY[2],
      'u_adfFromGeoY[3]': 0.0,
      'u_adfFromGeoY[4]': 0.0,
      'u_adfFromGeoY[5]': 0.0,
      'u_adfFromGeoY[6]': 0.0,
      'u_adfFromGeoY[7]': 0.0,
      'u_adfFromGeoY[8]': 0.0,
      'u_adfFromGeoY[9]': 0.0,

      u_nOrder: () => hTransformArg.nOrder
    },

    depth: {
      enable: false
    }
  })
}
