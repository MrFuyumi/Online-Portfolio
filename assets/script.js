const PARTICLE_COUNT = 180;
const MAX_DISTANCE = 115;

class Particle {
  constructor(section) {
    this.section = section;
    this.x = Math.random() * section.offsetWidth;
    this.y = Math.random() * section.offsetHeight;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.radius = 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > this.section.offsetWidth) this.vx *= -1;
    if (this.y < 0 || this.y > this.section.offsetHeight) this.vy *= -1;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

const sections = document.querySelectorAll(".particles-section");

sections.forEach((section) => {
  const canvas = section.querySelector(".particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let dpr = window.devicePixelRatio || 1;

  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(section));
  }

  function resize() {
    const rect = section.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DISTANCE) {
          ctx.strokeStyle = `rgba(255,255,255,${1 - dist / MAX_DISTANCE})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    // Очистка с правильными размерами (в CSS-пикселях)
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    const rect = section.getBoundingClientRect();
    ctx.fillRect(0, 0, rect.width, rect.height);

    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
    });

    connectParticles();
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();
});

const developer = document.querySelector(".developer h1");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  let opacity = 1 - scrollY / 200;

  if (opacity < 0) opacity = 0;
  if (opacity > 1) opacity = 1;

  developer.style.opacity = opacity;
});
