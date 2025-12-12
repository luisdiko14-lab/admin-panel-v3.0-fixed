alert("Welcome!")
let progress = 0;
const loadingBar = document.getElementById('loadingBar');
const status = document.getElementById('status');

const interval = setInterval(() => {
  if (progress >= 100) {
    clearInterval(interval);
    status.textContent = "Login checked successfully! ✅";
  } else {
    progress += 1.8; // Increase by 1.8%
    loadingBar.style.width = progress + '%';
    loadingBar.textContent = Math.floor(progress) + '%';
  }
}, 300); // every 0.3 seconds