import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  OneHandGrabbable,
  Plane,
  PlaneGeometry,
  PointLight,
  Raycaster,
  RayInteractable,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
  World
} from "@iwsdk/core";





import projectOptions from "virtual:iwsdk-project";
import { createMemoryVisual } from "./memoryVisuals.js";

import {
  checkBackendHealth,
  generateConcepts,
  generateRevision
} from "./api.js";

// =========================================================
// SCENE
// =========================================================

const sceneContainer = document.getElementById("scene-container");

if (!(sceneContainer instanceof HTMLDivElement)) {
  throw new Error("Missing #scene-container");
}

// =========================================================
// WORLD
// =========================================================

World.create(sceneContainer, projectOptions).then((world) => {
  console.log("🏫 AI MEMORY PALACE 3D CLASSROOM STARTED");

  // CAMERA
  world.camera.position.set(4.2, 2.8, 7.8);
  world.camera.lookAt(0, 1.45, -1.6);

  // LIGHTING
  const ambientLight = new AmbientLight(0xffffff, 1.65);
  world.scene.add(ambientLight);

  const mainLight = new DirectionalLight(0xfff3dc, 2.8);
  mainLight.position.set(3, 7, 6);
  mainLight.castShadow = true;
  world.scene.add(mainLight);

  const classroomLight = new PointLight(0xffe8bd, 20, 14);
  classroomLight.position.set(0, 3.1, 0);
  world.scene.add(classroomLight);

  const boardLight = new PointLight(0x8ab4ff, 8, 8);
  boardLight.position.set(0, 2.5, -4.1);
  world.scene.add(boardLight);

  
  // FUTURISTIC AI CLASSROOM GLOW
  const aiGlow = new PointLight(0x168cff, 12, 10);
  aiGlow.position.set(0, 3.2, -3.8);
  world.scene.add(aiGlow);


  // BACKEND
  checkBackendHealth()
    .then((data) => {
      console.log("Backend connected:", data);
    })
    .catch((error) => {
      console.error("Backend connection failed:", error);
    });

  // TOPIC
  let currentTopic = "Photosynthesis";

  // MATERIAL
  function material(color, roughness = 0.75, metalness = 0.05) {
    return new MeshStandardMaterial({
      color,
      roughness,
      metalness
    });
  }

  // BOX
  function createBox(width, height, depth, color, position, options = {}) {
    const mesh = new Mesh(
      new BoxGeometry(width, height, depth),
      material(
        color,
        options.roughness ?? 0.75,
        options.metalness ?? 0.05
      )
    );

    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    world.createTransformEntity(mesh);
    return mesh;
  }

  // CYLINDER
  function createCylinder(radiusTop, radiusBottom, height, color, position) {
    const mesh = new Mesh(
      new CylinderGeometry(radiusTop, radiusBottom, height, 24),
      material(color)
    );

    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    world.createTransformEntity(mesh);
    return mesh;
  }

  // SPHERE
  function createSphere(radius, color, position) {
    const mesh = new Mesh(
      new SphereGeometry(radius, 24, 16),
      material(color)
    );

    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    world.createTransformEntity(mesh);
    return mesh;
  }

  // =======================================================
  // LABEL TEXT DRAWING — UPDATED FONT SIZES
  // =======================================================

  function drawLabelContent(canvas, ctx, text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
    ctx.roundRect(
      5,
      5,
      canvas.width - 10,
      canvas.height - 10,
      18
    );
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const words = String(text).split(/\s+/);
    const lines = [];
    let line = "";

    ctx.font = "bold 76px Arial";

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;

      if (ctx.measureText(testLine).width > 950 && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      lines.push(line);
    }

    if (lines.length > 2) {
      ctx.font = "bold 46px Arial";
    } else if (lines.length === 2) {
      ctx.font = "bold 60px Arial";
    }

    const visibleLines = lines.slice(0, 3);
    const lineHeight = visibleLines.length > 2 ? 46 : 66;

    const startY =
      canvas.height / 2 -
      ((visibleLines.length - 1) * lineHeight) / 2;

    visibleLines.forEach((lineText, index) => {
      ctx.fillText(
        lineText,
        canvas.width / 2,
        startY + index * lineHeight,
        970
      );
    });
  }

  // CREATE LABEL
  function createLabel(text, position, width = 1.4, height = 0.28) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 160;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context unavailable");
    }

    drawLabelContent(canvas, ctx, text);

    const texture = new CanvasTexture(canvas);

    const label = new Mesh(
      new PlaneGeometry(width, height),
      new MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 1
      })
    );

    label.position.set(position[0], position[1], position[2]);
    world.createTransformEntity(label);

    return {
      mesh: label,
      canvas,
      ctx,
      texture
    };
  }

  // UPDATE LABEL
  function updateLabel(data, text) {
    drawLabelContent(data.canvas, data.ctx, text);
    data.texture.needsUpdate = true;
  }

  // =======================================================
  // FLOOR
  // =======================================================

  createBox(10, 0.18, 10, 0x6b513d, [0, -0.09, -0.2], {
    roughness: 0.9
  });

  // FLOOR STRIPS
  for (let z = -5; z <= 5; z += 0.75) {
    createBox(9.7, 0.012, 0.025, 0x9a7654, [0, 0.012, z - 0.2]);
  }

  // BACK WALL
  createBox(10, 4.2, 0.18, 0xe5dccb, [0, 2.1, -5]);

  // LEFT WALL
  createBox(0.18, 4.2, 10, 0xd8cfbf, [-5, 2.1, -0.2]);

  // RIGHT WALL
  createBox(0.18, 4.2, 10, 0xd8cfbf, [5, 2.1, -0.2]);

  // CEILING
  createBox(10, 0.15, 10, 0xf1eee7, [0, 4.2, -0.2]);

  // CEILING BEAMS
  [-3, 0, 3].forEach((x) => {
    createBox(0.16, 0.16, 9.5, 0x7b624d, [x, 4.08, -0.2]);
  });

  // WINDOWS
  function createWindow(x, z) {
    createBox(1.5, 1.25, 0.06, 0x86b8d8, [x, 2.35, z], {
      roughness: 0.2,
      metalness: 0.1
    });

    createBox(1.65, 0.10, 0.10, 0x654936, [x, 3.02, z - 0.06]);
    createBox(1.65, 0.10, 0.10, 0x654936, [x, 1.68, z - 0.06]);
    createBox(0.10, 1.45, 0.10, 0x654936, [x - 0.78, 2.35, z - 0.06]);
    createBox(0.10, 1.45, 0.10, 0x654936, [x + 0.78, 2.35, z - 0.06]);
    createBox(0.07, 1.25, 0.10, 0x654936, [x, 2.35, z - 0.08]);
    createBox(1.5, 0.07, 0.10, 0x654936, [x, 2.35, z - 0.08]);
  }

  createWindow(-3.35, -4.88);
  createWindow(3.35, -4.88);

  // DOOR
  createBox(1.15, 2.55, 0.16, 0x5b3d2d, [4.15, 1.28, -4.86]);
  createBox(0.82, 0.72, 0.03, 0x744d38, [4.15, 1.78, -4.96]);
  createBox(0.82, 0.72, 0.03, 0x744d38, [4.15, 0.78, -4.96]);
  createSphere(0.07, 0xd8b35c, [3.72, 1.28, -5.05]);

  // =======================================================
  // BLACKBOARD
  // =======================================================

  createBox(5.8, 1.75, 0.12, 0x183f32, [0, 2.55, -4.72]);
  createBox(6.05, 0.12, 0.18, 0x704c2f, [0, 3.48, -4.82]);
  createBox(6.05, 0.12, 0.18, 0x704c2f, [0, 1.62, -4.82]);
  createBox(0.12, 1.98, 0.18, 0x704c2f, [-3.0, 2.55, -4.82]);
  createBox(0.12, 1.98, 0.18, 0x704c2f, [3.0, 2.55, -4.82]);
  createBox(5.5, 0.10, 0.25, 0x62452f, [0, 1.52, -4.91]);

  
  // FUTURISTIC NEON BOARD FRAME
  createBox(6.12, 0.045, 0.045, 0x168cff, [0, 3.53, -4.68]);
  createBox(6.12, 0.045, 0.045, 0x168cff, [0, 1.57, -4.68]);

  createBox(0.045, 1.98, 0.045, 0x168cff, [-3.06, 2.55, -4.68]);
  createBox(0.045, 1.98, 0.045, 0x168cff, [3.06, 2.55, -4.68]);


  // =======================================================
  // BOARD LABELS — THIRD TEXT ENLARGED
  // =======================================================

  const boardTitle = createLabel(
    "AI LEARNING BOARD",
    [0, 3.15, -4.60],
    3.6,
    0.34
  );

  const resultText = createLabel(
    "Photosynthesis",
    [0, 2.65, -4.60],
    4.4,
    0.40
  );

  const boardHint = createLabel(
    "AI is ready to teach",
    [0, 2.15, -4.60],
    4.8,
    0.45
  );

  // =======================================================
  // TEACHER DESK
  // =======================================================

  createBox(2.15, 0.20, 0.95, 0x714d31, [0, 0.98, -3.45]);

  [
    [-0.82, -3.80],
    [0.82, -3.80],
    [-0.82, -3.10],
    [0.82, -3.10]
  ].forEach(([x, z]) => {
    createBox(0.12, 0.95, 0.12, 0x503522, [x, 0.48, z]);
  });

  // TEACHER CHAIR
  createBox(0.85, 0.12, 0.80, 0x3e5d72, [0, 0.72, -2.55]);
  createBox(0.85, 0.95, 0.12, 0x3e5d72, [0, 1.18, -2.92]);

  createLabel("TEACHER", [0, 1.22, -3.92], 1.1, 0.25);

  
  // FUTURISTIC AI ENERGY ORBS
  const aiOrbLeft = createSphere(0.16, 0x168cff, [-1.35, 1.45, -3.45]);
  const aiOrbRight = createSphere(0.16, 0x168cff, [1.35, 1.45, -3.45]);

  aiOrbLeft.material.emissive.set(0x0755cc);
  aiOrbLeft.material.emissiveIntensity = 1.5;

  aiOrbRight.material.emissive.set(0x0755cc);
  aiOrbRight.material.emissiveIntensity = 1.5;

  
  // AI HOLOGRAM RINGS
  const aiRingLeft = new Mesh(
    new TorusGeometry(0.24, 0.025, 8, 48),
    new MeshStandardMaterial({
      color: 0x168cff,
      emissive: 0x0755cc,
      emissiveIntensity: 2
    })
  );

  aiRingLeft.position.set(-1.35, 1.45, -3.45);
  aiRingLeft.rotation.x = Math.PI / 2;
  world.createTransformEntity(aiRingLeft);

  const aiRingRight = new Mesh(
    new TorusGeometry(0.24, 0.025, 8, 48),
    new MeshStandardMaterial({
      color: 0x168cff,
      emissive: 0x0755cc,
      emissiveIntensity: 2
    })
  );

  aiRingRight.position.set(1.35, 1.45, -3.45);
  aiRingRight.rotation.x = Math.PI / 2;
  world.createTransformEntity(aiRingRight);



  // =======================================================
  // STUDENT DESKS
  // =======================================================

  function createStudentDesk(x, z) {
    createBox(1.65, 0.15, 0.82, 0x9a6842, [x, 1.18, z]);
    createBox(1.70, 0.08, 0.08, 0x70482f, [x, 1.08, z - 0.40]);

    [
      [-0.62, -0.28],
      [0.62, -0.28],
      [-0.62, 0.28],
      [0.62, 0.28]
    ].forEach(([dx, dz]) => {
      createBox(0.10, 1.05, 0.10, 0x67452e, [x + dx, 0.55, z + dz]);
    });

    createBox(0.78, 0.12, 0.70, 0x4f6980, [x, 0.72, z + 0.95]);

    [
      [-0.27, 0.78],
      [0.27, 0.78]
    ].forEach(([dx, dz]) => {
      createBox(0.07, 0.70, 0.07, 0x34495a, [x + dx, 0.38, z + dz]);
    });

    createBox(0.78, 0.78, 0.12, 0x4f6980, [x, 1.08, z + 1.30]);
    createBox(0.48, 0.055, 0.30, 0xe7c45b, [x - 0.28, 1.285, z]);
    createBox(0.32, 0.045, 0.24, 0x5d8dcc, [x + 0.20, 1.34, z]);
    createCylinder(0.025, 0.025, 0.45, 0xe6a04c, [x + 0.48, 1.27, z]);
  }

  createStudentDesk(-1.8, -1.5);
  createStudentDesk(1.8, -1.5);
  createStudentDesk(-1.8, 0.25);
  createStudentDesk(1.8, 0.25);
  createStudentDesk(-1.8, 2.05);
  createStudentDesk(1.8, 2.05);

  // =======================================================
  // BOOKSHELF
  // =======================================================

  createBox(1.35, 2.65, 0.45, 0x684631, [-4.25, 1.45, 1.65]);

  [0.65, 1.35, 2.05].forEach((y) => {
    createBox(1.15, 0.08, 0.55, 0x8a6040, [-4.25, y, 1.35]);
  });

  const bookColors = [
    0xd95c5c,
    0x4d7bc4,
    0x58a66d,
    0xd9a441,
    0x9b65bd
  ];

  for (let shelf = 0; shelf < 3; shelf++) {
    for (let book = 0; book < 5; book++) {
      createBox(
        0.15,
        0.48 + (book % 2) * 0.08,
        0.30,
        bookColors[(book + shelf) % bookColors.length],
        [-4.72 + book * 0.22, 0.92 + shelf * 0.70, 1.05]
      );
    }
  }

  createLabel("LIBRARY", [-4.25, 2.95, 1.05], 1.2, 0.25);

  // =======================================================
  // PLANTS
  // =======================================================

  function createPlant(x, z) {
    createCylinder(0.25, 0.32, 0.42, 0xb75e43, [x, 0.22, z]);
    createCylinder(0.035, 0.035, 0.85, 0x4d8b50, [x, 0.82, z]);

    [
      [-0.18, 1.05, 0],
      [0.18, 1.15, 0],
      [0, 1.30, 0.08],
      [0, 0.98, 0.18]
    ].forEach(([dx, y, dz]) => {
      createSphere(0.17, 0x4d9b5b, [x + dx, y, z + dz]);
    });

    const petalColor = 0xff6fae;

    [
      [-0.16, 1.52, 0],
      [0.16, 1.52, 0],
      [0, 1.68, 0],
      [0, 1.36, 0],
      [0, 1.52, 0.16]
    ].forEach(([dx, y, dz]) => {
      createSphere(0.14, petalColor, [x + dx, y, z + dz]);
    });

    createSphere(0.11, 0xffd447, [x, 1.52, z]);
  }

  createPlant(-3.5, -2.5);
  createPlant(3.5, -2.5);

  // WALL DECORATION
  createBox(1.45, 0.9, 0.06, 0xd5c29c, [-4.0, 3.35, -4.65]);
  createLabel("LEARN", [-4.0, 3.35, -4.60], 1.15, 0.25);

  createBox(1.45, 0.9, 0.06, 0xb9cbe0, [4.0, 3.35, -4.65]);
  createLabel("EXPLORE", [4.0, 3.35, -4.60], 1.25, 0.25);

  // CEILING LAMPS
  [-2.5, 0, 2.5].forEach((x) => {
    createCylinder(0.18, 0.18, 0.12, 0xd6b85a, [x, 3.95, -0.2]);

    const lamp = new PointLight(0xffdca0, 5, 5);
    lamp.position.set(x, 3.7, -0.2);
    world.scene.add(lamp);
  });

  // =======================================================
  // MEMORY CARPET
  // =======================================================

  const memoryCenterX = 0;
  const memoryCenterZ = 3.55;

  createCylinder(1.45, 1.45, 0.06, 0x283d63, [memoryCenterX, 0.04, memoryCenterZ]);
  createCylinder(1.15, 1.15, 0.065, 0x344f7d, [memoryCenterX, 0.075, memoryCenterZ]);

  createLabel("MEMORY ZONE", [memoryCenterX, 0.28, memoryCenterZ], 1.5, 0.25);

  // =======================================================
  // MEMORY OBJECTS
  // =======================================================

  const recallObjects = [];
  let correctOrder = [];

  
  // AI TEACHING HIGHLIGHT
  let highlightedMemoryObject = null;

  function highlightMemoryObject(targetObject) {
    // Previous object ka highlight remove karo
    if (highlightedMemoryObject) {
      highlightedMemoryObject.traverse((part) => {
        if (part.material && "emissive" in part.material) {
          part.material.emissive.set(0x000000);
          part.material.emissiveIntensity = 0;
        }
      });
    }

    highlightedMemoryObject = targetObject;

    if (!targetObject) return;

    // Current concept ko glow karo
    targetObject.traverse((part) => {
      if (part.material && "emissive" in part.material) {
        part.material.emissive.set(0x168cff);
        part.material.emissiveIntensity = 1.8;
      }
    });
  }


  const recallSlots = [-1.15, -0.575, 0, 0.575, 1.15];
  let recallStarted = false;

  function createRecallObject(color, position, label, correctIndex, memoryHint = "") {
    const object = createMemoryVisual(label, color, memoryHint);

    object.position.set(position[0], position[1], position[2]);
    object.castShadow = true;

    const entity = world.createTransformEntity(object);
    entity.addComponent(RayInteractable);

    entity.addComponent(OneHandGrabbable, {
      translate: true,
      rotate: false
    });

    const originalScale = object.scale.clone();

    object.addEventListener("pointerenter", () => {
      object.scale.set(
        originalScale.x * 1.18,
        originalScale.y * 1.18,
        originalScale.z * 1.18
      );
    });

    object.addEventListener("pointerleave", () => {
      object.scale.copy(originalScale);
    });

    // CLICK MEMORY OBJECT TO LEARN

    // CLICK MEMORY OBJECT TO LEARN
    object.addEventListener("click", () => {
      showConceptVisual(object);
    });

    
    recallObjects.push({
      object,
      label,
      correctIndex,
      memoryHint,
      labelData: createLabel(
        label,
        [position[0], position[1] + 0.62, position[2]],
        1.3,
        0.24
      )
    });
  }


    
  
    

  

  // INITIAL CONCEPTS
  const initialConcepts = [
    { name: "Light Energy", color: 0xffd447 },
    { name: "Water", color: 0x4fa3ff },
    { name: "Photosynthesis", color: 0x4fc36a },
    { name: "Glucose", color: 0xffa84d },
    { name: "Oxygen", color: 0xa86cff }
  ];

  correctOrder = initialConcepts.map((concept) => concept.name);

  initialConcepts.forEach((concept, index) => {
    createRecallObject(
      concept.color,
      [memoryCenterX + recallSlots[index], 0.72, memoryCenterZ],
      concept.name,
      index
    );
  });

  // =======================================================
  // DESKTOP / TABLET FREE DRAG
  // =======================================================

  function setupDesktop3DDrag() {
    const canvas = sceneContainer.querySelector("canvas");

    if (!(canvas instanceof HTMLCanvasElement)) {
      console.warn("Desktop drag: canvas not found");
      return;
    }

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const dragPlane = new Plane();
    const intersection = new Vector3();
    const dragOffset = new Vector3();

    let selectedObject = null;
    let isDragging = false;
    let dragDepth = 0;

    let pointerDownX = 0;
    let pointerDownY = 0;

    function updatePointer(event) {
      const rect = canvas.getBoundingClientRect();

      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function findMemoryObject(event) {
      updatePointer(event);
      raycaster.setFromCamera(pointer, world.camera);

      const meshes = recallObjects.map((item) => item.object);
      const intersections = raycaster.intersectObjects(meshes, true);

      if (intersections.length === 0) {
        return null;
      }

      let hit = intersections[0].object;

      while (hit && !meshes.includes(hit)) {
        hit = hit.parent;
      }

      return hit || null;
    }

    function handlePointerDown(event) {
      if (event.button !== 0 && event.pointerType !== "touch") {
        return;
      }

      const object = findMemoryObject(event);

      if (!object) {
        return;
      }

      selectedObject = object;
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      isDragging = true;

      if (canvas.setPointerCapture) {
        canvas.setPointerCapture(event.pointerId);
      }

      const cameraDirection = new Vector3();
      world.camera.getWorldDirection(cameraDirection);

      dragPlane.setFromNormalAndCoplanarPoint(cameraDirection, object.position);
      raycaster.setFromCamera(pointer, world.camera);

      if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        dragOffset.subVectors(object.position, intersection);
      }

      dragDepth = object.position.z;
      object.userData.desktopDragging = true;

      event.preventDefault();
    }

    function handlePointerMove(event) {
      if (!isDragging || !selectedObject) {
        return;
      }

      updatePointer(event);
      raycaster.setFromCamera(pointer, world.camera);

      if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
        selectedObject.position.x = intersection.x + dragOffset.x;
        selectedObject.position.y = intersection.y + dragOffset.y;
      }

      selectedObject.position.z = dragDepth;
      event.preventDefault();
    }

    function handleWheel(event) {
      if (!isDragging || !selectedObject) {
        return;
      }

      selectedObject.position.z += event.deltaY * 0.002;
      dragDepth = selectedObject.position.z;
      event.preventDefault();
    }

    function handlePointerUp(event) {
      if (!isDragging) {
        return;
      }

      if (
        canvas.hasPointerCapture &&
        canvas.hasPointerCapture(event.pointerId)
      ) {
        canvas.releasePointerCapture(event.pointerId);
      }

      
if (selectedObject) {
  selectedObject.userData.desktopDragging = false;

  const deltaX = event.clientX - pointerDownX;
  const deltaY = event.clientY - pointerDownY;

  const movedDistance = Math.sqrt(
    deltaX * deltaX + deltaY * deltaY
  );

  if (movedDistance < 8) {
    showConceptVisual(selectedObject);
  }
}
  
  


selectedObject = null;
isDragging = false;
dragOffset.set(0, 0, 0);

      
    }
        
      

      
      
      
    

    canvas.style.touchAction = "none";

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    canvas.addEventListener("wheel", handleWheel, { passive: false });

    console.log("✅ Desktop / Tablet 3D Drag Adapter ready");
  }

  setupDesktop3DDrag();

  // =======================================================
  // STATUS
  // =======================================================

  const aiStatusLabel = createLabel(
    "AI CLASSROOM READY",
    [-2.8, 0.30, -3.95],
    2.2,
    0.25
  );

  const scoreLabel = createLabel(
    "Score: --",
    [0, 0.30, -3.95],
    1.2,
    0.25
  );

  const feedbackLabel = createLabel(
    "Ready for recall",
    [2.3, 0.30, -3.95],
    2.0,
    0.25
  );

  
  // =======================================================
  // FLOATING CONCEPT VISUAL PANEL
  // =======================================================

  const visualPanel = document.createElement("div");

  visualPanel.style.cssText = `
    position: fixed;
    right: 18px;
    top: 80px;
    width: 290px;
    padding: 18px;
    box-sizing: border-box;
    z-index: 10000;
    display: none;
    color: white;
    background: linear-gradient(145deg, #172554, #312e81, #164e63);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 18px;
    box-shadow: 0 12px 35px rgba(0,0,0,0.4);
    font-family: Arial, sans-serif;
  `;

  const visualClose = document.createElement("button");
  visualClose.textContent = "✕";
  visualClose.style.cssText =
    "float:right;padding:5px 9px;cursor:pointer;border:0;border-radius:6px;";

  visualClose.addEventListener("click", () => {
    visualPanel.style.display = "none";
  });

  const visualTitle = document.createElement("h2");
  visualTitle.style.cssText = "font-size:21px;margin:8px 0 14px;";

  const visualArt = document.createElement("div");
  visualArt.style.cssText = `
    min-height:120px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:64px;
    background:rgba(255,255,255,0.10);
    border-radius:14px;
    margin-bottom:14px;
  `;

  const visualExplanation = document.createElement("p");
  visualExplanation.style.cssText =
    "font-size:15px;line-height:1.5;margin:0;";

  visualPanel.append(
    visualClose,
    visualTitle,
    visualArt,
    visualExplanation
  );

  document.body.appendChild(visualPanel);

  function showConceptVisual(object) {
    const name = object.userData.conceptName || "Learning Concept";
    const hint = object.userData.memoryHint || "";
    const description =
      object.userData.description ||
      object.userData.revisionExplanation ||
      hint ||
      `Explore ${name} and its role in ${currentTopic}.`;

    const text = `${name} ${hint}`.toLowerCase();

    let symbol = "🧠";

    if (/photosynthesis|plant|leaf|flower/.test(text)) {
      symbol = "🌱";
    } else if (/light|sun|solar|energy/.test(text)) {
      symbol = "☀️";
    } else if (/water|rain|ocean|river/.test(text)) {
      symbol = "💧";
    } else if (/glucose|sugar|food/.test(text)) {
      symbol = "🍬";
    } else if (/oxygen|air|gas|breath/.test(text)) {
      symbol = "🫧";
    } else if (/heart|blood|circulation/.test(text)) {
      symbol = "❤️";
    } else if (/atom|molecule|chemistry/.test(text)) {
      symbol = "⚛️";
    } else if (/earth|planet|geography/.test(text)) {
      symbol = "🌍";
    } else if (/math|number|equation/.test(text)) {
      symbol = "🔢";
    }

    visualTitle.textContent = name;
    visualArt.textContent = symbol;
    visualExplanation.textContent = description;
    visualPanel.style.display = "block";

    updateLabel(boardTitle, "LEARN A CONCEPT");
    updateLabel(resultText, name);
    updateLabel(boardHint, description);
    updateLabel(feedbackLabel, `Selected: ${name}`);
  }


  const revisionLabel = createLabel(
    "AI Revision: Waiting",
    [0, 0.45, 3.55],
    2.7,
    0.25
  );

  // =======================================================
  // START / CHECK BUTTONS
  // =======================================================

  function createButton(text, x, color) {
    const button = createBox(
      1.65,
      0.38,
      0.18,
      color,
      [x, 0.45, 1.0],
      { roughness: 0.55 }
    );

    const entity = world.createTransformEntity(button);
    entity.addComponent(RayInteractable);

    createLabel(text, [x, 0.45, 0.88], 1.45, 0.22);

    return button;
  }

  const startPanel = createButton("START RECALL", -1.0, 0x2f8f62);
  const checkPanel = createButton("CHECK RECALL", 1.0, 0x3867b7);

  // LABEL FOLLOW SYSTEM
  function updateObjectLabels() {
    recallObjects.forEach((item) => {
      item.labelData.mesh.position.set(
        item.object.position.x,
        item.object.position.y + 0.62,
        item.object.position.z
      );
    });

    requestAnimationFrame(updateObjectLabels);
  }

  updateObjectLabels();

  
  // AI HOLOGRAM RING ANIMATION
  

