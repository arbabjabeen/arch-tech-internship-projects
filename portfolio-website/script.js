/* ===============================================
   Arbab Jabeen — Personal Portfolio Website
   script.js — Interactive Enhancements
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==================== NAVBAR SCROLL SHADOW ====================
    const navbar = document.getElementById('navbar');

    /**
     * Adds a 'scrolled' class to the navbar when the page is scrolled
     * past 50px to apply a subtle box-shadow.
     */
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll);

    // ==================== MOBILE HAMBURGER MENU ====================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    /**
     * Toggles the mobile navigation menu open/closed
     * and animates the hamburger icon to an X.
     */
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    }

    hamburger.addEventListener('click', toggleMobileMenu);

    // Close menu when a nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    // ==================== SMOOTH SCROLL NAVIGATION ====================
    /**
     * Smooth scrolls to the target section when a nav link is clicked.
     * Uses native scrollIntoView for smooth behavior.
     */
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Also handle CTA buttons and logo click
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            // Skip if already handled by navLinks
            if (anchor.classList.contains('nav-link')) return;

            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ==================== ACTIVE NAV LINK ON SCROLL ====================
    const sections = document.querySelectorAll('section[id]');

    /**
     * Uses IntersectionObserver to highlight the active nav link
     * based on which section is currently visible in the viewport.
     */
    const sectionObserverOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // ==================== SCROLL REVEAL ANIMATION ====================
    const revealElements = document.querySelectorAll('.reveal');

    /**
     * Uses IntersectionObserver to add an 'active' class to elements
     * with the 'reveal' class when they enter the viewport,
     * triggering a CSS fade-in + slide-up animation.
     */
    const revealObserverOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a small stagger delay for grouped elements
                const siblings = entry.target.parentElement.querySelectorAll('.reveal');
                let delay = 0;
                siblings.forEach(sibling => {
                    if (sibling === entry.target) {
                        entry.target.style.transitionDelay = `${delay * 0.1}s`;
                    }
                    delay++;
                });

                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // ==================== CONTACT FORM VALIDATION ====================
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    /**
     * Validates a single form field. Returns true if valid, false otherwise.
     * Displays an inline error message under the field.
     * @param {HTMLElement} field - The input or textarea element
     * @param {string} errorId - The ID of the error message span
     * @param {string} fieldName - Display name for the field
     * @returns {boolean}
     */
    function validateField(field, errorId, fieldName) {
        const errorEl = document.getElementById(errorId);
        const value = field.value.trim();

        // Clear previous error
        field.classList.remove('error');
        errorEl.textContent = '';

        // Check empty
        if (!value) {
            field.classList.add('error');
            errorEl.textContent = `${fieldName} is required.`;
            return false;
        }

        // Email validation
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.classList.add('error');
                errorEl.textContent = 'Please enter a valid email address.';
                return false;
            }
        }

        // Minimum length for message
        if (field.name === 'message' && value.length < 10) {
            field.classList.add('error');
            errorEl.textContent = 'Message must be at least 10 characters.';
            return false;
        }

        return true;
    }

    /**
     * Handles form submission. Validates all fields, prevents default
     * submission, and shows a success message on valid input.
     */
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const subjectField = document.getElementById('subject');
        const messageField = document.getElementById('message');

        // Validate all fields
        const isNameValid = validateField(nameField, 'name-error', 'Name');
        const isEmailValid = validateField(emailField, 'email-error', 'Email');
        const isSubjectValid = validateField(subjectField, 'subject-error', 'Subject');
        const isMessageValid = validateField(messageField, 'message-error', 'Message');

        if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
            // Show success message
            formSuccess.classList.add('show');
            contactForm.reset();

            // Clear all error states
            [nameField, emailField, subjectField, messageField].forEach(f => {
                f.classList.remove('error');
            });

            // Hide success message after 5 seconds
            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 5000);
        }
    });

    // Real-time validation: clear error when user starts typing
    const formFields = contactForm.querySelectorAll('input, textarea');
    formFields.forEach(field => {
        field.addEventListener('input', () => {
            const errorEl = document.getElementById(`${field.name}-error`);
            if (errorEl) {
                field.classList.remove('error');
                errorEl.textContent = '';
            }
        });
    });

});
