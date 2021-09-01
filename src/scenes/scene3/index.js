import * as THREE from "three";
import * as utils from "./utils";
import { Pane } from "tweakpane";
import { Electron } from "../scene0/Electron";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
let src0 = new THREE.Vector3(-2, 0, 0);
let src1 = new THREE.Vector3(2, 0, 0);

let configs = {
  showField: false,
  showReferencePlaneX: false,
  showReferencePlaneY: false,
  toggleCurrent: false,
};

// let wire1Dir = 'up';
// let wire2Dir = 'down';
let wire1Dir = {
  name: 'up',
  value: new THREE.Vector3(0, 0, -1)
}
let wire2Dir = {
  name: 'down',
  value: new THREE.Vector3(0, 0, 1)
}
let currentHeplers = new THREE.Mesh(
  new THREE.PlaneGeometry(),
  new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
);

export const renderScene = (graphContainer) => {
  const pane = new Pane();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // const camera = new THREE.OrthographicCamera(
  //   window.innerWidth / -180,
  //   window.innerWidth / 180,
  //   window.innerHeight / 180,
  //   window.innerHeight / -180,
  //   1,
  //   1000
  // );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.z = 5;
  const alight = new THREE.AmbientLight("grey");
  const dlight = new THREE.DirectionalLight("white");
  dlight.position.set(0, 10, 0);
  dlight.castShadow = true;
  let magneticField = new utils.VectorField(src0, src1);

  const ground = utils.ground(15, 20, 0, -2, 0);
  scene.add(ground)

  const origin = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 10, 10),
    new THREE.MeshPhysicalMaterial({
      color: "blue",
      roughness: 0.3,
      metalness: 1,
    })
  );
  // origin.position.z = 2;
  const refPlaneX = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5, 10, 10),
    new THREE.MeshBasicMaterial({
      color: "grey",
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    })
  );
  refPlaneX.rotation.x = Math.PI / 2;

  const refPlaneY = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5, 10, 10),
    new THREE.MeshBasicMaterial({
      color: "grey",
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    })
  );
  // scene.add(refPlaneX, refPlaneY);

  let wire1Electrons = [];
  let wire2Electrons = [];

  const wire1 = utils.createWire(0.1, 0.1, 6);
  wire1.rotation.x = Math.PI / 2;
  wire1.position.x = -2;
  wire1.castShadow = true;

  const wire2 = utils.createWire(0.1, 0.1, 6);
  wire2.rotation.x = Math.PI / 2;
  wire2.position.x = 2;
  wire2.castShadow = true;

  for (let i = 0; i < 8; i++) {
    const electron = new Electron(0.05, "red", false, wire1Dir.name, 0.07, 5.8);
    electron.getMesh().position.y = -3.2 + i * 0.8;
    wire1Electrons.push(electron);
    wire1.add(electron.getMesh());

    const electron2 = new Electron(0.05, "red", false, wire2Dir.name, 0.07, 5.8);
    electron2.getMesh().position.y = -3.2 + i * 0.8;
    wire2Electrons.push(electron2);
    wire2.add(electron2.getMesh());

  }

  const point = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 10),
    new THREE.MeshPhysicalMaterial({
      color: "red",
      roughness: 0.3,
      metalness: 1,
    })
  );
  point.position.x = 2;
  point.position.y = 1;
  point.castShadow = true

  const r1 = wire1.position.distanceTo(point.position);

  const theta1 = Math.atan2(
    point.position.y,
    point.position.x + Math.abs(wire1.position.x)
  );

  let r1direction = new THREE.Vector3(
    r1 * Math.cos(theta1),
    r1 * Math.sin(theta1),
    0
  );

  const loop1 = utils.dashedLoop(r1);
  loop1.name = "loop1";
  loop1.position.copy(wire1.position);

  const current1 = utils.createArrow(
    wire1.position,
    wire1Dir.value,
    1,
    0.04,
    "white"
  );
  current1.name = "current1";
  current1.position.x -= 0.5;
  current1.position.z = 0;

  currentHeplers.add(current1);

  const rVector1 = utils.dashedLine(wire1.position, point.position);
  rVector1.name = "rVector1";

  const tangent1dir = new THREE.Vector3().crossVectors(
    wire1Dir.value,
    r1direction
  );
  const tangent1 = utils.createArrow(
    point.position,
    tangent1dir,
    1 / tangent1dir.length(),
    0.05,
    "red"
  );
  tangent1.name = "tangent1";

  const r2 = wire2.position.distanceTo(point.position);

  const theta2 =
    Math.PI -
    Math.atan2(
      point.position.y,
      Math.abs(wire2.position.x) - Math.abs(point.position.x)
    );

  let r2direction = new THREE.Vector3(
    r2 * Math.cos(theta2),
    r2 * Math.sin(theta2),
    0
  );

  const loop2 = utils.dashedLoop(r2);
  loop2.name = "loop2";
  loop2.position.copy(wire2.position);

  const current2 = utils.createArrow(
    wire2.position,
    wire2Dir.value,
    1,
    0.04,
    "white"
  );
  current2.name = "current2";
  current2.position.x += 0.5;
  current2.position.z = 0;
  currentHeplers.add(current2);

  const rVector2 = utils.dashedLine(wire2.position, point.position);
  rVector2.name = "rVector2";

  const tangent2dir = new THREE.Vector3().crossVectors(
    wire2Dir.value,
    r2direction
  );
  const tangent2 = utils.createArrow(
    point.position,
    tangent2dir,
    1 / tangent2dir.length(),
    0.05,
    "yellow"
  );
  tangent2.name = "tangent2";

  const bnetDir = new THREE.Vector3().addVectors(
    tangent1dir.clone().divideScalar(tangent1dir.lengthSq()),
    tangent2dir.clone().divideScalar(tangent2dir.lengthSq())
  );
  const bnet = utils.createArrow(point.position, bnetDir, 1, 0.05, "purple");
  bnet.name = "bnet";
  let w = 0;
  let R = 0.2;
  for (w = 0; w < 6.3; w += 0.5) {
    origin.position.copy(
      new THREE.Vector3(2 + R * Math.cos(w), R * Math.sin(w), 0)
    );
    let fieldLine = magneticField.createField(origin.position, false, 1);
    fieldLine.name = "fieldLine";
    fieldLine.material.transparent = true;
    fieldLine.material.opacity = 0;
    fieldLine.children[0].cone.material.transparent = true;
    fieldLine.children[0].cone.material.opacity = 0;
    console.log(fieldLine);
    scene.add(fieldLine);
  }

  pane.addInput(configs, "showReferencePlaneX").on("change", (e) => {
    if (e.value) {
      // refPlaneX.material.opacity = 0.2;
      scene.add(refPlaneX);
    } else scene.remove(refPlaneX)
  });
  pane.addInput(configs, "showReferencePlaneY").on("change", (e) => {
    if (e.value) {
      scene.add(refPlaneY)
    } else scene.remove(refPlaneY)
  });

  pane.addInput(configs, 'toggleCurrent').on('change', e => {
    let temp;
    temp = wire1Dir;
    wire1Dir = wire2Dir;
    wire2Dir = temp;
    
    for(let i=0; i<wire1Electrons.length; i++) {
      wire1Electrons[i]._direction = wire1Dir.name;
      wire2Electrons[i]._direction = wire2Dir.name;
    }
    currentHeplers.children = [];
    const current1 = utils.createArrow(
      wire1.position,
      wire1Dir.value,
      1,
      0.04,
      "white"
    );
    current1.name = "current1";
    current1.position.x -= 0.5;
    current1.position.z = 0;
    currentHeplers.add(current1)

    const current2 = utils.createArrow(
      wire2.position,
      wire2Dir.value,
      1,
      0.04,
      "white"
    );
    current2.name = "current2";
    current2.position.x += 0.5;
    current2.position.z = 0;
    currentHeplers.add(current2);
  })

  pane.addInput(configs, "showField").on("change", (e) => {
    if (e.value) {
      scene.children.forEach((child) => {
        if (child.name === "fieldLine") {
          child.material.opacity = 1;
          child.children[0].cone.material.opacity = 1;
        }
      });
    } else {
      scene.children.forEach((child) => {
        if (child.name === "fieldLine") {
          child.material.opacity = 0;
          child.children[0].cone.material.opacity = 0;
        }
      });
    }
  });

  scene.add(
    alight,
    dlight,
    currentHeplers,
    origin,
    wire1,
    wire2,
    point,
    loop1,
    loop2,
    rVector1,
    rVector2,
    tangent1,
    tangent2,
    bnet
  );

  let draggables = [point];
  const dragControls = new DragControls(
    draggables,
    camera,
    renderer.domElement
  );
  dragControls.addEventListener("dragstart", (e) => {
    controls.enabled = false;
  });

  dragControls.addEventListener("drag", (e) => {
    controls.enabled = false;
    point.position.z = 0;
    // let { children } = scene;
    // children.forEach((child) => {
    //   if (
    //     child.name === "loop1" ||
    //     child.name === "loop2" ||
    //     child.name === "rVector1" ||
    //     child.name === "rVector2" ||
    //     child.name === "tangent1" ||
    //     child.name === "tangent2" ||
    //     child.name === "bnet"
    //   ) {
    //     scene.remove(child);
    //   }
    // });

    scene.children.pop();
    scene.children.pop();
    scene.children.pop();
    scene.children.pop();
    scene.children.pop();
    scene.children.pop();
    scene.children.pop(); //bnet

    const r1 = wire1.position.distanceTo(point.position);

    const theta1 = Math.atan2(
      point.position.y,
      point.position.x + Math.abs(wire1.position.x)
    );

    let r1direction = new THREE.Vector3(
      r1 * Math.cos(theta1),
      r1 * Math.sin(theta1),
      0
    );

    const loop1 = utils.dashedLoop(r1);
    loop1.name = "loop1";
    loop1.position.copy(wire1.position);

    const rVector1 = utils.dashedLine(wire1.position, point.position);
    rVector1.name = "rVector1";

    const tangent1dir = new THREE.Vector3().crossVectors(
      wire1Dir.value,
      r1direction
    );
    const tangent1 = utils.createArrow(
      point.position,
      tangent1dir,
      1 / tangent1dir.length(),
      0.05,
      "red"
    );
    tangent1.name = "tangent1";

    const r2 = wire2.position.distanceTo(point.position);

    const theta2 =
      Math.PI -
      Math.atan2(
        point.position.y,
        Math.abs(wire2.position.x) - point.position.x
      );

    let r2direction = new THREE.Vector3(
      r2 * Math.cos(theta2),
      r2 * Math.sin(theta2),
      0
    );

    const loop2 = utils.dashedLoop(r2);
    loop2.name = "loop2";
    loop2.position.copy(wire2.position);

    const rVector2 = utils.dashedLine(wire2.position, point.position);
    rVector2.name = "rVector2";

    const tangent2dir = new THREE.Vector3().crossVectors(
      wire2Dir.value,
      r2direction
    );
    const tangent2 = utils.createArrow(
      point.position,
      tangent2dir,
      1 / tangent2dir.length(),
      0.05,
      "yellow"
    );
    tangent2.name = "tangent2";

    const bnetDir = new THREE.Vector3().addVectors(
      tangent1dir.clone().divideScalar(tangent1dir.lengthSq()),
      tangent2dir.clone().divideScalar(tangent2dir.lengthSq())
    );
    const bnet = utils.createArrow(point.position, bnetDir, 1, 0.05, "purple");
    bnet.name = "bnet";
    scene.add(loop1, loop2, rVector1, rVector2, tangent1, tangent2, bnet);
  });

  dragControls.addEventListener("dragend", (e) => {
    controls.enabled = true;
  });
  dragControls.addEventListener("hoveroff", (e) => {
    controls.enabled = true;
  });
  const animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    wire1Electrons.forEach(e => e.behaviour())
    wire2Electrons.forEach(e => e.behaviour())

    renderer.render(scene, camera);
  };

  animate();
};
