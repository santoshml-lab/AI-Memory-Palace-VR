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
    new BoxGeometry(0.5, 0.5, 0.5),
    new MeshBasicMaterial({
      color: 0x4f8cff
    })
  );

  cube.position.set(0, 0.75, -2);

  world.createTransformEntity(cube);

  console.log("Memory Palace test cube created");
});
