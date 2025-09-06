// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting presentation initialization...');
    
    // Presentation state
    let currentSlide = 1;
    const totalSlides = 8;
    
    // Get DOM elements
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideSpan = document.getElementById('currentSlide');
    const totalSlidesSpan = document.getElementById('totalSlides');
    
    console.log('DOM elements found:', {
        slides: slides.length,
        indicators: indicators.length,
        prevBtn: !!prevBtn,
        nextBtn: !!nextBtn,
        currentSlideSpan: !!currentSlideSpan,
        totalSlidesSpan: !!totalSlidesSpan
    });
    
    // Function to update slide display
    function updateSlideDisplay() {
        // Remove active class from all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Add active class to current slide
        if (slides[currentSlide - 1]) {
            slides[currentSlide - 1].classList.add('active');
        }
        
        console.log('Updated to slide:', currentSlide);
    }
    
    // Function to update indicators
    function updateIndicators() {
        indicators.forEach((indicator, index) => {
            if (index + 1 === currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Function to update slide counter
    function updateSlideCounter() {
        if (currentSlideSpan) {
            currentSlideSpan.textContent = currentSlide;
        }
        if (totalSlidesSpan) {
            totalSlidesSpan.textContent = totalSlides;
        }
    }
    
    // Function to update navigation buttons
    function updateNavigationButtons() {
        if (prevBtn) {
            prevBtn.disabled = (currentSlide === 1);
        }
        if (nextBtn) {
            nextBtn.disabled = (currentSlide === totalSlides);
        }
    }
    
    // Function to go to specific slide
    function goToSlide(slideNumber) {
        if (slideNumber < 1 || slideNumber > totalSlides || slideNumber === currentSlide) {
            return;
        }
        
        console.log('Going to slide:', slideNumber);
        currentSlide = slideNumber;
        
        updateSlideDisplay();
        updateIndicators();
        updateSlideCounter();
        updateNavigationButtons();
        
        // Dispatch custom event
        const event = new CustomEvent('slideChanged', {
            detail: { currentSlide, totalSlides }
        });
        document.dispatchEvent(event);
    }
    
    // Function to go to next slide
    function nextSlide() {
        console.log('Next slide clicked, current:', currentSlide);
        if (currentSlide < totalSlides) {
            goToSlide(currentSlide + 1);
        }
    }
    
    // Function to go to previous slide
    function previousSlide() {
        console.log('Previous slide clicked, current:', currentSlide);
        if (currentSlide > 1) {
            goToSlide(currentSlide - 1);
        }
    }
    
    // Set up navigation button event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Previous button clicked');
            previousSlide();
        });
        console.log('Previous button event listener added');
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Next button clicked');
            nextSlide();
        });
        console.log('Next button event listener added');
    }
    
    // Set up indicator event listeners
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Indicator clicked:', index + 1);
            goToSlide(index + 1);
        });
    });
    console.log('Indicator event listeners added');
    
    // Set up keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Don't handle if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                previousSlide();
                break;
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ': // Spacebar
                e.preventDefault();
                nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides);
                break;
        }
    });
    console.log('Keyboard navigation added');
    
    // Set up touch/swipe navigation
    let startX = 0;
    let startY = 0;
    
    const slidesContainer = document.querySelector('.slides-container');
    
    if (slidesContainer) {
        slidesContainer.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        slidesContainer.addEventListener('touchend', function(e) {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Only handle horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe right - previous slide
                    previousSlide();
                } else {
                    // Swipe left - next slide
                    nextSlide();
                }
            }
        }, { passive: true });
        
        console.log('Touch navigation added');
    }
    
    // Initialize the presentation
    function initializePresentation() {
        updateSlideDisplay();
        updateIndicators();
        updateSlideCounter();
        updateNavigationButtons();
        console.log('Presentation initialized successfully');
    }
    
    // Prevent right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Prevent text selection
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            // Force reflow
            activeSlide.style.display = 'none';
            activeSlide.offsetHeight;
            activeSlide.style.display = '';
        }
    });
    
    // Initialize the presentation
    initializePresentation();
    
    // Make functions globally available for debugging
    window.presentationControls = {
        goToSlide: goToSlide,
        nextSlide: nextSlide,
        previousSlide: previousSlide,
        getCurrentSlide: () => currentSlide,
        getTotalSlides: () => totalSlides,
        debug: () => {
            console.log('Current slide:', currentSlide);
            console.log('Total slides:', totalSlides);
            console.log('Active slide element:', document.querySelector('.slide.active'));
            console.log('Navigation buttons:', { prevBtn: !!prevBtn, nextBtn: !!nextBtn });
            console.log('Indicators:', indicators.length);
        }
    };
    
    console.log('Presentation setup complete. Use window.presentationControls.debug() for debugging.');
});