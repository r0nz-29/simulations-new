import * as THREE from "three";
import * as utils from "../../utils";
import { Pane } from "tweakpane";
import CSG from "./libs/Three-CSG";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import px from "../../images/px.jpg";
import nx from "../../images/nx.jpg";
import py from "../../images/py.jpg";
import ny from "../../images/ny.jpg";
import pz from "../../images/pz.jpg";
import nz from "../../images/nz.jpg";
import TWEEN, { Easing } from "@tweenjs/tween.js";

let pane,
  scene,
  camera,
  controls,
  renderer,
  cylinder,
  fps = 1 / 60,
  origin = new THREE.Vector3(0, 0, 0),
  area = 1,
  cap1,
  cap2,
  e,
  ePath;

const urls = [px, nx, py, ny, pz, nz];
const reflectionCube = new THREE.CubeTextureLoader().load(urls);
reflectionCube.encoding = THREE.sRGBEncoding;

let configs = {
  hideCylinder: false,
  hideCaps: false,
  thetaMax: 0.35,
  hideField: false,
  c: 0.2,
  n: 4,
  b: 0.2,
  i: 0.12,
  theta: (4 * 0.2 * 0.12 * area) / 0.2,
};

export const renderScene = () => {
  init();

  const redMagnet = makeMagnet("red");
  const blueMagnet = makeMagnet("blue");
  redMagnet.rotation.x = Math.PI / 2;
  redMagnet.rotation.z = -Math.PI / 2;
  blueMagnet.rotation.x = -Math.PI / 2;
  blueMagnet.rotation.z = Math.PI / 2;
  blueMagnet.position.x += 1.5;
  redMagnet.position.x -= 1.5;
  redMagnet.position.y = blueMagnet.position.y = 1;

  const coil = Spiral(0.14, configs.theta * 0.5);
  coil.rotation.x = -Math.PI;
  coil.position.y = -1.5;

  const BHelper = utils.createArrow(
    origin,
    new THREE.Vector3(0, 0, 1),
    3,
    0.1,
    "black",
    true
  );
  BHelper.rotation.z = Math.PI;
  BHelper.position.y = -1;

  const rectangleLoop = Rectangle(configs.n, "#b87333");
  rectangleLoop.rotation.x = -Math.PI / 2;
  rectangleLoop.position.set(0, 0, 1);

  const axis = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 2, 100, 100),
    new THREE.MeshStandardMaterial({
      color: "#b87333",
      roughness: 0.4,
      metalness: 1,
    })
  );
  axis.position.y = -0.62;

  const caps = new THREE.Group();
  cap1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.03, 100, 100),
    new THREE.MeshStandardMaterial({ color: "#040404" })
  );
  cap2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.05, 100, 100),
    new THREE.MeshStandardMaterial({ color: "#040404" })
  );
  cap1.position.set(0, 1.03, 0);
  cap2.position.set(0, -1.62, 0);
  caps.add(cap1, cap2);

  drawFieldLines();

  cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 2, 100, 100),
    new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 1.0,
      envMap: reflectionCube,
    })
  );
  cylinder.position.y = 1;
  cylinder.rotation.x = Math.PI / 2;
  cylinder.castShadow = true;
  cylinder.add(rectangleLoop, BHelper, caps, axis, coil);

  let blocks = new THREE.Group();
  let block1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.5, 0.1),
    new THREE.MeshPhongMaterial({ color: "black" })
  );
  let block2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.5, 0.1),
    new THREE.MeshPhongMaterial({ color: "black" })
  );
  block1.position.set(-1, 0.1, 2);
  block2.position.set(1, 0.1, 2);
  blocks.add(block1, block2);

  e = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 10, 10),
    new THREE.MeshBasicMaterial({ color: "cyan" })
  );
  e.position.copy(ePath[0]);

  const scale = new THREE.Mesh(
    new THREE.RingGeometry(3, 5, 100, 1, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );

  scale.rotation.z = Math.PI / 4;
  scale.position.z = -1.2;

  // for (
  //   let theta = Math.PI / 2 + Math.PI / 4;
  //   theta >= Math.PI / 4;
  //   theta -= 0.2
  // ) {
  //   let line = new THREE.Mesh(
  //     new THREE.CylinderGeometry(0.01, 0.01, 1, 10, 10),
  //     new THREE.MeshBasicMaterial({ color: "black" })
  //   );
  //   line.position.x = theta * 3;
  //   line.position.y = 4;
  //   line.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), -theta);
  //   scale.add(line);
  // }

  scene.add(blocks, e, redMagnet, blueMagnet, scale, cylinder);

  pane
    .addInput(configs, "hideCylinder", {
      label: "Hide Cylinder",
    })
    .on("change", (e) => {
      if (e.value) {
        cylinder.material.transparent = true;
        cylinder.material.opacity = 0;
      } else {
        cylinder.material.opacity = 1;
      }
    });

  pane
    .addInput(configs, "hideCaps", {
      label: "Hide Caps",
    })
    .on("change", (e) => {
      if (e.value) {
        caps.children.forEach((child) => {
          child.material.transparent = true;
          child.material.opacity = 0;
        });
      } else {
        caps.children.forEach((child) => {
          child.material.opacity = 1;
        });
      }
    });

  pane
    .addInput(configs, "hideField", { label: "Hide Field" })
    .on("change", (e) => {
      if (e.value) {
        scene.children[6].children.forEach((child) => {
          child.material.opacity = 0;
        });
      } else {
        scene.children[6].children.forEach((child) => {
          child.material.opacity = 0.5;
        });
      }
    });

  // pane
  //   .addInput(configs, "thetaMax", {
  //     label: "theta",
  //     step: 0.001,
  //     min: 0.1,
  //     max: 0.2,
  //   })
  //   .on("change", (e) => {
  //     configs.thetaMax = e.value;
  //     cylinder.children.pop();
  //     let newSpring = Spiral(configs.thetaMax);
  //     newSpring.rotation.x = -Math.PI;
  //     newSpring.position.y = -1.5;
  //     cylinder.add(newSpring);
  //   });

  pane
    .addInput(configs, "c", { label: "C", min: 0.2, max: 0.57 })
    .on("change", (e) => {
      configs.c = e.value;
      configs.theta = calculateTheta();
      updateSpring(configs.theta * 0.5);
    });

  pane
    .addInput(configs, "n", { label: "N", min: 1, max: 10, step: 1 })
    .on("change", (e) => {
      configs.n = e.value;

      cylinder.children.shift();
      let newLoop = Rectangle(configs.n, "#b87333");
      // newLoop.rotation.x = -Math.PI / 2;
      // newLoop.position.set(0, 0, 1);
      cylinder.children.unshift(newLoop);

      configs.theta = calculateTheta();
      updateSpring(configs.theta * 0.5);
    });

  pane
    .addInput(configs, "b", { label: "B", min: 0.2, max: 0.57 })
    .on("change", (e) => {
      configs.b = e.value;
      configs.theta = calculateTheta();
      updateSpring(configs.theta * 0.5);
    });

  pane
    .addInput(configs, "i", { label: "i", min: -0.12, max: 0.12 })
    .on("change", (e) => {
      configs.i = e.value;
      // if ((configs.i = 0)) configs.i = 0.1;
      configs.theta = calculateTheta();

      // .onUpdate(() => cylinder.updateMatrix());
      updateSpring(configs.theta * 0.5);
    });

  animate();
};

