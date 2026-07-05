import './style.css'
import confetti from 'canvas-confetti'

document.addEventListener('DOMContentLoaded', () => {
  // 1. Entry Overlay Logic
  const entryOverlay = document.getElementById('entry-overlay');
  const appContainer = document.getElementById('app');

  const enterMainPage = () => {
    if (entryOverlay.classList.contains('open')) return;
    entryOverlay.classList.add('open');
    document.body.classList.remove('no-scroll');
    appContainer.style.opacity = '1';
    
    // Start flower shower animation
    startFlowerShower();

    // Hide overlay completely after door slides to allow interactions
    setTimeout(() => {
      entryOverlay.style.display = 'none';
    }, 1500);
  };

  entryOverlay.addEventListener('dblclick', enterMainPage);

  // Mobile support: double tap equivalent
  let lastTap = 0;
  entryOverlay.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 400 && tapLength > 0) {
      e.preventDefault();
      enterMainPage();
    }
    lastTap = currentTime;
  });

  // Start Countdown Timer
  initCountdown();

  // 2. Curtains & Confetti Observer
  const venueSection = document.getElementById('venue');
  let hasFiredConfetti = false;

  const venueObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        venueSection.classList.add('open');
        if (!hasFiredConfetti) {
          hasFiredConfetti = true;
          setTimeout(() => fireConfetti(), 1200);
        }
      }
    });
  }, { threshold: 0.5 });
  venueObserver.observe(venueSection);

  // 3. Scroll Reveal for Cards (Valima + Outro)
  const revealElements = document.querySelectorAll('.glass-card, .mehndi-card, .outro-content');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.3 });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. Scratch Card Logic
  setupScratchCard();
});

function setupScratchCard() {
  const canvas = document.getElementById('scratch-canvas');
  const ctx = canvas.getContext('2d');
  const container = document.querySelector('.scratch-card-container');
  
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;

  // Fill canvas with premium metallic/beige overlay
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#D5BDB2");
  gradient.addColorStop(0.5, "#EEDACB");
  gradient.addColorStop(1, "#D5BDB2");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add some Scratch Me text over it
  ctx.font = "italic 22px 'Cormorant Garamond'";
  ctx.fillStyle = "#8a6d62";
  ctx.textAlign = "center";
  ctx.fillText("Scratch to Reveal", canvas.width / 2, canvas.height / 2 + 5);

  let isDrawing = false;

  const scratch = (x, y) => {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  const getCoordinates = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startScratch = (e) => {
    isDrawing = true;
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const moveScratch = (e) => {
    if (!isDrawing) return;
    if (e.cancelable) {
      e.preventDefault(); // prevent scrolling while scratching on mobile
    }
    const { x, y } = getCoordinates(e);
    scratch(x, y);
  };

  const endScratch = () => {
    isDrawing = false;
  };

  canvas.addEventListener('mousedown', startScratch);
  canvas.addEventListener('mousemove', moveScratch);
  canvas.addEventListener('mouseup', endScratch);
  canvas.addEventListener('mouseleave', endScratch);

  canvas.addEventListener('touchstart', startScratch, { passive: false });
  canvas.addEventListener('touchmove', moveScratch, { passive: false });
  canvas.addEventListener('touchend', endScratch);
}

function fireConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  // increase zIndex so confetti flies over the door if any is left, and over UI
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 120 };
  const colors = ['#FFD1DC', '#F5E6CC', '#EEDACB', '#ffffff', '#c78b98'];

  function random(min, max) { return Math.random() * (max - min) + min; }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 50 * (timeLeft / duration);
    
    confetti({
      ...defaults,
      particleCount,
      origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 },
      colors: colors
    });
    
    confetti({
      ...defaults,
      particleCount,
      origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 },
      colors: colors
    });
  }, 250);
}

function startFlowerShower() {
  const container = document.body;
  const duration = 4000; // spawn for 4 seconds
  const petalCount = 6; // number of petals to spawn per interval
  
  const spawnInterval = setInterval(() => {
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.className = 'falling-flower';
      
      // Random sizes between 15px and 32px
      const size = Math.random() * 17 + 15;
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;
      
      // Random starting horizontal position across viewport
      petal.style.left = `${Math.random() * 100}vw`;
      
      // Random animation duration between 2.5s and 5s
      const animDuration = Math.random() * 2.5 + 2.5;
      petal.style.animationDuration = `${animDuration}s`;
      
      // Random opacity starting state
      petal.style.opacity = Math.random() * 0.4 + 0.6;
      
      // Random initial rotation
      petal.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      container.appendChild(petal);
      
      // Remove petal from DOM once it completes falling
      setTimeout(() => {
        petal.remove();
      }, animDuration * 1000);
    }
  }, 120);

  // Stop spawning after 4 seconds
  setTimeout(() => {
    clearInterval(spawnInterval);
  }, duration);
}

function initCountdown() {
  // Target: August 12, 2026 at 7:00 PM local time
  const targetDate = new Date(2026, 7, 12, 19, 0, 0);

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function update() {
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minutesEl) minutesEl.textContent = '00';
      if (secondsEl) secondsEl.textContent = '00';
      clearInterval(timerInterval);
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
  }

  update();
  const timerInterval = setInterval(update, 1000);
}
