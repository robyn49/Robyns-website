const pbox = document.querySelector("#closeup-pbox");
const letter = document.querySelector("#pbox-letter");
const returnAnimation = document.querySelector("#return-animation");

let activePointerId = null;
let grabOffsetX = 0;
let grabOffsetY = 0;
let isReturning = false;

const returnLetterToStart = () => {
  letter.classList.remove("dragging");
  letter.style.removeProperty("left");
  letter.style.removeProperty("top");
};

// Play the supplied full-screen animation and return to the landing page when it ends.
const playReturnAnimation = async () => {
  isReturning = true;
  returnAnimation.hidden = false;

  try {
    await returnAnimation.play();
  } catch (error) {
    console.error("Could not play the return-to-landing animation.", error);
    returnAnimation.hidden = true;
    isReturning = false;
    pbox.src = "images/New Pbox rest.png";
    returnLetterToStart();
  }
};

letter.addEventListener("pointerdown", (event) => {
  if (
    isReturning ||
    activePointerId !== null ||
    (event.pointerType === "mouse" && event.button !== 0)
  ) {
    return;
  }

  event.preventDefault();
  const bounds = letter.getBoundingClientRect();
  activePointerId = event.pointerId;
  grabOffsetX = event.clientX - bounds.left;
  grabOffsetY = event.clientY - bounds.top;
  letter.classList.add("dragging");
  letter.setPointerCapture(event.pointerId);
  pbox.src = "images/New Pbox airplane.png";
});

letter.addEventListener("pointermove", (event) => {
  if (event.pointerId !== activePointerId) {
    return;
  }

  const bounds = letter.getBoundingClientRect();
  const left = Math.min(
    window.innerWidth - bounds.width,
    Math.max(0, event.clientX - grabOffsetX)
  );
  const top = Math.min(
    window.innerHeight - bounds.height,
    Math.max(0, event.clientY - grabOffsetY)
  );

  letter.style.left = `${left + bounds.width / 2}px`;
  letter.style.top = `${top + bounds.height / 2}px`;
});

// Pointer capture routes release here even if the pointer has moved off the letter.
letter.addEventListener("pointerup", (event) => {
  if (event.pointerId !== activePointerId) {
    return;
  }

  activePointerId = null;
  letter.classList.remove("dragging");
  if (letter.hasPointerCapture(event.pointerId)) {
    letter.releasePointerCapture(event.pointerId);
  }

  playReturnAnimation();
});

letter.addEventListener("pointercancel", (event) => {
  if (event.pointerId !== activePointerId) {
    return;
  }

  activePointerId = null;
  returnLetterToStart();
  pbox.src = "images/New Pbox rest.png";
});

returnAnimation.addEventListener("ended", () => {
  window.location.replace("index.html");
});

returnAnimation.addEventListener("error", () => {
  console.error("Could not load the return-to-landing animation.", returnAnimation.error);
});
