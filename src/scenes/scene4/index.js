import * as THREE from "three";
import * as utils from "./utils";
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
import font from "three/examples/fonts/droid/droid_sans_regular.typeface.json";

let pane,
  scene,
  camera,
  controls,
  renderer,
  cylinder,
  origin = new THREE.Vector3(0, 0, 0),
  area = 1,
  cap1,
  cap2,
  caps,
  e,
  ePath,
  maxDeflection = 0.23,
  rectPath,
  rectangleLoop;

const urls = [px, nx, py, ny, pz, nz];
const reflectionCube = new THREE.CubeTextureLoader().load(urls);
reflectionCube.encoding = THREE.sRGBEncoding;

let configs = {
  hideCylinder: false,
  hideCaps: false,
  hideField: false,
  c: 0.2,
  n: 4,
  b: 0.2,
  i: 0.0,
  theta: 0,
  deltaSpiral: 0,
};

export const renderScene = () => {
  init();

  const redMagnet = makeMagnet("red", "N");
  const blueMagnet = makeMagnet("blue", "S");
  redMagnet.rotation.x = Math.PI / 2;
  redMagnet.rotation.z = -Math.PI / 2;
  blueMagnet.rotation.x = -Math.PI / 2;
  blueMagnet.rotation.z = Math.PI / 2;
  blueMagnet.position.x += 1.5;
  redMagnet.position.x -= 1.5;
  redMagnet.position.y = blueMagnet.position.y = 1;

  const coil = Spiral(0.14, 0.2 + configs.theta * 0.05);
  coil.rotation.x = -Math.PI;
  coil.position.y = -1.5;
  coil.name = "coil";

  const BHelper = utils.createArrow(
    origin,
    new THREE.Vector3(0, 0, 1),
    3.4,
    0.1,
    "black",
    false,
    true
  );
  BHelper.rotation.z = Math.PI;
  BHelper.position.y = -1;

  rectangleLoop = Rectangle(configs.n, "#b87333");
  rectangleLoop.rotation.x = -Math.PI / 2;
  rectangleLoop.position.set(0, 0, 1);
  rectangleLoop.name = "loop";
  rectangleLoop.updateMatrix();
  rectPath = rectangleLoop.children[0].geometry.parameters.path.getPoints(100);

  // let matrix = rectangleLoop.matrix;
  // rectPath.forEach((point) => {
  // point.y += 1;
  // point.applyMatrix4(matrix);
  // });
  // ePath = ePath.concat(rectPath);

  const axis = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 2, 100, 100),
    new THREE.MeshStandardMaterial({
      color: "#b87333",
      roughness: 0.4,
      metalness: 1,
    })
  );
  axis.position.y = -0.62;

  caps = new THREE.Group();
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
  cylinder.rotation.x = Math.PI / 2;
  cylinder.position.y = 1;
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
    new THREE.RingGeometry(4, 5, 100, 1, 0, Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );

  scale.rotation.z = Math.PI / 4;
  scale.position.z = -1.2;

  for (let theta = Math.PI / 2; theta >= Math.PI / 4; theta -= 0.05) {
    markScale(theta);
  }
  j = 0;
  for (let theta = Math.PI / 2; theta <= (3 * Math.PI) / 4; theta += 0.05) {
    markScale(theta, true);
  }

  scene.add(blocks, e, redMagnet, blueMagnet, scale, cylinder);

  configurePane();

  animate();
};

// UTILITY FUNCTIONS, TO BE MERGED WITH utils.js UPON COMPLETION

let j = 0;
function markScale(theta, negative) {
  let r2 = 5,
    t = 0.5,
    long = r2 - t,
    short = r2 - t * 0.5,
    p2;
  let p1 = new THREE.Vector3(r2 * Math.cos(theta), r2 * Math.sin(theta), -1.2);
  if (j % 5 === 0) {
    p2 = new THREE.Vector3(
      long * Math.cos(theta),
      long * Math.sin(theta),
      -1.2
    );
  } else {
    p2 = new THREE.Vector3(
      short * Math.cos(theta),
      short * Math.sin(theta),
      -1.2
    );
  }
  let geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
  let line = new THREE.Line(
    geo,
    new THREE.LineBasicMaterial({ color: "black" })
  );
  j++;
  scene.add(line);
  let text = utils.createText(
    `${negative ? 1 - j : j - 1}`,
    p2.multiplyScalar(0.98),
    0.13,
    "black"
  );
  text.position.z += 0.1;
  text.rotation.z = theta;
  scene.add(text);
}