function animateAIRings() {
  aiRingLeft.rotation.y += 0.04;
  aiRingRight.rotation.y -= 0.04;

  aiRingLeft.scale.setScalar(
    1 + 0.25 * Math.sin(Date.now() * 0.005)
  );

  requestAnimationFrame(animateAIRings);
}

animateAIRings();


  // AI ENERGY ORB FLOATING ANIMATION
  const orbLeftBaseY = aiOrbLeft.position.y;
  const orbRightBaseY = aiOrbRight.position.y;

  function animateAIOrbs() {
    const time = Date.now() * 0.002;

    aiOrbLeft.position.y =
      orbLeftBaseY + Math.sin(time) * 0.12;

    aiOrbRight.position.y =
      orbRightBaseY + Math.sin(time + Math.PI) * 0.12;

    requestAnimationFrame(animateAIOrbs);
  }

  animateAIOrbs();


  
  // AI ENERGY WAVES
  function createEnergyWave(x, z) {
    const wave = new Mesh(
      new TorusGeometry(0.20, 0.012, 8, 48),
      new MeshStandardMaterial({
        color: 0x168cff,
        emissive: 0x0755cc,
        emissiveIntensity: 2,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
      })
    );

    wave.position.set(x, 1.45, z);
    wave.rotation.x = Math.PI / 2;

    world.createTransformEntity(wave);

    return wave;
  }

  const waveLeft1 = createEnergyWave(-1.35, -3.45);
  const waveLeft2 = createEnergyWave(-1.35, -3.45);
  const waveRight1 = createEnergyWave(1.35, -3.45);
  const waveRight2 = createEnergyWave(1.35, -3.45);

  const energyWaves = [
    waveLeft1,
    waveLeft2,
    waveRight1,
    waveRight2
  ];

  function animateAIEnergyWaves() {
    const time = Date.now() * 0.001;

    energyWaves.forEach((wave, index) => {
      const cycle =
        (time * 0.7 + (index % 2) * 0.5) % 1;

      const scale = 0.7 + cycle * 1.5;

      wave.scale.setScalar(scale);
      wave.material.opacity = 0.8 * (1 - cycle);
    });

    requestAnimationFrame(animateAIEnergyWaves);
  }

  animateAIEnergyWaves();



  
  // =======================================================
  // 3D HOLOGRAPHIC AI TEACHER
  // =======================================================

  const hologramTeacher = [];

  // HEAD
  const teacherHead = createSphere(
    0.23,
    0x168cff,
    [0, 2.05, -3.65]
  );

  // HOLOGRAPHIC BODY
  const teacherBody = createCylinder(
    0.13,
    0.23,
    0.48,
    0x168cff,
    [0, 1.65, -3.65]
  );

  // SHOULDERS
  const teacherShoulderLeft = createSphere(
    0.13,
    0x168cff,
    [-0.22, 1.78, -3.65]
  );

  const teacherShoulderRight = createSphere(
    0.13,
    0x168cff,
    [0.22, 1.78, -3.65]
  );

  
  // AI TEACHER - SAFE 3D POINTING ARM

  const teacherPointingArm = createCylinder(
    0.055,
    0.075,
    0.42,
    0x168cff,
    [0.38, 1.92, -3.62]
  );

  teacherPointingArm.rotation.z = -0.65;
  teacherPointingArm.material.emissive.set(0x0755cc);
  teacherPointingArm.material.emissiveIntensity = 1.5;

  const teacherPointingHand = createSphere(
    0.085,
    0x168cff,
    [0.51, 2.10, -3.62]
  );

  teacherPointingHand.material.emissive.set(0x0755cc);
  teacherPointingHand.material.emissiveIntensity = 1.5;

  const teacherPointingFinger = createCylinder(
    0.022,
    0.022,
    0.16,
    0x65e8ff,
    [0.62, 2.15, -3.62]
  );

  teacherPointingFinger.rotation.z = -Math.PI / 2;
  
  
  
  // AI TEACHER - DIRECTIONAL POINTING ANIMATION

  const teacherShoulderAnchor = new Vector3(
    0.22, 1.78, -3.65
  );

  const teacherBoardTarget = new Vector3(
    0, 2.55, -4.7
  );

  let teacherPointTarget = null;

  const teacherPointDirection = new Vector3();
  const teacherPointUp = new Vector3(0, 1, 0);

  
