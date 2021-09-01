import * as THREE from "three";
// import compass from "./images/compass.png";
import { Sky } from "three/examples/jsm/objects/Sky";
import TextSprite from "@seregpie/three.text-sprite";
import TextTexture from "@seregpie/three.text-texture";

// const Compass = new THREE.TextureLoader().load(compass);

export const createMap = (image) => {
  const map = new THREE.TextureLoader().load(image);
  return map;
};

export const createMaterial = (color, wireframe) => {
  let material = new THREE.MeshStandardMaterial({
    color: `${color}`,
    roughness: 0.5,
    metalness: 1,
    wireframe: wireframe,
  });
  return material;
};

export const createWire = (radTop, radBottom, height) => {
  const cylinderG = new THREE.CylinderGeometry(
    radTop,
    radBottom,
    height,
    10,
    10,
    false
  );
  const wire = new THREE.Mesh(
    cylinderG,
    new THREE.MeshPhysicalMaterial({
      color: "blue",
      transparent: true,
      opacity: 0.7,
    })
  );
  return wire;
};

export const createRing = (radius, thickness) => {
  const ringG = new THREE.TorusGeometry(radius, thickness, 10, 100);
  const ring = new THREE.Mesh(ringG, createMaterial("blue", false));
  return ring;
};

export const createRefPlane = (width, height) => {
  const planeG = new THREE.PlaneGeometry(width, height, 20, 20);
  const plane = new THREE.Mesh(
    planeG,
    new THREE.MeshBasicMaterial({
      color: "grey",
      wireframe: false,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    })
  );
  return plane;
};

export const createArrow = (radius, length) => {
  const coneG = new THREE.ConeGeometry(radius, length, 10, 10);
  const arrow = new THREE.Mesh(coneG, createMaterial("red", false));
  arrow.rotation.z = -Math.PI / 2;
  arrow.position.x += 0.06;
  return arrow;
};

export const cross = () => {
  const circle = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.15, 20, 10),
    new THREE.MeshPhysicalMaterial({
      color: "blue",
      wireframe: false,
      side: THREE.DoubleSide,
    })
  );
  const line1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.24),
    createMaterial("blue", false)
  );
  line1.rotation.z = Math.PI / 4;
  const line2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.24),
    createMaterial("blue", false)
  );
  line2.rotation.z = -Math.PI / 4;
  circle.add(line1, line2);
  return circle;
};

// export const createCompass = (configs) => {
//   const g = new THREE.CylinderGeometry(0.5, 0.5, 0.01, 20, 20);
//   const m = new THREE.MeshPhysicalMaterial({
//     map: Compass,
//   });
//   const c = new THREE.Mesh(g, m);
//   // c.rotation.x = Math.PI / 2;
//   c.position.set(3, 0, 0);
//   // c.rotation.y = Math.PI;
//   let direction = c.position.normalize();
//   let newPos = new THREE.Vector3(direction.x * 3.0, 0, direction.z * 3.0);
//   let initial_angle =
//     configs.currentDir === "down" ? -Math.PI / 2 : Math.PI / 2;
//   c.rotation.y = initial_angle;
//   c.position.copy(newPos);
//   return c;
// };

export const createText = (text, pos, size, color) => {
  if (!color) color = "#ffffff";
  if (!size) size = 0.1;

  let textSprite = new TextSprite({
    alignment: "center",
    color: color,
    fontFamily: "Arial, Times, serif",
    fontSize: size,
    fontStyle: "bold",
    text: text,
  });
  textSprite.position.set(pos.x, pos.y, pos.z);
  return textSprite;
};

export function monkeyPatch(
  shader,
  { defines = "", header = "", main = "", ...replaces }
) {
  let patchedShader = shader;

  const replaceAll = (str, find, rep) => str.split(find).join(rep);
  Object.keys(replaces).forEach((key) => {
    patchedShader = replaceAll(patchedShader, key, replaces[key]);
  });

  patchedShader = patchedShader.replace(
    "void main() {",
    `
    ${header}
    void main() {
      ${main}
    `
  );

  return `
    ${defines}
    ${patchedShader}
  `;
}

export const createSky = (renderer) => {
  const sky = new Sky();
  sky.scale.setScalar(450000);

  const turbidity = 10;
  const rayleigh = 3;
  const mieCoefficient = 0.005;
  const mieDirectionalG = 0.7;
  const elevation = 2;
  const azimuth = 180;
  const exposure = renderer.toneMappingExposure;

  const sun = new THREE.Vector3();
  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = turbidity;
  uniforms["rayleigh"].value = rayleigh;
  uniforms["mieCoefficient"].value = mieCoefficient;
  uniforms["mieDirectionalG"].value = mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms["sunPosition"].value.copy(sun);

  renderer.toneMappingExposure = exposure;

  return sky;
};
