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
    5.4
  );

  world.camera.lookAt(
    0,
    1.35,
    -1.0
  );


  // =======================================================
  // MATERIAL / BOX HELPERS
  // =======================================================

  function createBox(
    width,
    height,
    depth,
    color,
    position
  ) {

    const mesh =
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

    mesh.position.set(
      position[0],
      position[1],
      position[2]
    );

    world.createTransformEntity(mesh);

    return mesh;
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
      throw new Error("Unable to create label canvas");
    }

    context.fillStyle =
      "rgba(5, 10, 20, 0.92)";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      "#ffffff";

    context.font =
      "bold 32px Arial";

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
      "rgba(5, 10, 20, 0.92)";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.fillStyle =
      "#ffffff";

    context.font =
      "bold 32px Arial";

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
  // ROOM
  // =======================================================

  // FLOOR

  createBox(
    6,
    0.12,
    6,
    0x29354a,
    [0, -0.06, 0]
  );


  // BACK WALL

  createBox(
    6,
    3,
    0.12,
    0x172235,
    [0, 1.5, -3]
  );


  // LEFT WALL

  createBox(
    0.12,
    3,
    6,
    0x202d43,
    [-3, 1.5, 0]
  );


  // RIGHT WALL

  createBox(
    0.12,
    3,
    6,
    0x202d43,
    [3, 1.5, 0]
  );


  // CEILING

  createBox(
    6,
    0.1,
    6,
    0x101827,
    [0, 3.05, 0]
  );


  // =======================================================
  // CEILING LIGHTS
  // =======================================================

  const ceilingLightPositions = [
    [-1.8, 2.92, 0.8],
    [0, 2.92, 0.8],
    [1.8, 2.92, 0.8]
  ];

  ceilingLightPositions.forEach(
    (position) => {

      createBox(
        1.1,
        0.08,
        0.28,
        0xf7dfa0,
        position
      );

    }
  );


  // =======================================================
  // HALL TITLE
  // =======================================================

  createLabel(
    "AI LEARNING HALL",
    [0, 2.72, -2.82],
    2.8,
    0.32
  );


  // =======================================================
  // SMALL DECORATIVE TOP STRIP
  // =======================================================

  createBox(
    5.4,
    0.06,
    0.08,
    0x536d9d,
    [0, 2.52, -2.91]
  );


  // =======================================================
  // CENTRAL BLACKBOARD
  // =======================================================

  const blackboard =
    new Mesh(
      new BoxGeometry(
        4.2,
        1.15,
        0.08
      ),
      new MeshBasicMaterial({
        color: 0x07140f
      })
    );

  blackboard.position.set(
    0,
    1.88,
    -2.82
  );

  world.createTransformEntity(
    blackboard
  );


  // Blackboard frame

  createBox(
    4.35,
    0.08,
    0.12,
    0x8d6b40,
    [0, 2.48, -2.88]
  );

  createBox(
    4.35,
    0.08,
    0.12,
    0x8d6b40,
    [0, 1.28, -2.88]
  );

  createBox(
    0.08,
    1.25,
    0.12,
    0x8d6b40,
    [-2.18, 1.88, -2.88]
  );

  createBox(
    0.08,
    1.25,
    0.12,
    0x8d6b40,
    [2.18, 1.88, -2.88]
  );


  createLabel(
    "AI RESULT",
    [0, 2.15, -2.72],
    1.5,
    0.25
  );


  const resultText =
    createLabel(
      "Learning result will appear here",
      [0, 1.76, -2.72],
      3.3,
      0.23
    );


  // =======================================================
  // TEACHER DESK
  // =======================================================

  createBox(
    1.25,
    0.10,
    0.55,
    0x765438,
    [0, 0.70, -2.05]
  );


  // Desk legs

  const deskLegs = [
    [-0.48, 0.35, -2.25],
    [0.48, 0.35, -2.25],
    [-0.48, 0.35, -1.85],
    [0.48, 0.35, -1.85]
  ];

  deskLegs.forEach(
    (position) => {

      createBox(
        0.08,
        0.65,
        0.08,
        0x543b27,
        position
      );

    }
  );


  createLabel(
    "AI TEACHER",
    [0, 0.91, -1.72],
    1.25,
    0.21
  );


  // =======================================================
  // SIDE WINDOWS
  // =======================================================

  // LEFT WINDOW

  createBox(
    0.06,
    0.72,
    1.25,
    0x3f789e,
    [-2.92, 1.85, -0.7]
  );


  // LEFT WINDOW FRAME

  createBox(
    0.08,
    0.78,
    0.06,
    0xaab8c7,
    [-2.96, 1.85, -0.7]
  );


  // RIGHT WINDOW

  createBox(
    0.06,
    0.72,
    1.25,
    0x3f789e,
    [2.92, 1.85, -0.7]
  );


  // RIGHT WINDOW FRAME

  createBox(
    0.08,
    0.78,
    0.06,
    0xaab8c7,
    [2.96, 1.85, -0.7]
  );


  // =======================================================
  // SIDE DOOR
  // =======================================================

  createBox(
    0.08,
    1.7,
    0.85,
    0x513a4f,
    [2.92, 0.86, 1.75]
  );


  createBox(
    0.08,
    0.07,
    0.07,
    0xe8c66c,
    [2.84, 0.92, 1.48]
  );


  createLabel(
    "EXIT",
    [2.86, 1.85, 1.75],
    0.7,
    0.20
  );


  // =======================================================
  // STUDENT TABLES
  // =======================================================

  function createStudentTable(
    x,
    z
  ) {

    // tabletop

    createBox(
      1.05,
      0.08,
      0.58,
      0x6e5034,
      [x, 0.70, z]
    );


    // legs

    const legs = [
      [x - 0.42, 0.35, z - 0.20],
      [x + 0.42, 0.35, z - 0.20],
      [x - 0.42, 0.35, z + 0.20],
      [x + 0.42, 0.35, z + 0.20]
    ];

    legs.forEach(
      (position) => {

        createBox(
          0.07,
          0.65,
          0.07,
          0x513a29,
          position
        );

      }
    );


    // small book

    createBox(
      0.28,
      0.04,
      0.18,
      0xd7c59c,
      [x - 0.18, 0.77, z]
    );
  }


  // Three clean tables

  createStudentTable(
    -1.55,
    0.85
  );

  createStudentTable(
    0,
    0.85
  );

  createStudentTable(
    1.55,
    0.85
  );


  // =======================================================
  // STUDENT CHAIRS
  // =======================================================

  function createChair(
    x,
    z
  ) {

    // seat

    createBox(
      0.48,
      0.08,
      0.48,
      0x465875,
      [x, 0.43, z]
    );


    // back

    createBox(
      0.48,
      0.55,
      0.08,
      0x465875,
      [x, 0.68, z + 0.22]
    );


    // legs

    createBox(
      0.06,
      0.40,
      0.06,
      0x303d54,
      [x - 0.18, 0.20, z - 0.16]
    );

    createBox(
      0.06,
      0.40,
      0.06,
      0x303d54,
      [x + 0.18, 0.20, z - 0.16]
    );

  }


  createChair(
    -1.55,
    1.25
  );

  createChair(
    0,
    1.25
  );

  createChair(
    1.55,
    1.25
  );


  // =======================================================
  // LEARNING CORNER
  // =======================================================

  createBox(
    1.05,
    0.55,
    0.08,
    0x29466f,
    [-2.15, 0.95, -1.05]
  );

  createLabel(
    "LEARNING",
    [-2.15, 0.95, -0.96],
    0.95,
    0.20
  );


  // =======================================================
  // REVISION CORNER
  // =======================================================

  createBox(
    1.05,
    0.55,
    0.08,
    0x365078,
    [2.15, 0.95, -1.05]
  );

  createLabel(
    "AI REVISION",
    [2.15, 0.95, -0.96],
    1.0,
    0.20
  );


  // =======================================================
  // MEMORY ZONE
  // =======================================================

  const memoryZone =
    new Mesh(
      new BoxGeometry(
        4.4,
        0.04,
        1.15
      ),
      new MeshBasicMaterial({
        color: 0x172844
      })
    );

  memoryZone.position.set(
    0,
    0.04,
    -0.35
  );

  world.createTransformEntity(
    memoryZone
  );


  // Memory zone border

  createBox(
    4.45,
    0.035,
    0.05,
    0x5875b0,
    [0, 0.07, -0.93]
  );

  createBox(
    4.45,
    0.035,
    0.05,
    0x5875b0,
    [0, 0.07, 0.23]
  );

  createBox(
    0.05,
    0.035,
    1.15,
    0x5875b0,
    [-2.22, 0.07, -0.35]
  );

  createBox(
    0.05,
    0.035,
    1.15,
    0x5875b0,
    [2.22, 0.07, -0.35]
  );


  createLabel(
    "MEMORY PALACE",
    [0, 0.30, -0.88],
    1.55,
    0.21
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
          originalScale.x * 1.15,
          originalScale.y * 1.15,
          originalScale.z * 1.15
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
          position[1] + 0.48,
          position[2]
        ],
        1.0,
        0.20
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
          -0.35
        ],
        concept.name,
        index
      );

    }
  );


  // =======================================================
  // STATUS
  // =======================================================

  const aiStatusLabel =
    createLabel(
      "AI Memory Palace Ready",
      [0, 2.55, -2.70],
      2.25,
      0.23
    );


  const scoreLabel =
    createLabel(
      "Score: --",
      [-1.65, 0.28, -1.55],
      1.05,
      0.21
    );


  const feedbackLabel =
    createLabel(
      "Ready for recall",
      [0, 0.28, -1.55],
      1.55,
      0.21
    );


  const revisionLabel =
    createLabel(
      "AI Revision: Waiting...",
      [1.65, 0.28, -1.55],
      1.65,
      0.21
    );


  // =======================================================
  // START RECALL
  // =======================================================

  const startPanel =
    new Mesh(
      new BoxGeometry(
        1.35,
        0.40,
        0.08
      ),
      new MeshBasicMaterial({
        color: 0x329568
      })
    );

  startPanel.position.set(
    -0.78,
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
    [-0.78, 0.14, -1.87],
    1.20,
    0.20
  );


  // =======================================================
  // CHECK RECALL
  // =======================================================

  const checkPanel =
    new Mesh(
      new BoxGeometry(
        1.35,
        0.40,
        0.08
      ),
      new MeshBasicMaterial({
        color: 0x3159a6
      })
    );

  checkPanel.position.set(
    0.78,
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
    [0.78, 0.14, -1.87],
    1.20,
    0.20
  );


  // =======================================================
  // UPDATE MEMORY LABELS
  // =======================================================

  function updateObjectLabels() {

    recallObjects.forEach(
      (item) => {

        item.labelData.mesh.position.set(
          item.object.position.x,
          item.object.position.y + 0.48,
          item.object.position.z
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
          -0.35
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

      if (event.key === "Enter") {

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
          -0.35;
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


