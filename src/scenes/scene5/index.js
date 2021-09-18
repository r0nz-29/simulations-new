import * as THREE from "three";
import * as utils from "../../utils";
import { Pane } from "tweakpane";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let pane,
  scene,
  camera,
  controls,
  renderer,
  point = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 10, 10),
    new THREE.MeshPhongMaterial({ color: "yellow" })
  ),
  origin = new THREE.Vector3(0, 0, 0),
  x_axis = new THREE.Vector3(1, 0, 0),
  y_axis = new THREE.Vector3(0, 1, 0),
  z_axis = new THREE.Vector3(0, 0, 1),
  isRunning = false,
  Rcontainer = new THREE.Group(),
  axisContainer = new THREE.Group(),
  trailContainer = new THREE.Group(),
  tangentsAndNormals = new THREE.Group();

let configs = {
  run: false,
};

export const renderScene = () => {
  init();

  let axes = new THREE.Group();
  axes.add(utils.createArrow(origin, x_axis, 3, 0.1, "red"));
  axes.add(utils.createArrow(origin, y_axis, 3, 0.1, "green"));
  axes.add(utils.createArrow(origin, z_axis, 3, 0.1, "blue"));
  axes.add(
    utils.createArrow(new THREE.Vector3(0, 2, -2), x_axis, 1.4, 0.1, "white")
  );

  axes.children[0].children[1].add(
    utils.createText("x", new THREE.Vector3(0, 1, 0), 0.52, "red")
  );
  axes.children[1].children[1].add(
    utils.createText("y", new THREE.Vector3(0, 1, 0), 0.52, "green")
  );
  axes.children[2].children[1].add(
    utils.createText("z", new THREE.Vector3(0, 1, 0), 0.52, "blue")
  );
  axes.children[3].children[1].add(
    utils.createText("B", new THREE.Vector3(0, 0.4, 0), 0.52, "white")
  );

  point.position.x = 0.2;
  point.castShadow = true;

  scene.add(
    axes,
    point,
    Rcontainer,
    axisContainer,
    trailContainer,
    tangentsAndNormals
  );

  configurePane();

  animate();
};

point.behaviour = function () {
  point.position.set(
    0.2 + theta * 0.1,
    1 + Math.sin(-Math.PI / 2 + theta),
    Math.cos(-Math.PI / 2 + theta)
  );
  theta += 0.1;
  addAxis();
  updateTrail();
};

point.reset = function () {
  point.position.x = 0.2;
  theta = 0;
  Rcontainer.children = trailContainer.children = axisContainer.children = [];
};

function addAxis() {
  Rcontainer.children = [];
  let axis = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, point.position.x, 10, 50)
  );
  axis.position.set(point.position.x / 2, 1, 0);
  axis.rotation.z = Math.PI / 2;
  let geo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(point.position.x, 1, 0),
    point.position.clone(),
  ]);
  let r = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff }));
  Rcontainer.add(r);
  axisContainer.add(axis);
}

function updateTrail() {
  let trail = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 10, 10),
    new THREE.MeshBasicMaterial({ color: "yellow" })
  );
  trail.position.copy(point.position.clone());
  trailContainer.add(trail);

  tangentsAndNormals.children = [];
  let normal = new THREE.Vector3().subVectors(
    new THREE.Vector3(point.position.x, 1, 0),
    point.position.clone()
  );
  let tangent = new THREE.Vector3().crossVectors(x_axis, normal);
  tangentsAndNormals.add(
    utils.createArrow(point.position.clone(), normal, 0.6, 0.04, "white"),
    utils.createArrow(point.position.clone(), tangent, 0.4, 0.02, "yellow")
  );
  tangentsAndNormals.children[1].add(
    utils.createText(
      "v",
      tangentsAndNormals.children[1].children[1].position.clone().setY(0.55),
      0.24,
      "yellow"
    )
  );
  tangentsAndNormals.children[0].add(
    utils.createText(
      "F",
      tangentsAndNormals.children[0].children[1].position.clone().setZ(0.15),
      0.24,
      "white"
    )
  );
}

let theta = 0;
let previousFrame = null;
function animate() {
  requestAnimationFrame((t) => {
    if (previousFrame === null) {
      previousFrame = t;
    }
    animate();

    controls.update();
    if (isRunning) {
      if (point.position.x >= 4) {
        point.reset();
      } else {
        point.behaviour();
      }
    }
    renderer.render(scene, camera);
  });
}

function init() {
  document.body.style.backgroundColor = "black";
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
  controls.maxDistance = 8;
  camera.position.set(0, 10, 0);
  const alight = new THREE.AmbientLight("grey");
  const dlight = new THREE.SpotLight("white");
  const frontLight = new THREE.SpotLight("white");
  frontLight.position.set(0, 10, 0);
  frontLight.castShadow = true;
  dlight.position.set(0, 10, 0);
  dlight.castShadow = true;
  let grid = new THREE.GridHelper(20, 10);
  grid.position.y = -1;
  grid.receiveShadow = true;
  let ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 10, 10),
    new THREE.MeshPhongMaterial({ color: "grey" })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(alight, frontLight, grid, ground);
  scene.fog = new THREE.Fog(0x000000, 0.1, 15);
}

function configurePane() {
  pane.addInput(configs, "run", { label: "Run" }).on("change", (e) => {
    if (e.value) {
      isRunning = true;
    } else {
      isRunning = false;
    }
  });
}
