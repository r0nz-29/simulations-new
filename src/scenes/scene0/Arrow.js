import * as THREE from "three";
import { createMaterial } from "./utils";

class Arrow extends THREE.Mesh {
  constructor(radius, length) {
    super();
    this._geometry = new THREE.ConeGeometry(radius, length, 10, 10);
    this._mesh = new THREE.Mesh(this._geometry, createMaterial("red", false));
    this._mesh.rotation.z = -Math.PI / 2;
    this._mesh.position.x += 0.06;
  }

  behaviour() {
    // this._mesh.rotation.y -= 0.01;
    // // pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;
    // let point = new THREE.Vector3(0, 0, 0);
    // let axis = new THREE.Vector3(0, -1, 0);
    // let theta = 0.01;
    // // if(pointIsWorld){
    // this._mesh.parent.localToWorld(this._mesh.position); // compensate for world coordinate
    // // }
    // this._mesh.position.sub(point); // remove the offset
    // this._mesh.position.applyAxisAngle(axis, theta); // rotate the POSITION
    // this._mesh.position.add(point); // re-add the offset
    // // if(pointIsWorld){
    // this._mesh.parent.worldToLocal(this._mesh.position); // undo world coordinates compensation
    // // }
    // this._mesh.rotateOnAxis(axis, theta); // rotate the OBJECT
  }

  getMesh() {
    return this._mesh;
  }
}

export { Arrow };
