/* Custom Cursor Logic */
const dot = document.querySelector('.cursor-dot');
const outline = document.querySelector('.cursor-outline');

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

const interactables = document.querySelectorAll('a, button, .project-card, .close-btn');
interactables.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* Continuous Scroll Reveal Observer */
const fadeUpObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach((el) => fadeUpObserver.observe(el));

/* Smooth CAD Background Switcher on Scroll */
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

/* Project Overlay Popup Control */
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
    // Pause any active videos inside overlays on close
    const videos = overlay.querySelectorAll('video');
    videos.forEach(v => v.pause());
  });
  document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProjectView();
});

/* Resume Download Notification Toast */
function triggerResumeDownload(e) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  }
}

/* Interstitial Redirect Modal */
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