function calculateTheta() {
  return (configs.n * area * configs.b * configs.i) / configs.c;
}

function init() {
  pane = new Pane();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  camera.position.set(0, 10, 0);
  const alight = new THREE.AmbientLight("grey");
  const dlight = new THREE.SpotLight("white");
  const frontLight = new THREE.SpotLight("white");
  frontLight.position.set(0, 0, 5);
  dlight.position.set(0, 10, 0);
  dlight.castShadow = true;
  scene.add(dlight, alight, frontLight);
  let ground = utils.ground(10, 10, 0, 0, 0);
  scene.add(ground);
}

function makeMagnet(color) {
  let mesh1 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
  mesh1.position.y -= 0.5;
  let mesh2 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2, 100, 100));
  mesh2.rotation.z = Math.PI / 2;
  mesh2.position.y += 1;
  mesh1.updateMatrix();
  mesh2.updateMatrix();
  let cubeBSP = CSG.fromMesh(mesh1);
  let cylinderBSP = CSG.fromMesh(mesh2);
  let bspResult = cubeBSP.subtract(cylinderBSP);
  let meshResult = CSG.toMesh(bspResult, mesh1.matrix, mesh1.material);
  meshResult.material = new THREE.MeshPhongMaterial({ color: `${color}` });
  return meshResult;
}

