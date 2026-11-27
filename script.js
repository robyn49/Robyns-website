const sceneViewport = document.querySelector("#scene-viewport");
const scene = document.querySelector("#scene");
const mapLetterLinks = Array.from(document.querySelectorAll(".map-letter-link"));
// A 1x1 canvas checks whether a clicked point is opaque in each letter overlay.
const mapHitCanvas = document.createElement("canvas");
mapHitCanvas.width = 1;
mapHitCanvas.height = 1;
const mapHitContext = mapHitCanvas.getContext("2d", { willReadFrequently: true });

if (!mapHitContext) {
  throw new Error("Could not create the map-letter hit-test canvas.");
}

// Navigate only when a click lands on a visible pixel of a map-letter image.
sceneViewport.addEventListener("click", async (event) => {
  if (
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const sceneBounds = scene.getBoundingClientRect();
  for (const link of mapLetterLinks) {
    const image = link.querySelector("img");
    await image.decode();

    const x = Math.floor(
      ((event.clientX - sceneBounds.left) / sceneBounds.width) * image.naturalWidth
    );
    const y = Math.floor(
      ((event.clientY - sceneBounds.top) / sceneBounds.height) * image.naturalHeight
    );
    if (x < 0 || y < 0 || x >= image.naturalWidth || y >= image.naturalHeight) {
      continue;
    }

    mapHitContext.clearRect(0, 0, 1, 1);
    mapHitContext.drawImage(image, x, y, 1, 1, 0, 0, 1, 1);
    if (mapHitContext.getImageData(0, 0, 1, 1).data[3] > 0) {
      window.location.assign(link.href);
      return;
    }
  }
});

// Map vertical mouse-wheel motion to horizontal scrolling across the wide artwork.
sceneViewport.addEventListener("wheel", (event) => {
  const maxScroll = scene.offsetWidth - sceneViewport.clientWidth;
  if (maxScroll <= 0) {
    return;
  }

  event.preventDefault();
  sceneViewport.scrollLeft +=
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;
});

// Center the map initially and again when the viewport dimensions change.
const centerScene = () => {
  sceneViewport.scrollLeft = Math.max(
    0,
    (scene.offsetWidth - sceneViewport.clientWidth) / 2
  );
};

window.addEventListener("resize", centerScene);
window.addEventListener("load", centerScene);
centerScene();
