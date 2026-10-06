import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  OneHandGrabbable,
  RayInteractable,
  World
} from "@iwsdk/core";

import * as THREE from "three";
import projectOptions from "virtual:iwsdk-project";

const sceneContainer = document.getElementById("scene-container");

if (!(sceneContainer instanceof HTMLDivElement)) {
  throw new Error("Missing #scene-container");
}

World.create(sceneContainer, projectOptions).then((world) => {
  console.log("AI Memory Palace VR started");

  // Browser preview camera
  world.camera.position.set(0, 1.7, 4);
  world.camera.lookAt(0, 1, 0);

  // ---------- MATERIALS ----------

  const floorMaterial = new MeshBasicMaterial({
    color: 0x20283d
  });

  const wallMaterial = new MeshBasicMaterial({
    color: 0x151b2d
  });

  // ---------- FLOOR ----------

  const floor = new Mesh(
    new BoxGeometry(6, 0.1, 6),
    floorMaterial
  );

  floor.position.set(0, -0.05, 0);

  world.createTransformEntity(floor);

  // ---------- BACK WALL ----------

  const backWall = new Mesh(
    new BoxGeometry(6, 3, 0.1),
    wallMaterial
  );

  backWall.position.set(0, 1.5, -3);

  world.createTransformEntity(backWall);

  // ---------- LABEL FUNCTION ----------

  function createLabel(text, position) {
    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create label canvas");
    }

    context.fillStyle = "rgba(10, 15, 30, 0.9)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#ffffff";
    context.font = "bold 42px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(
      text,
      canvas.width / 2,
      canvas.height / 2
    );

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.3),
      material
    );

    label.position.set(
      position[0],
      position[1],
      position[2]
    );

    world.createTransformEntity(label);
  }

  // ---------- STATIC MEMORY OBJECT ----------

  function createStaticMemoryObject(color, position, label) {
    const object = new Mesh(
      new BoxGeometry(0.55, 0.55, 0.55),
      new MeshBasicMaterial({
        color
      })
    );

    object.position.set(
      position[0],
      position[1],
      position[2]
    );

    world.createTransformEntity(object);

    createLabel(
      label,
      [
        position[0],
        position[1] + 0.45,
        position[2]
      ]
    );
  }

  // ---------- GRABBABLE MEMORY OBJECT ----------

  function createGrabbableMemoryObject(color, position, label) {
    const object = new Mesh(
      new BoxGeometry(0.65, 0.65, 0.65),
      new MeshBasicMaterial({
        color
      })
    );

    object.position.set(
      position[0],
      position[1],
      position[2]
    );

    const entity = world.createTransformEntity(object);

    // Makes the object selectable by the interaction system.
    entity.addComponent(RayInteractable);

    // Enables direct one-hand manipulation.
    entity.addComponent(OneHandGrabbable, {
      translate: true,
      rotate: false
    });

    createLabel(
      label,
      [
        position[0],
        position[1] + 0.5,
        position[2]
      ]
    );

    return entity;
  }

  // ---------- PHOTOSYNTHESIS MEMORY PALACE ----------

  // Main concept: GRABBABLE
  createGrabbableMemoryObject(
    0x4f8cff,
    [0, 1.2, -2],
    "Photosynthesis"
  );

  // Supporting concepts: STATIC
  createStaticMemoryObject(
    0x36d399,
    [-1.3, 1.4, -2.2],
    "Light Energy"
  );

  createStaticMemoryObject(
    0xffc857,
    [1.3, 1.4, -2.2],
    "Glucose"
  );

  createStaticMemoryObject(
    0xff6b6b,
    [-1.8, 0.8, -2],
    "Water"
  );

  createStaticMemoryObject(
    0xb56cff,
    [1.8, 0.8, -2],
    "Oxygen"
  );

  console.log("Photosynthesis memory palace created");
  console.log("Photosynthesis object is ready for one-hand grabbing");
});