function calculateTheta() {
  let matrix = rectangleLoop.matrix;
  rectPath.forEach((point) => {
    // point.y += 1;
    point.applyMatrix4(matrix);
  });
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

function makeMagnet(color, string) {
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
  let cover = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 1.3, 2.1),
    new THREE.MeshPhongMaterial({ color: "black" })
  );
  meshResult.add(cover);
  cover.position.y -= 0.5;
  let text = new THREE.Mesh(
    new THREE.TextGeometry(`${string}`, { font: new THREE.Font(font) })
  );
  text.scale.setScalar(0.005);
  text.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 2);
  text.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  text.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI);
  text.position.set(-0.85, -0.3, -0.25);

  let textUpper = text.clone();
  if (string === "S") {
    textUpper.position.set(1.75, 1.82, 0.2);
  } else {
    textUpper.position.set(-2.25, 1.82, 0.2);
  }
  textUpper.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);
  textUpper.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI / 2);

  meshResult.add(text);
  scene.add(textUpper);

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
  let loop = new THREE.CatmullRomCurve3(points).getPoints(100);
  const tubeMesh = () => {
    return new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        100,
        tubeRadius,
        100
      ),
      new THREE.MeshStandardMaterial({
        color: `${color}`,
        roughness: roughness,
        metalness: metalness,
      })
    );
  };

  // loop.rotation.y = configs.theta;
  loop.forEach((point) => {
    point.y += 1;
  });
  ePath = curve2.getPoints(100);
  ePath = ePath.concat(loop);
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
  // rectangleLoop.name = "loop";
  return rectangleLoop;
}

function drawFieldLines() {
  let fieldlines = new THREE.Group();
  for (let angle = Math.atan2(1, 1); angle > Math.atan2(-1, 1); angle -= 0.5) {
    let fieldline = utils.createArrow(
      origin,
      new THREE.Vector3(1, 0, 0),
      1.2,
      0.04,
      "yellow"
    );
    let fieldline2 = utils.createArrow(
      origin,
      new THREE.Vector3(1, 0, 0),
      1.2,
      0.04,
      "yellow",
      true
    );
    fieldline.rotation.z = Math.PI + angle;
    fieldline2.rotation.z = angle;
    fieldlines.add(fieldline, fieldline2);
  }
  fieldlines.rotation.z = Math.PI / 2;
  fieldlines.position.y = 1;
  for (let i = 0; i < 5; i++) {
    let temp = fieldlines.clone();
    temp.position.z = -0.8 + i * 0.4;
    temp.name = "magField";
    scene.add(temp);
  }
}

let i = 0;
let previousFrame = null;

function animate() {
  requestAnimationFrame((t) => {
    if (previousFrame === null) previousFrame = t;
    animate();
    controls.update();
    let elapsedTime = (t - previousFrame) * 0.001;

    var tween = new TWEEN.Tween(cylinder.rotation)
      .to({ x: 0, y: configs.theta, z: 0 }, 100)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => (cylinder.rotation.y = configs.theta));

    tween.start(elapsedTime);
    TWEEN.update(elapsedTime);

    //update electron
    if (ePath[i]) {
      e.position.copy(ePath[i]);
    } else {
      if ((i = ePath.length - 1)) {
        i = 0;
      } else {
        scene.remove(e);
      }
    }

    i++;
    renderer.render(scene, camera);
  });
}

function updateSpring(theta) {
  cylinder.remove(cylinder.getObjectByName("coil"));
  let newSpring = Spiral(0.14, theta);
  newSpring.rotation.x = -Math.PI;
  newSpring.position.y = -1.5;
  newSpring.name = "coil";
  cylinder.add(newSpring);
}

function configurePane() {
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
        scene.getObjectByName("magField").children.forEach((child) => {
          child.material.opacity = 0;
        });
      } else {
        scene.getObjectByName("magField").children.forEach((child) => {
          child.material.opacity = 0.5;
        });
      }
    });

  pane
    .addInput(configs, "c", { label: "C", min: 0.2, max: 0.57 })
    .on("change", (e) => {
      configs.c = e.value;
      configs.theta = calculateTheta();
      updateSpring(0.2 + configs.theta);
    });

  pane
    .addInput(configs, "n", { label: "N", min: 1, max: 10, step: 1 })
    .on("change", (e) => {
      configs.n = e.value * 0.4;
      cylinder.remove(cylinder.getObjectByName("loop"));

      let newLoop = Rectangle(configs.n * 2.5, "#b87333");
      newLoop.name = "loop";
      newLoop.rotation.x = -Math.PI / 2;
      newLoop.position.z = 1;
      cylinder.add(newLoop);

      configs.theta = calculateTheta();
      updateSpring(0.2 + configs.theta * 0.05);
    });

  pane
    .addInput(configs, "b", { label: "B", min: 0.2, max: 0.57 })
    .on("change", (e) => {
      configs.b = e.value * 0.4;
      configs.theta = calculateTheta();
      updateSpring(0.2 + configs.theta * 0.05);
    });

  pane
    .addInput(configs, "i", {
      label: "i",
      min: -maxDeflection,
      max: maxDeflection,
    })
    .on("change", (e) => {
      configs.i = e.value;
      configs.theta = calculateTheta();
      updateSpring(0.2 + configs.theta * 0.05);
    });
}