function Spiral(maxRadius, dtheta) {
  let points = [];
  let theta = 0;
  let tubeRadius = 0.01;
  let radius;
  if (maxRadius <= 0) {
    maxRadius = 0.2;
  }
  for (radius = maxRadius; radius > 0; radius -= 0.0009) {
    let point = new THREE.Vector3(
      Math.cos(theta) * radius,
      radius * 0.5,
      Math.sin(theta) * radius
    );
    points.push(point);
    theta += dtheta;
  }
  const pipe2 = new THREE.Mesh(
    new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.12, 10, 100),
    new THREE.MeshStandardMaterial({
      color: "#b87333",
      roughness: 0.4,
      metalness: 1,
    })
  );
  pipe2.position.set(
    radius + 0.14, //left
    radius - 0.49, // in / out
    0 // up
  );
  const curve = new THREE.CatmullRomCurve3(points);
  const spiral = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 100, tubeRadius, 100),
    new THREE.MeshStandardMaterial({
      color: "#b87333",
      roughness: 0.4,
      metalness: 1,
    })
  );

  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.3, 10, 10),
    new THREE.MeshStandardMaterial({
      color: "#b87333",
      roughness: 0.4,
      metalness: 1,
    })
  );
  pipe.position.y = -0.2;
  spiral.add(pipe, pipe2);
  return spiral;
}

