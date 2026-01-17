/**
 * Brunstad Rør Service AS - Main JavaScript
 * VVS-tjenester i Jevnaker og Hadeland
 */

(function() {
    'use strict';

    // ===========================================
    // MOBILE NAVIGATION
    // ===========================================
    const initMobileNav = () => {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        const header = document.getElementById('header');

        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.contains('is-open');

            navMenu.classList.toggle('is-open');
            navToggle.classList.toggle('is-active');
            navToggle.setAttribute('aria-expanded', !isOpen);

            // Prevent body scroll when menu is open
            document.body.classList.toggle('nav-open', !isOpen);
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-open');
                navToggle.classList.remove('is-active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('is-open');
                navToggle.classList.remove('is-active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-open');
            }
        });
    };

    // ===========================================
    // STICKY HEADER
    // ===========================================
    const initStickyHeader = () => {
        const header = document.getElementById('header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add scrolled class when scrolling down
            if (currentScroll > scrollThreshold) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }

            // Hide/show header based on scroll direction
            if (currentScroll > lastScroll && currentScroll > 200) {
                header.classList.add('is-hidden');
            } else {
                header.classList.remove('is-hidden');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    };

    // ===========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ===========================================
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Skip if it's just "#" or empty
                if (href === '#' || href === '') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();

                    const headerHeight = document.getElementById('header')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    };

    // ===========================================
    // CONTACT FORM HANDLING
    // ===========================================
    const initContactForm = () => {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Honeypot check
            const honeypot = form.querySelector('input[name="website"]');
            if (honeypot && honeypot.value !== '') {
                console.log('Bot detected');
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32"/>
                </svg>
                Sender...
            `;

            // Simulate form submission (replace with actual endpoint)
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Success message
                showFormMessage(form, 'success', 'Takk for din henvendelse! Vi tar kontakt med deg snart.');
                form.reset();

            } catch (error) {
                // Error message
                showFormMessage(form, 'error', 'Beklager, noe gikk galt. Vennligst prøv igjen eller ring oss direkte.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('is-invalid')) {
                    validateField(input);
                }
            });
        });
    };

    const validateField = (field) => {
        const isValid = field.checkValidity();
        field.classList.toggle('is-invalid', !isValid);
        field.classList.toggle('is-valid', isValid);
        return isValid;
    };

    const showFormMessage = (form, type, message) => {
        // Remove existing messages
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `form-message form-message--${type}`;
        messageEl.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success'
                    ? '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                    : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
                }
            </svg>
            <span>${message}</span>
        `;

        form.insertBefore(messageEl, form.firstChild);

        // Auto-remove success message
        if (type === 'success') {
            setTimeout(() => {
                messageEl.classList.add('fade-out');
                setTimeout(() => messageEl.remove(), 300);
            }, 5000);
        }
    };

    // ===========================================
    // PHONE NUMBER FORMATTING
    // ===========================================
    const initPhoneFormatting = () => {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');

        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');

                // Format as XXX XX XXX for Norwegian numbers
                if (value.length > 3 && value.length <= 5) {
                    value = value.slice(0, 3) + ' ' + value.slice(3);
                } else if (value.length > 5) {
                    value = value.slice(0, 3) + ' ' + value.slice(3, 5) + ' ' + value.slice(5, 8);
                }

                e.target.value = value;
            });
        });
    };

    // ===========================================
    // EMERGENCY CARDS TOGGLE
    // ===========================================
    const initEmergencyCards = () => {
        const emergencyCards = document.querySelectorAll('.emergency-card');

        emergencyCards.forEach(card => {
            card.addEventListener('click', () => {
                // Close other open cards
                emergencyCards.forEach(c => {
                    if (c !== card) {
                        c.classList.remove('is-expanded');
                    }
                });

                // Toggle current card
                card.classList.toggle('is-expanded');
            });
        });
    };

    // ===========================================
    // SCROLL ANIMATIONS
    // ===========================================
    const initScrollAnimations = () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Elements to animate
        const animatedElements = document.querySelectorAll(
            '.service-card, .pricing-card, .info-card, .feature-item, .emergency-card, .area-card, .project-type'
        );

        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    };

    // ===========================================
    // COUNTER ANIMATION
    // ===========================================
    const initCounterAnimation = () => {
        const counters = document.querySelectorAll('.stat-number, .response-info__number');

        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.textContent);

                    if (isNaN(target)) return;

                    animateCounter(counter, target);
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(counter => observer.observe(counter));
    };

    const animateCounter = (element, target) => {
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(updateCounter);
    };

    // ===========================================
    // MOBILE CTA VISIBILITY
    // ===========================================
    const initMobileCTA = () => {
        const mobileCTA = document.querySelector('.mobile-cta');
        if (!mobileCTA) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Show CTA after scrolling down a bit
            if (currentScroll > 300) {
                mobileCTA.classList.add('is-visible');
            } else {
                mobileCTA.classList.remove('is-visible');
            }

            // Hide when scrolling up quickly
            if (currentScroll < lastScroll - 50 && currentScroll > 500) {
                mobileCTA.classList.add('is-hidden');
            } else {
                mobileCTA.classList.remove('is-hidden');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    };

    // ===========================================
    // LAZY LOADING FOR IMAGES
    // ===========================================
    const initLazyLoading = () => {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.loading = 'lazy';
            });
        } else {
            // Fallback with Intersection Observer
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => imageObserver.observe(img));
        }
    };

    // ===========================================
    // ACCESSIBILITY IMPROVEMENTS
    // ===========================================
    const initAccessibility = () => {
        // Skip to main content
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.tabIndex = -1;
                    main.focus();
                }
            });
        }

        // Escape key closes mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const navMenu = document.getElementById('navMenu');
                const navToggle = document.getElementById('navToggle');

                if (navMenu?.classList.contains('is-open')) {
                    navMenu.classList.remove('is-open');
                    navToggle?.classList.remove('is-active');
                    navToggle?.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('nav-open');
                    navToggle?.focus();
                }
            }
        });

        // Reduce motion for users who prefer it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('reduce-motion');
        }
    };

    // ===========================================
    // SERVICE WORKER REGISTRATION (for PWA)
    // ===========================================
    const initServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered:', registration.scope);
                    })
                    .catch(error => {
                        console.log('SW registration failed:', error);
                    });
            });
        }
    };

    // ===========================================
    // CLICK TO CALL TRACKING
    // ===========================================
    const initClickTracking = () => {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

        phoneLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Track phone call clicks (integrate with analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        'event_category': 'Contact',
                        'event_label': 'Phone Call',
                        'value': link.href
                    });
                }

                console.log('Phone call initiated:', link.href);
            });
        });

        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

        emailLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        'event_category': 'Contact',
                        'event_label': 'Email',
                        'value': link.href
                    });
                }

                console.log('Email link clicked:', link.href);
            });
        });
    };

    // ===========================================
    // INITIALIZE ALL FUNCTIONS
    // ===========================================
    const init = () => {
        initMobileNav();
        initStickyHeader();
        initSmoothScroll();
        initContactForm();
        initPhoneFormatting();
        initEmergencyCards();
        initScrollAnimations();
        initCounterAnimation();
        initMobileCTA();
        initLazyLoading();
        initAccessibility();
        initClickTracking();
        // initServiceWorker(); // Uncomment when SW is ready
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
