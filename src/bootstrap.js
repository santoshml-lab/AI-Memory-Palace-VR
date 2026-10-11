import { DevUI } from "@iwer/devui";

const hasNativeWebXR =
typeof navigator.xr !== "undefined" &&
await navigator.xr
.isSessionSupported("immersive-vr")
.catch(() => false);

if (!hasNativeWebXR) {
  console.log("Native WebXR supported:", hasNativeWebXR);
const { XRDevice, metaQuest3 } = await import("iwer");

const xrDevice = new XRDevice(metaQuest3);

// Show a single view in the tablet preview
xrDevice.stereoEnabled = false;

// Install the emulated WebXR runtime
xrDevice.installRuntime();
// Make the emulator accessible for debugging
  window.xrdevice = xrDevice;
  

// Show IWER emulator controls
new DevUI(xrDevice);
}

await import("./index.js");
