let PARTICLE_COUNT = 158;
let MAX_DISTANCE = 124;

function updateParticleSettings() {
  if (window.innerWidth <= 768) {
    PARTICLE_COUNT = 96;
    MAX_DISTANCE = 105;
  } else {
    PARTICLE_COUNT = 158;
    MAX_DISTANCE = 124;
  }
}

function getScrollPercent() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return (scrollTop / docHeight) * 100;
}

let currentR = 245;
let currentG = 220;
let currentB = 255;

const transitionStart = 60;
const transitionEnd = 80;

function updateLineColor() {
  const percent = getScrollPercent();

  let targetR, targetG, targetB;

  if (percent < transitionStart) {
    targetR = Math.round(100 - percent * 2.2);
    targetG = Math.round(250 + percent * 1.85);
    targetB = Math.round(285 - percent * 2.85);
  } else if (percent > transitionEnd) {
    targetR = Math.round(150 + percent * 5.2);
    targetG = Math.round(250 - percent * 1.25);
    targetB = Math.round(225 + percent * 2.25);
  } else {
    const progress =
      (percent - transitionStart) / (transitionEnd - transitionStart);

    const r1 = Math.round(100 - 60 * 2.2);
    const g1 = Math.round(250 + 60 * 1.85);
    const b1 = Math.round(285 - 60 * 2.85);

    const r2 = Math.round(150 + 80 * 5.2);
    const g2 = Math.round(250 - 80 * 1.25);
    const b2 = Math.round(225 + 80 * 2.25);

    targetR = Math.round(r1 + (r2 - r1) * progress);
    targetG = Math.round(g1 + (g2 - g1) * progress);
    targetB = Math.round(b1 + (b2 - b1) * progress);
  }

  currentR = Math.max(0, Math.min(255, targetR));
  currentG = Math.max(0, Math.min(255, targetG));
  currentB = Math.max(0, Math.min(255, targetB));
}

updateLineColor();
window.addEventListener("scroll", updateLineColor);
window.addEventListener("resize", updateLineColor);

updateParticleSettings();

window.addEventListener("resize", updateParticleSettings);
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
          ctx.strokeStyle = `rgba(${currentR}, ${currentG}, ${currentB}, ${
            1 - dist / MAX_DISTANCE
          })`;
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
