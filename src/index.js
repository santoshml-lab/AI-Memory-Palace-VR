import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  RayInteractable,
  DistanceGrabbable,
  MovementMode,
  World
} from "@iwsdk/core";

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

  // ---------- MEMORY OBJECT FUNCTION ----------

  function createMemoryObject(color, position) {
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

    const entity = world.createTransformEntity(object);

    entity.addComponent(RayInteractable);

    entity.addComponent(DistanceGrabbable, {
      movementMode: MovementMode.MoveTowardsTarget,
      moveSpeedFactor: 0.15,
      targetPositionOffset: [0, 0, -0.3]
    });

    return entity;
  }

  // ---------- MEMORY OBJECTS ----------

  createMemoryObject(
    0x4f8cff,
    [0, 1.2, -2]
  );

  createMemoryObject(
    0x36d399,
    [-1.3, 1.4, -2.2]
  );

  createMemoryObject(
    0xffc857,
    [1.3, 1.4, -2.2]
  );

  createMemoryObject(
    0xff6b6b,
    [-1.8, 0.8, -2]
  );

  createMemoryObject(
    0xb56cff,
    [1.8, 0.8, -2]
  );

  console.log("Interactive memory objects created");
});
