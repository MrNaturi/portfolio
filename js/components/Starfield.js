export function StarfieldCanvas() {
  return `<canvas class="starfield"></canvas>`;
}

export function initStarfield() {
  const canvas = document.querySelector('.starfield');
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const stars = [];
  const starCount = 150;
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
    });
  }

  function drawStatic() {
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(236, 231, 220, ${star.opacity})`;
      ctx.fill();
    });
  }

  // reduced motion: draw once, skip the cursor-reactive loop entirely
  if (prefersReducedMotion) {
    drawStatic();
    return;
  }

  let mouseX = null;
  let mouseY = null;

  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
      let radius = star.radius;
      let opacity = star.opacity;

      if (mouseX !== null) {
        const dx = star.x - mouseX;
        const dy = star.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const proximity = 1 - distance / 120;
          radius = star.radius + proximity * 1.5;
          opacity = Math.min(1, star.opacity + proximity * 0.5);
        }
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(236, 231, 220, ${opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}