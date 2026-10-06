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

  // ---------- CAMERA ----------

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

  // ---------- TEXT LABEL ----------

  function createLabel(
    text,
    position,
    width = 1.05,
    height = 0.26
  ) {
    const canvas = document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create label canvas");
    }

    context.fillStyle = "rgba(10, 15, 30, 0.95)";
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle = "#ffffff";
    context.font = "bold 38px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(
      text,
      canvas.width / 2,
      canvas.height / 2
    );

    const texture = new THREE.CanvasTexture(canvas);

    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      material
    );

    label.position.set(
      position[0],
      position[1],
      position[2]
    );

    world.createTransformEntity(label);

    return {
      mesh: label,
      canvas,
      context,
      texture
    };
  }

  // ---------- UPDATE LABEL ----------

  function updateLabel(labelData, text) {
    const {
      canvas,
      context,
      texture
    } = labelData;

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle = "rgba(10, 15, 30, 0.95)";
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle = "#ffffff";
    context.font = "bold 38px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(
      text,
      canvas.width / 2,
      canvas.height / 2
    );

    texture.needsUpdate = true;
  }

  // ---------- RECALL DATA ----------

  const recallObjects = [];

  const correctOrder = [
    "Light Energy",
    "Water",
    "Photosynthesis",
    "Glucose",
    "Oxygen"
  ];

  // ---------- MEMORY OBJECT ----------

  function createRecallObject(
    color,
    position,
    label,
    correctIndex
  ) {
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

    const entity =
      world.createTransformEntity(object);

    entity.addComponent(RayInteractable);

    entity.addComponent(OneHandGrabbable, {
      translate: true,
      rotate: false
    });

    // ---------- HOVER EFFECT ----------

    const originalScale = object.scale.clone();

    object.addEventListener("pointerenter", () => {
      object.scale.set(
        originalScale.x * 1.15,
        originalScale.y * 1.15,
        originalScale.z * 1.15
      );
    });

    object.addEventListener("pointerleave", () => {
      object.scale.copy(originalScale);
    });

    // ---------- LABEL ----------

    const labelData = createLabel(
      label,
      [
        position[0],
        position[1] + 0.72,
        position[2] + 0.18
      ],
      1.05,
      0.26
    );

    recallObjects.push({
      object,
      label,
      correctIndex,
      labelData
    });

    return entity;
  }

  // ---------- MEMORY OBJECTS ----------

  createRecallObject(
    0x36d399,
    [-1.3, 1.4, -2.2],
    "Light Energy",
    0
  );

  createRecallObject(
    0xff6b6b,
    [-1.8, 0.8, -2],
    "Water",
    1
  );

  createRecallObject(
    0x4f8cff,
    [0, 1.2, -2],
    "Photosynthesis",
    2
  );

  createRecallObject(
    0xffc857,
    [1.3, 1.4, -2.2],
    "Glucose",
    3
  );

  createRecallObject(
    0xb56cff,
    [1.8, 0.8, -2],
    "Oxygen",
    4
  );

  // ---------- SCORE LABEL ----------

  const scoreLabel = createLabel(
    "Score: --",
    [0, 2.35, -2.15],
    1.6,
    0.32
  );

  // ---------- CHECK RECALL PANEL ----------

  const panel = new Mesh(
    new BoxGeometry(1.8, 0.55, 0.08),
    new MeshBasicMaterial({
      color: 0x3159a6
    })
  );

  panel.position.set(
    0,
    0.35,
    -2.3
  );

  const panelEntity =
    world.createTransformEntity(panel);

  panelEntity.addComponent(RayInteractable);

  // Put text in front of the panel.
  const checkLabel = createLabel(
    "CHECK RECALL",
    [0, 0.35, -2.24],
    1.5,
    0.28
  );

  // ---------- RECALL ENGINE ----------

  function calculateRecallScore() {
    const sortedObjects = [...recallObjects].sort(
      (a, b) =>
        a.object.position.x -
        b.object.position.x
    );

    let correct = 0;

    sortedObjects.forEach((item, index) => {
      if (item.correctIndex === index) {
        correct++;
      }
    });

    return Math.round(
      (correct / correctOrder.length) * 100
    );
  }

  // ---------- CHECK RECALL ----------

  function checkRecall() {
    const score = calculateRecallScore();

    updateLabel(
      scoreLabel,
      `Score: ${score}%`
    );

    console.log(
      `Recall Score: ${score}%`
    );

    if (score === 100) {
      console.log("Excellent recall!");
    } else if (score >= 60) {
      console.log(
        "Good recall. Review the weak concepts."
      );
    } else {
      console.log(
        "More revision recommended."
      );
    }
  }

  // ---------- PANEL INTERACTION ----------

  panel.addEventListener(
    "click",
    checkRecall
  );

  window.checkRecall = checkRecall;

  console.log(
    "Recall Challenge ready"
  );
});
