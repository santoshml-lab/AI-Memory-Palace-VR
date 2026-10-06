import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry
} from "@iwsdk/core";


function createMaterial(color) {
  return new MeshBasicMaterial({
    color
  });
}


export function createMemoryVisual(
  conceptName,
  color,
  memoryHint = ""
) {

  const name =
    conceptName.toLowerCase();

  const hint =
    memoryHint.toLowerCase();


  let mesh;


  // ---------- LIGHT / SUN / CHLOROPHYLL ----------

  if (
    name.includes("light") ||
    name.includes("chlorophyll") ||
    name.includes("sun") ||
    hint.includes("sun") ||
    hint.includes("glowing")
  ) {

    mesh =
      new Mesh(
        new SphereGeometry(
          0.38,
          24,
          24
        ),
        createMaterial(color)
      );

    mesh.userData.memoryType =
      "light";

  }


  // ---------- WATER ----------

  else if (
    name.includes("water") ||
    name.includes("droplet") ||
    hint.includes("water") ||
    hint.includes("droplet")
  ) {

    mesh =
      new Mesh(
        new SphereGeometry(
          0.32,
          20,
          20
        ),
        createMaterial(color)
      );

    mesh.scale.set(
      0.8,
      1.25,
      0.8
    );

    mesh.userData.memoryType =
      "water";

  }


  // ---------- ENERGY ----------

  else if (
    name.includes("atp") ||
    name.includes("energy") ||
    name.includes("electron") ||
    name.includes("nadph") ||
    hint.includes("battery") ||
    hint.includes("energy")
  ) {

    mesh =
      new Mesh(
        new TorusGeometry(
          0.28,
          0.10,
          16,
          32
        ),
        createMaterial(color)
      );

    mesh.userData.memoryType =
      "energy";

  }


  // ---------- CYCLE / PROCESS ----------

  else if (
    name.includes("cycle") ||
    name.includes("process") ||
    name.includes("transport") ||
    hint.includes("cycle") ||
    hint.includes("chain")
  ) {

    mesh =
      new Mesh(
        new CylinderGeometry(
          0.34,
          0.34,
          0.55,
          6
        ),
        createMaterial(color)
      );

    mesh.userData.memoryType =
      "process";

  }


  // ---------- DEFAULT ----------

  else {

    mesh =
      new Mesh(
        new BoxGeometry(
          0.6,
          0.6,
          0.6
        ),
        createMaterial(color)
      );

    mesh.userData.memoryType =
      "general";

  }


  // Store the AI memory hint
  // for the spatial memory system.
  mesh.userData.memoryHint =
    memoryHint;

  mesh.userData.conceptName =
    conceptName;


  return mesh;
}
