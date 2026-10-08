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

import { createMemoryVisual } from "./memoryVisuals.js";

import {
  checkBackendHealth,
  generateConcepts,
  generateRevision
} from "./api.js";


// =========================================================
// SCENE CONTAINER
// =========================================================

const sceneContainer =
  document.getElementById("scene-container");

if (!(sceneContainer instanceof HTMLDivElement)) {
  throw new Error("Missing #scene-container");
}


// =========================================================
// WORLD
// =========================================================

World.create(sceneContainer, projectOptions).then((world) => {

  console.log("AI Memory Palace VR started");


  // =======================================================
  // BACKEND
  // =======================================================

  checkBackendHealth()
    .then((data) => {
      console.log("Backend connected:", data);
    })
    .catch((error) => {
      console.error("Backend connection failed:", error);
    });


  // =======================================================
  // TOPIC
  // =======================================================

  let currentTopic = "Photosynthesis";


  // =======================================================
  // CAMERA
  // =======================================================

  world.camera.position.set(
    0,
    1.65,
    5.2
  );

  world.camera.lookAt(
    0,
    1.35,
    -1.2
  );


  // =======================================================
  // BASIC MATERIALS
  // =======================================================

  const floorMaterial =
    new MeshBasicMaterial({
      color: 0x252c3d
    });

  const wallMaterial =
    new MeshBasicMaterial({
      color: 0x182033
    });

  const sideWallMaterial =
    new MeshBasicMaterial({
      color: 0x202a43
    });

  const ceilingMaterial =
    new MeshBasicMaterial({
      color: 0x111827
    });


  // =======================================================
  // CREATE BOX
  // =======================================================

  function createBox(
    width,
    height,
    depth,
    color,
    position
  ) {

    const box =
      new Mesh(
        new BoxGeometry(
          width,
          height,
          depth
        ),
        new MeshBasicMaterial({
          color
        })
      );

    box.position.set(
      position[0],
      position[1],
      position[2]
    );

    world.createTransformEntity(box);

    return box;
  }


  // =======================================================
  // LABEL SYSTEM
  // =======================================================

  function createLabel(
    text,
    position,
    width = 1,
    height = 0.24
  ) {

    const canvas =
      document.createElement("canvas");

    canvas.width = 512;
    canvas.height = 128;

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Unable to create label canvas"
      );
    }

    context.fillStyle =
      "rgba(7, 12, 24, 0.94)";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      "#ffffff";

    context.font =
      "bold 34px Arial";

    context.textAlign =
      "center";

    context.textBaseline =
      "middle";

    context.fillText(
      text,
      canvas.width / 2,
      canvas.height / 2
    );

    const texture =
      new THREE.CanvasTexture(canvas);

    const material =
      new MeshBasicMaterial({
        map: texture,
        transparent: true
      });

    const label =
      new THREE.Mesh(
        new THREE.PlaneGeometry(
          width,
          height
        ),
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


  function updateLabel(
    labelData,
    text
  ) {

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

    context.fillStyle =
      "rgba(7, 12, 24, 0.94)";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      "#ffffff";

    context.font =
      "bold 34px Arial";

    context.textAlign =
      "center";

    context.textBaseline =
      "middle";

    context.fillText(
      text,
      canvas.width / 2,
      canvas.height / 2
    );

    texture.needsUpdate = true;
  }


  // =======================================================
  // 1. FLOOR
  // =======================================================

  const floor =
    new Mesh(
      new BoxGeometry(
        6,
        0.1,
        6
      ),
      floorMaterial
    );

  floor.position.set(
    0,
    -0.05,
    0
  );

  world.createTransformEntity(floor);


  // =======================================================
  // 2. BACK WALL
  // =======================================================

  createBox(
    6,
    3,
    0.12,
    0x182033,
    [0, 1.5, -3]
  );


  // =======================================================
  // 3. SIDE WALLS
  // =======================================================

  createBox(
    0.12,
    3,
    6,
    0x202a43,
    [-3, 1.5, 0]
  );

  createBox(
    0.12,
    3,
    6,
    0x202a43,
    [3, 1.5, 0]
  );


  // =======================================================
  // 4. CEILING
  // =======================================================

  createBox(
    6,
    0.1,
    6,
    0x111827,
    [0, 3.05, 0]
  );


  // =======================================================
  // 5. SIMPLE CEILING LIGHTS
  // =======================================================

  createBox(
    1.2,
    0.08,
    0.3,
    0xf4d98a,
    [-1.6, 2.9, -0.4]
  );

  createBox(
    1.2,
    0.08,
    0.3,
    0xf4d98a,
    [0, 2.9, -0.4]
  );

  createBox(
    1.2,
    0.08,
    0.3,
    0xf4d98a,
    [1.6, 2.9, -0.4]
  );


  // =======================================================
  // 6. HALL TITLE
  // =======================================================

  createLabel(
    "AI LEARNING HALL",
    [0, 2.65, -2.88],
    2.6,
    0.34
  );


  // =======================================================
  // 7. CENTRAL AI BLACKBOARD
  // =======================================================

  const blackboard =
    new Mesh(
      new BoxGeometry(
        4.4,
        1.15,
        0.08
      ),
      new MeshBasicMaterial({
        color: 0x08120f
      })
    );

  blackboard.position.set(
    0,
    1.9,
    -2.78
  );

  world.createTransformEntity(
    blackboard
  );


  // Blackboard wooden frame

  createBox(
    4.6,
    0.08,
    0.12,
    0x8b693f,
    [0, 2.51, -2.84]
  );

  createBox(
    4.6,
    0.08,
    0.12,
    0x8b693f,
    [0, 1.29, -2.84]
  );

  createBox(
    0.08,
    1.3,
    0.12,
    0x8b693f,
    [-2.28, 1.9, -2.84]
  );

  createBox(
    0.08,
    1.3,
    0.12,
    0x8b693f,
    [2.28, 1.9, -2.84]
  );


  createLabel(
    "AI RESULT",
    [0, 2.2, -2.70],
    1.55,
    0.27
  );


  const resultText =
    createLabel(
      "Learning result will appear here",
      [0, 1.75, -2.70],
      3.4,
      0.25
    );


  // =======================================================
  // 8. SMALL SIDE INFORMATION PANELS
  // =======================================================

  // LEFT

  createBox(
    1.25,
    0.62,
    0.08,
    0x263b63,
    [-2.05, 0.82, -2.72]
  );

  createLabel(
    "LEARNING",
    [-2.05, 0.82, -2.64],
    1.1,
    0.22
  );


  // RIGHT

  createBox(
    1.25,
    0.62,
    0.08,
    0x304a78,
    [2.05, 0.82, -2.72]
  );

  createLabel(
    "AI REVISION",
    [2.05, 0.82, -2.64],
    1.15,
    0.22
  );


  // =======================================================
  // 9. SIMPLE WINDOWS
  // =======================================================

  createBox(
    0.85,
    0.65,
    0.06,
    0x315d82,
    [-2.35, 2.0, -2.92]
  );

  createBox(
    0.85,
    0.65,
    0.06,
    0x315d82,
    [2.35, 2.0, -2.92]
  );


  // =======================================================
  // 10. WINDOW FRAMES
  // =======================================================

  createBox(
    0.06,
    0.7,
    0.08,
    0x91a4b8,
    [-2.35, 2.0, -2.98]
  );

  createBox(
    0.06,
    0.7,
    0.08,
    0x91a4b8,
    [2.35, 2.0, -2.98]
  );


  // =======================================================
  // 11. SIMPLE DOOR
  // =======================================================

  createBox(
    0.72,
    1.65,
    0.08,
    0x493654,
    [2.45, 0.92, -2.91]
  );

  createBox(
    0.07,
    0.07,
    0.07,
    0xe5c36d,
    [2.68, 0.95, -2.99]
  );


  // =======================================================
  // 12. TEACHER DESK
  // =======================================================

  createBox(
    1.25,
    0.08,
    0.55,
    0x765538,
    [0, 0.72, -2.0]
  );

  createBox(
    0.08,
    0.65,
    0.08,
    0x5a402c,
    [-0.48, 0.38, -2.18]
  );

  createBox(
    0.08,
    0.65,
    0.08,
    0x5a402c,
    [0.48, 0.38, -2.18]
  );

  createBox(
    0.08,
    0.65,
    0.08,
    0x5a402c,
    [-0.48, 0.38, -1.82]
  );

  createBox(
    0.08,
    0.65,
    0.08,
    0x5a402c,
    [0.48, 0.38, -1.82]
  );


  createLabel(
    "AI TEACHER DESK",
    [0, 0.9, -1.72],
    1.45,
    0.22
  );


  // =======================================================
  // 13. MEMORY ZONE
  // =======================================================

  const memoryZone =
    new Mesh(
      new BoxGeometry(
        4.6,
        0.04,
        1.35
      ),
      new MeshBasicMaterial({
        color: 0x18233d
      })
    );

  memoryZone.position.set(
    0,
    0.04,
    -0.65
  );

  world.createTransformEntity(
    memoryZone
  );


  // Zone border

  createBox(
    4.6,
    0.035,
    0.05,
    0x4d6bb3,
    [0, 0.07, -1.32]
  );

  createBox(
    4.6,
    0.035,
    0.05,
    0x4d6bb3,
    [0, 0.07, 0.02]
  );

  createBox(
    0.05,
    0.035,
    1.35,
    0x4d6bb3,
    [-2.3, 0.07, -0.65]
  );

  createBox(
    0.05,
    0.035,
    1.35,
    0x4d6bb3,
    [2.3, 0.07, -0.65]
  );


  createLabel(
    "MEMORY ZONE",
    [0, 0.34, -1.20],
    1.5,
    0.23
  );


  // =======================================================
  // RECALL DATA
  // =======================================================

  const recallObjects = [];

  let correctOrder = [];

  const recallSlots = [
    -1.6,
    -0.8,
    0,
    0.8,
    1.6
  ];

  let recallStarted = false;


  // =======================================================
  // MEMORY OBJECT
  // =======================================================

  function createRecallObject(
    color,
    position,
    label,
    correctIndex,
    memoryHint = ""
  ) {

    const object =
      createMemoryVisual(
        label,
        color,
        memoryHint
      );

    object.position.set(
      position[0],
      position[1],
      position[2]
    );

    const entity =
      world.createTransformEntity(
        object
      );

    entity.addComponent(
      RayInteractable
    );

    entity.addComponent(
      OneHandGrabbable,
      {
        translate: true,
        rotate: false
      }
    );


    const originalScale =
      object.scale.clone();


    object.addEventListener(
      "pointerenter",
      () => {

        object.scale.set(
          originalScale.x * 1.12,
          originalScale.y * 1.12,
          originalScale.z * 1.12
        );

      }
    );


    object.addEventListener(
      "pointerleave",
      () => {

        object.scale.copy(
          originalScale
        );

      }
    );


    const labelData =
      createLabel(
        label,
        [
          position[0],
          position[1] + 0.5,
          position[2] + 0.15
        ],
        1.05,
        0.22
      );


    object.userData.memoryHint =
      memoryHint;

    object.userData.conceptName =
      label;


    recallObjects.push({
      object,
      label,
      correctIndex,
      labelData,
      memoryHint
    });


    return entity;
  }


  // =======================================================
  // INITIAL CONCEPTS
  // =======================================================

  const initialConcepts = [
    {
      name: "Light Energy",
      color: 0x36d399
    },
    {
      name: "Water",
      color: 0xff6b6b
    },
    {
      name: "Photosynthesis",
      color: 0x4f8cff
    },
    {
      name: "Glucose",
      color: 0xffc857
    },
    {
      name: "Oxygen",
      color: 0xb56cff
    }
  ];


  correctOrder =
    initialConcepts.map(
      (concept) => concept.name
    );


  initialConcepts.forEach(
    (concept, index) => {

      createRecallObject(
        concept.color,
        [
          recallSlots[index],
          0.82,
          -0.65
        ],
        concept.name,
        index
      );

    }
  );


  // =======================================================
  // STATUS PANELS
  // =======================================================

  const aiStatusLabel =
    createLabel(
      "AI Memory Palace Ready",
      [0, 2.78, -2.45],
      2.3,
      0.25
    );


  const scoreLabel =
    createLabel(
      "Score: --",
      [-1.65, 0.32, -2.05],
      1.15,
      0.24
    );


  const feedbackLabel =
    createLabel(
      "Ready for recall",
      [0, 0.32, -2.05],
      1.8,
      0.24
    );


  const revisionLabel =
    createLabel(
      "AI Revision: Waiting...",
      [1.65, 0.32, -2.05],
      1.75,
      0.24
    );


  // =======================================================
  // START RECALL BUTTON
  // =======================================================

  const startPanel =
    new Mesh(
      new BoxGeometry(
        1.55,
        0.42,
        0.08
      ),
      new MeshBasicMaterial({
        color: 0x36a269
      })
    );

  startPanel.position.set(
    -0.9,
    0.14,
    -1.95
  );

  const startPanelEntity =
    world.createTransformEntity(
      startPanel
    );

  startPanelEntity.addComponent(
    RayInteractable
  );


  createLabel(
    "START RECALL",
    [-0.9, 0.14, -1.88],
    1.3,
    0.22
  );


  // =======================================================
  // CHECK RECALL BUTTON
  // =======================================================

  const checkPanel =
    new Mesh(
      new BoxGeometry(
        1.55,
        0.42,
        0.08
      ),
      new MeshBasicMaterial({
        color: 0x3159a6
      })
    );

  checkPanel.position.set(
    0.9,
    0.14,
    -1.95
  );

  const checkPanelEntity =
    world.createTransformEntity(
      checkPanel
    );

  checkPanelEntity.addComponent(
    RayInteractable
  );


  createLabel(
    "CHECK RECALL",
    [0.9, 0.14, -1.88],
    1.3,
    0.22
  );


  // =======================================================
  // UPDATE OBJECT LABELS
  // =======================================================

  function updateObjectLabels() {

    recallObjects.forEach(
      (item) => {

        item.labelData.mesh.position.set(
          item.object.position.x,
          item.object.position.y + 0.5,
          item.object.position.z + 0.15
        );

      }
    );

    requestAnimationFrame(
      updateObjectLabels
    );
  }

  updateObjectLabels();


  // =======================================================
  // DESKTOP DRAG
  // =======================================================

  function setupDesktop3DDrag() {

    const canvas =
      sceneContainer.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {

      console.warn(
        "Desktop drag: canvas not found"
      );

      return;
    }


    const raycaster =
      new THREE.Raycaster();

    const pointer =
      new THREE.Vector2();

    const dragPlane =
      new THREE.Plane();

    const intersection =
      new THREE.Vector3();

    const dragOffset =
      new THREE.Vector3();

    let selectedObject = null;

    let isDragging = false;

    let dragDepth = 0;


    function updatePointer(event) {

      const rect =
        canvas.getBoundingClientRect();

      pointer.x =
        (
          (event.clientX - rect.left) /
          rect.width
        ) * 2 - 1;

      pointer.y =
        -(
          (event.clientY - rect.top) /
          rect.height
        ) * 2 + 1;
    }


    function findMemoryObject(event) {

      updatePointer(event);

      raycaster.setFromCamera(
        pointer,
        world.camera
      );

      const meshes =
        recallObjects.map(
          (item) => item.object
        );

      const intersections =
        raycaster.intersectObjects(
          meshes,
          true
        );

      if (
        intersections.length === 0
      ) {
        return null;
      }

      let hit =
        intersections[0].object;

      while (
        hit &&
        !meshes.includes(hit)
      ) {

        hit = hit.parent;
      }

      return hit || null;
    }


    function handlePointerDown(event) {

      if (event.button !== 0) {
        return;
      }

      const object =
        findMemoryObject(event);

      if (!object) {
        return;
      }

      selectedObject = object;

      isDragging = true;

      canvas.setPointerCapture(
        event.pointerId
      );


      const cameraDirection =
        new THREE.Vector3();

      world.camera.getWorldDirection(
        cameraDirection
      );


      dragPlane.setFromNormalAndCoplanarPoint(
        cameraDirection,
        object.position
      );


      raycaster.setFromCamera(
        pointer,
        world.camera
      );


      if (
        raycaster.ray.intersectPlane(
          dragPlane,
          intersection
        )
      ) {

        dragOffset.subVectors(
          object.position,
          intersection
        );
      }


      dragDepth =
        object.position.z;


      object.userData.desktopDragging =
        true;

      event.preventDefault();
    }


    function handlePointerMove(event) {

      if (
        !isDragging ||
        !selectedObject
      ) {
        return;
      }

      updatePointer(event);

      raycaster.setFromCamera(
        pointer,
        world.camera
      );


      if (
        raycaster.ray.intersectPlane(
          dragPlane,
          intersection
        )
      ) {

        selectedObject.position.x =
          intersection.x +
          dragOffset.x;

        selectedObject.position.y =
          intersection.y +
          dragOffset.y;
      }


      selectedObject.position.z =
        dragDepth;

      event.preventDefault();
    }


    function handleWheel(event) {

      if (
        !isDragging ||
        !selectedObject
      ) {
        return;
      }

      selectedObject.position.z +=
        event.deltaY * 0.002;

      dragDepth =
        selectedObject.position.z;

      event.preventDefault();
    }


    function handlePointerUp(event) {

      if (!isDragging) {
        return;
      }

      if (
        canvas.hasPointerCapture(
          event.pointerId
        )
      ) {

        canvas.releasePointerCapture(
          event.pointerId
        );
      }

      if (selectedObject) {

        selectedObject.userData.desktopDragging =
          false;
      }

      selectedObject = null;

      isDragging = false;

      dragOffset.set(
        0,
        0,
        0
      );
    }


    canvas.style.touchAction =
      "none";


    canvas.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    canvas.addEventListener(
      "pointermove",
      handlePointerMove
    );

    canvas.addEventListener(
      "pointerup",
      handlePointerUp
    );

    canvas.addEventListener(
      "pointercancel",
      handlePointerUp
    );

    canvas.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false
      }
    );


    console.log(
      "Desktop 3D Drag Adapter ready"
    );
  }


  setupDesktop3DDrag();


  // =======================================================
  // APPLY AI CONCEPTS
  // =======================================================

  function applyAIConcepts(
    concepts
  ) {

    if (
      !Array.isArray(concepts) ||
      concepts.length === 0
    ) {

      updateLabel(
        aiStatusLabel,
        "AI returned no concepts"
      );

      return;
    }


    const usableConcepts =
      concepts.slice(0, 5);


    correctOrder =
      usableConcepts.map(
        (concept) => concept.name
      );


    const colors = [
      0x36d399,
      0xff6b6b,
      0x4f8cff,
      0xffc857,
      0xb56cff
    ];


    usableConcepts.forEach(
      (concept, index) => {

        const item =
          recallObjects[index];

        if (!item) {
          return;
        }


        item.label =
          concept.name;

        item.correctIndex =
          index;

        item.memoryHint =
          concept.memory_hint || "";


        item.object.userData.memoryHint =
          concept.memory_hint || "";

        item.object.userData.description =
          concept.description || "";

        item.object.userData.conceptName =
          concept.name;


        updateLabel(
          item.labelData,
          concept.name
        );


        if (
          item.object.material &&
          item.object.material.color
        ) {

          item.object.material.color.setHex(
            colors[index]
          );
        }


        item.object.position.set(
          recallSlots[index],
          0.82,
          -0.65
        );
      }
    );


    updateLabel(
      scoreLabel,
      "Score: --"
    );

    updateLabel(
      feedbackLabel,
      "AI concepts loaded"
    );

    updateLabel(
      aiStatusLabel,
      "AI Memory Palace Ready"
    );


    recallStarted = false;
  }


  // =======================================================
  // GENERATE AI CONCEPTS
  // =======================================================

  async function generateAIConcepts(
    topic
  ) {

    const cleanTopic =
      topic.trim();


    if (!cleanTopic) {

      updateLabel(
        feedbackLabel,
        "Enter a topic first"
      );

      return;
    }


    currentTopic =
      cleanTopic;


    updateLabel(
      aiStatusLabel,
      "AI is thinking..."
    );

    updateLabel(
      feedbackLabel,
      "Generating memory concepts"
    );


    try {

      const result =
        await generateConcepts(
          cleanTopic
        );


      applyAIConcepts(
        result.concepts
      );


      console.log(
        "AI concept response:",
        result
      );

    } catch (error) {

      console.error(
        "AI concept generation failed:",
        error
      );


      updateLabel(
        aiStatusLabel,
        "AI connection failed"
      );

      updateLabel(
        feedbackLabel,
        "Try generating again"
      );
    }
  }


  // =======================================================
  // BROWSER TOPIC INPUT
  // =======================================================

  const topicPanel =
    document.createElement("div");

  topicPanel.style.position =
    "fixed";

  topicPanel.style.top =
    "20px";

  topicPanel.style.left =
    "50%";

  topicPanel.style.transform =
    "translateX(-50%)";

  topicPanel.style.zIndex =
    "9999";

  topicPanel.style.display =
    "flex";

  topicPanel.style.gap =
    "8px";

  topicPanel.style.padding =
    "10px";

  topicPanel.style.background =
    "rgba(10,15,30,0.94)";

  topicPanel.style.borderRadius =
    "12px";


  const topicInput =
    document.createElement("input");

  topicInput.type =
    "text";

  topicInput.placeholder =
    "Enter a learning topic";

  topicInput.value =
    "Photosynthesis";

  topicInput.style.width =
    "240px";

  topicInput.style.padding =
    "10px";

  topicInput.style.borderRadius =
    "8px";

  topicInput.style.border =
    "1px solid #6c63ff";

  topicInput.style.background =
    "#151b2d";

  topicInput.style.color =
    "#ffffff";


  const generateButton =
    document.createElement("button");

  generateButton.textContent =
    "GENERATE AI";

  generateButton.style.padding =
    "10px 14px";

  generateButton.style.border =
    "none";

  generateButton.style.borderRadius =
    "8px";

  generateButton.style.cursor =
    "pointer";

  generateButton.style.background =
    "#6c63ff";

  generateButton.style.color =
    "#ffffff";


  generateButton.addEventListener(
    "click",
    () => {

      generateAIConcepts(
        topicInput.value
      );

    }
  );


  topicInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter"
      ) {

        generateAIConcepts(
          topicInput.value
        );
      }
    }
  );


  topicPanel.appendChild(
    topicInput
  );

  topicPanel.appendChild(
    generateButton
  );

  document.body.appendChild(
    topicPanel
  );


  // =======================================================
  // SHUFFLE
  // =======================================================

  function shuffleRecallObjects() {

    const shuffledSlots =
      [...recallSlots];


    for (
      let i = shuffledSlots.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(
          Math.random() *
          (i + 1)
        );


      [
        shuffledSlots[i],
        shuffledSlots[j]
      ] =
      [
        shuffledSlots[j],
        shuffledSlots[i]
      ];
    }


    recallObjects.forEach(
      (item, index) => {

        item.object.position.x =
          shuffledSlots[index];

        item.object.position.y =
          0.82;

        item.object.position.z =
          -0.65;
      }
    );
  }


  // =======================================================
  // START RECALL
  // =======================================================

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

    updateLabel(
      aiStatusLabel,
      "Recall Challenge"
    );
  }


  // =======================================================
  // CALCULATE SCORE
  // =======================================================

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
      (
        correct /
        correctOrder.length
      ) * 100
    );
  }


  // =======================================================
  // WEAK CONCEPTS
  // =======================================================

  function getWeakConcepts() {

    const sortedObjects =
      [...recallObjects].sort(
        (a, b) =>
          a.object.position.x -
          b.object.position.x
      );


    const weakConcepts = [];


    sortedObjects.forEach(
      (item, index) => {

        if (
          item.correctIndex !== index
        ) {

          weakConcepts.push(
            item.label
          );
        }
      }
    );


    return [
      ...new Set(
        weakConcepts
      )
    ];
  }


  // =======================================================
  // ADAPTIVE REVISION
  // =======================================================

  async function generateAdaptiveRevision(
    weakConcepts
  ) {

    if (
      !weakConcepts ||
      weakConcepts.length === 0
    ) {
      return;
    }


    updateLabel(
      aiStatusLabel,
      "AI Revision"
    );


    updateLabel(
      revisionLabel,
      `Weak: ${weakConcepts.join(", ")}`
    );


    updateLabel(
      feedbackLabel,
      "Finding weak concepts..."
    );


    try {

      const result =
        await generateRevision(
          currentTopic,
          weakConcepts
        );


      if (
        !result ||
        !Array.isArray(result.revision) ||
        result.revision.length === 0
      ) {

        updateLabel(
          aiStatusLabel,
          "AI Revision Ready"
        );

        updateLabel(
          feedbackLabel,
          "Review weak concepts"
        );

        return;
      }


      const revision =
        result.revision[0];


      const conceptName =
        revision.concept ||
        weakConcepts[0];


      const explanation =
        revision.explanation ||
        "Review this concept again.";


      const memoryHint =
        revision.memory_hint ||
        "Create a strong visual memory.";


      const challenge =
        revision.challenge ||
        "Try recalling this concept again.";


      const weakObject =
        recallObjects.find(
          (item) =>
            item.label.toLowerCase() ===
            conceptName.toLowerCase()
        );


      if (weakObject) {

        weakObject.object.userData.revisionExplanation =
          explanation;

        weakObject.object.userData.memoryHint =
          memoryHint;

        weakObject.object.userData.challenge =
          challenge;
      }


      updateLabel(
        aiStatusLabel,
        `Revise: ${conceptName}`
      );


      updateLabel(
        revisionLabel,
        `Hint: ${memoryHint}`
      );


      updateLabel(
        feedbackLabel,
        explanation
      );


      console.log(
        "Revision:",
        {
          conceptName,
          explanation,
          memoryHint,
          challenge
        }
      );

    } catch (error) {

      console.error(
        "Adaptive revision failed:",
        error
      );


      updateLabel(
        aiStatusLabel,
        "Revision unavailable"
      );

      updateLabel(
        feedbackLabel,
        "Review weak concepts manually"
      );
    }
  }


  // =======================================================
  // CHECK RECALL
  // =======================================================

  async function checkRecall() {

    if (!recallStarted) {

      updateLabel(
        feedbackLabel,
        "Start recall first"
      );

      return;
    }


    const score =
      calculateRecallScore();


    updateLabel(
      scoreLabel,
      `Score: ${score}%`
    );


    const weakConcepts =
      getWeakConcepts();


    if (score === 100) {

      updateLabel(
        feedbackLabel,
        "Excellent memory!"
      );

      updateLabel(
        aiStatusLabel,
        "Memory mastered!"
      );

      return;
    }


    if (score >= 60) {

      updateLabel(
        feedbackLabel,
        "Good! AI reviewing weak concepts."
      );

    } else {

      updateLabel(
        feedbackLabel,
        "Let's revise weak concepts."
      );
    }


    await generateAdaptiveRevision(
      weakConcepts
    );
  }


  // =======================================================
  // BUTTON EVENTS
  // =======================================================

  startPanel.addEventListener(
    "click",
    startRecall
  );

  checkPanel.addEventListener(
    "click",
    checkRecall
  );


  // =======================================================
  // GLOBAL FUNCTIONS
  // =======================================================

  window.startRecall =
    startRecall;

  window.checkRecall =
    checkRecall;

  window.generateAIConcepts =
    generateAIConcepts;


  // =======================================================
  // FINAL
  // =======================================================

  console.log(
    "AI Memory Palace VR ready"
  );

});


