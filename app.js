// Slide Navigation Functionality
let currentSlide = 1;
const totalSlides = 6;

// Initialize the presentation
document.addEventListener('DOMContentLoaded', function() {
    updateSlideVisibility();
    updateNavigationState();
    initializeFromURL();
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowRight' || event.key === ' ') {
            event.preventDefault();
            nextSlide();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            previousSlide();
        } else if (event.key >= '1' && event.key <= '6') {
            event.preventDefault();
            goToSlide(parseInt(event.key));
        } else if (event.key === 'Escape') {
            event.preventDefault();
            exitFullscreen();
        }
    });
    
    // Add ARIA labels and roles for accessibility
    setupAccessibility();
});

// Navigation functions
function nextSlide() {
    if (currentSlide < totalSlides) {
        currentSlide++;
        updateSlideVisibility();
        updateNavigationState();
        updateURL();
        announceSlideChange();
    }
}

function previousSlide() {
    if (currentSlide > 1) {
        currentSlide--;
        updateSlideVisibility();
        updateNavigationState();
        updateURL();
        announceSlideChange();
    }
}

function goToSlide(slideNumber) {
    if (slideNumber >= 1 && slideNumber <= totalSlides) {
        currentSlide = slideNumber;
        updateSlideVisibility();
        updateNavigationState();
        updateURL();
        announceSlideChange();
    }
}

// Update slide visibility with smooth transitions
function updateSlideVisibility() {
    const slides = document.querySelectorAll('.slide');
    
    slides.forEach((slide, index) => {
        const slideNumber = index + 1;
        
        // Remove all classes first
        slide.classList.remove('active', 'prev', 'next');
        
        if (slideNumber === currentSlide) {
            // Current slide
            slide.classList.add('active');
        } else if (slideNumber < currentSlide) {
            // Previous slides
            slide.classList.add('prev');
        } else {
            // Next slides (default state)
            // No additional class needed, default transform handles this
        }
    });
    
    // Reset scroll position for slide 4 when entering
    if (currentSlide === 4) {
        setTimeout(() => {
            const scrollableContent = document.querySelector('.scrollable-content');
            if (scrollableContent) {
                scrollableContent.scrollTop = 0;
            }
        }, 300);
    }
}

// Update navigation button states and indicators
function updateNavigationState() {
    // Update navigation buttons
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.disabled = currentSlide === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentSlide === totalSlides;
    }
    
    // Update slide indicators
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        const slideNumber = index + 1;
        if (slideNumber === currentSlide) {
            indicator.classList.add('active');
            indicator.setAttribute('aria-current', 'true');
        } else {
            indicator.classList.remove('active');
            indicator.removeAttribute('aria-current');
        }
    });
}

// Touch/swipe support for mobile devices
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50; // minimum distance for a swipe
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = touchEndY - touchStartY;
    
    // Only handle horizontal swipes if they're more significant than vertical ones
    if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY) && Math.abs(swipeDistanceX) > swipeThreshold) {
        // Check if we're in slide 4 and scrolling vertically
        if (currentSlide === 4) {
            const scrollableContent = document.querySelector('.scrollable-content');
            if (scrollableContent) {
                const isScrollable = scrollableContent.scrollHeight > scrollableContent.clientHeight;
                const isAtTop = scrollableContent.scrollTop === 0;
                const isAtBottom = scrollableContent.scrollTop >= (scrollableContent.scrollHeight - scrollableContent.clientHeight - 1);
                
                // Only allow slide navigation if not scrolling or at scroll boundaries
                if (!isScrollable || (swipeDistanceX > 0 && isAtTop) || (swipeDistanceX < 0 && isAtBottom)) {
                    if (swipeDistanceX > 0) {
                        previousSlide();
                    } else {
                        nextSlide();
                    }
                }
            }
        } else {
            if (swipeDistanceX > 0) {
                previousSlide();
            } else {
                nextSlide();
            }
        }
    }
}

// URL hash support for direct linking to slides
function updateURL() {
    history.replaceState(null, null, `#slide-${currentSlide}`);
}

function initializeFromURL() {
    const hash = window.location.hash;
    const match = hash.match(/#slide-(\d+)/);
    
    if (match) {
        const slideNumber = parseInt(match[1]);
        if (slideNumber >= 1 && slideNumber <= totalSlides) {
            currentSlide = slideNumber;
        }
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    initializeFromURL();
    updateSlideVisibility();
    updateNavigationState();
});

// Accessibility improvements
function setupAccessibility() {
    // Add ARIA labels and roles to slides
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        slide.setAttribute('role', 'tabpanel');
        slide.setAttribute('aria-label', `Slide ${index + 1} de ${totalSlides}`);
        slide.setAttribute('aria-hidden', index + 1 !== currentSlide ? 'true' : 'false');
    });
    
    // Add ARIA labels to navigation
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.setAttribute('aria-label', 'Slide anterior');
    }
    
    if (nextBtn) {
        nextBtn.setAttribute('aria-label', 'Próximo slide');
    }
    
    // Add ARIA labels to indicators
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.setAttribute('aria-label', `Ir para slide ${index + 1}`);
        indicator.setAttribute('role', 'button');
        indicator.setAttribute('tabindex', '0');
        
        // Add keyboard support for indicators
        indicator.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goToSlide(index + 1);
            }
        });
    });
}

