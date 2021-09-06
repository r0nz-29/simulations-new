import * as THREE from "three";
import * as utils from "./utils";
import { Pane } from "tweakpane";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";

const configs = {
  theta: 0,
  run: false,
  showAngle: false,
  showField: false,
};

const r = 2;
const z = 3;
let w = 0;
let running = false;

export const renderScene = () => {
  const scene = new THREE.Scene();
  let magneticField = new utils.VectorField(scene);
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // renderer.physicallyCorrectLights = true;
  document.body.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  camera.position.set(1, 2, 5);
  const alight = new THREE.AmbientLight("white");
  const dlight = new THREE.DirectionalLight("white");
  dlight.position.set(0, 5, 5);
  dlight.castShadow = true;
  const slight = new THREE.SpotLight("white", 10);
  slight.position.set(0, 0, 5);
  const ground = utils.ground();
  scene.add(ground);

  let dlContainer = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      color: "grey",
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    })
  );
  scene.add(dlContainer);
  const coil = utils.createRing(r, 0.1);
  coil.castShadow = true;

  const axis = utils.strokeLine(
    new THREE.Vector3(0, 0, -10),
    new THREE.Vector3(0, 0, 10),
    false,
    "black"
  );
  coil.add(axis);

  const dl = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.12, 10, 100, Math.PI / 16),
    utils.createMaterial("red", false)
  );
  scene.add(dl);

  const point = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 10),
    utils.createMaterial("red", false)
  );
  point.position.set(0, 0, z);
  point.castShadow = true;
  axis.add(point);

  let positionVector = new THREE.Vector3(
    r * Math.cos(configs.theta),
    r * Math.sin(configs.theta)
  );

  const dir = new THREE.Vector3(
    -r * Math.sin(configs.theta),
    r * Math.cos(configs.theta),
    0
  );

  const dlVector = new THREE.Vector3(
    -r * Math.sin(configs.theta),
    r * Math.cos(configs.theta),
    0
  );

  const dlHelper = utils.createArrow(
    new THREE.Vector3(
      r * Math.cos(configs.theta),
      r * Math.sin(configs.theta),
      0.07
    ),
    dir.normalize(),
    1,
    0.07,
    "red"
  );
  const dlText = utils.createText(
    "dl",
    dlHelper.children[1].position.clone().multiplyScalar(1.3),
    0.22,
    "red"
  );
  dlHelper.add(dlText);
  console.log(dlHelper);
  dlContainer.add(dlHelper);

  let v1 = positionVector;
  let v2 = point.position.clone();

  const rVector = utils.strokeLine(v1, v2, false, "white");
  const rText = utils.createText(
    "r",
    new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.58),
    0.22,
    "white"
  );
  rVector.add(rText);
  dl.add(rVector);

  let rvector = new THREE.Vector3().subVectors(positionVector, point.position);

  const direction = new THREE.Vector3().crossVectors(rvector, dlVector);

  const db = utils.createArrow(
    new THREE.Vector3(0, 0, 0),
    direction.normalize(),
    0.6,
    0.02,
    "white"
  );
  const dbText = utils.createText(
    "db",
    db.children[1].position.clone().multiplyScalar(1.3),
    0.15,
    "white"
  );
  db.add(dbText);
  point.add(db);

  const { line1, line2 } = utils.rightAngle(point.position, direction, rvector);
  rVector.add(line1, line2);
  scene.add(alight, dlight, coil);

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
    point.position.x = 0;
    point.position.y = 0;

    // dl.remove(rVector);
    dl.children = [];
    // rVector.geometry.dispose();
    let v1 = positionVector;
    let v2 = point.position.clone();

    const newRvector = utils.strokeLine(v1, v2, false, "white");

    // rVector.children = [];
    const rText = utils.createText(
      "r",
      new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.58),
      0.22,
      "white"
    );
    newRvector.add(rText);
    dl.add(newRvector);

    let rvector = new THREE.Vector3().subVectors(
      positionVector,
      point.position
    );

    // point.remove(db);
    point.children = [];
    const direction = new THREE.Vector3().crossVectors(rvector, dlVector);
    const db = utils.createArrow(
      new THREE.Vector3(0, 0, 0),
      direction.normalize(),
      0.6,
      0.02,
      "white"
    );
    const dbText = utils.createText(
      "db",
      db.children[1].position.clone().multiplyScalar(1.3),
      0.12,
      "white"
    );
    db.add(dbText);
    const { line1, line2 } = utils.rightAngle(
      point.position,
      direction,
      rvector
    );
    newRvector.add(line1, line2);
    point.add(db);
  });
  dragControls.addEventListener("dragend", (e) => {
    controls.enabled = true;
  });
  dragControls.addEventListener("hoveroff", (e) => {
    controls.enabled = true;
  });

  const pane = new Pane();
  pane
    .addBlade({
      view: "slider",
      label: "theta",
      min: 0,
      max: Math.PI * 2,
      value: configs.theta,
    })
    .on("change", (e) => {
      configs.theta = e.value;

      // scene.remove(dlHelper);
      dlContainer.children = [];

      const dir = new THREE.Vector3(
        -r * Math.sin(configs.theta),
        r * Math.cos(configs.theta),
        0
      );
      const newDlHelper = utils.createArrow(
        new THREE.Vector3(
          r * Math.cos(configs.theta),
          r * Math.sin(configs.theta),
          0.07
        ),
        dir.normalize(),
        1,
        0.07,
        "red"
      );
      const dlText = utils.createText(
        "dl",
        newDlHelper.children[1].position.clone().multiplyScalar(1.3),
        0.22,
        "red"
      );
      newDlHelper.add(dlText);
      dlContainer.add(newDlHelper);
      const { theta } = configs;

      const newdl = dl.clone();
      newdl.material.color = new THREE.Color(0xffaaaa);
      newdl.children = [];
      scene.add(newdl);
      dl.rotation.z = theta;
      // dl.material.color = new THREE.Color(0xff0000);

      scene.remove(db);
      let positionVector = new THREE.Vector3(
        r * Math.cos(configs.theta),
        r * Math.sin(configs.theta)
      );
      const dlVector = new THREE.Vector3(
        -r * Math.sin(configs.theta),
        r * Math.cos(configs.theta),
        0
      );
      let rvector = new THREE.Vector3().subVectors(
        positionVector,
        point.position
      );
      const direction = new THREE.Vector3().crossVectors(rvector, dlVector);
      const newdb = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        direction.normalize(),
        0.6,
        0.02,
        "white"
      );
      const dbText = utils.createText(
        "db",
        newdb.children[1].position.clone().multiplyScalar(1.3),
        0.12,
        "white"
      );
      // newdb.add(dbText);
      point.add(newdb);

      if (configs.theta >= 6.283) {
        point.children = [];
        dlContainer.children = [];
        const resultant = utils.createArrow(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, 1),
          1,
          0.06,
          "yellow"
        );
        const resultantText = utils.createText(
          "B net",
          resultant.children[1].position.clone().multiplyScalar(1.3),
          0.12,
          "yellow"
        );
        resultant.add(resultantText);
        point.add(resultant);
        dl.children = [];
      }
    });

  pane.addInput(configs, "run").on("change", (e) => {
    if (e.value) {
      w = 0.05;
      running = true;
    } else {
      w = 0;
      running = false;
    }
  });

  // pane.addInput(configs, "showField").on("change", (e) => {
  //   let field = magneticField.createField(new THREE.Vector3(1, 3, 0), false, 1);
  //   if (e.value) scene.add(field);
  //   else scene.remove(field);
  // });

  const animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    dl.rotation.z += w;

    if (running) {
      // scene.remove(dlHelper);
      dlContainer.children = [];
      let current0 = dl.rotation.z;

      const dir = new THREE.Vector3(
        -r * Math.sin(current0),
        r * Math.cos(current0),
        0
      );
      const newDlHelper = utils.createArrow(
        new THREE.Vector3(r * Math.cos(current0), r * Math.sin(current0), 0.07),
        dir.normalize(),
        1,
        0.07,
        "red"
      );
      const dlText = utils.createText(
        "dl",
        newDlHelper.children[1].position.clone().multiplyScalar(1.3),
        0.22,
        "red"
      );
      newDlHelper.add(dlText);
      dlContainer.add(newDlHelper);
      // const { theta } = configs;

      const newdl = dl.clone();
      newdl.material.color = new THREE.Color(0xffaaaa);
      newdl.children = [];
      scene.add(newdl);
      // dl.rotation.z = theta;
      // dl.material.color = new THREE.Color(0xff0000);

      scene.remove(db);
      let positionVector = new THREE.Vector3(
        r * Math.cos(current0),
        r * Math.sin(current0)
      );
      const dlVector = new THREE.Vector3(
        -r * Math.sin(current0),
        r * Math.cos(current0),
        0
      );
      let rvector = new THREE.Vector3().subVectors(
        positionVector,
        point.position
      );
      const direction = new THREE.Vector3().crossVectors(rvector, dlVector);
      const newdb = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        direction.normalize(),
        0.6,
        0.02,
        "white"
      );
      const dbText = utils.createText(
        "db",
        newdb.children[1].position.clone().multiplyScalar(1.3),
        0.12,
        "white"
      );
      // newdb.add(dbText);
      point.add(newdb);

      if (current0 >= 6.283) {
        point.children = [];
        dlContainer.children = [];
        const resultant = utils.createArrow(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, 1),
          1,
          0.06,
          "yellow"
        );
        const resultantText = utils.createText(
          "B net",
          resultant.children[1].position.clone().multiplyScalar(1.3),
          0.12,
          "yellow"
        );
        resultant.add(resultantText);
        point.add(resultant);
        dl.children = [];
        running = false;
      }
    }

    renderer.render(scene, camera);
  };

  animate();
};
