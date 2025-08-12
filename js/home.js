/**
 * JavaScript for the Home page features
 */

document.addEventListener('DOMContentLoaded', function() {
    // Testimonial slider functionality
    function initTestimonialSlider() {
        const testimonialSlides = document.querySelectorAll('.testimonial-slide');
        const dots = document.querySelectorAll('.testimonial-dots .dot');
        let currentSlide = 0;
        let interval;
        
        // Show a specific slide
        function showSlide(index) {
            // Hide all slides
            testimonialSlides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Remove active class from all dots
            dots.forEach(dot => {
                dot.classList.remove('active');
            });
            
            // Show the selected slide and dot
            testimonialSlides[index].classList.add('active');
            dots[index].classList.add('active');
            
            currentSlide = index;
        }
        
        // Auto-rotate testimonials
        function startAutoRotate() {
            interval = setInterval(() => {
                const nextSlide = (currentSlide + 1) % testimonialSlides.length;
                showSlide(nextSlide);
            }, 5000); // Change slide every 5 seconds
        }
        
        // Add click event to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
                clearInterval(interval); // Reset interval when manually changing slide
                startAutoRotate();
            });
        });
        
        // Start auto-rotation
        if (testimonialSlides.length > 0) {
            startAutoRotate();
        }
    }
    
    // Animate statistics on scroll
    function initStatsAnimation() {
        const stats = document.querySelectorAll('.stat-number');
        
        function animateStats() {
            stats.forEach(stat => {
                const rect = stat.getBoundingClientRect();
                const isVisible = (
                    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.bottom >= 0
                );
                
                if (isVisible && !stat.classList.contains('animated')) {
                    const target = parseInt(stat.textContent.replace(/\D/g, ''), 10);
                    let count = 0;
                    const duration = 2000; // 2 seconds
                    const increment = Math.ceil(target / (duration / 16)); // 60fps
                    const plusSign = stat.textContent.includes('+');
                    
                    stat.classList.add('animated');
                    
                    const animate = () => {
                        count += increment;
                        if (count >= target) {
                            count = target;
                            stat.textContent = plusSign ? `${count}+` : count;
                        } else {
                            stat.textContent = plusSign ? `${count}+` : count;
                            requestAnimationFrame(animate);
                        }
                    };
                    
                    animate();
                }
            });
        }
        
        // Add scroll event listener
        window.addEventListener('scroll', animateStats);
        
        // Initial check
        animateStats();
    }
    
    // Parallax effect for hero section
    function initParallaxEffect() {
        const hero = document.querySelector('.hero');
        
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            
            if (scrollPosition < window.innerHeight) {
                // Move background slightly for parallax effect
                hero.style.backgroundPosition = `center ${50 + (scrollPosition * 0.1)}%`;
            }
        });
    }
    
    // Hero banner slider functionality
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const hero = document.querySelector('.hero');
        let currentSlide = 0;
        let interval;
        let startX = 0;  // ADD THIS for touch support
        let startY = 0;  // ADD THIS for touch support

        function showSlide(index) {
            // Remove active and prev classes from all slides
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'prev');
                if (i === index) {
                    slide.classList.add('active');
                } else if (i === (index - 1 + slides.length) % slides.length) {
                    slide.classList.add('prev');
                }
            });

            currentSlide = index;
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        }

        // ADD THIS FUNCTION for previous slide
        function prevSlide() {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prevIndex);
        }

        function startAutoSlide() {
            interval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
        }

        // Initialize first slide
        if (slides.length > 0) {
            showSlide(0);
            startAutoSlide();
        }

        // Pause on hover over hero section
        if (hero) {
            hero.addEventListener('mouseenter', () => {
                clearInterval(interval);
            });

            hero.addEventListener('mouseleave', () => {
                startAutoSlide();
            });

            // ADD TOUCH/SWIPE SUPPORT FOR MOBILE
            hero.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                clearInterval(interval); // Pause auto-slide during touch
            });

            hero.addEventListener('touchend', (e) => {
                if (!startX || !startY) return;

                let endX = e.changedTouches[0].clientX;
                let endY = e.changedTouches[0].clientY;

                let diffX = startX - endX;
                let diffY = startY - endY;

                // Check if horizontal swipe is more significant than vertical
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (Math.abs(diffX) > 50) { // Minimum swipe distance
                        if (diffX > 0) {
                            nextSlide(); // Swipe left - next slide
                        } else {
                            prevSlide(); // Swipe right - previous slide
                        }
                    }
                }

                startX = 0;
                startY = 0;
                startAutoSlide(); // Resume auto-slide after touch
            });
        }
    }
    
    // Add dynamic effects to buttons and elements
    function initDynamicEffects() {
        // Add hover effects to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-15px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Add floating animation to floating buttons on mobile
        const floatingButtons = document.querySelectorAll('.float-btn');
        floatingButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                btn.style.animation = 'none';
                setTimeout(() => {
                    btn.style.animation = `float 3s ease-in-out infinite`;
                    btn.style.animationDelay = `${index * 0.5}s`;
                }, 100);
            });
        });
        
        // Add scroll-based animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements for scroll animations
        const animateElements = document.querySelectorAll('.feature-card, .testimonial-slide, .about-text');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }
    
    // Initialize home page functions
    if (document.querySelector('.testimonial-slide')) {
        initTestimonialSlider();
    }
    
    if (document.querySelector('.stat-number')) {
        initStatsAnimation();
    }
    
    if (document.querySelector('.hero')) {
        initParallaxEffect();
    }
    
    if (document.querySelector('.hero-slider')) {
        initHeroSlider();
    }
    
    // Initialize dynamic effects
    initDynamicEffects();
});