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
  // 1. Initialize Three.js 3D Scene with WebGL context check
  const canvas = document.querySelector('#webgl');
  let scene3D = null;
  
  try {
    if (canvas) {
      // Check for WebGL context availability explicitly first to avoid unhandled WebGLRenderer crashes
      const canvasTest = document.createElement('canvas');
      const gl = canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL context not supported by browser/GPU.');
      }
      scene3D = new Cyber3DScene(canvas);
    }
  } catch (error) {
    console.error("WebGL failed to initialize:", error);
    
    // Show compatibility warning banner
    const warningBanner = document.getElementById('webgl-warning');
    if (warningBanner) {
      warningBanner.style.display = 'block';
    }
    document.body.classList.add('no-webgl');
    
    // Handle closing the warning banner
    const closeWarningBtn = document.getElementById('close-warning-btn');
    if (closeWarningBtn && warningBanner) {
      closeWarningBtn.addEventListener('click', () => {
        warningBanner.style.display = 'none';
        document.body.classList.remove('no-webgl');
      });
    }
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
  const projectSlides = document.querySelectorAll('.project-slide');
  const slider = document.querySelector('#portfolio-slider');
  const progressBar = document.querySelector('#slider-progress');
  const arrowPrev = document.querySelector('#slider-prev');
  const arrowNext = document.querySelector('#slider-next');

  // Set up an Intersection Observer for active slides (fades and video playing)
  if (slider) {
    const slideObserverOptions = {
      root: slider,
      threshold: 0.5
    };

    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const slide = entry.target;
        const video = slide.querySelector('video');

        if (entry.isIntersecting) {
          slide.classList.add('active');
          
          // Lazy load and play video on active slide
          if (video) {
            if (!video.src && video.dataset.src) {
              video.src = video.dataset.src;
              video.load();
            }
            video.play().catch(err => {});
          }
        } else {
          slide.classList.remove('active');
          
          // Pause video on inactive slide
          if (video && video.src) {
            video.pause();
          }
        }
      });
    }, slideObserverOptions);

    projectSlides.forEach((slide) => {
      slideObserver.observe(slide);
      
      const video = slide.querySelector('video');
      const img = slide.querySelector('img');
      const fallback = slide.querySelector('.fallback-media-art');

      if (fallback) {
        fallback.style.display = 'none'; // Hidden by default
      }

      if (video) {
        if (video.readyState >= 2) {
          video.classList.add('media-loaded');
        } else {
          video.addEventListener('loadeddata', () => {
            video.classList.add('media-loaded');
          });
        }

        video.addEventListener('error', () => {
          video.style.display = 'none';
          if (fallback) fallback.style.display = 'flex';
        });
      }

      if (img) {
        if (img.complete) {
          img.classList.add('media-loaded');
        } else {
          img.addEventListener('load', () => {
            img.classList.add('media-loaded');
          });
        }

        img.addEventListener('error', () => {
          img.style.display = 'none';
          if (fallback) fallback.style.display = 'flex';
        });
      }
    });

    // Horizontal Scroll Progress Bar
    if (progressBar) {
      slider.addEventListener('scroll', () => {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        const progressPercentage = maxScroll > 0 ? (slider.scrollLeft / maxScroll) * 100 : 0;
        progressBar.style.width = `${progressPercentage}%`;
      });
    }

    // Desktop Sticky-to-Horizontal Scroll sync
    const syncStickySlider = () => {
      if (window.innerWidth < 768) return; // Run on desktop only

      const container = document.getElementById('sec-projects-container');
      if (container && slider) {
        const rect = container.getBoundingClientRect();
        const totalScrollableHeight = rect.height - window.innerHeight;
        const scrolledDistance = -rect.top;

        if (scrolledDistance >= 0 && scrolledDistance <= totalScrollableHeight) {
          const progressRatio = scrolledDistance / totalScrollableHeight;
          const maxHorizontalScroll = slider.scrollWidth - slider.clientWidth;
          slider.scrollLeft = progressRatio * maxHorizontalScroll;
        } else if (scrolledDistance < 0) {
          slider.scrollLeft = 0;
        } else if (scrolledDistance > totalScrollableHeight) {
          slider.scrollLeft = slider.scrollWidth - slider.clientWidth;
        }
      }
    };

    window.addEventListener('scroll', syncStickySlider);
    window.addEventListener('resize', syncStickySlider);
    // Initial sync
    syncStickySlider();

    // Navigation Arrows Logic
    const getScrollOffset = () => {
      const firstSlide = slider.querySelector('.project-slide');
      if (firstSlide) {
        const gap = parseFloat(getComputedStyle(slider).gap) || 0;
        return firstSlide.clientWidth + gap;
      }
      return 300;
    };

    const scrollToSlide = (index) => {
      const container = document.getElementById('sec-projects-container');
      if (container && slider) {
        const rect = container.getBoundingClientRect();
        const containerTop = window.scrollY + rect.top;
        const totalScrollableHeight = rect.height - window.innerHeight;
        
        const targetY = containerTop + (index / (projectSlides.length - 1)) * totalScrollableHeight;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    };

    if (arrowPrev && arrowNext) {
      arrowPrev.addEventListener('click', () => {
        if (window.innerWidth >= 768) {
          const activeIndex = Array.from(projectSlides).findIndex(slide => slide.classList.contains('active'));
          if (activeIndex > 0) {
            scrollToSlide(activeIndex - 1);
          }
        } else {
          slider.scrollBy({ left: -getScrollOffset(), behavior: 'smooth' });
        }
      });

      arrowNext.addEventListener('click', () => {
        if (window.innerWidth >= 768) {
          const activeIndex = Array.from(projectSlides).findIndex(slide => slide.classList.contains('active'));
          if (activeIndex < projectSlides.length - 1 && activeIndex !== -1) {
            scrollToSlide(activeIndex + 1);
          }
        } else {
          slider.scrollBy({ left: getScrollOffset(), behavior: 'smooth' });
        }
      });
    }
  }

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
        
        videoElement.addEventListener('loadeddata', () => {
          videoElement.classList.add('media-loaded');
        });

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
        
        imgElement.addEventListener('load', () => {
          imgElement.classList.add('media-loaded');
        });

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
  projectSlides.forEach((slide) => {
    slide.addEventListener('click', (e) => {
      // Do not open details modal if the user is clicking the "Visitar" external link directly
      if (e.target.closest('.btn-slide-link')) {
        return;
      }
      openModal(slide);
    });
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
