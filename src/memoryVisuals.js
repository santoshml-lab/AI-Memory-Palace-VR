
import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  TorusGeometry
} from "@iwsdk/core";

function createMaterial(color) {
  return new MeshBasicMaterial({ color });
}

export function createMemoryVisual(
  conceptName,
  color,
  memoryHint = ""
) {
  const name = conceptName.toLowerCase();
  const hint = memoryHint.toLowerCase();

  let mesh;

  // LIGHT ENERGY — round sun
  if (
    name.includes("light") ||
    name.includes("sun") ||
    name.includes("chlorophyll") ||
    hint.includes("sun") ||
    hint.includes("glowing")
  ) {
    mesh = new Mesh(
      new SphereGeometry(0.38, 24, 24),
      createMaterial(color)
    );
    mesh.userData.memoryType = "light";
  }

  // WATER — tall droplet-like shape
  else if (
    name.includes("water") ||
    name.includes("droplet") ||
    hint.includes("water") ||
    hint.includes("droplet")
  ) {
    mesh = new Mesh(
      new SphereGeometry(0.32, 20, 20),
      createMaterial(color)
    );
    mesh.scale.set(0.75, 1.3, 0.75);
    mesh.userData.memoryType = "water";
  }

  // PHOTOSYNTHESIS — hexagonal process shape
  else if (
    name.includes("photosynthesis") ||
    name.includes("cycle") ||
    name.includes("process") ||
    name.includes("transport") ||
    hint.includes("cycle") ||
    hint.includes("chain")
  ) {
    mesh = new Mesh(
      new CylinderGeometry(0.34, 0.34, 0.55, 6),
      createMaterial(color)
    );
    mesh.userData.memoryType = "process";
  }

  // ENERGY — ring shape
  else if (
    name.includes("atp") ||
    name.includes("energy") ||
    name.includes("electron") ||
    name.includes("nadph") ||
    hint.includes("battery") ||
    hint.includes("energy")
  ) {
    mesh = new Mesh(
      new TorusGeometry(0.28, 0.10, 16, 32),
      createMaterial(color)
    );
    mesh.userData.memoryType = "energy";
  }

  // GLUCOSE — rectangular 3D block
  else if (name.includes("glucose") || name.includes("sugar")) {
    mesh = new Mesh(
      new BoxGeometry(0.48, 0.68, 0.48),
      createMaterial(color)
    );
    mesh.userData.memoryType = "glucose";
  }

  // OXYGEN — small round molecule
  else if (
    name.includes("oxygen") ||
    name === "o2"
  ) {
    mesh = new Mesh(
      new SphereGeometry(0.28, 24, 24),
      createMaterial(color)
    );
    mesh.userData.memoryType = "oxygen";
  }

  // DEFAULT — cube
  else {
    mesh = new Mesh(
      new BoxGeometry(0.6, 0.6, 0.6),
      createMaterial(color)
    );
    mesh.userData.memoryType = "general";
  }

  mesh.userData.memoryHint = memoryHint;
  mesh.userData.conceptName = conceptName;

  return mesh;
}

