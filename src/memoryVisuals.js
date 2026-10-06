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
  color
) {

  const name =
    conceptName.toLowerCase();


  // Light / sunlight concepts
  if (
    name.includes("light") ||
    name.includes("chlorophyll") ||
    name.includes("sun")
  ) {

    const geometry =
      new SphereGeometry(
        0.38,
        24,
        24
      );

    return new Mesh(
      geometry,
      createMaterial(color)
    );
  }


  // Water concepts
  if (
    name.includes("water") ||
    name.includes("droplet")
  ) {

    const geometry =
      new SphereGeometry(
        0.32,
        20,
        20
      );

    const mesh =
      new Mesh(
        geometry,
        createMaterial(color)
      );

    mesh.scale.set(
      0.8,
      1.25,
      0.8
    );

    return mesh;
  }


  // Energy / ATP concepts
  if (
    name.includes("atp") ||
    name.includes("energy") ||
    name.includes("electron")
  ) {

    const geometry =
      new TorusGeometry(
        0.28,
        0.10,
        16,
        32
      );

    return new Mesh(
      geometry,
      createMaterial(color)
    );
  }


  // Process / cycle concepts
  if (
    name.includes("cycle") ||
    name.includes("process") ||
    name.includes("transport")
  ) {

    const geometry =
      new CylinderGeometry(
        0.34,
        0.34,
        0.55,
        6
      );

    return new Mesh(
      geometry,
      createMaterial(color)
    );
  }


  // Default memory object
  const geometry =
    new BoxGeometry(
      0.6,
      0.6,
      0.6
    );

  return new Mesh(
    geometry,
    createMaterial(color)
  );
}
