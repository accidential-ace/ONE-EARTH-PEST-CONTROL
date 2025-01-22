// Initialize EmailJS with your user ID
(function() {
    emailjs.init("m3r8Hchk_opXrZcw9"); 
    console.log("EmailJS initialized");
})();

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) {
        console.error('Contact form not found!');
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log('Form submitted');
        
        // Show loading state
        const submitButton = document.querySelector('.submit-btn');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            service: document.getElementById('service').value,
            message: document.getElementById('message').value
        };

        console.log('Sending email with data:', formData);

        // Send email using EmailJS
        emailjs.send('one_earth', 'template_9wpf0af', {
            from_name: formData.name,
            from_email: formData.email,
            phone_number: formData.phone,
            service_required: formData.service,
            message: formData.message
        })
        .then(function(response) {
            console.log('Email sent successfully:', response);
            // Show success message
            showNotification('Thank you! Your message has been sent successfully.', 'success');
            
            // Reset form
            form.reset();
        })
        .catch(function(error) {
            console.error('EmailJS Error:', error);
            // Show error message
            showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
        })
        .finally(function() {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });
});

// Notification system
function showNotification(message, type) {
    console.log(`Showing ${type} notification:`, message);
    
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add notification to page
    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Form validation
function validateForm() {
    const form = document.getElementById('contactForm');
    if (!form) {
        console.error('Contact form not found for validation!');
        return;
    }
    
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                this.classList.remove('valid');
                if (this.hasAttribute('required')) {
                    this.classList.add('invalid');
                }
            }
        });
    });

    // Phone number validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            if (phoneRegex.test(this.value)) {
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                this.classList.remove('valid');
                this.classList.add('invalid');
            }
        });
    }

    // Email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(this.value)) {
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else {
                this.classList.remove('valid');
                this.classList.add('invalid');
            }
        });
    }
}

// Initialize form validation when DOM is loaded
document.addEventListener('DOMContentLoaded', validateForm);
