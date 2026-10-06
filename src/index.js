import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
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

  const accentMaterial = new MeshBasicMaterial({
    color: 0x4f8cff
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

  // ---------- LEFT WALL ----------

  const leftWall = new Mesh(
    new BoxGeometry(0.1, 3, 6),
    wallMaterial
  );

  leftWall.position.set(-3, 1.5, 0);

  world.createTransformEntity(leftWall);

  // ---------- RIGHT WALL ----------

  const rightWall = new Mesh(
    new BoxGeometry(0.1, 3, 6),
    wallMaterial
  );

  rightWall.position.set(3, 1.5, 0);

  world.createTransformEntity(rightWall);

  // ---------- MEMORY CUBE ----------

  const memoryCube = new Mesh(
    new BoxGeometry(0.7, 0.7, 0.7),
    accentMaterial
  );

  memoryCube.position.set(0, 1, -2);

  world.createTransformEntity(memoryCube);

  console.log("Memory Palace room created");
});
