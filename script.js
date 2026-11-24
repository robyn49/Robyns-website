// Runs once the page has loaded.
const letters = document.querySelectorAll(".letter");
const pbox = document.querySelector("#pbox");
const pboxTrigger = document.querySelector("#pbox-trigger");
let isEating = false;

// Calculate Pbox's rendered bounds because object-fit: contain does not fill
// the full viewport even though the image element does.
const getPboxBounds = () => {
  const imageWidth = 806;
  const imageHeight = 1640;
  const scale = Math.min(
    window.innerWidth / imageWidth,
    window.innerHeight / imageHeight
  );
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    left: (window.innerWidth - width) / 2,
    right: (window.innerWidth + width) / 2,
    top: window.innerHeight - height,
    bottom: window.innerHeight,
  };
};

const objectsOverlap = (first, second) =>
  first.left < second.right &&
  first.right > second.left &&
  first.top < second.bottom &&
  first.bottom > second.top;

// Place the invisible trigger over the upper part of Pbox at any viewport size.
const getPboxTriggerBounds = () => {
  const pboxBounds = getPboxBounds();
  const width = pboxBounds.right - pboxBounds.left;
  const height = pboxBounds.bottom - pboxBounds.top;
  const bounds = {
    left: pboxBounds.left + width * 0.41,
    right: pboxBounds.left + width * 0.59,
    top: pboxBounds.top + height * 0.18,
    bottom: pboxBounds.top + height * 0.24,
  };

  pboxTrigger.style.left = `${bounds.left}px`;
  pboxTrigger.style.top = `${bounds.top}px`;
  pboxTrigger.style.width = `${bounds.right - bounds.left}px`;
  pboxTrigger.style.height = `${bounds.bottom - bounds.top}px`;
  return bounds;
};

// Show the eating animation during its timed interaction, otherwise use the
// airplane image only while a held letter touches Pbox.
const updatePboxImage = () => {
  const pboxBounds = getPboxBounds();
  const touchingPbox = Array.from(letters).some((letter) => {
    if (!letter.classList.contains("dragging")) {
      return false;
    }

    return objectsOverlap(letter.getBoundingClientRect(), pboxBounds);
  });

  getPboxTriggerBounds();
  const imagePath = isEating
    ? "animations/New Pbox eating.gif"
    : touchingPbox
      ? "images/New Pbox airplane.png"
      : "images/New Pbox rest.png";

  // Avoid restarting an animation when another letter updates the Pbox state.
  if (pbox.getAttribute("src") !== imagePath) {
    pbox.src = imagePath;
  }
};

// Temporarily hide a letter and play the eating animation after a trigger hit.
const eatLetter = (letter, pointerId) => {
  if (
    isEating ||
    !objectsOverlap(letter.getBoundingClientRect(), getPboxTriggerBounds())
  ) {
    return false;
  }

  isEating = true;
  letter.classList.remove("dragging");
  letter.classList.add("eaten");
  letter.style.removeProperty("left");
  letter.style.removeProperty("top");

  if (letter.hasPointerCapture(pointerId)) {
    letter.releasePointerCapture(pointerId);
  }

  updatePboxImage();
  window.setTimeout(() => {
    isEating = false;
    letter.classList.remove("eaten");
    updatePboxImage();
  }, 3000);

  return true;
};

letters.forEach((letter) => {
  let offsetX = 0;
  let offsetY = 0;

  // Remove drag coordinates so the letter returns to its CSS landing-page position.
  const returnToInitialPosition = () => {
    letter.classList.remove("dragging");
    letter.style.removeProperty("left");
    letter.style.removeProperty("top");
  };

  // Start dragging only with the left mouse button and preserve the grab offset.
  letter.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const bounds = letter.getBoundingClientRect();
    offsetX = event.clientX - bounds.left;
    offsetY = event.clientY - bounds.top;

    letter.classList.add("dragging");
    letter.setPointerCapture(event.pointerId);
    if (eatLetter(letter, event.pointerId)) {
      return;
    }
    updatePboxImage();
  });

  // Move the letter while preserving it within the visible viewport.
  letter.addEventListener("pointermove", (event) => {
    if (!letter.classList.contains("dragging")) {
      return;
    }

    const bounds = letter.getBoundingClientRect();
    const left = Math.min(
      window.innerWidth - bounds.width,
      Math.max(0, event.clientX - offsetX)
    );
    const top = Math.min(
      window.innerHeight - bounds.height,
      Math.max(0, event.clientY - offsetY)
    );

    letter.style.left = `${left + bounds.width / 2}px`;
    letter.style.top = `${top + bounds.height / 2}px`;
    if (eatLetter(letter, event.pointerId)) {
      return;
    }
    updatePboxImage();
  });

  // Release the letter when the mouse button is released.
  letter.addEventListener("pointerup", (event) => {
    returnToInitialPosition();
    if (letter.hasPointerCapture(event.pointerId)) {
      letter.releasePointerCapture(event.pointerId);
    }
    updatePboxImage();
  });

  letter.addEventListener("pointercancel", () => {
    returnToInitialPosition();
    updatePboxImage();
  });
});

// Recheck collision after resizing because Pbox's rendered position can change.
window.addEventListener("resize", updatePboxImage);