// Screen reader announcements for slide changes
function announceSlideChange() {
    const activeSlide = document.querySelector('.slide.active');
    if (activeSlide) {
        const slideTitle = activeSlide.querySelector('h1');
        if (slideTitle) {
            // Update ARIA hidden states
            const slides = document.querySelectorAll('.slide');
            slides.forEach((slide, index) => {
                slide.setAttribute('aria-hidden', index + 1 !== currentSlide ? 'true' : 'false');
            });
            
            // Create temporary announcement element
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Slide ${currentSlide} de ${totalSlides}: ${slideTitle.textContent}`;
            
            document.body.appendChild(announcement);
            
            // Remove after announcement
            setTimeout(() => {
                if (document.body.contains(announcement)) {
                    document.body.removeChild(announcement);
                }
            }, 1000);
        }
    }
}

// Fullscreen functionality
function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Handle fullscreen changes
document.addEventListener('fullscreenchange', function() {
    const isFullscreen = document.fullscreenElement !== null;
    document.body.classList.toggle('fullscreen-mode', isFullscreen);
});

// Auto-advance functionality (disabled by default)
let autoAdvanceTimer = null;
const autoAdvanceDelay = 15000; // 15 seconds

function startAutoAdvance() {
    stopAutoAdvance();
    autoAdvanceTimer = setInterval(() => {
        if (currentSlide < totalSlides) {
            nextSlide();
        } else {
            stopAutoAdvance();
        }
    }, autoAdvanceDelay);
}

function stopAutoAdvance() {
    if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
}

// Stop auto-advance on user interaction
document.addEventListener('click', stopAutoAdvance);
document.addEventListener('keydown', stopAutoAdvance);
document.addEventListener('touchstart', stopAutoAdvance);

// Progress tracking
function getProgress() {
    return {
        currentSlide: currentSlide,
        totalSlides: totalSlides,
        percentage: Math.round((currentSlide / totalSlides) * 100)
    };
}

// Slide 4 specific enhancements
document.addEventListener('DOMContentLoaded', function() {
    const scrollableContent = document.querySelector('.scrollable-content');
    
    if (scrollableContent) {
        // Add smooth scrolling behavior
        scrollableContent.style.scrollBehavior = 'smooth';
        
        // Add scroll progress indicator for slide 4
        const scrollProgress = document.createElement('div');
        scrollProgress.className = 'scroll-progress';
        scrollProgress.style.cssText = `
            position: absolute;
            bottom: 140px;
            right: 20px;
            width: 4px;
            height: 100px;
            background: var(--color-secondary);
            border-radius: 2px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const scrollThumb = document.createElement('div');
        scrollThumb.className = 'scroll-thumb';
        scrollThumb.style.cssText = `
            width: 100%;
            background: var(--color-primary);
            border-radius: 2px;
            transition: height 0.1s ease;
        `;
        
        scrollProgress.appendChild(scrollThumb);
        document.querySelector('.slide[data-slide="4"]').appendChild(scrollProgress);
        
        // Update scroll progress
        scrollableContent.addEventListener('scroll', function() {
            if (currentSlide === 4) {
                const scrollTop = this.scrollTop;
                const scrollHeight = this.scrollHeight - this.clientHeight;
                const progress = scrollTop / scrollHeight;
                
                scrollThumb.style.height = Math.max(10, progress * 100) + '%';
                scrollProgress.style.opacity = scrollHeight > 0 ? '1' : '0';
            }
        });
    }
});

// Performance optimization: preload content
function preloadSlideContent() {
    // Preload images and content for better performance
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        const images = slide.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
    });
}

// Initialize preloading
document.addEventListener('DOMContentLoaded', preloadSlideContent);

// Presentation mode detection
function isPresentationMode() {
    return document.fullscreenElement !== null;
}

// Export API for external use
window.presentationAPI = {
    nextSlide,
    previousSlide,
    goToSlide,
    getCurrentSlide: () => currentSlide,
    getTotalSlides: () => totalSlides,
    getProgress,
    enterFullscreen,
    exitFullscreen,
    startAutoAdvance,
    stopAutoAdvance,
    isPresentationMode
};

// Debug mode (can be enabled via console)
window.debugPresentation = function() {
    console.log('Presentation Debug Info:', {
        currentSlide,
        totalSlides,
        progress: getProgress(),
        isFullscreen: isPresentationMode(),
        autoAdvanceActive: autoAdvanceTimer !== null
    });
};

// Initialize presentation on load
document.addEventListener('DOMContentLoaded', function() {
    // Add a subtle fade-in effect on load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // Focus management for better keyboard navigation
    const firstSlide = document.querySelector('.slide.active');
    if (firstSlide) {
        firstSlide.focus();
    }
});

// Error handling
window.addEventListener('error', function(event) {
    console.error('Presentation error:', event.error);
    // Graceful degradation - ensure navigation still works
    if (typeof nextSlide !== 'function') {
        window.location.reload();
    }
});

// Performance monitoring (development only)
if (window.performance && window.performance.mark) {
    document.addEventListener('DOMContentLoaded', function() {
        performance.mark('presentation-loaded');
    });
    
    // Measure slide transition performance
    const originalUpdateSlideVisibility = updateSlideVisibility;
    updateSlideVisibility = function() {
        performance.mark('slide-transition-start');
        originalUpdateSlideVisibility();
        setTimeout(() => {
            performance.mark('slide-transition-end');
            performance.measure('slide-transition', 'slide-transition-start', 'slide-transition-end');
        }, 300);
    };
}