import { World } from "@iwsdk/core";
import projectOptions from "virtual:iwsdk-project";

const sceneContainer = document.getElementById("scene-container");

console.log("AI Memory Palace: starting...");
console.log("Scene container:", sceneContainer);
console.log("Project options:", projectOptions);

if (!sceneContainer) {
  document.body.innerHTML = `
    <div style="color:white;background:#101426;padding:40px;font-family:Arial">
      <h1>AI Memory Palace VR</h1>
      <p>Scene container was not found.</p>
    </div>
  `;
} else {
  World.create(sceneContainer, projectOptions)
    .then((world) => {
      console.log("IWSDK World created successfully.");
      console.log(world);
    })
    .catch((error) => {
      console.error("IWSDK World creation failed:", error);

      document.body.innerHTML = `
        <div style="color:white;background:#101426;padding:40px;font-family:Arial">
          <h1>AI Memory Palace VR</h1>
          <p>IWSDK startup failed.</p>
          <pre style="white-space:pre-wrap">${error}</pre>
        </div>
      `;
    });
}
