import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
} from "@iwsdk/core";

const geometry = new BoxGeometry(0.5, 0.5, 0.5);

const material = new MeshStandardMaterial({
  color: 0x6c63ff,
});

const memoryCube = new Mesh(
  geometry,
  material,
);

export default memoryCube;
