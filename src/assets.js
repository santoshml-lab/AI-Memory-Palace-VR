import { AssetType, defineAssets, Group, Mesh, BoxGeometry, MeshStandardMaterial } from "@iwsdk/core";

const memoryCube = new Group();

const geometry = new BoxGeometry(0.5, 0.5, 0.5);

const material = new MeshStandardMaterial({
  color: 0x6c63ff
});

const cube = new Mesh(
  geometry,
  material
);

cube.position.set(0, 1.2, -2);

memoryCube.add(cube);

export default defineAssets({
  memoryCube: {
    name: "Memory Cube",
    type: AssetType.OBJECT3D,
    object: memoryCube
  }
});
