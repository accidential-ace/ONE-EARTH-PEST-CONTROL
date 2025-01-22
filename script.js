// Use strict mode for better error catching and performance
'use strict';

// Performance optimization: Use event delegation and throttle/debounce
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const header = document.querySelector('header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    // Throttle function for performance
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Intersection Observer for lazy loading
    const lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
                lazyLoadObserver.unobserve(entry.target);
            }
        });
    });

    // Lazy load images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        lazyLoadObserver.observe(img);
    });

    // Mobile menu handling
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Smooth scroll handling with performance optimization
    document.addEventListener('click', throttle((e) => {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const id = e.target.getAttribute('href');
            if (id === '#') return;
            const element = document.querySelector(id);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }, 100));

    // Modal handling
    const modal = document.getElementById('callModal');
    const callForm = document.getElementById('callForm');
    const closeBtn = document.querySelector('.close-modal');
    const callFormContainer = document.getElementById('callFormContainer');
    const successMessage = document.getElementById('successMessage');

    function openModal() {
        if (modal) {
            callForm.reset();
            callFormContainer.style.display = 'block';
            successMessage.style.display = 'none';
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => modal.classList.add('show'));
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                modal.style.display = 'none';
                callFormContainer.style.display = 'block';
                successMessage.style.display = 'none';
            }, 300);
        }
    }

    // Event delegation for modal triggers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-toggle="modal"]');
        if (trigger) {
            e.preventDefault();
            openModal();
        }
    });

    // Close modal events
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form submission
    if (callForm) {
        callForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(callForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/call-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) throw new Error('Submission failed');

                callFormContainer.style.display = 'none';
                successMessage.style.display = 'block';
                successMessage.classList.add('show');
                callForm.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to submit form. Please try again.');
            }
        });
    }

    // Performance optimization for scroll events
    let lastScroll = 0;
    window.addEventListener('scroll', throttle(() => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        lastScroll = currentScroll;
    }, 100));

    // Server URL constant
    const SERVER_URL = 'http://localhost:3000';

    // Call button functionality
    const callBtns = document.querySelectorAll('.hero-cta, [data-toggle="modal"][data-target="#callModal"]');
    const modal = document.getElementById('callModal');
    const closeBtn = document.querySelector('.close-modal');
    const callForm = document.getElementById('callForm');
    const callFormContainer = document.getElementById('callFormContainer');
    const successMessage = document.getElementById('successMessage');

    function openModal() {
        if (modal) {
            // Reset form and show form container
            callForm.reset();
            callFormContainer.style.display = 'block';
            successMessage.style.display = 'none';
            
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => modal.classList.add('show'), 10);
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            setTimeout(() => {
                modal.style.display = 'none';
                // Reset to form view after modal is closed
                callFormContainer.style.display = 'block';
                successMessage.style.display = 'none';
            }, 300);
        }
    }

    // Show success message
    function showSuccessMessage() {
        callFormContainer.style.display = 'none';
        successMessage.style.display = 'block';
        successMessage.classList.add('show');
    }

    // Handle call buttons
    if (callBtns.length > 0) {
        callBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });
    }

    // Handle modal close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Handle success message close button
    const successCloseBtn = successMessage.querySelector('.close-btn');
    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Handle call form submission
    if (callForm) {
        callForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = callForm.querySelector('input[name="name"]');
            const phoneInput = callForm.querySelector('input[name="phone"]');
            
            if (!nameInput || !phoneInput) return;
            
            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();

            if (!name || !phone) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!validatePhoneNumber(phone)) {
                showNotification('Please enter a valid phone number', 'error');
                return;
            }

            try {
                const response = await fetch(`${SERVER_URL}/api/call-request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, phone })
                });

                if (!response.ok) {
                    throw new Error('Failed to submit call request');
                }
                
                showSuccessMessage();
                callForm.reset();
            } catch (error) {
                console.error('Call request error:', error);
                showNotification('Failed to submit request. Please try again later.', 'error');
            }
        });
    }

    // Newsletter form submission
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    if (newsletterForms.length > 0) {
        newsletterForms.forEach(form => {
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const emailInput = form.querySelector('input[type="email"]');
                if (!emailInput) return;
                
                const email = emailInput.value.trim();
                
                if (!email) {
                    showNotification('Please enter your email address', 'error');
                    return;
                }
                
                try {
                    const response = await fetch(`${SERVER_URL}/api/subscribe`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email })
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.message || 'Failed to subscribe');
                    }
                    
                    showNotification('Thank you for subscribing to our newsletter!', 'success');
                    emailInput.value = '';
                } catch (error) {
                    console.error('Newsletter subscription error:', error);
                    showNotification(error.message || 'Failed to subscribe. Please try again later.', 'error');
                }
            });
        });
    }

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            
            // Animate hamburger to X
            const spans = mobileMenuBtn.querySelectorAll('span');
            spans.forEach(span => span.classList.toggle('active'));
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav') && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                const spans = mobileMenuBtn.querySelectorAll('span');
                spans.forEach(span => span.classList.remove('active'));
            }
        });

        // Close mobile menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                const spans = mobileMenuBtn.querySelectorAll('span');
                spans.forEach(span => span.classList.remove('active'));
            });
        });
    }

    // Smooth scroll functionality
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // FAQ Functionality
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                question.addEventListener('click', () => {
                    const isOpen = item.classList.contains('active');
                    
                    // Close all other items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            if (otherAnswer) {
                                otherAnswer.style.maxHeight = null;
                            }
                        }
                    });
                    
                    // Toggle current item
                    item.classList.toggle('active');
                    if (!isOpen) {
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    } else {
                        answer.style.maxHeight = null;
                    }
                });
            }
        });
    }

    // Enhanced Testimonial Slider with fade effect
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial');
    const testimonialCount = testimonials.length;

    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.opacity = '0';
            testimonial.style.transform = 'translateX(50px)';
            
            setTimeout(() => {
                testimonial.style.display = i === index ? 'block' : 'none';
                if (i === index) {
                    setTimeout(() => {
                        testimonial.style.opacity = '1';
                        testimonial.style.transform = 'translateX(0)';
                    }, 50);
                }
            }, 400);
        });
    }

    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonialCount;
        showTestimonial(currentTestimonial);
    }

    // Auto-advance testimonials every 5 seconds
    setInterval(nextTestimonial, 5000);

    // Testimonial Slider
    const testimonialContainer = document.querySelector('.testimonial-container');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const prevButton = document.querySelector('.prev-testimonial');
    const nextButton = document.querySelector('.next-testimonial');
    const dotsContainer = document.querySelector('.testimonial-dots');

    let currentTestimonialIndex = 0;

    // Create dots
    testimonialCards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showTestimonialIndex(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function showTestimonialIndex(index) {
        testimonialCards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        testimonialCards[index].classList.add('active');
        dots[index].classList.add('active');
        currentTestimonialIndex = index;
    }

    function nextTestimonialIndex() {
        currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonialCards.length;
        showTestimonialIndex(currentTestimonialIndex);
    }

    function prevTestimonialIndex() {
        currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonialCards.length) % testimonialCards.length;
        showTestimonialIndex(currentTestimonialIndex);
    }

    prevButton.addEventListener('click', prevTestimonialIndex);
    nextButton.addEventListener('click', nextTestimonialIndex);

    // Auto-advance testimonials
    let testimonialInterval = setInterval(nextTestimonialIndex, 5000);

    // Pause auto-advance on hover
    testimonialContainer.addEventListener('mouseenter', () => {
        clearInterval(testimonialInterval);
    });

    testimonialContainer.addEventListener('mouseleave', () => {
        testimonialInterval = setInterval(nextTestimonialIndex, 5000);
    });

    // Animate solution cards on scroll with intersection observer
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    document.querySelectorAll('.solution-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(card);
    });
});

// Utility functions
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on notification type
    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    notification.appendChild(icon);
    
    const text = document.createElement('span');
    text.textContent = message;
    notification.appendChild(text);
    
    // Add progress bar
    const progress = document.createElement('div');
    progress.className = 'notification-progress';
    notification.appendChild(progress);
    
    document.body.appendChild(notification);
    
    // Start animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
        progress.style.width = '0%';
    });
    
    // Remove notification after animation
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function validatePhoneNumber(phone) {
    // Allow digits, spaces, hyphens, plus sign, and parentheses
    const phoneRegex = /^[\d\s-+()]{10,}$/;
    return phoneRegex.test(phone);
}