function animateTeacherPointingHand() {
  const targetPosition = teacherPointTarget
    ? teacherPointTarget.position
    : teacherBoardTarget;

  teacherPointDirection
    .subVectors(targetPosition, teacherShoulderAnchor)
    .normalize();

  const armLength = 0.42;
  const handLength = 0.52;

  teacherPointingArm.position
    .copy(teacherShoulderAnchor)
    .addScaledVector(teacherPointDirection, armLength / 2);

  teacherPointingHand.position
    .copy(teacherShoulderAnchor)
    .addScaledVector(teacherPointDirection, handLength);

  teacherPointingFinger.position
    .copy(teacherPointingHand.position)
    .addScaledVector(teacherPointDirection, 0.10);

  teacherPointingArm.quaternion.setFromUnitVectors(
    teacherPointUp,
    teacherPointDirection
  );

  teacherPointingFinger.quaternion.setFromUnitVectors(
    teacherPointUp,
    teacherPointDirection
  );

  requestAnimationFrame(animateTeacherPointingHand);
}

animateTeacherPointingHand();

    
      
      

    




  

  
  

  
  
  

  teacherPointingFinger.material.emissive.set(0x168cff);
  teacherPointingFinger.material.emissiveIntensity = 2;


  // GLOWING EYES
  const teacherEyeLeft = createSphere(
    0.035,
    0x9be7ff,
    [-0.08, 2.08, -3.44]
  );

  const teacherEyeRight = createSphere(
    0.035,
    0x9be7ff,
    [0.08, 2.08, -3.44]
  );

  // ANTENNA
  const teacherAntenna = createCylinder(
    0.018,
    0.018,
    0.16,
    0x168cff,
    [0, 2.32, -3.65]
  );

  const teacherAntennaLight = createSphere(
    0.055,
    0x65e8ff,
    [0, 2.42, -3.65]
  );

  // HOLOGRAM HALO
  const teacherHalo = new Mesh(
    new TorusGeometry(0.31, 0.018, 8, 48),
    new MeshStandardMaterial({
      color: 0x168cff,
      emissive: 0x0755cc,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9
    })
  );

  teacherHalo.position.set(0, 2.05, -3.65);
  teacherHalo.rotation.x = Math.PI / 2;
  world.createTransformEntity(teacherHalo);

  // APPLY HOLOGRAM GLOW
  hologramTeacher.push(
    teacherHead,
    teacherBody,
    teacherShoulderLeft,
    teacherShoulderRight,
    teacherEyeLeft,
    teacherEyeRight,
    teacherAntenna,
    teacherAntennaLight,
    teacherHalo
  );

  hologramTeacher.forEach((part) => {
    if (part.material) {
      part.material.emissive.set(0x0755cc);
      part.material.emissiveIntensity = 1.5;
      part.material.transparent = true;
      part.material.opacity = 0.88;
    }
  });

  // SAVE ORIGINAL HEIGHTS
  const teacherBaseHeights = hologramTeacher.map(
    (part) => part.position.y
  );

  // FLOATING + ROTATING HOLOGRAM
  function animateHolographicTeacher() {
    const time = Date.now() * 0.001;

    hologramTeacher.forEach((part, index) => {
      part.position.y =
        teacherBaseHeights[index] +
        Math.sin(time * 1.5) * 0.06;
    });

    teacherHalo.rotation.z += 0.012;

    requestAnimationFrame(animateHolographicTeacher);
  }

  animateHolographicTeacher();

  
 



  
 // AI TEACHER SPEAKING ANIMATION
