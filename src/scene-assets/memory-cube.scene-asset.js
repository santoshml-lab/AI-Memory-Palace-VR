import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Group
} from "@iwsdk/core";

const memoryCube = new Group();

const geometry = new BoxGeometry(0.5, 0.5, 0.5);

const material = new MeshStandardMaterial({
  color: 0x6c63ff
});

const cube = new Mesh(
  geometry,
  material
);

cube.position.set(0, 0, 0);

memoryCube.add(cube);

export default memoryCube;
