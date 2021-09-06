import * as THREE from "three";
import compass from "./compass.png";
import { Sky } from "three/examples/jsm/objects/Sky";
import TextSprite from "@seregpie/three.text-sprite";
import TextTexture from "@seregpie/three.text-texture";
import woodenFloor from "../../images/woodenFloor.jpg";

const groundTexture = new THREE.TextureLoader().load(woodenFloor);

export const ground = (width, height, x, y, z) => {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(width ? width : 10, height ? height : 10, 10, 10),
    new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      map: groundTexture,
    })
  );
  ground.rotation.x = Math.PI / 2;
  ground.position.x = x ? x : 0;
  ground.position.y = y ? y : -3;
  ground.position.z = z ? z : -2;
  ground.receiveShadow = true;
  return ground;
};

export const createArrow = (start, dir, length, thickness, color) => {
  let cylinderGeom = new THREE.CylinderGeometry(
    thickness / 2,
    thickness / 2,
    length - thickness * 2,
    12
  );
  let headGeom = new THREE.ConeGeometry(thickness * 1.5, thickness * 4, 12);
  let material = new THREE.MeshPhongMaterial({
    color: color,
  });
  let cylinder = new THREE.Mesh(cylinderGeom, material);
  cylinder.position.set(0, length / 2 - thickness, 0);
  let head = new THREE.Mesh(headGeom, material);

  head.position.set(0, length - thickness * 2, 0);
  let arrow = new THREE.Group();
  arrow.add(cylinder);
  arrow.add(head);
  var axis = new THREE.Vector3(0, 1, 0);
  arrow.quaternion.setFromUnitVectors(axis, dir.clone().normalize());
  arrow.position.set(start.x, start.y, start.z);
  return arrow;
};

const Compass = new THREE.TextureLoader().load(compass);

export const createMap = (image) => {
  const map = new THREE.TextureLoader().load(image);
  return map;
};

export const createMaterial = (color, wireframe) => {
  let material = new THREE.MeshPhysicalMaterial({
    color: `${color}`,
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
  const ring = new THREE.Mesh(ringG, createMaterial("red", false));
  return ring;
};

export const createRefPlane = (width, height, horizontal) => {
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
  if (horizontal) {
    plane.rotation.x = Math.PI / 2;
  }
  return plane;
};

export const cross = (cross) => {
  const circle = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.15, 20, 10),
    new THREE.MeshPhysicalMaterial({
      color: "blue",
      wireframe: false,
      side: THREE.DoubleSide,
    })
  );
  if (cross) {
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
  }
  return circle;
};

export const createCompass = (configs) => {
  const g = new THREE.CylinderGeometry(0.5, 0.5, 0.01, 20, 20);
  const m = new THREE.MeshPhysicalMaterial({
    map: Compass,
  });
  const c = new THREE.Mesh(g, m);
  c.position.set(3, 0, 0);
  let direction = c.position.normalize();
  let newPos = new THREE.Vector3(direction.x * 3.0, 0, direction.z * 3.0);
  let initial_angle =
    configs.currentDir === "down" ? -Math.PI / 2 : Math.PI / 2;
  c.rotation.y = initial_angle;
  c.position.copy(newPos);
  return c;
};

export const createText = (text, pos, size, color) => {
  if (!color) color = "#ffffff";
  if (!size) size = 0.1;

  let textSprite = new TextSprite({
    alignment: "center",
    color: color,
    fontFamily: "monospace",
    fontSize: size,
    fontStyle: "bold",
    text: text,
  });
  textSprite.position.set(pos.x, pos.y, pos.z);
  return textSprite;
};
