class PresentationController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 7;
        this.slidesWrapper = document.getElementById('slidesWrapper');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.slideIndicators = document.getElementById('slideIndicators');
        
        this.init();
    }

    init() {
        this.createIndicators();
        this.bindEvents();
        this.updateSlide();
        this.updateNavButtons();
    }

    createIndicators() {
        for (let i = 1; i <= this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (i === 1) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(i));
            this.slideIndicators.appendChild(indicator);
        }
    }

    bindEvents() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
            }
        });

        // Touch/swipe support for mobile
        let startX = null;
        let startY = null;

        this.slidesWrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        this.slidesWrapper.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) { // Minimum swipe distance
                    if (diffX > 0) {
                        // Swipe left - next slide
                        this.nextSlide();
                    } else {
                        // Swipe right - previous slide
                        this.previousSlide();
                    }
                }
            }

            startX = null;
            startY = null;
        });
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.currentSlide++;
            this.updateSlide();
            this.updateNavButtons();
            this.updateIndicators();
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.currentSlide--;
            this.updateSlide();
            this.updateNavButtons();
            this.updateIndicators();
        }
    }

    goToSlide(slideNumber) {
        if (slideNumber >= 1 && slideNumber <= this.totalSlides && slideNumber !== this.currentSlide) {
            this.currentSlide = slideNumber;
            this.updateSlide();
            this.updateNavButtons();
            this.updateIndicators();
        }
    }

    updateSlide() {
        const slides = document.querySelectorAll('.slide');
        
        slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            slide.classList.remove('active', 'prev');
            
            if (slideNumber === this.currentSlide) {
                slide.classList.add('active');
            } else if (slideNumber < this.currentSlide) {
                slide.classList.add('prev');
            }
        });

        // Scroll to top of slide content when switching
        const activeSlide = document.querySelector('.slide.active .slide-content');
        if (activeSlide) {
            activeSlide.scrollTop = 0;
        }
    }

    updateNavButtons() {
        this.prevBtn.disabled = this.currentSlide === 1;
        this.nextBtn.disabled = this.currentSlide === this.totalSlides;
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.remove('active');
            if (index + 1 === this.currentSlide) {
                indicator.classList.add('active');
            }
        });
    }

    // Public method to get current slide info
    getCurrentSlideInfo() {
        return {
            current: this.currentSlide,
            total: this.totalSlides,
            isFirst: this.currentSlide === 1,
            isLast: this.currentSlide === this.totalSlides
        };
    }
}

// Enhanced accessibility features
class AccessibilityEnhancer {
    constructor(presentation) {
        this.presentation = presentation;
        this.init();
    }

    init() {
        this.addAriaLabels();
        this.addLiveRegion();
        this.enhanceKeyboardNavigation();
    }

    addAriaLabels() {
        // Add aria labels to navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.setAttribute('aria-label', 'Slide anterior');
        nextBtn.setAttribute('aria-label', 'Próximo slide');

        // Add aria labels to slides
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            slide.setAttribute('aria-label', `Slide ${index + 1} de ${slides.length}`);
            slide.setAttribute('role', 'tabpanel');
        });

        // Add aria labels to indicators
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.setAttribute('aria-label', `Ir para slide ${index + 1}`);
            indicator.setAttribute('role', 'tab');
            indicator.setAttribute('tabindex', '0');
        });
    }

    addLiveRegion() {
        // Create a live region for screen readers
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.classList.add('sr-only');
        liveRegion.id = 'slide-announcer';
        document.body.appendChild(liveRegion);

        // Update live region when slide changes
        const originalUpdateSlide = this.presentation.updateSlide.bind(this.presentation);
        this.presentation.updateSlide = () => {
            originalUpdateSlide();
            this.announceSlideChange();
        };
    }

    announceSlideChange() {
        const liveRegion = document.getElementById('slide-announcer');
        const slideInfo = this.presentation.getCurrentSlideInfo();
        const activeSlide = document.querySelector('.slide.active');
        const slideTitle = activeSlide.querySelector('h1, h2');
        
        let announcement = `Slide ${slideInfo.current} de ${slideInfo.total}`;
        if (slideTitle) {
            announcement += `: ${slideTitle.textContent}`;
        }
        
        liveRegion.textContent = announcement;
    }

    enhanceKeyboardNavigation() {
        // Add keyboard support for indicators
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.presentation.goToSlide(index + 1);
                }
            });
        });
    }
}

// Smooth scroll enhancement for slide content
class ScrollEnhancer {
    constructor() {
        this.init();
    }

    init() {
        // Add smooth scrolling to slide content areas
        const slideContents = document.querySelectorAll('.slide-content');
        slideContents.forEach(content => {
            content.style.scrollBehavior = 'smooth';
        });

        // Add custom scrollbar styling for webkit browsers
        this.addCustomScrollbar();
    }

    addCustomScrollbar() {
        const style = document.createElement('style');
        style.textContent = `
            .slide-content::-webkit-scrollbar {
                width: 8px;
            }
            
            .slide-content::-webkit-scrollbar-track {
                background: var(--color-secondary);
                border-radius: var(--radius-sm);
            }
            
            .slide-content::-webkit-scrollbar-thumb {
                background: var(--color-primary);
                border-radius: var(--radius-sm);
            }
            
            .slide-content::-webkit-scrollbar-thumb:hover {
                background: var(--color-primary-hover);
            }
        `;
        document.head.appendChild(style);
    }
}

// Performance optimization
class PerformanceOptimizer {
    constructor(presentation) {
        this.presentation = presentation;
        this.init();
    }

    init() {
        this.preloadSlides();
        this.optimizeTransitions();
    }

    preloadSlides() {
        // Force browser to render all slides for smoother transitions
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
            slide.style.willChange = 'transform, opacity';
        });
    }

    optimizeTransitions() {
        // Use requestAnimationFrame for smoother animations
        const originalUpdateSlide = this.presentation.updateSlide.bind(this.presentation);
        this.presentation.updateSlide = () => {
            requestAnimationFrame(originalUpdateSlide);
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create main presentation controller
    const presentation = new PresentationController();
    
    // Enhance with accessibility features
    new AccessibilityEnhancer(presentation);
    
    // Add scroll enhancements
    new ScrollEnhancer();
    
    // Optimize performance
    new PerformanceOptimizer(presentation);

    // Add loading state management
    document.body.classList.add('presentation-loaded');
    
    // Focus management for better UX
    const firstSlide = document.querySelector('.slide.active');
    if (firstSlide) {
        firstSlide.focus();
    }

    // Add error handling for missing elements
    try {
        const requiredElements = ['slidesWrapper', 'prevBtn', 'nextBtn', 'slideIndicators'];
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                throw new Error(`Required element '${id}' not found`);
            }
        });
    } catch (error) {
        console.error('Presentation initialization error:', error);
    }
});