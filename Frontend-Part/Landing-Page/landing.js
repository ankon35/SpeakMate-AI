
// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navActions = document.querySelector('.nav-actions');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Hamburger Menu Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    navActions.classList.toggle('active');
});

// Smooth Scroll
document.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-scroll');
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }

        // Close mobile menu
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        navActions.classList.remove('active');
    });
});

// Step Cards Animation on Scroll
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 200);
        }
    });
}, observerOptions);

document.querySelectorAll('.step-card').forEach(card => {
    observer.observe(card);
});

// Testimonials Carousel
const testimonials = document.querySelectorAll('.testimonial');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currentIndex = 0;
let autoSlideInterval;
let isPaused = false;

function showTestimonial(index) {
    testimonials.forEach(testimonial => {
        testimonial.classList.remove('active');
    });
    testimonials[index].classList.add('active');
}

function nextTestimonial() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    showTestimonial(currentIndex);
}

function prevTestimonial() {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentIndex);
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        if (!isPaused) {
            nextTestimonial();
        }
    }, 5000);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

nextBtn.addEventListener('click', () => {
    nextTestimonial();
    resetAutoSlide();
});

prevBtn.addEventListener('click', () => {
    prevTestimonial();
    resetAutoSlide();
});

// Pause on hover
document.querySelector('.testimonials-wrapper').addEventListener('mouseenter', () => {
    isPaused = true;
});

document.querySelector('.testimonials-wrapper').addEventListener('mouseleave', () => {
    isPaused = false;
});

startAutoSlide();

// Stats Counter Animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');

            const statNumbers = entry.target.parentElement.querySelectorAll('.stat-number');
            statNumbers.forEach((stat, index) => {
                if (index === 0) {
                    animateNumber(stat, 10000, '+', 2000);
                } else if (index === 1) {
                    animateNumber(stat, 95, '%', 2000);
                }
            });
        }
    });
}, { threshold: 0.5 });

function animateNumber(element, target, suffix, duration) {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString() + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }
    }, 16);
}

document.querySelectorAll('.stat-card').forEach(card => {
    statsObserver.observe(card);
});

// Form Submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalContent = submitBtn.innerHTML;

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        submitBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';

        setTimeout(() => {
            contactForm.reset();
            submitBtn.innerHTML = originalContent;
            submitBtn.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
            submitBtn.disabled = false;
        }, 2500);
    }, 1500);
});

// Parallax Effect for Hero
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset;
            const heroContent = document.querySelector('.hero-content');
            const heroVisual = document.querySelector('.hero-visual');

            if (scrolled < window.innerHeight && heroContent && window.innerWidth > 768) {
                heroContent.style.transform = `translateY(${scrolled * 0.35}px)`;
                if (heroVisual) {
                    heroVisual.style.transform = `translateY(${scrolled * 0.25}px)`;
                }
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Add smooth page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Enhanced hover effects for buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
                    position: absolute;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: translate(-50%, -50%);
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
    });
});

document.getElementById("loginBtn").onclick = function () {
    window.location.href = "/Frontend-Part/Login-Page/login.html";
};

document.getElementById("signupBtn").onclick = function () {
    // Generate a unique token for the signup process
    const token = generateUniqueToken();

    // Construct the signup URL with the mode set to 'signup' and include the token
    const signupUrl = "/Frontend-Part/Login-Page/login.html?mode=signup&token=" + token;

    // Redirect to the login-signup page with the mode and token
    window.location.href = signupUrl;
};



// Function to generate a unique token for signup
function generateUniqueToken() {
    return 'signup-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}



// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.color = '';
        if (link.getAttribute('data-scroll') === current) {
            link.style.color = 'var(--primary)';
        }
    });
});
