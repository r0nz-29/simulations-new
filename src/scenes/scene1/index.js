import * as THREE from "three";
import * as utils from "../../utils";
import { Pane } from "tweakpane";
import { Electron } from "../scene0/Electron";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import posx from "../../images/clouds1/clouds1_east.bmp";
// import negx from "../../images/clouds1/clouds1_west.bmp";
// import posy from "../../images/clouds1/clouds1_up.bmp";
// import negy from "../../images/clouds1/clouds1_down.bmp";
// import posz from "../../images/clouds1/clouds1_north.bmp";
// import negz from "../../images/clouds1/clouds1_south.bmp";

let t = 0;
let theta = 0;
let paddingX = 1.6;
let paddingY = 1.3;
let length = 8;
let width = 6;
let configs = {
  showField: true,
  hidePlane: false,
  hideGround: false,
  hideAxis: false,
  theta: 0,
  b: 1,
  i: 1,
  running: false,
  wave: theta,
};

export const renderScene = (graphContainer) => {
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
  camera.position.set(-3, 2, 15);
  const alight = new THREE.AmbientLight("grey");
  const dlight = new THREE.DirectionalLight("white", 2);
  dlight.position.set(0, 5, 5);
  dlight.castShadow = true;
  // const sky = utils.createSky(renderer);
  // const loader = new THREE.CubeTextureLoader();
  // const texture = loader.load([posx, negx, posy, negy, posz, negz]);
  // scene.background = texture;

  const ground = utils.ground(15, 15, 0, -7, -7);
  scene.add(ground);

  const mainPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 8, 10, 10),
    new THREE.MeshBasicMaterial({
      color: "grey",
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    })
  );

  const axis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, length / 2.0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -length / 2.0, 0),
    ]),
    new THREE.LineDashedMaterial({
      color: "red",
      dashSize: 1,
      gapSize: 3,
    })
  );
  mainPlane.name = "mainPlane";
  mainPlane.add(axis);

  const leftSide = utils.createWire(0.2, 0.2, length + 0.36);
  leftSide.position.set(-width / 2.0, 0, 0);
  leftSide.castShadow = true;

  const rightSide = utils.createWire(0.2, 0.2, length + 0.36);
  rightSide.position.set(width / 2.0, 0, 0);
  rightSide.castShadow = true;

  const bottomSide = utils.createWire(0.2, 0.2, width);
  bottomSide.position.set(0, -length / 2.0, 0);
  bottomSide.rotation.z = Math.PI / 2;
  bottomSide.castShadow = true;

  const topSide = utils.createWire(0.2, 0.2, width);
  topSide.position.set(0, length / 2.0, 0);
  topSide.rotation.z = Math.PI / 2;
  topSide.castShadow = true;

  let leftSideElectrons = [];
  for (let i = 0; i < 12; i++) {
    const e = new Electron(0.1, "red", false, "down", configs.i * 0.05, length);
    e.getMesh().position.y = -3 + i * 0.8;
    leftSideElectrons.push(e);
    leftSide.add(e.getMesh());
  }

  let rightSideElectrons = [];
  for (let i = 0; i < 12; i++) {
    const e = new Electron(0.1, "red", false, "up", configs.i * 0.05, length);
    e.getMesh().position.y = -3 + i * 0.8;
    rightSideElectrons.push(e);
    rightSide.add(e.getMesh());
  }

  let topSideElectrons = [];
  for (let i = 0; i < 8; i++) {
    const e = new Electron(0.1, "red", false, "up", configs.i * 0.05, width);
    e.getMesh().position.y = -3 + i * 0.8;
    topSideElectrons.push(e);
    topSide.add(e.getMesh());
  }

  let bottomSideElectrons = [];
  for (let i = 0; i < 8; i++) {
    const e = new Electron(0.1, "red", false, "down", configs.i * 0.05, width);
    e.getMesh().position.y = -3 + i * 0.8;
    bottomSideElectrons.push(e);
    bottomSide.add(e.getMesh());
  }

  let fieldLines = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      let a = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 1),
        configs.b,
        0.06,
        "white"
      );
      a.position.set(-3 + i * 1.2, -3 + j * 1.2, -0.4);
      fieldLines.push(a);
      scene.add(a);
    }
  }

  const fieldText = utils.createText(
    "B",
    new THREE.Vector3(0, 0, fieldLines[0].children[1].position.z + 1),
    1,
    "white"
  );
  scene.add(fieldText);

  let bil = configs.b * configs.i * length * 0.2;
  let bib = configs.b * configs.i * width * 0.2;

  const forceOnLeftSide = utils.createArrow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    bil,
    0.06,
    "yellow"
  );

  const forceOnRightSide = utils.createArrow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0, 0),
    bil,
    0.06,
    "yellow"
  );

  const forceOnTopSide = utils.createArrow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0, 0),
    bib,
    0.06,
    "yellow"
  );

  const forceOnBottomSide = utils.createArrow(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    bib,
    0.06,
    "yellow"
  );

  const textLeft = utils.createText(
    `${(bil * 5).toFixed(2)}N`,
    new THREE.Vector3(0, bil + 1.3, 0),
    0.6,
    "yellow"
  );

  forceOnLeftSide.add(textLeft);

  const textRight = utils.createText(
    `${(bil * 5).toFixed(2)}N`,
    new THREE.Vector3(0, bil + 1.3, 0),
    0.6,
    "yellow"
  );
  forceOnRightSide.add(textRight);

  const textTop = utils.createText(
    `${(bib * 5).toFixed(2)}N`,
    new THREE.Vector3(0, bib + 0.65, 0),
    0.6,
    "yellow"
  );
  forceOnTopSide.add(textTop);

  const textBottom = utils.createText(
    `${(bib * 5).toFixed(2)}N`,
    new THREE.Vector3(0, bib + 0.65, 0),
    0.6,
    "yellow"
  );
  forceOnBottomSide.add(textBottom);

  leftSide.add(forceOnLeftSide);
  rightSide.add(forceOnRightSide);
  topSide.add(forceOnTopSide);
  bottomSide.add(forceOnBottomSide);

  mainPlane.add(leftSide, rightSide, topSide, bottomSide);

  scene.add(dlight, alight, mainPlane);

  const pane = new Pane();

  pane.addInput(configs, "showField").on("change", (e) => {
    if (e.value) {
      for (let i = 0; i < 36; i++) scene.add(fieldLines[i]);
      scene.add(fieldText);
    } else {
      for (let i = 0; i < 36; i++) scene.remove(fieldLines[i]);
      scene.remove(fieldText);
    }
  });

  pane.addInput(configs, "hideGround").on("change", (e) => {
    configs.hideGround = e.value;
    ground.material.transparent = true;
    ground.material.opacity = configs.hideGround ? 0 : 1;
  });

  pane.addInput(configs, "hidePlane").on("change", (e) => {
    mainPlane.material.opacity = e.value ? 0 : 0.2;
  });

  pane.addInput(configs, "hideAxis").on("change", (e) => {
    e.value ? mainPlane.remove(axis) : mainPlane.add(axis);
  });

  pane
    .addBlade({
      view: "slider",
      label: "theta",
      min: 0,
      max: 1,
      value: 0,
    })
    .on("change", (e) => {
      configs.theta = e.value;
      mainPlane.rotation.y = configs.theta;

      if (configs.theta !== 0) {
        scene.children.forEach((child) => {
          if (child.name === "helper1") {
            scene.remove(child);
          }
          if (child.name === "helper2") {
            scene.remove(child);
          }
          if (child.name === "rightAngle") {
            scene.remove(child);
          }
        });
        const helper1 = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (-width / 2.0) * Math.cos(configs.theta),
              0,
              (width / 2.0) * Math.sin(configs.theta)
            ),
            new THREE.Vector3((-width / 2.0) * Math.cos(configs.theta), 0, -3),
          ]),
          new THREE.LineDashedMaterial({
            color: "grey",
            dashSize: 0.3,
            gapSize: 0.1,
          })
        );
        helper1.computeLineDistances();
        helper1.name = "helper1";
        scene.add(helper1);
        const helper2 = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (width / 2.0) * Math.cos(configs.theta),
              0,
              (-width / 2.0) * Math.sin(configs.theta)
            ),
            new THREE.Vector3(-3, 0, (-width / 2.0) * Math.sin(configs.theta)),
          ]),
          new THREE.LineDashedMaterial({
            color: "grey",
            dashSize: 0.3,
            gapSize: 0.1,
          })
        );
        helper2.computeLineDistances();
        helper2.name = "helper2";
        scene.add(helper2);

        const rightAngleG = new THREE.EdgesGeometry(
          new THREE.BoxGeometry(0.5, 0.5, 0)
        );
        const rightAngle = new THREE.LineSegments(
          rightAngleG,
          new THREE.LineBasicMaterial({ color: "grey" })
        );
        rightAngle.rotation.x = Math.PI / 2;
        rightAngle.position.copy(
          new THREE.Vector3(
            (-width / 2.0) * Math.cos(configs.theta) + 0.25,
            0,
            (-width / 2.0) * Math.sin(configs.theta) + 0.25
          )
        );
        rightAngle.name = "rightAngle";
        scene.add(rightAngle);

        //recalculate top and bottom forces
        topSide.children.pop();
        bottomSide.children.pop();
        bib = configs.b * configs.i * width * Math.cos(configs.theta) * 0.4;
        const forceOntop = utils.createArrow(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(1, 0, 0),
          bib,
          0.06,
          "yellow"
        );
        forceOntop.add(
          utils.createText(
            `${(bib * 2.5).toFixed(2)}N`,
            new THREE.Vector3(0, bib + 0.65, 0),
            0.6,
            "yellow"
          )
        );
        topSide.add(forceOntop);
        const forceOnbottom = utils.createArrow(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-1, 0, 0),
          bib,
          0.06,
          "yellow"
        );
        forceOnbottom.add(
          utils.createText(
            `${(bib * 2.5).toFixed(2)}N`,
            new THREE.Vector3(0, bib + 0.65, 0),
            0.6,
            "yellow"
          )
        );
        bottomSide.add(forceOnbottom);

        //align left and right forces
        leftSide.children[leftSide.children.length - 1].rotation.y =
          -configs.theta;
        rightSide.children[rightSide.children.length - 1].rotation.y =
          -configs.theta;
      }
    });

  pane
    .addBlade({
      view: "slider",
      label: "B",
      min: 0,
      max: 5,
      value: configs.b,
    })
    .on("change", (e) => {
      configs.b = e.value;
      bib = configs.b * configs.i * width * Math.cos(configs.theta) * 0.1;
      bil = configs.b * configs.i * length * 0.1;
      for (let i = 0; i < 36; i++) scene.remove(fieldLines[i]);
      fieldLines = [];

      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 6; j++) {
          let a = utils.createArrow(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1),
            configs.b,
            0.06,
            "white"
          );
          a.position.set(-3 + i * 1.2, -3 + j * 1.2, -0.4);
          fieldLines.push(a);
          scene.add(a);
        }
      }
      fieldText.position.z = configs.b + fieldLines[0].children[1].position.z;

      leftSide.children.pop();
      rightSide.children.pop();
      topSide.children.pop();
      bottomSide.children.pop();
      const leftForce = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        bil,
        0.06,
        "yellow"
      );
      const rightForce = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        bil,
        0.06,
        "yellow"
      );
      const topForce = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        bib,
        0.06,
        "yellow"
      );
      const bottomForce = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        bib,
        0.06,
        "yellow"
      );
      topForce.add(
        utils.createText(
          `${(bib * 10).toFixed(2)}N`,
          new THREE.Vector3(0, bib + 0.65, 0),
          0.6,
          "yellow"
        )
      );
      bottomForce.add(
        utils.createText(
          `${(bib * 10).toFixed(2)}N`,
          new THREE.Vector3(0, bib + 0.65, 0),
          0.6,
          "yellow"
        )
      );
      leftForce.add(
        utils.createText(
          `${(bil * 10).toFixed(2)}N`,
          new THREE.Vector3(0, bil + 1.3, 0),
          0.6,
          "yellow"
        )
      );
      rightForce.add(
        utils.createText(
          `${(bil * 10).toFixed(2)}N`,
          new THREE.Vector3(0, bil + 1.3, 0),
          0.6,
          "yellow"
        )
      );
      leftForce.rotation.y = -configs.theta;
      rightForce.rotation.y = -configs.theta;
      leftSide.add(leftForce);
      rightSide.add(rightForce);
      topSide.add(topForce);
      bottomSide.add(bottomForce);
    });

  pane
    .addBlade({
      view: "slider",
      label: "current",
      min: 0,
      max: 5,
      value: configs.i,
    })
    .on("change", (e) => {
      configs.i = e.value;
      bib = configs.b * configs.i * width * Math.cos(configs.theta) * 0.1;
      bil = configs.b * configs.i * length * 0.1;
      [
        leftSideElectrons,
        rightSideElectrons,
        topSideElectrons,
        bottomSideElectrons,
      ].forEach((array) => {
        array.forEach((elec) => {
          elec._speed = configs.i * 0.05;
        });
      });

      leftSide.children.pop();
      rightSide.children.pop();
      topSide.children.pop();
      bottomSide.children.pop();
      const leftForce = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        bil,
        0.06,
        "yellow"
      );
      const rightForce = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        bil,
        0.06,
        "yellow"
      );
      const topForce = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        bib,
        0.06,
        "yellow"
      );
      const bottomForce = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        bib,
        0.06,
        "yellow"
      );
      topForce.add(
        utils.createText(
          `${(bib * 10).toFixed(2)}N`,
          new THREE.Vector3(0, bib + 0.65, 0),
          0.6,
          "yellow"
        )
      );
      bottomForce.add(
        utils.createText(
          `${(bib * 10).toFixed(2)}N`,
          new THREE.Vector3(0, bib + 0.65, 0),
          0.6,
          "yellow"
        )
      );
      leftForce.add(
        utils.createText(
          `${(bil * 10).toFixed(2)}N`,
          new THREE.Vector3(0, bil + 1.3, 0),
          0.6,
          "yellow"
        )
      );
      rightForce.add(
        utils.createText(
          `${(bil * 10).toFixed(2)}N`,
          new THREE.Vector3(0, bil + 1.3, 0),
          0.6,
          "yellow"
        )
      );
      leftForce.rotation.y = -configs.theta;
      rightForce.rotation.y = -configs.theta;
      leftSide.add(leftForce);
      rightSide.add(rightForce);
      topSide.add(topForce);
      bottomSide.add(bottomForce);
    });

  pane.addInput(configs, "running").on("change", (e) => {
    configs.running = e.value ? true : false;
  });

  // const graphs = new Pane({ container: graphContainer });

  // graphs.addMonitor(configs, "wave", {
  //   label: "theta",
  //   view: "graph",
  //   min: -1,
  //   max: +1,
  // });

  const animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    leftSideElectrons.forEach((e) => {
      e.behaviour();
    });
    rightSideElectrons.forEach((e) => {
      e.behaviour();
    });
    topSideElectrons.forEach((e) => {
      e.behaviour();
    });
    bottomSideElectrons.forEach((e) => {
      e.behaviour();
    });

    if (configs.running) {
      theta =
        configs.theta * Math.cos(10 * Math.sqrt(configs.b * configs.i) * t);
      mainPlane.rotation.y = theta;
      t += 0.01;
      configs.wave = theta;

      topSide.children.pop();
      bottomSide.children.pop();
      bib = configs.b * configs.i * width * Math.cos(theta) * 0.4;
      const forceOntop = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        bib,
        0.06,
        "yellow"
      );
      forceOntop.add(
        utils.createText(
          `${(bib * 2.5).toFixed(2)}N`,
          new THREE.Vector3(0, bib + 0.65, 0),
          0.6,
          "yellow"
        )
      );
      topSide.add(forceOntop);
      const forceOnbottom = utils.createArrow(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-1, 0, 0),
        bib,
        0.06,
        "yellow"
      );
      forceOnbottom.add(
        utils.createText(
          `${(bib * 2.5).toFixed(2)}N`,
          new THREE.Vector3(0, bib + 0.65, 0),
          0.6,
          "yellow"
        )
      );
      bottomSide.add(forceOnbottom);
      leftSide.children[leftSide.children.length - 1].rotation.y = -theta;
      rightSide.children[rightSide.children.length - 1].rotation.y = -theta;

      if (configs.theta !== 0) {
        scene.children.forEach((child) => {
          if (child.name === "helper1") {
            scene.remove(child);
          }
          if (child.name === "helper2") {
            scene.remove(child);
          }
          if (child.name === "rightAngle") {
            scene.remove(child);
          }
        });
        let dir = theta < 0 ? 3 : -3;
        const helper1 = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (-width / 2.0) * Math.cos(theta),
              0,
              (width / 2.0) * Math.sin(theta)
            ),
            new THREE.Vector3((-width / 2.0) * Math.cos(theta), 0, dir),
          ]),
          new THREE.LineDashedMaterial({
            color: "grey",
            dashSize: 0.3,
            gapSize: 0.1,
          })
        );
        helper1.computeLineDistances();
        helper1.name = "helper1";
        scene.add(helper1);
        const helper2 = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(
              (width / 2.0) * Math.cos(theta),
              0,
              (-width / 2.0) * Math.sin(theta)
            ),
            new THREE.Vector3(-3, 0, (-width / 2.0) * Math.sin(theta)),
          ]),
          new THREE.LineDashedMaterial({
            color: "grey",
            dashSize: 0.3,
            gapSize: 0.1,
          })
        );
        helper2.computeLineDistances();
        helper2.name = "helper2";
        scene.add(helper2);
        const rightAngleG = new THREE.EdgesGeometry(
          new THREE.BoxGeometry(0.5, 0.5, 0)
        );
        const rightAngle = new THREE.LineSegments(
          rightAngleG,
          new THREE.LineBasicMaterial({ color: "grey" })
        );
        rightAngle.rotation.x = Math.PI / 2;
        rightAngle.position.copy(
          new THREE.Vector3(
            (-width / 2.0) * Math.cos(theta) + 0.25,
            0,
            (-width / 2.0) * Math.sin(theta) + 0.25
          )
        );
        rightAngle.name = "rightAngle";
        scene.add(rightAngle);
      }
    }
    renderer.render(scene, camera);
  };

  animate();
};
