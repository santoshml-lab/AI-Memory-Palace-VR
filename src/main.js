import * as THREE from "three";

const app = document.getElementById("app");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x101426);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);

camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

app.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(
  0xffffff,
  0x444466,
  2
);

scene.add(light);

const geometry = new THREE.BoxGeometry(
  0.6,
  0.6,
  0.6
);

const material = new THREE.MeshStandardMaterial({
  color: 0x6c63ff
});

const cube = new THREE.Mesh(
  geometry,
  material
);

cube.position.set(0, 1.2, -1.5);

scene.add(cube);

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(
    scene,
    camera
  );
}

animate();

window.addEventListener(
  "resize",
  () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);