function Rectangle(nMax, color) {
  let width = 1;
  let height = 2;
  let tubeRadius = 0.01;
  let roughness = 0.4;
  let metalness = 1;

  // y, z, x
  let points1 = [
    new THREE.Vector3(0, 1, -1.6),
    new THREE.Vector3(0.5, 0.3, -1.3),
    new THREE.Vector3(0.5, 0.1, 2),
    new THREE.Vector3(1, 0.1, 2),
  ];
  let curve1 = new THREE.CatmullRomCurve3(points1);
  let wire1 = new THREE.Mesh(
    new THREE.TubeGeometry(curve1, 100, tubeRadius, 100),
    new THREE.MeshStandardMaterial({
      color: `${color}`,
      roughness: roughness,
      metalness: metalness,
    })
  );
  wire1.castShadow = true;

  // y, z, x
  let points2 = [
    new THREE.Vector3(-1, 0.1, 2),
    new THREE.Vector3(-0.5, 0.1, 1.1),
    new THREE.Vector3(0, 1, 1),
  ];

  let curve2 = new THREE.CatmullRomCurve3(points2);
  let wire2 = new THREE.Mesh(
    new THREE.TubeGeometry(curve2, 100, tubeRadius, 100),
    new THREE.MeshStandardMaterial({
      color: `${color}`,
      roughness: roughness,
      metalness: metalness,
    })
  );

  wire2.castShadow = true;
  scene.add(wire1, wire2);

  let points = [
    new THREE.Vector3(width / 2, 0, -height / 2),
    new THREE.Vector3(width / 2, 0, -height / 4),
    new THREE.Vector3(width / 2, 0, 0),
    new THREE.Vector3(width / 2, 0, height / 4),
    new THREE.Vector3(width / 2, 0, height / 2),

    new THREE.Vector3(width / 4, 0, height / 2),
    new THREE.Vector3(width / 8, 0, height / 2),
    new THREE.Vector3(0, 0, height / 2),
    new THREE.Vector3(-width / 8, 0, height / 2),
    new THREE.Vector3(-width / 4, 0, height / 2),

    new THREE.Vector3(-width / 2, 0, height / 2),
    new THREE.Vector3(-width / 2, 0, height / 4),
    new THREE.Vector3(-width / 2, 0, 0),
    new THREE.Vector3(-width / 2, 0, -height / 4),
    new THREE.Vector3(-width / 2, 0, -height / 2),

    new THREE.Vector3(-width / 4, 0, -height / 2),
    new THREE.Vector3(-width / 8, 0, -height / 2),
    new THREE.Vector3(0, 0, -height / 2),
    new THREE.Vector3(width / 8, 0, -height / 2),
    new THREE.Vector3(width / 4, 0, -height / 2),
    new THREE.Vector3(width / 2, 0, -height / 2),
  ];
  let loop = new THREE.CatmullRomCurve3(points);
  const tubeMesh = () => {
    return new THREE.Mesh(
      new THREE.TubeGeometry(loop, 100, tubeRadius, 100),
      new THREE.MeshStandardMaterial({
        color: `${color}`,
        roughness: roughness,
        metalness: metalness,
      })
    );
  };

  ePath = curve2.getPoints(100);
  // ePath = ePath.concat(loop.getPoints(100));
  ePath = ePath.concat(curve1.getPoints(100));

  let rectangleLoop = new THREE.Group();

  for (let n = 1; n <= nMax; n++) {
    const rectangle = tubeMesh();
    rectangleLoop.add(rectangle);
    rectangle.position.y = 0.96 + n * 0.01;
  }

  const coverTop = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      100,
      tubeRadius,
      100
    ),
    new THREE.MeshStandardMaterial({
      color: `white`,
      roughness: roughness,
      metalness: metalness,
    })
  );
  coverTop.position.y =
    rectangleLoop.children[rectangleLoop.children.length - 1].position.y + 0.01;
  const coverBottom = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points),
      100,
      tubeRadius,
      100
    ),
    new THREE.MeshStandardMaterial({
      color: `white`,
      roughness: roughness,
      metalness: metalness,
    })
  );
  coverBottom.position.y = rectangleLoop.children[0].position.y - 0.01;
  rectangleLoop.add(coverTop, coverBottom);
  return rectangleLoop;
}

function drawFieldLines() {
  let fieldlines = new THREE.Group();
  for (let angle = Math.atan2(1, 1); angle > Math.atan2(-1, 1); angle -= 0.5) {
    let fieldline = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.5, 10, 10),
      new THREE.MeshBasicMaterial({
        color: "yellow",
        transparent: true,
        opacity: 0.5,
      })
    );
    fieldline.rotation.z = angle;
    fieldlines.add(fieldline);
  }
  fieldlines.rotation.z = Math.PI / 2;
  fieldlines.position.y = 1;
  for (let i = 0; i < 5; i++) {
    let temp = fieldlines.clone();
    temp.position.z = -0.8 + i * 0.4;
    temp.name = "fieldLineGroup";
    scene.add(temp);
  }
}

let t = 0,
  i = 0;
// let w = 4;
// let A = 0.5;
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  cylinder.rotation.y = configs.theta;
  // var tween = new TWEEN.Tween(cylinder.rotation.y)
  //   .to({ y: configs.theta }, 100)
  //   .easing(Easing.Quadratic.Out)
  //   .onUpdate(() => (cylinder.rotation.y = configs.theta));
  // tween.start();
  // TWEEN.update(t);
  if (ePath[i]) {
    e.position.copy(ePath[i]);
  } else {
    if ((i = ePath.length - 1)) {
      i = 0;
    } else {
      scene.remove(e);
    }
  }

  t += fps;
  i++;
  renderer.render(scene, camera);
}

function updateSpring(theta) {
  cylinder.children.pop();
  let newSpring = Spiral(0.14, theta);
  newSpring.rotation.x = -Math.PI;
  newSpring.position.y = -1.5;
  cylinder.add(newSpring);
}
