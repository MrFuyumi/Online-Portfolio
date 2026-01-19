// Globale Partikel-Einstellungen (Anzahl und maximale Verbindungsdistanz)
let PARTICLE_COUNT = 158;
let MAX_DISTANCE = 124;

// Anpassung der Partikelanzahl und Distanz für Mobilgeräte
function updateParticleSettings() {
  if (window.innerWidth <= 768) {
    // Weniger Partikel → bessere Performance auf Handy
    PARTICLE_COUNT = 96;
    MAX_DISTANCE = 105;
  } else {
    PARTICLE_COUNT = 158;
    MAX_DISTANCE = 124;
  }
}

// Berechnet den Scroll-Fortschritt der Seite (0–100%)
// Wird für den Farbverlauf der Verbindungslinien verwendet
function getScrollPercent() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 0;
  return (scrollTop / docHeight) * 100;
}

// Aktuelle Linienfarbe (RGB)
let currentR = 245;
let currentG = 220;
let currentB = 255;

// Übergangspunkte für Farbwechsel (in Prozent 60% und 80%)
const transitionStart = 60;
const transitionEnd = 80;

// Ändert die Farbe der Verbindungslinien je nach Scroll-Position
// 0–60%   → Startfarbbereich
// 60–80%  → sanfter Übergang
// 80–100% → Endfarbbereich
function updateLineColor() {
  const percent = getScrollPercent();

  let targetR, targetG, targetB;

  if (percent < transitionStart) {
    // Startfarbbereich
    targetR = Math.round(100 - percent * 2.2);
    targetG = Math.round(250 + percent * 1.85);
    targetB = Math.round(285 - percent * 2.85);
  } else if (percent > transitionEnd) {
    // Endfarbbereich
    targetR = Math.round(150 + percent * 5.2);
    targetG = Math.round(250 - percent * 1.25);
    targetB = Math.round(225 + percent * 2.25);
  } else {
    // Sanfter Übergang zwischen Start und Ende
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

  // Werte auf 0–255 begrenzen
  currentR = Math.max(0, Math.min(255, targetR));
  currentG = Math.max(0, Math.min(255, targetG));
  currentB = Math.max(0, Math.min(255, targetB));
}

updateLineColor();
window.addEventListener("scroll", updateLineColor);
window.addEventListener("resize", updateLineColor);

// Start-Einstellungen für Partikel
updateParticleSettings();
window.addEventListener("resize", updateParticleSettings);

// Klasse für ein einzelnes Partikel
class Particle {
  constructor(section) {
    this.section = section; // Sektion, in der das Partikel lebt
    this.x = Math.random() * section.offsetWidth;
    this.y = Math.random() * section.offsetHeight;
    this.vx = (Math.random() - 0.5) * 0.6; // kleine zufällige Geschwindigkeit
    this.vy = (Math.random() - 0.5) * 0.6;
    this.radius = 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Abprallen an den Rändern der Sektion
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

// Initialisierung der Partikel und Animation für jede Sektion
const sections = document.querySelectorAll(".particles-section");

sections.forEach((section) => {
  const canvas = section.querySelector(".particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let dpr = window.devicePixelRatio || 1;

  // Array mit Partikeln für diese Sektion
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(section));
  }

  // Canvas-Größe an Sektionsgröße anpassen + Retina-Support
  function resize() {
    const rect = section.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Verbindet nahe Partikel mit Linien
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MAX_DISTANCE) {
          // Transparenz abhängig von der Entfernung
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

  // Haupt-Animationsschleife
  function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    // Halbtransparenter schwarzer Hintergrund → Nachleuchteffekt;
    const rect = section.getBoundingClientRect();
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Partikel aktualisieren und zeichnen
    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
    });

    connectParticles();
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize(); // Erste Anpassung
  animate(); // Animation starten
});

//Плавное изчезновенние текста "Junior Developer"
const developer = document.querySelector(".developer h1");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  let opacity = 1 - scrollY / 200;

  if (opacity < 0) opacity = 0;
  if (opacity > 1) opacity = 1;

  developer.style.opacity = opacity;
});
