
import { DevUI } from "@iwer/devui";

const forceEmulator =
  new URLSearchParams(window.location.search).get("emulator") === "1";

const hasNativeWebXR =
  typeof navigator.xr !== "undefined" &&
  await navigator.xr
    .isSessionSupported("immersive-vr")
    .catch(() => false);

if (forceEmulator || !hasNativeWebXR) {
  const { XRDevice, metaQuest3 } = await import("iwer");

  const xrDevice = new XRDevice(metaQuest3);

  xrDevice.stereoEnabled = false;
  xrDevice.installRuntime();

  window.xrdevice = xrDevice;
  new DevUI(xrDevice);
}

await import("./index.js");

