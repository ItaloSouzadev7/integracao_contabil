// Tab Navigation Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons and panels
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    // Function to switch tabs
    function switchTab(targetTab) {
        // Remove active class from all buttons
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Remove active class from all panels
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Add active class to clicked button
        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Show corresponding panel
        const activePanel = document.getElementById(targetTab);
        if (activePanel) {
            activePanel.classList.add('active');
        }
        
        // Scroll to top of content for better UX
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // Debug logging
        console.log(`Switched to tab: ${targetTab}`);
        console.log(`Active button:`, activeButton);
        console.log(`Active panel:`, activePanel);
    }
    
    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetTab = this.getAttribute('data-tab');
            console.log(`Button clicked for tab: ${targetTab}`);
            switchTab(targetTab);
            
            // Update URL hash without triggering page reload
            if (history.replaceState) {
                history.replaceState(null, null, `#${targetTab}`);
            }
        });
        
        // Also handle Enter key for accessibility
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Handle initial state and URL hash navigation
    function initializeTabs() {
        // Check if there's a hash in URL
        const hash = window.location.hash.substring(1);
        const validTabs = ['overview', 'comparison', 'features', 'extract-analysis', 'conclusions'];
        
        if (hash && validTabs.includes(hash)) {
            switchTab(hash);
        } else {
            // Default to overview tab
            switchTab('overview');
        }
    }
    
    // Initialize tabs on page load
    initializeTabs();
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', function() {
        initializeTabs();
    });
    
    // Keyboard navigation for accessibility
    tabButtons.forEach((button, index) => {
        button.addEventListener('keydown', function(e) {
            let targetIndex = index;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    targetIndex = index > 0 ? index - 1 : tabButtons.length - 1;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    targetIndex = index < tabButtons.length - 1 ? index + 1 : 0;
                    break;
                case 'Home':
                    e.preventDefault();
                    targetIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    targetIndex = tabButtons.length - 1;
                    break;
                default:
                    return;
            }
            
            tabButtons[targetIndex].focus();
            tabButtons[targetIndex].click();
        });
    });
    
    // Add smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Enhanced table responsiveness
    const tables = document.querySelectorAll('.comparison-table');
    tables.forEach(table => {
        const container = table.parentElement;
        
        function checkTableOverflow() {
            if (table.scrollWidth > container.clientWidth) {
                container.setAttribute('data-overflow', 'true');
                // Add scroll indicator styles
                container.style.position = 'relative';
            } else {
                container.removeAttribute('data-overflow');
            }
        }
        
        // Check on load and resize
        checkTableOverflow();
        window.addEventListener('resize', checkTableOverflow);
    });
    
    // Add visual feedback for interactive elements
    const interactiveElements = document.querySelectorAll('.feature-card, .solution-card, .scenario-card, .analysis-card, .conclusion-card');
    
    interactiveElements.forEach(element => {
        // Add subtle animation on hover for touch devices
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
        });
        
        // Mouse events for desktop
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Lazy loading animation for cards (simple fade-in effect)
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    cardObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe cards for animation
        const animatedCards = document.querySelectorAll('.feature-card, .analysis-card, .conclusion-card, .scenario-card');
        animatedCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            cardObserver.observe(card);
        });
    }
    
    // Performance optimization: debounce resize events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Optimized resize handler
    const debouncedResize = debounce(() => {
        // Recalculate any size-dependent elements
        tables.forEach(table => {
            const container = table.parentElement;
            if (table.scrollWidth > container.clientWidth) {
                container.setAttribute('data-overflow', 'true');
            } else {
                container.removeAttribute('data-overflow');
            }
        });
    }, 250);
    
    window.addEventListener('resize', debouncedResize);
    
    // Error handling and debugging
    function validateTabSetup() {
        console.log(`Found ${tabButtons.length} tab buttons`);
        console.log(`Found ${tabPanels.length} tab panels`);
        
        tabButtons.forEach((btn, index) => {
            const tabId = btn.getAttribute('data-tab');
            const panel = document.getElementById(tabId);
            console.log(`Tab ${index}: ${tabId} -> Panel exists: ${!!panel}`);
        });
        
        if (tabButtons.length === 0) {
            console.error('No tab buttons found');
        }
        
        if (tabPanels.length === 0) {
            console.error('No tab panels found');
        }
        
        if (tabButtons.length !== tabPanels.length) {
            console.warn('Mismatch between number of tab buttons and panels');
        }
    }
    
    // Run validation
    validateTabSetup();
    
    // Focus management for better accessibility
    let focusTrap = null;
    
    function createFocusTrap(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return null;
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        return {
            activate: () => {
                element.addEventListener('keydown', trapFocus);
            },
            deactivate: () => {
                element.removeEventListener('keydown', trapFocus);
            }
        };
        
        function trapFocus(e) {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    }
    
    // Console log for successful initialization
    console.log('Ottimizza vs Visão Lógica - Comparison App initialized successfully');
    
    // Force initial tab display (fallback)
    setTimeout(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const targetTab = activeTab.getAttribute('data-tab');
            switchTab(targetTab);
        }
    }, 100);
});