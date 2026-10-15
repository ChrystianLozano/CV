import './style.css';
import { Cyber3DScene } from './three-scene.js';

// ==========================================================================
// 1. Sleek Preloader Logic
// ==========================================================================
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderStatus = document.getElementById('preloader-status');

if (preloader) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 20) + 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, 150);
    }
    if (preloaderBar) preloaderBar.style.width = `${progress}%`;
    if (preloaderStatus) preloaderStatus.textContent = `${progress}%`;
  }, 25);
}

// ==========================================================================
// 2. WebGL 3D Scene Initialization
// ==========================================================================
const canvas = document.querySelector('#webgl');
let scene3D = null;

try {
  if (canvas) {
    const canvasTest = document.createElement('canvas');
    const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
    if (!gl) {
      throw new Error('WebGL context not supported.');
    }
    scene3D = new Cyber3DScene(canvas);
  }
} catch (error) {
  console.warn("WebGL initialization note:", error);
  const warningBanner = document.getElementById('webgl-warning');
  if (warningBanner) {
    warningBanner.style.display = 'block';
  }
  document.body.classList.add('no-webgl');

  const closeWarningBtn = document.getElementById('close-warning-btn');
  if (closeWarningBtn && warningBanner) {
    closeWarningBtn.addEventListener('click', () => {
      warningBanner.style.display = 'none';
      document.body.classList.remove('no-webgl');
    });
  }
}

// ==========================================================================
// 3. Navigation & Scroll Spying
// ==========================================================================
const sections = document.querySelectorAll('.portfolio-section');
const navLinks = document.querySelectorAll('.nav-link');
const menuToggleBtn = document.querySelector('#mobile-toggle');
let activeSectionIndex = 0;

// Smooth Section Navigation
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      e.preventDefault();
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
        document.body.classList.remove('mobile-nav-active');
      }
    }
  });
});

// Mobile Menu Toggle
if (menuToggleBtn) {
  menuToggleBtn.addEventListener('click', () => {
    const isExpanded = document.body.classList.toggle('mobile-nav-active');
    menuToggleBtn.setAttribute('aria-expanded', isExpanded.toString());
  });
}

// Close mobile menu on click outside
document.addEventListener('click', (e) => {
  if (document.body.classList.contains('mobile-nav-active')) {
    if (!e.target.closest('#nav-menu') && !e.target.closest('#mobile-toggle')) {
      document.body.classList.remove('mobile-nav-active');
    }
  }
});

// Scroll Spying (Section Reveal & 3D Scene Morph Synchronization)
const sectionObserverOptions = {
  root: null,
  rootMargin: '-20% 0px -40% 0px',
  threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-visible');
      
      const id = entry.target.id;
      let index = 0;
      if (id === 'sec-home') index = 0;
      else if (id === 'sec-projects') index = 1;
      else if (id === 'sec-education') index = 2;
      else if (id === 'sec-skills') index = 3;
      else if (id === 'sec-contact' || id === 'sec-faq') index = 4;

      if (activeSectionIndex !== index) {
        activeSectionIndex = index;

        // Sync header nav active link
        navLinks.forEach((link) => {
          if (parseInt(link.getAttribute('data-section'), 10) === index) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // Trigger 3D scene camera and color transitions
        if (scene3D) {
          scene3D.setSection(index);
        }
      }
    }
  });
}, sectionObserverOptions);

sections.forEach((sec) => sectionObserver.observe(sec));

// Reveal hero immediately if in view
if (sections[0]) {
  sections[0].classList.add('reveal-visible');
}

// ==========================================================================
// 4. Project Category Filtering & Media Handling
// ==========================================================================
const filterChips = document.querySelectorAll('.filter-chip');
const projectCards = document.querySelectorAll('.project-card');

filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const filter = chip.getAttribute('data-filter');

    // Update active chip UI
    filterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    // Filter project cards
    projectCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// Project Videos Lazy Loading & Play-on-view / Play-on-hover
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }
      video.play().catch(() => {});
    } else {
      if (video.src) {
        video.pause();
      }
    }
  });
}, { threshold: 0.25 });

projectCards.forEach((card) => {
  const video = card.querySelector('video');
  if (video) {
    videoObserver.observe(video);

    // Hover acceleration
    card.addEventListener('mouseenter', () => {
      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }
      video.play().catch(() => {});
    });
  }
});

// ==========================================================================
// 5. Project Details Modal Mechanics (Emil Kowalski Modal Architecture)
// ==========================================================================
const modal = document.querySelector('#project-modal');
const modalCloseBtn = document.querySelector('#modal-close-btn');
const modalDismissBtn = document.querySelector('#modal-dismiss-btn');
const modalBackdrop = document.querySelector('#modal-backdrop');
const modalMedia = document.querySelector('#modal-media');
const modalTitle = document.querySelector('#modal-title');
const modalMetaTag = document.querySelector('#modal-meta-tag');
const modalDesc = document.querySelector('#modal-description');
const modalLinkBtn = document.querySelector('#modal-link-btn');

const openModal = (card) => {
  if (!modal) return;

  const title = card.getAttribute('data-title') || '';
  const meta = card.getAttribute('data-meta') || '';
  const desc = card.getAttribute('data-description') || '';
  const mediaPath = card.getAttribute('data-image') || '';
  const linkUrl = card.getAttribute('data-link') || '';

  if (modalTitle) modalTitle.textContent = title;
  if (modalMetaTag) modalMetaTag.textContent = meta;
  if (modalDesc) modalDesc.textContent = desc;

  // External visit button
  if (modalLinkBtn) {
    if (linkUrl) {
      modalLinkBtn.href = linkUrl;
      modalLinkBtn.style.display = 'inline-flex';
    } else {
      modalLinkBtn.style.display = 'none';
      modalLinkBtn.href = '#';
    }
  }

  // Populate media inside modal
  if (modalMedia) {
    modalMedia.innerHTML = '';
    if (mediaPath.endsWith('.mp4') || mediaPath.endsWith('.webm')) {
      const vid = document.createElement('video');
      vid.src = mediaPath;
      vid.autoplay = true;
      vid.controls = true;
      vid.loop = true;
      vid.playsInline = true;
      modalMedia.appendChild(vid);
    } else if (mediaPath) {
      const img = document.createElement('img');
      img.src = mediaPath;
      img.alt = title;
      if (card.getAttribute('data-tone') === 'grayscale') {
        img.classList.add('tone-grayscale');
      }
      modalMedia.appendChild(img);
    }
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  setTimeout(() => {
    if (modalMedia) {
      const vid = modalMedia.querySelector('video');
      if (vid) vid.pause();
      modalMedia.innerHTML = '';
    }
  }, 250);
};

// Bind card click triggers
projectCards.forEach((card) => {
  card.addEventListener('click', (e) => {
    // Avoid opening modal if clicking direct external visit link
    if (e.target.closest('.btn-card-visit')) return;
    openModal(card);
  });
});

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
    closeModal();
  }
});

// ==========================================================================
// 6. Direct Email Copy Feedback (Micro-interaction)
// ==========================================================================
const copyEmailBtn = document.getElementById('btn-copy-email');

if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', async () => {
    const email = 'hola@chrystian.dev';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const temp = document.createElement('textarea');
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }

      const copyText = copyEmailBtn.querySelector('.copy-text');
      if (copyText) {
        const originalText = copyText.textContent;
        copyText.textContent = '¡Copiado!';
        copyEmailBtn.classList.add('copied');

        setTimeout(() => {
          copyText.textContent = originalText;
          copyEmailBtn.classList.remove('copied');
        }, 2000);
      }
    } catch (err) {
      console.error('No se pudo copiar el correo:', err);
    }
  });
}
