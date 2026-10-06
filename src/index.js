import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  World
} from "@iwsdk/core";

import projectOptions from "virtual:iwsdk-project";

const sceneContainer = document.getElementById("scene-container");

if (!(sceneContainer instanceof HTMLDivElement)) {
  throw new Error("Missing #scene-container");
}

World.create(sceneContainer, projectOptions).then((world) => {
  console.log("AI Memory Palace VR started");

  const cube = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshBasicMaterial({
      color: 0x6c63ff
    })
  );

  cube.position.set(0, 1.2, -2);

  world.createTransformEntity(cube);

  console.log("Memory Palace test cube created");
});
