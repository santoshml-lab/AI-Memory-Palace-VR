const hasNativeWebXR =
  typeof navigator.xr !== "undefined" &&
  await navigator.xr
    .isSessionSupported("immersive-vr")
    .catch(() => false);

if (!hasNativeWebXR) {
  const { XRDevice, metaQuest3 } = await import("iwer");

  const xrDevice = new XRDevice(metaQuest3);
  xrDevice.installRuntime();
}

await import("./index.js");
