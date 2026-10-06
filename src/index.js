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

  const recallSlots = [
    -2.0,
    -1.0,
    0,
    1.0,
    2.0
  ];

  let recallStarted = false;

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

  // ---------- KEEP LABELS WITH OBJECTS ----------

  function updateObjectLabels() {
    recallObjects.forEach((item) => {
      item.labelData.mesh.position.set(
        item.object.position.x,
        item.object.position.y + 0.72,
        item.object.position.z + 0.18
      );
    });

    requestAnimationFrame(updateObjectLabels);
  }

  updateObjectLabels();

  // ---------- SCORE LABEL ----------

  const scoreLabel = createLabel(
    "Score: --",
    [0, 2.35, -2.15],
    1.6,
    0.32
  );

  // ---------- FEEDBACK LABEL ----------

  const feedbackLabel = createLabel(
    "Press START RECALL",
    [0, 1.95, -2.15],
    2.1,
    0.28
  );

  // ---------- START RECALL PANEL ----------

  const startPanel = new Mesh(
    new BoxGeometry(1.8, 0.5, 0.08),
    new MeshBasicMaterial({
      color: 0x36a269
    })
  );

  startPanel.position.set(
    0,
    0.35,
    -2.3
  );

  const startPanelEntity =
    world.createTransformEntity(startPanel);

  startPanelEntity.addComponent(RayInteractable);

  createLabel(
    "START RECALL",
    [0, 0.35, -2.24],
    1.5,
    0.28
  );

  // ---------- CHECK RECALL PANEL ----------

  const checkPanel = new Mesh(
    new BoxGeometry(1.8, 0.5, 0.08),
    new MeshBasicMaterial({
      color: 0x3159a6
    })
  );

  checkPanel.position.set(
    0,
    0.9,
    -2.3
  );

  const checkPanelEntity =
    world.createTransformEntity(checkPanel);

  checkPanelEntity.addComponent(
    RayInteractable
  );

  createLabel(
    "CHECK RECALL",
    [0, 0.9, -2.24],
    1.5,
    0.28
  );

  // ---------- SHUFFLE ----------

  function shuffleRecallObjects() {
    const shuffledSlots = [...recallSlots];

    for (
      let i = shuffledSlots.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        shuffledSlots[i],
        shuffledSlots[j]
      ] = [
        shuffledSlots[j],
        shuffledSlots[i]
      ];
    }

    recallObjects.forEach(
      (item, index) => {
        item.object.position.x =
          shuffledSlots[index];

        item.object.position.y =
          index % 2 === 0
            ? 1.35
            : 0.95;
      }
    );

    console.log(
      "Recall concepts shuffled"
    );
  }

  // ---------- START RECALL ----------

  function startRecall() {
    recallStarted = true;

    shuffleRecallObjects();

    updateLabel(
      scoreLabel,
      "Score: --"
    );

    updateLabel(
      feedbackLabel,
      "Arrange the concepts"
    );

    console.log(
      "Recall challenge started"
    );
  }

  // ---------- CALCULATE SCORE ----------

  function calculateRecallScore() {
    const sortedObjects =
      [...recallObjects].sort(
        (a, b) =>
          a.object.position.x -
          b.object.position.x
      );

    let correct = 0;

    sortedObjects.forEach(
      (item, index) => {
        if (
          item.correctIndex === index
        ) {
          correct++;
        }
      }
    );

    return Math.round(
      (correct /
        correctOrder.length) *
        100
    );
  }

  // ---------- CHECK RECALL ----------

  function checkRecall() {
    if (!recallStarted) {
      updateLabel(
        feedbackLabel,
        "Start the challenge first"
      );

      return;
    }

    const score =
      calculateRecallScore();

    updateLabel(
      scoreLabel,
      `Score: ${score}%`
    );

    if (score === 100) {
      updateLabel(
        feedbackLabel,
        "Excellent memory!"
      );

      console.log(
        "Excellent recall!"
      );
    } else if (score >= 60) {
      updateLabel(
        feedbackLabel,
        "Good! Review weak concepts."
      );

      console.log(
        "Good recall. Review weak concepts."
      );
    } else {
      updateLabel(
        feedbackLabel,
        "Review and try again."
      );

      console.log(
        "More revision recommended."
      );
    }
  }

  // ---------- BUTTON EVENTS ----------

  startPanel.addEventListener(
    "click",
    startRecall
  );

  checkPanel.addEventListener(
    "click",
    checkRecall
  );

  // ---------- GLOBAL TEST FUNCTIONS ----------

  window.startRecall = startRecall;
  window.checkRecall = checkRecall;

  console.log(
    "Recall Challenge 2.0 ready"
  );
});
