const openLetter = document.querySelector("#open-letter");
const letterReading = document.querySelector("#letter-reading");

// Reveal the scrollable letter contents above the envelope when it is clicked.
openLetter.addEventListener("click", () => {
  letterReading.hidden = false;
  openLetter.disabled = true;
  letterReading.focus({ preventScroll: true });
});
