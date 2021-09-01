import * as THREE from "three";
// import compass from "./images/compass.png";
import { Sky } from "three/examples/jsm/objects/Sky";
import TextSprite from "@seregpie/three.text-sprite";
import woodenFloor from "./images/woodenFloor.jpg";

// import TextTexture from "@seregpie/three.text-texture";

// const Compass = new THREE.TextureLoader().load(compass);
const groundTexture = new THREE.TextureLoader().load(woodenFloor);

export const ground = (width, height, x, y, z) => {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(width ? width : 10, height ? height : 10, 10, 10),
    new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      color: "grey",
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

function fLoop(v) {
  var flag = 1;
  var fLoop = new THREE.Vector3();
  var r;
  var qpos = [];
  var tang = [];
  var numCharges = 12;
  var th = 0;
  //var q=[1,1,1,1,1,1,1,1];
  for (let i = 0; i < numCharges; i++) {
    th = (2 * i * Math.PI) / numCharges;
    qpos[i] = new THREE.Vector3(Math.cos(th), Math.sin(th), 0);
    tang[i] = new THREE.Vector3(-flag * Math.sin(th), flag * Math.cos(th), 0);
  }
  for (let i = 0; i < 12; i++) {
    r = tang[i].cross(qpos[i].to(v));
    r.setMagnitude(10 / r.getMagnitudeSquared());
    fLoop.add(r);
  }
  return fLoop;
}

export function VectorField(src0, src1) {
  this.minBounds = new THREE.Vector3(-20, -30, -20);
  this.maxBounds = new THREE.Vector3(20, 30, 20);
  this.arrowLoc = 0.35;
  this.arrowSize = 0.03;
  this.maxSteps = 150;
  this.stopPoints = [];
  this.fieldColor = "#ffffff";
  this.arrowColor = "#ffffff";
  this.min = 1e-12;
  this.max = 1e12;
  this.step = 0.5;
  this.useTube = true;
  this.floop = function fLoop(v) {
    var flag = 1;
    var fLoop = new THREE.Vector3();
    var r;
    var qpos = [];
    var tang = [];
    var numCharges = 12;
    var th = 0;
    //var q=[1,1,1,1,1,1,1,1];
    for (let i = 0; i < numCharges; i++) {
      th = (2 * i * Math.PI) / numCharges;
      qpos[i] = new THREE.Vector3(Math.cos(th), Math.sin(th), 0);
      tang[i] = new THREE.Vector3(-flag * Math.sin(th), flag * Math.cos(th), 0);
    }
    for (let i = 0; i < 12; i++) {
      r = tang[i].cross(qpos[i].to(v));
      r.setMagnitude(10 / r.getMagnitudeSquared());
      fLoop.add(r);
    }
    return fLoop;
  };

  /**
   * returns field vector at point p
   */
  this.fieldEvaluator = function (p) {
    let factor = 0.7;
    let AP = p.clone().sub(src0);
    let BP = p.clone().sub(src1);

    let d1 = AP.length();
    let d2 = BP.length();

    AP = AP.cross(new THREE.Vector3(0, 0, 1)).multiplyScalar(
      factor / (d1 * d1)
    );
    BP = BP.cross(new THREE.Vector3(0, 0, 1)).multiplyScalar(
      factor / (d2 * d2)
    );

    BP = BP.sub(AP);
    // console.log(p);
    //console.log(AP);
    return BP;
  };
  // if (options) {
  //   if (options.minBounds) this.minBounds = options.minBounds;
  //   if (options.maxBounds) this.maxBounds = options.maxBounds;
  //   if (options.arrowLoc) this.arrowLoc = options.arrowLoc;
  //   if (options.arrowSize) this.arrowSize = options.arrowSize;
  //   if (options.maxSteps) this.maxSteps = options.maxSteps;
  //   if (options.fieldColor) this.fieldColor = options.fieldColor;
  //   if (options.arrowColor) this.arrowColor = options.arrowColor;
  //   if (options.stopPoints) this.stopPoints = options.stopPoints;
  //   if (options.fieldEvaluator) this.fieldEvaluator = options.fieldEvaluator;
  //   if (options.min) this.min = options.min;
  //   if (options.max) this.max = options.max;
  //   if (options.step) this.step = options.step;
  // }

  this.addStopPoints = function (p) {
    this.stopPoints[this.stopPoints.length] = p;
  };

  this.getFieldAt = function (p) {
    return this.fieldEvaluator(p);
  };

  this.createField = function (pt, moveAgainstField, opacity) {
    let vertices = [];
    let dir = this.fieldEvaluator(pt).normalize();
    let prevDir = new THREE.Vector3();
    prevDir.set(dir.x, dir.y, dir.z);
    if (!dir) return;
    vertices[vertices.length] = pt;
    let p = pt.clone();
    let k = moveAgainstField ? -1 : 1;
    let n = 0;
    outer: while (n < this.maxSteps) {
      if (!dir) break;
      let E = dir.normalize();
      //avoid abrupt change in field
      if (dir.dot(prevDir) < -0.5) break;
      prevDir.set(dir.x, dir.y, dir.z);
      if (E < this.min || E > this.max) break;
      dir = dir.multiplyScalar(k * this.step);
      p.add(dir);
      if (!withinBounds(p, this.minBounds, this.maxBounds)) break;

      if (p.distanceTo(pt) < this.step / 2) {
        vertices[vertices.length] = new THREE.Vector3(pt.x, pt.y, pt.z);
        break;
      }
      for (let i = 0; i < this.stopPoints.length; i++) {
        let stopPoint = this.stopPoints[i];
        if (p.distanceTo(stopPoint) < this.step / 2) {
          vertices[vertices.length] = new THREE.Vector3(
            stopPoint.x,
            stopPoint.y,
            stopPoint.z
          );
          break outer;
        }
      }

      vertices[vertices.length] = new THREE.Vector3(p.x, p.y, p.z);
      dir = this.fieldEvaluator(p);
      n++;
    }
    //console.log(vertices);
    if (vertices.length < 2) return;
    let curve = new THREE.CatmullRomCurve3(vertices);
    let geometry;
    let material;
    let curveObject;
    if (this.useTube) {
      geometry = new THREE.TubeGeometry(curve, 40, this.arrowSize / 5, 5);
      material = new THREE.MeshPhongMaterial({
        color: this.fieldColor,
      });
      curveObject = new THREE.Mesh(geometry, material);
    } else {
      let points = curve.getPoints(50);
      geometry = new THREE.BufferGeometry().setFromPoints(points);
      material = new THREE.LineBasicMaterial({
        color: this.fieldColor,
        linewidth: 4,
      });
      curveObject = new THREE.Line(geometry, material);
      //material = new MeshLineMaterial({
      //  lineWidth:2.5,
      // color:this.fieldColor
      //});
      //const line = new MeshLine();
      // line.setPoints(points);
      // curveObject = new THREE.Line(geometry, material);
    }

    let ap1 = curve.getPoint(this.arrowLoc);
    //let ap2=curve.getPoint(this.arrowLoc+this.arrowSize);
    dir = this.fieldEvaluator(ap1).normalize();
    const arrowHelper = new THREE.ArrowHelper(
      dir,
      ap1,
      this.arrowSize,
      this.arrowColor,
      1.5 * this.arrowSize,
      this.arrowSize
    );
    curveObject.add(arrowHelper);

    if (opacity) material.opacity = opacity;
    return curveObject;
  };

  function withinBounds(p, minBounds, maxBounds) {
    if (
      p.x < minBounds.x ||
      p.y < minBounds.y ||
      p.z < minBounds.z ||
      p.x > maxBounds.x ||
      p.y > maxBounds.y ||
      p.z > maxBounds.z
    )
      return false;
    return true;
  }
}

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
      opacity: 0.8,
      roughness: 0.9,
      metalness: 1,
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

// export const createArrow = (radius, length) => {
//   const coneG = new THREE.ConeGeometry(radius, length, 10, 10);
//   const arrow = new THREE.Mesh(coneG, createMaterial("red", false));
//   arrow.rotation.z = -Math.PI / 2;
//   arrow.position.x += 0.06;
//   return arrow;
// };

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
    // fontFamily: "Arial, Times, serif",
    fontFamily: "monospace",
    fontSize: size,
    fontStyle: "bold",
    text: text,
  });
  textSprite.position.set(pos.x, pos.y, pos.z);
  return textSprite;
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
  // console.log(arrow);
  return arrow;
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
