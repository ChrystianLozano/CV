import './style.css';
import { Cyber3DScene } from './three-scene.js';

// 0. Preloader Logic
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderStatus = document.getElementById('preloader-status');

if (preloader) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('loaded');
      }, 200);
    }
    if (preloaderBar) preloaderBar.style.width = `${progress}%`;
    if (preloaderStatus) preloaderStatus.textContent = `${progress}%`;
  }, 40);
}

// Initialize UI and WebGL components immediately as the module executes
  // 1. Initialize Three.js 3D Scene
  const canvas = document.querySelector('#webgl');
  let scene3D = null;
  
  if (canvas) {
    scene3D = new Cyber3DScene(canvas);
  }

  // 2. Select DOM Elements
  const sections = document.querySelectorAll('.portfolio-section');
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggleBtn = document.querySelector('#mobile-toggle');
  const navMenu = document.querySelector('#nav-menu');
  
  // Project Modal Elements
  const modal = document.querySelector('#project-modal');
  const modalCloseBtn = document.querySelector('#modal-close-btn');
  const modalMedia = document.querySelector('#modal-media');
  const modalTitle = document.querySelector('#modal-title');
  const modalMetaTag = document.querySelector('#modal-meta-tag');
  const modalDesc = document.querySelector('#modal-description');
  const modalLinkBtn = document.querySelector('#modal-link-btn');

  let activeSectionIndex = 0;

  // 3. Section Navigation & Smooth Scroll
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetIndex = parseInt(link.getAttribute('data-section'), 10);
      const targetSection = sections[targetIndex];
      
      if (targetSection) {
        // Scroll target section into view
        targetSection.scrollIntoView({ behavior: 'smooth' });
        
        // If mobile nav active, collapse it
        document.body.classList.remove('mobile-nav-active');
      }
    });
  });

  // 4. Mobile Menu Toggle
  if (menuToggleBtn) {
    menuToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('mobile-nav-active');
    });
  }

  // 5. Scroll Spying (Intersection Observer)
  // Calibrated for a top-down scroll site: triggers when a section passes through the center band of the screen
  const observerOptions = {
    root: null, // use viewport
    rootMargin: '-25% 0px -55% 0px',
    threshold: 0
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        let index = 0;
        
        // Map section ID to index
        if (id === 'sec-home') index = 0;
        else if (id === 'sec-projects') index = 1;
        else if (id === 'sec-education') index = 2;
        else if (id === 'sec-skills') index = 3;
        else if (id === 'sec-contact' || id === 'sec-faq') index = 4;
        
        // Add reveal-visible class to animate sections entering the screen
        entry.target.classList.add('reveal-visible');

        if (activeSectionIndex !== index) {
          activeSectionIndex = index;

          // Sync top navbar active state
          navLinks.forEach((link) => {
            if (parseInt(link.getAttribute('data-section'), 10) === index) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });

          // Transition Three.js camera/sculpture parameters
          if (scene3D) {
            scene3D.setSection(index);
          }
        }
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach((section) => observer.observe(section));

  // Trigger reveal for first section immediately in case it doesn't fire observer on load
  if (sections[0]) {
    sections[0].classList.add('reveal-visible');
  }

  // 6. Project Media Handling (Lazy Loading & Fallback mechanism)
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  
  // Set up an Intersection Observer for lazy loading and auto-play/pause of card videos
  const videoLazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        // Load the src if it hasn't been loaded yet
        if (!video.src && video.dataset.src) {
          video.src = video.dataset.src;
          video.load();
        }
        // Play the video
        video.play().catch(err => {});
      } else {
        // Pause the video to save performance when not in viewport
        if (video.src) {
          video.pause();
        }
      }
    });
  }, {
    root: null, // viewport
    rootMargin: '100px', // load 100px before entering viewport
    threshold: 0
  });

  portfolioCards.forEach((card) => {
    const video = card.querySelector('video');
    const img = card.querySelector('img');
    const fallback = card.querySelector('.fallback-media-art');

    if (fallback) {
      fallback.style.display = 'none'; // Hidden by default, only shown on failure
    }

    if (video) {
      // Observe video for lazy load / play management
      videoLazyObserver.observe(video);

      video.addEventListener('error', () => {
        video.style.display = 'none';
        if (fallback) fallback.style.display = 'flex';
      });
    }

    if (img) {
      img.addEventListener('error', () => {
        img.style.display = 'none';
        if (fallback) fallback.style.display = 'flex';
      });
    }
  });

  // 7. Project Details Modal Mechanics
  const openModal = (card) => {
    if (!modal) return;
    
    // Extract metadata
    const title = card.getAttribute('data-title') || '';
    const meta = card.getAttribute('data-meta') || '';
    const desc = card.getAttribute('data-description') || '';
    const mediaPath = card.getAttribute('data-image') || '';
    const linkUrl = card.getAttribute('data-link') || '';

    // Populate copy
    if (modalTitle) modalTitle.textContent = title;
    if (modalMetaTag) modalMetaTag.textContent = meta;
    if (modalDesc) modalDesc.textContent = desc;

    // Populate Visit Link Button
    if (modalLinkBtn) {
      if (linkUrl) {
        modalLinkBtn.href = linkUrl;
        modalLinkBtn.style.display = 'inline-flex';
      } else {
        modalLinkBtn.style.display = 'none';
        modalLinkBtn.href = '#';
      }
    }

    // Populate media node
    if (modalMedia) {
      modalMedia.innerHTML = ''; // Clear previous media

      if (mediaPath.endsWith('.mp4') || mediaPath.endsWith('.webm')) {
        const videoElement = document.createElement('video');
        videoElement.src = mediaPath;
        videoElement.autoplay = true;
        videoElement.controls = true;
        videoElement.loop = true;
        videoElement.playsInline = true;
        
        videoElement.addEventListener('error', () => {
          videoElement.style.display = 'none';
          const errorPlaceholder = document.createElement('div');
          errorPlaceholder.className = 'fallback-media-art';
          errorPlaceholder.innerHTML = `<span class="fallback-text">${title}</span>`;
          modalMedia.appendChild(errorPlaceholder);
        });

        modalMedia.appendChild(videoElement);
      } else if (mediaPath) {
        const imgElement = document.createElement('img');
        imgElement.src = mediaPath;
        imgElement.alt = title;
        
        imgElement.addEventListener('error', () => {
          imgElement.style.display = 'none';
          const errorPlaceholder = document.createElement('div');
          errorPlaceholder.className = 'fallback-media-art';
          errorPlaceholder.innerHTML = `<span class="fallback-text">${title}</span>`;
          modalMedia.appendChild(errorPlaceholder);
        });

        modalMedia.appendChild(imgElement);
      } else {
        const errorPlaceholder = document.createElement('div');
        errorPlaceholder.className = 'fallback-media-art';
        errorPlaceholder.innerHTML = `<span class="fallback-text">${title}</span>`;
        modalMedia.appendChild(errorPlaceholder);
      }
    }

    // Display modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock main scroll
  };

  const closeModal = () => {
    if (!modal) return;
    
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock main scroll

    // Pause and clean media inside to save memory
    setTimeout(() => {
      if (modalMedia) {
        const video = modalMedia.querySelector('video');
        if (video) video.pause();
        modalMedia.innerHTML = '';
      }
    }, 500);
  };

  // Bind portfolio card click handlers
  portfolioCards.forEach((card) => {
    card.addEventListener('click', () => openModal(card));
  });

  // Bind close buttons and backdrop clicks
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });
