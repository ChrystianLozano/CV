import './style.css';

// ==========================================================================
// 1. Live Local Time (Guanajuato, MX · America/Mexico_City)
// ==========================================================================
const localTimeEl = document.getElementById('local-time');
if (localTimeEl) {
  const updateClock = () => {
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('es-MX', {
        timeZone: 'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(now);
      localTimeEl.textContent = `${formatted} CST`;
    } catch {
      localTimeEl.textContent = 'CST';
    }
  };
  updateClock();
  setInterval(updateClock, 30000);
}

// ==========================================================================
// 2. Smooth Navigation & Mobile Menu
// ==========================================================================
const sections = document.querySelectorAll('.portfolio-section');
const navLinks = document.querySelectorAll('.nav-link');
const menuToggleBtn = document.getElementById('mobile-toggle');

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId && targetId.length > 1) {
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        e.preventDefault();
        targetSection.scrollIntoView({ behavior: 'smooth' });
        document.body.classList.remove('mobile-nav-active');
        if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });
});

if (menuToggleBtn) {
  menuToggleBtn.addEventListener('click', () => {
    const isExpanded = document.body.classList.toggle('mobile-nav-active');
    menuToggleBtn.setAttribute('aria-expanded', isExpanded.toString());
  });
}

document.addEventListener('click', (e) => {
  if (document.body.classList.contains('mobile-nav-active')) {
    if (!e.target.closest('#nav-menu') && !e.target.closest('#mobile-toggle')) {
      document.body.classList.remove('mobile-nav-active');
      if (menuToggleBtn) menuToggleBtn.setAttribute('aria-expanded', 'false');
    }
  }
});

// Active Navigation Link via IntersectionObserver
const navSpyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        let index = 0;
        if (id === 'sec-home') index = 0;
        else if (id === 'sec-projects') index = 1;
        else if (id === 'sec-education') index = 2;
        else if (id === 'sec-skills') index = 3;
        else if (id === 'sec-contact') index = 4;

        navLinks.forEach((link) => {
          const linkIndex = parseInt(link.getAttribute('data-section'), 10);
          link.classList.toggle('active', linkIndex === index);
        });
      }
    });
  },
  {
    rootMargin: '-25% 0px -55% 0px',
    threshold: 0
  }
);

sections.forEach((sec) => navSpyObserver.observe(sec));

// ==========================================================================
// 3. Subtle Scroll Reveal Animations (IntersectionObserver)
// ==========================================================================
const revealSections = document.querySelectorAll('.reveal-section');
const revealItems = document.querySelectorAll('.reveal-item');

const revealSectionObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

revealSections.forEach((section) => revealSectionObserver.observe(section));

// Group reveal items per section so their stagger index is local and gentle
document.querySelectorAll('.portfolio-section').forEach((section) => {
  const items = section.querySelectorAll('.reveal-item');
  items.forEach((item, idx) => {
    // Cap delay so items never feel slow
    const delayMs = Math.min(idx % 4, 3) * 65;
    item.style.setProperty('--reveal-delay', `${delayMs}ms`);
  });
});

const revealItemObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
);

revealItems.forEach((item) => revealItemObserver.observe(item));

// ==========================================================================
// 4. Project Category Filtering & Sliding Pill Indicator
// ==========================================================================
const filterBar = document.querySelector('.project-filter-bar');
const filterChips = document.querySelectorAll('.filter-chip');
const projectCards = document.querySelectorAll('.project-card');

const updateFilterIndicator = (activeChip) => {
  if (!filterBar || !activeChip) return;
  const x = activeChip.offsetLeft;
  const w = activeChip.offsetWidth;
  filterBar.style.setProperty('--pill-x', `${x}px`);
  filterBar.style.setProperty('--pill-w', `${w}px`);
};

// Initialize indicator position once fonts/layout settle
const initIndicator = () => {
  const activeChip = document.querySelector('.filter-chip.active');
  if (activeChip) updateFilterIndicator(activeChip);
};

window.addEventListener('load', initIndicator);
window.addEventListener('resize', initIndicator);
initIndicator();

filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const filter = chip.getAttribute('data-filter');

    filterChips.forEach((c) => {
      const isTarget = c === chip;
      c.classList.toggle('active', isTarget);
      c.setAttribute('aria-selected', isTarget.toString());
    });

    updateFilterIndicator(chip);

    let visibleIndex = 0;
    projectCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      const matches = filter === 'all' || category === filter;

      card.classList.remove('filtering-in');
      if (matches) {
        card.classList.remove('hidden');
        card.classList.add('is-visible');
        // Force reflow so the subtle entry animation replays cleanly
        void card.offsetWidth;
        card.style.setProperty('--filter-delay', `${Math.min(visibleIndex * 45, 180)}ms`);
        card.classList.add('filtering-in');
        visibleIndex++;
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ==========================================================================
// 5. Project Videos Lazy Loading & Play-on-View
// ==========================================================================
const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (!video.src && video.dataset.src) {
          video.src = video.dataset.src;
          video.load();
        }
        video.play().catch(() => {});
      } else if (video.src) {
        video.pause();
      }
    });
  },
  { threshold: 0.25 }
);

projectCards.forEach((card) => {
  const video = card.querySelector('video');
  if (video) {
    videoObserver.observe(video);

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
// 6. Project Details Modal
// ==========================================================================
const modal = document.getElementById('project-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalDismissBtn = document.getElementById('modal-dismiss-btn');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalMedia = document.getElementById('modal-media');
const modalTitle = document.getElementById('modal-title');
const modalMetaTag = document.getElementById('modal-meta-tag');
const modalDesc = document.getElementById('modal-description');
const modalLinkBtn = document.getElementById('modal-link-btn');

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

  if (modalLinkBtn) {
    if (linkUrl) {
      modalLinkBtn.href = linkUrl;
      modalLinkBtn.style.display = 'inline-flex';
    } else {
      modalLinkBtn.style.display = 'none';
      modalLinkBtn.href = '#';
    }
  }

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
  }, 240);
};

projectCards.forEach((card) => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.btn-link-external')) return;
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
// 7. Direct Email Copy Feedback
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
        copyText.textContent = 'Copiado ✓';
        copyEmailBtn.classList.add('copied');

        setTimeout(() => {
          copyText.textContent = 'Copiar';
          copyEmailBtn.classList.remove('copied');
        }, 2000);
      }
    } catch (err) {
      console.error('No se pudo copiar el correo:', err);
    }
  });
}