const teacherMouth = createBox(
  0.09,
  0.025,
  0.025,
  0x65e8ff,
  [0, 1.98, -3.42]
);

teacherMouth.material.emissive.set(0x168cff);
teacherMouth.material.emissiveIntensity = 2;

let teacherIsSpeaking = false;

function animateTeacherSpeaking() {
  const time = Date.now() * 0.001;

  teacherMouth.scale.y = teacherIsSpeaking
    ? 1 + Math.abs(Math.sin(time * 12)) * 5
    : 1;

  requestAnimationFrame(animateTeacherSpeaking);
}

animateTeacherSpeaking();


  console.log("AI HOLOGRAPHIC TEACHER READY");
  
  // HOLOGRAPHIC TEACHER STATUS
  const teacherStatusLabel = createLabel(
    "AI TEACHER READY",
    [0, 2.75, -3.65],
    2.0,
    0.28
  );

  
 // AI TEACHER VOICE
function speakTeacherLesson(text) {
  if (!("speechSynthesis" in window)) {
    console.error("Speech synthesis is not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.rate = 0.9;
  speech.pitch = 1.1;
  speech.volume = 1;

  
    
  

  
speech.onstart = () => {
  teacherIsSpeaking = true;
  updateLabel(teacherStatusLabel, "AI TEACHER SPEAKING");
};

speech.onend = () => {
  teacherIsSpeaking = false;
  updateLabel(teacherStatusLabel, "AI LESSON COMPLETE");
};

speech.onerror = () => {
  teacherIsSpeaking = false;
  updateLabel(teacherStatusLabel, "VOICE INTERRUPTED");
};

    
  

  

  window.speechSynthesis.speak(speech);
}

function stopTeacherVoice() {
  window.speechSynthesis.cancel();
  teacherIsSpeaking = false;
}




const voiceTestButton = document.createElement("button");

voiceTestButton.textContent = "🔊 TEST AI TEACHER VOICE";

voiceTestButton.style.position = "fixed";
voiceTestButton.style.bottom = "20px";
voiceTestButton.style.left = "50%";
voiceTestButton.style.transform = "translateX(-50%)";
voiceTestButton.style.zIndex = "99999";
voiceTestButton.style.padding = "14px 18px";
voiceTestButton.style.background = "#168cff";
voiceTestButton.style.color = "white";
voiceTestButton.style.border = "none";
voiceTestButton.style.borderRadius = "10px";

document.body.appendChild(voiceTestButton);

voiceTestButton.addEventListener("click", () => {
  speakTeacherLesson(
    "Hello students! Welcome to our AI Memory Palace."
  );
});

  
  

  



  

  
  
  

  
  

  




    
    

    
  

  


  // =======================================================
  // AI CONCEPTS
  // =======================================================

  function applyAIConcepts(concepts) {
    if (!Array.isArray(concepts) || concepts.length === 0) {
      updateLabel(aiStatusLabel, "AI returned no concepts");
      return;
    }

    const usable = concepts.slice(0, 5);

    correctOrder = usable.map((concept) => concept.name);

    usable.forEach((concept, index) => {
      const item = recallObjects[index];

      if (!item) {
        return;
      }

      item.label = concept.name;
      item.correctIndex = index;
      item.memoryHint = concept.memory_hint || "";

      item.object.userData.memoryHint = concept.memory_hint || "";
      item.object.userData.description = concept.description || "";
      item.object.userData.conceptName = concept.name;

      updateLabel(item.labelData, concept.name);

      item.object.position.set(
        memoryCenterX + recallSlots[index],
        0.72,
        memoryCenterZ
      );
    });

    updateLabel(resultText, `${currentTopic}: AI Concepts Ready`);

    updateLabel(
      boardHint,
      "Arrange the memory objects and recall the concept sequence."
    );

    updateLabel(aiStatusLabel, "AI CLASSROOM READY");
    updateLabel(feedbackLabel, "AI concepts loaded");

    recallStarted = false;
  }

  // GENERATE AI
  async function generateAIConcepts(topic) {
    const cleanTopic = topic.trim();

    if (!cleanTopic) {
      updateLabel(feedbackLabel, "Enter a topic");
      return;
    }

    currentTopic = cleanTopic;

    updateLabel(boardTitle, "AI IS THINKING...");
    updateLabel(teacherStatusLabel, "AI IS THINKING...");
    teacherIsSpeaking = false;
    updateLabel(resultText, `Learning: ${cleanTopic}`);
    updateLabel(boardHint, "Generating visual memory concepts...");

    try {
      const result = await generateConcepts(cleanTopic);

      applyAIConcepts(result.concepts)
      
const lessonText = result.concepts
  .map((concept) => {
    return `${concept.name}. ${concept.description || ""}`;
  })
  .join(". ");

let conceptIndex = 0;

function pointToNextConcept() {
  if (conceptIndex >= result.concepts.length) {
    teacherPointTarget = null;
    return;
  }

  const concept = result.concepts[conceptIndex];

  const matchingObject = recallObjects.find(
    (item) =>
      item.label.toLowerCase() ===
      concept.name.toLowerCase()
  );

  if (matchingObject) {
  teacherPointTarget = matchingObject.object;

  // Highlight the concept being taught
  highlightMemoryObject(matchingObject.object);

  updateLabel(
    teacherStatusLabel,
    `TEACHING: ${concept.name}`
  );
  }
    
    
    
  

  conceptIndex++;

  setTimeout(pointToNextConcept, 3500);
}

pointToNextConcept();
speakTeacherLesson(lessonText);

     
      
  
  
      
      

      console.log("AI concepts:", result);
    } catch (error) {
      console.error(error);
      teacherIsSpeaking = false;

      updateLabel(boardTitle, "AI CONNECTION ERROR");
      updateLabel(teacherStatusLabel, "AI CONNECTION ERROR");
      updateLabel(boardHint, "Please generate again.");
    }
  }

  // BROWSER AI CONTROL
  const topicPanel = document.createElement("div");

  topicPanel.style.position = "fixed";
  topicPanel.style.top = "18px";
  topicPanel.style.left = "50%";
  topicPanel.style.transform = "translateX(-50%)";
  topicPanel.style.zIndex = "9999";
  topicPanel.style.display = "flex";
  topicPanel.style.gap = "8px";
  topicPanel.style.padding = "9px";
  topicPanel.style.background = "rgba(20,25,35,0.90)";
  topicPanel.style.borderRadius = "10px";

  const topicInput = document.createElement("input");
  topicInput.value = "Photosynthesis";
  topicInput.placeholder = "Learning topic";
  topicInput.style.width = "230px";
  topicInput.style.padding = "9px";
  topicInput.style.borderRadius = "7px";
  topicInput.style.border = "1px solid #888";
  topicInput.style.background = "#18202b";
  topicInput.style.color = "white";

  const generateButton = document.createElement("button");
  generateButton.textContent = "GENERATE AI";
  generateButton.style.padding = "9px 13px";
  generateButton.style.border = "none";
  generateButton.style.borderRadius = "7px";
  generateButton.style.cursor = "pointer";

  generateButton.addEventListener("click", () => {
    generateAIConcepts(topicInput.value);
  });

  topicInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      generateAIConcepts(topicInput.value);
    }
  });

  topicPanel.appendChild(topicInput);
  topicPanel.appendChild(generateButton);
  document.body.appendChild(topicPanel);

  // SHUFFLE
  function shuffleRecallObjects() {
    const shuffled = [...recallSlots];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    recallObjects.forEach((item, index) => {
      item.object.position.set(
        memoryCenterX + shuffled[index],
        0.72,
        memoryCenterZ
      );
    });
  }

  // START RECALL
  function startRecall() {
    recallStarted = true;

    shuffleRecallObjects();

    updateLabel(boardTitle, "RECALL CHALLENGE");
    updateLabel(resultText, currentTopic);

    updateLabel(
      boardHint,
      "Arrange the 3D memory objects in the correct order."
    );

    updateLabel(scoreLabel, "Score: --");
    updateLabel(feedbackLabel, "Recall started");
  }

  // SCORE
  function calculateRecallScore() {
    const sorted = [...recallObjects].sort(
      (a, b) => a.object.position.x - b.object.position.x
    );

    let correct = 0;

    sorted.forEach((item, index) => {
      if (item.correctIndex === index) {
        correct++;
      }
    });

    return Math.round((correct / correctOrder.length) * 100);
  }

  // WEAK CONCEPTS
  function getWeakConcepts() {
    const sorted = [...recallObjects].sort(
      (a, b) => a.object.position.x - b.object.position.x
    );

    const weak = [];

    sorted.forEach((item, index) => {
      if (item.correctIndex !== index) {
        weak.push(item.label);
      }
    });

    return [...new Set(weak)];
  }

  // ADAPTIVE REVISION
  async function generateAdaptiveRevision(weakConcepts) {
    if (!weakConcepts || weakConcepts.length === 0) {
      return;
    }

    updateLabel(boardTitle, "AI REVISION");
    updateLabel(revisionLabel, `Weak: ${weakConcepts.join(", ")}`);

    try {
      const result = await generateRevision(currentTopic, weakConcepts);

      if (
        !result ||
        !Array.isArray(result.revision) ||
        result.revision.length === 0
      ) {
        updateLabel(boardHint, "Review weak concepts again.");
        return;
      }

      const revision = result.revision[0];

      const conceptName = revision.concept || weakConcepts[0];
      const explanation = revision.explanation || "Review this concept again.";
      const memoryHint = revision.memory_hint || "Create a strong visual memory.";

      updateLabel(resultText, conceptName);
      updateLabel(boardHint, explanation);
      updateLabel(revisionLabel, `Memory Hint: ${memoryHint}`);
      updateLabel(feedbackLabel, "AI revision ready");

      const weakObject = recallObjects.find(
        (item) => item.label.toLowerCase() === conceptName.toLowerCase()
      );

      if (weakObject) {
        weakObject.object.userData.revisionExplanation = explanation;
        weakObject.object.userData.memoryHint = memoryHint;
      }
    } catch (error) {
      console.error("Revision error:", error);
      updateLabel(boardHint, "Review weak concepts manually.");
    }
  }

  // CHECK RECALL
  async function checkRecall() {
    if (!recallStarted) {
      updateLabel(feedbackLabel, "Start recall first");
      return;
    }

    const score = calculateRecallScore();

    updateLabel(scoreLabel, `Score: ${score}%`);

    const weak = getWeakConcepts();

    if (score === 100) {
      updateLabel(boardTitle, "MEMORY MASTERED!");
      updateLabel(resultText, "Excellent Recall");

      updateLabel(
        boardHint,
        "You remembered the complete learning sequence."
      );

      updateLabel(feedbackLabel, "Perfect!");
      return;
    }

    if (score >= 60) {
      updateLabel(feedbackLabel, "Good! AI reviewing weak concepts.");
    } else {
      updateLabel(feedbackLabel, "Let's revise weak concepts.");
    }

    await generateAdaptiveRevision(weak);
  }

  // BUTTON EVENTS
  startPanel.addEventListener("click", startRecall);
  checkPanel.addEventListener("click", checkRecall);

  // GLOBAL FUNCTIONS
  window.startRecall = startRecall;
  window.checkRecall = checkRecall;
  window.generateAIConcepts = generateAIConcepts;

  // FINAL
  console.log("✅ REAL 3D AI CLASSROOM READY");
});
