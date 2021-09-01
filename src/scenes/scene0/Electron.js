import * as THREE from "three";

class Electron extends THREE.Mesh {
  constructor(radius, color, wireframe, direction, speed, lengthOfTube) {
    super();
    this._geometry = new THREE.SphereGeometry(radius, 10, 10);
    this._material = new THREE.MeshPhysicalMaterial({
      color: `${color}`,
      wireframe: wireframe,
      emissive: "red",
      emissiveIntensity: 3,
    });
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._direction = direction;
    this._speed = speed;
    this._length = lengthOfTube;
  }

  behaviour() {
    if (this._direction === "down") {
      if (this._mesh.position.y >= this._length / 2.0) {
        this._mesh.position.y = -this._length / 2.0;
      } else if (this._mesh.position.y < -this._length / 2.0) {
        this._mesh.position.y = this._length / 2.0;
      } else {
        this._mesh.position.y += this._speed;
      }
    } else if (this._direction === "up") {
      if (this._mesh.position.y > this._length / 2.0) {
        this._mesh.position.y = -this._length / 2.0;
      } else if (this._mesh.position.y <= -this._length / 2.0) {
        this._mesh.position.y = this._length / 2.0;
      } else {
        this._mesh.position.y += -this._speed;
      }
    } else if (this._direction === "left") {
      if (this._mesh.position.x > this._length / 2.0) {
        this._mesh.position.x = -this._length / 2.0;
      } else if (this._mesh.position.x <= -this._length / 2.0) {
        this._mesh.position.x = this._length / 2.0;
      } else {
        this._mesh.position.x += this._speed;
      }
    } else {
      if (this._mesh.position.x > this._length / 2.0) {
        this._mesh.position.x = -this._length / 2.0;
      } else if (this._mesh.position.x <= -this._length / 2.0) {
        this._mesh.position.x = this._length / 2.0;
      } else {
        this._mesh.position.x += -this._speed;
      }
    }
  }

  getMesh() {
    return this._mesh;
  }
}

export { Electron };
