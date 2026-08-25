/* =========================================================
   HARDWARE DETECTION (Fixes Mobile Stutter)
========================================================= */
const isMobileDevice = window.matchMedia("(max-width: 900px)").matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* =========================================================
   CUSTOM CURSOR (Desktop Only)
========================================================= */
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');

if (!isMobileDevice) {
  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (dot) {
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }
  });

  function animateCursor() {
    if (outline) {
      let dx = mouseX - outlineX;
      let dy = mouseY - outlineY;
      outlineX += dx * 0.15;
      outlineY += dy * 0.15;
      outline.style.left = `${outlineX}px`;
      outline.style.top = `${outlineY}px`;
    }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const interactables = document.querySelectorAll('a, button, .project-card, .close-btn, .overlay-img, .overlay-video');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* =========================================================
   MAGNETIC UI ELEMENTS (Desktop Only)
========================================================= */
if (!isMobileDevice) {
  const magneticElements = document.querySelectorAll('.btn, .project-card, .stat-card');

  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const position = el.getBoundingClientRect();
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;
      
      el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px) scale(1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0px, 0px) scale(1)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
    
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'none';
    });
  });
}

/* =========================================================
   TEXT SCRAMBLE DECODE EFFECT (Fast & Smooth Version)
========================================================= */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      // Dramatically reduced timings for a lightning-fast snap effect
      const start = Math.floor(Math.random() * 5);
      const end = start + Math.floor(Math.random() * 15);
      this.queue.push({ from, to, start, end, char: '' });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        // Increased update frequency to 60% for smoother letter cycling
        if (!char || Math.random() < 0.60) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

const fadeUpObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      
      // Trigger fast scramble
      if (entry.target.classList.contains('scramble-text') && !entry.target.classList.contains('scrambled')) {
        const fx = new TextScramble(entry.target);
        const originalText = entry.target.getAttribute('data-text');
        fx.setText(originalText);
        entry.target.classList.add('scrambled'); 
      }
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up, .scramble-text').forEach((el) => fadeUpObserver.observe(el));

/* =========================================================
   CAD BACKGROUND SWITCHER
========================================================= */
const cadObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const targetCadId = entry.target.getAttribute('data-cad');
      
      document.querySelectorAll('.cad-bg-img').forEach(img => {
        img.classList.remove('active');
      });

      const activeCadImg = document.getElementById(targetCadId);
      if (activeCadImg) {
        activeCadImg.classList.add('active');
      }
    }
  });
}, { threshold: 0.35 });

document.querySelectorAll('.cad-trigger').forEach(section => cadObserver.observe(section));

/* =========================================================
   LIGHTBOX MODAL LOGIC (PAN & ZOOM CAD VIEWER)
========================================================= */
let lbScale = 1;
let lbPointX = 0;
let lbPointY = 0;
let lbPanning = false;
let lbStartX = 0;
let lbStartY = 0;

function openLightbox(element) {
  const lightbox = document.getElementById('lightbox-modal');
  const wrapper = lightbox.querySelector('.lightbox-content-wrapper');
  wrapper.innerHTML = ''; 

  document.querySelectorAll('.overlay-video').forEach(v => {
      if(v.pause) v.pause();
  });

  if (element.tagName === 'IMG') {
    const img = document.createElement('img');
    img.src = element.src;
    img.classList.add('zoomable-img');

    lbScale = 1; lbPointX = 0; lbPointY = 0;
    img.style.transform = `translate(0px, 0px) scale(1)`;
    
    img.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomSensitivity = 0.15;
      const delta = e.deltaY < 0 ? 1 : -1;
      const newScale = Math.min(Math.max(1, lbScale + (delta * zoomSensitivity * lbScale)), 5);

      lbScale = newScale;
      if (lbScale === 1) {
        lbPointX = 0; lbPointY = 0; 
        img.classList.remove('zoomed');
      } else {
        img.classList.add('zoomed');
      }

      img.style.transform = `translate(${lbPointX}px, ${lbPointY}px) scale(${lbScale})`;
    });

    img.addEventListener('mousedown', (e) => {
      if (lbScale > 1) {
        e.preventDefault();
        lbPanning = true;
        img.classList.add('dragging');
        lbStartX = e.clientX - lbPointX;
        lbStartY = e.clientY - lbPointY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!lbPanning) return;
      e.preventDefault();
      lbPointX = e.clientX - lbStartX;
      lbPointY = e.clientY - lbStartY;
      img.style.transform = `translate(${lbPointX}px, ${lbPointY}px) scale(${lbScale})`;
    });

    window.addEventListener('mouseup', () => {
      if (lbPanning) {
        lbPanning = false;
        img.classList.remove('dragging');
      }
    });

    wrapper.appendChild(img);
  } else if (element.tagName === 'VIDEO') {
    const video = document.createElement('video');
    video.src = element.querySelector('source').src;
    video.controls = true;
    video.autoplay = true;
    wrapper.appendChild(video);
  } else {
      return; 
  }

  lightbox.classList.add('active');
}

function closeLightbox(e) {
  if (e.target.tagName !== 'VIDEO' && e.target.tagName !== 'IMG') {
    const lightbox = document.getElementById('lightbox-modal');
    lightbox.classList.remove('active');
    const wrapper = lightbox.querySelector('.lightbox-content-wrapper');
    wrapper.innerHTML = ''; 
  }
}

document.querySelectorAll('.overlay-img, .overlay-video').forEach(media => {
  if(media.tagName !== 'IFRAME') {
      media.addEventListener('click', function() {
        openLightbox(this);
      });
  }
});

/* =========================================================
   PROJECT OVERLAY POPUP CONTROL
========================================================= */
function openProjectView(projectId) {
  const overlay = document.getElementById(projectId);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeProjectView() {
  const overlays = document.querySelectorAll('.project-overlay');
  overlays.forEach(overlay => {
    overlay.classList.remove('active');
    const videos = overlay.querySelectorAll('video');
    videos.forEach(v => v.pause());
  });
  document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const lightbox = document.getElementById('lightbox-modal');
    if (lightbox && lightbox.classList.contains('active')) {
      closeLightbox({target: lightbox}); 
    } else {
      closeProjectView();
    }
  }
});

/* =========================================================
   UTILITIES (Toasts & Redirects)
========================================================= */
function triggerResumeDownload(e) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }
}

function triggerRedirect(e, url, destinationName, isNewTab = true) {
  e.preventDefault();
  const modal = document.getElementById('redirect-modal');
  const title = document.getElementById('redirect-title');
  const desc = document.getElementById('redirect-desc');

  if (modal && title && desc) {
    title.textContent = `Connecting to ${destinationName}`;
    desc.textContent = `Opening link safely in a moment...`;
    modal.classList.add('active');

    setTimeout(() => {
      modal.classList.remove('active');
      if (isNewTab) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    }, 2000);
  }
}
