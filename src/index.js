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
  generateConcepts
} from "./api.js";


const sceneContainer =
  document.getElementById("scene-container");


if (!(sceneContainer instanceof HTMLDivElement)) {
  throw new Error("Missing #scene-container");
}


World.create(sceneContainer, projectOptions).then((world) => {

  console.log("AI Memory Palace VR started");


  // =========================================================
  // BACKEND CONNECTION
  // =========================================================

  checkBackendHealth()
    .then((data) => {
      console.log("Backend connected:", data);
    })
    .catch((error) => {
      console.error(
        "Backend connection failed:",
        error
      );
    });


  // =========================================================
  // CAMERA
  // =========================================================

  world.camera.position.set(
    0,
    1.7,
    4
  );

  world.camera.lookAt(
    0,
    1.2,
    0
  );


  // =========================================================
  // MATERIALS
  // =========================================================

  const floorMaterial =
    new MeshBasicMaterial({
      color: 0x20283d
    });


  const wallMaterial =
    new MeshBasicMaterial({
      color: 0x151b2d
    });


  // =========================================================
  // FLOOR
  // =========================================================

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

  world.createTransformEntity(
    floor
  );


  // =========================================================
  // BACK WALL
  // =========================================================

  const backWall =
    new Mesh(
      new BoxGeometry(
        6,
        3,
        0.1
      ),
      wallMaterial
    );

  backWall.position.set(
    0,
    1.5,
    -3
  );

  world.createTransformEntity(
    backWall
  );


  // =========================================================
  // LABEL SYSTEM
  // =========================================================

  function createLabel(
    text,
    position,
    width = 0.95,
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
      "rgba(10, 15, 30, 0.96)";

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
      new THREE.CanvasTexture(
        canvas
      );

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

    world.createTransformEntity(
      label
    );

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
      "rgba(10, 15, 30, 0.96)";

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

    texture.needsUpdate =
      true;
  }


  // =========================================================
  // RECALL DATA
  // =========================================================

  const recallObjects = [];

  let correctOrder = [];

  const recallSlots = [
    -2,
    -1,
    0,
    1,
    2
  ];

  let recallStarted =
    false;


  // =========================================================
  // MEMORY OBJECT
  // =========================================================

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


    // ---------- HOVER ----------

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


    // ---------- LABEL ----------

    const labelData =
      createLabel(
        label,
        [
          position[0],
          position[1] + 0.48,
          position[2] + 0.18
        ],
        1.1,
        0.24
      );


    // ---------- MEMORY DATA ----------

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


  // =========================================================
  // CREATE INITIAL CONCEPTS
  // =========================================================

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
      (concept) =>
        concept.name
    );


  initialConcepts.forEach(
    (concept, index) => {

      createRecallObject(
        concept.color,
        [
          recallSlots[index],
          1.25,
          -2.1
        ],
        concept.name,
        index
      );

    }
  );

    // =========================================================
  // DESKTOP 3D DRAG ADAPTER
  // =========================================================
  // Desktop testing only.
  //
  // Mouse:
  //   Drag       -> X / Y movement
  //   Wheel      -> Z movement
  //
  // XR / Meta Quest interaction is NOT modified here.
  // =========================================================

  function setupDesktop3DDrag() {

    const canvas =
      sceneContainer.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {

      console.warn(
        "Desktop 3D Drag: canvas not found"
      );

      return;
    }


    const raycaster =
      new THREE.Raycaster();


    const pointer =
      new THREE.Vector2();


    const dragPlane =
      new THREE.Plane();


    const planePoint =
      new THREE.Vector3();


    const dragOffset =
      new THREE.Vector3();


    const intersection =
      new THREE.Vector3();


    let selectedObject =
      null;


    let isDragging =
      false;


    let dragDepth =
      0;


    // -------------------------------------------------------
    // POINTER -> NORMALIZED DEVICE COORDINATES
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // FIND MEMORY OBJECT UNDER MOUSE
    // -------------------------------------------------------

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


      // Walk up until we reach
      // one of our memory objects.

      while (
        hit &&
        !meshes.includes(hit)
      ) {

        hit =
          hit.parent;

      }


      return hit || null;

    }


    // -------------------------------------------------------
    // POINTER DOWN
    // -------------------------------------------------------

    function handlePointerDown(event) {

      if (
        event.button !== 0
      ) {

        return;

      }


      const object =
        findMemoryObject(event);


      if (!object) {

        return;

      }


      selectedObject =
        object;


      isDragging =
        true;


      canvas.setPointerCapture(
        event.pointerId
      );


      // Create a horizontal/vertical
      // screen-facing drag plane.

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


      console.log(
        "Desktop grab:",
        object.userData.conceptName
      );


      event.preventDefault();

    }


    // -------------------------------------------------------
    // POINTER MOVE
    // -------------------------------------------------------

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


      // Keep Z controlled separately
      // through mouse wheel.

      selectedObject.position.z =
        dragDepth;


      event.preventDefault();

    }


    // -------------------------------------------------------
    // MOUSE WHEEL -> Z AXIS
    // -------------------------------------------------------

    function handleWheel(event) {

      if (
        !isDragging ||
        !selectedObject
      ) {

        return;

      }


      const zStep =
        event.deltaY * 0.002;


      selectedObject.position.z +=
        zStep;


      dragDepth =
        selectedObject.position.z;


      event.preventDefault();

    }


    // -------------------------------------------------------
    // POINTER UP
    // -------------------------------------------------------

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


        console.log(
          "Desktop release:",
          selectedObject.userData.conceptName,
          {
            x: selectedObject.position.x.toFixed(2),
            y: selectedObject.position.y.toFixed(2),
            z: selectedObject.position.z.toFixed(2)
          }
        );

      }


      selectedObject =
        null;


      isDragging =
        false;


      dragOffset.set(
        0,
        0,
        0
      );

    }


    // -------------------------------------------------------
    // EVENTS
    // -------------------------------------------------------

    canvas.style.touchAction = "none";

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


  // =========================================================
  // KEEP LABELS WITH OBJECTS
  // =========================================================

  function updateObjectLabels() {

    recallObjects.forEach(
      (item) => {

        item.labelData.mesh.position.set(
          item.object.position.x,
          item.object.position.y + 0.48,
          item.object.position.z + 0.18
        );

      }
    );

    requestAnimationFrame(
      updateObjectLabels
    );
  }


  updateObjectLabels();


  // =========================================================
  // SCORE
  // =========================================================

  const scoreLabel =
    createLabel(
      "Score: --",
      [
        0,
        2.45,
        -2.15
      ],
      1.5,
      0.3
    );


  // =========================================================
  // FEEDBACK
  // =========================================================

  const feedbackLabel =
    createLabel(
      "Ready for recall?",
      [
        0,
        2.05,
        -2.15
      ],
      2.0,
      0.26
    );


  // =========================================================
  // AI STATUS
  // =========================================================

  const aiStatusLabel =
    createLabel(
      "AI Memory Palace",
      [
        0,
        2.82,
        -2.15
      ],
      2.2,
      0.28
    );


  // =========================================================
  // CHECK RECALL PANEL
  // =========================================================

  const checkPanel =
    new Mesh(
      new BoxGeometry(
        1.7,
        0.45,
        0.08
      ),
      new MeshBasicMaterial({
        color: 0x3159a6
      })
    );


  checkPanel.position.set(
    0,
    0.62,
    -2.3
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
    [
      0,
      0.62,
      -2.24
    ],
    1.45,
    0.25
  );


  // =========================================================
  // START RECALL PANEL
  // =========================================================

  const startPanel =
    new Mesh(
      new BoxGeometry(
        1.7,
        0.45,
        0.08
      ),
      new MeshBasicMaterial({
        color: 0x36a269
      })
    );


  startPanel.position.set(
    0,
    0.08,
    -2.3
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
    [
      0,
      0.08,
      -2.24
    ],
    1.45,
    0.25
  );


  // =========================================================
  // APPLY AI CONCEPTS
  // =========================================================

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
        (concept) =>
          concept.name
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


        // ---------- CONCEPT DATA ----------

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


        // ---------- LABEL ----------

        updateLabel(
          item.labelData,
          concept.name
        );


        // ---------- COLOR ----------

        if (
          item.object.material &&
          item.object.material.color
        ) {

          item.object.material.color.setHex(
            colors[index]
          );

        }


        // ---------- POSITION ----------

        item.object.position.set(
          recallSlots[index],
          1.25,
          -2.1
        );


        console.log(
          "Memory hint:",
          concept.memory_hint
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


    recallStarted =
      false;


    console.log(
      "AI concepts loaded:",
      usableConcepts
    );

  }


  // =========================================================
  // GENERATE AI CONCEPTS
  // =========================================================

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


  // =========================================================
  // BROWSER TOPIC INPUT
  // =========================================================

  const topicPanel =
    document.createElement(
      "div"
    );


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
    "rgba(10, 15, 30, 0.94)";

  topicPanel.style.borderRadius =
    "12px";


  const topicInput =
    document.createElement(
      "input"
    );


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
    document.createElement(
      "button"
    );


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


  // =========================================================
  // SHUFFLE
  // =========================================================

  function shuffleRecallObjects() {

    const shuffledSlots =
      [
        ...recallSlots
      ];


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
          1.25;

        item.object.position.z =
          -2.1;

      }
    );


    console.log(
      "Recall concepts shuffled"
    );

  }


  // =========================================================
  // START RECALL
  // =========================================================

  function startRecall() {

    recallStarted =
      true;


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


  // =========================================================
  // CALCULATE SCORE
  // =========================================================

  function calculateRecallScore() {

    const sortedObjects =
      [
        ...recallObjects
      ].sort(
        (a, b) =>
          a.object.position.x -
          b.object.position.x
      );


    let correct =
      0;


    sortedObjects.forEach(
      (item, index) => {

        if (
          item.correctIndex ===
          index
        ) {

          correct++;

        }

      }
    );


    return Math.round(
      (
        correct /
        correctOrder.length
      ) *
      100
    );

  }


  // =========================================================
  // CHECK RECALL
  // =========================================================

  function checkRecall() {

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


    if (
      score === 100
    ) {

      updateLabel(
        feedbackLabel,
        "Excellent memory!"
      );

    } else if (
      score >= 60
    ) {

      updateLabel(
        feedbackLabel,
        "Good! Review weak concepts."
      );

    } else {

      updateLabel(
        feedbackLabel,
        "Review and try again."
      );

    }


    console.log(
      "Recall score:",
      score
    );

  }


  // =========================================================
  // BUTTON EVENTS
  // =========================================================

  startPanel.addEventListener(
    "click",
    startRecall
  );


  checkPanel.addEventListener(
    "click",
    checkRecall
  );


  // =========================================================
  // GLOBAL TEST FUNCTIONS
  // =========================================================

  window.startRecall =
    startRecall;

  window.checkRecall =
    checkRecall;

  window.generateAIConcepts =
    generateAIConcepts;


  console.log(
    "AI Memory Palace VR ready"
  );

});
