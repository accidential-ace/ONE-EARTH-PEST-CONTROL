// Create and manage crawling insects
class InsectAnimation {
    constructor() {
        this.insects = [];
        this.insectTypes = [
            { name: 'ant', emoji: '🐜', size: 20 },
            { name: 'spider', emoji: '🕷️', size: 24 },
            { name: 'beetle', emoji: '🪲', size: 24 },
            { name: 'cockroach', emoji: '🪳', size: 24 }
        ];
        this.container = document.createElement('div');
        this.container.id = 'insect-container';
        document.body.appendChild(this.container);
        
        this.init();
    }

    createInsect() {
        const insect = document.createElement('div');
        const type = this.insectTypes[Math.floor(Math.random() * this.insectTypes.length)];
        
        insect.className = 'crawling-insect';
        insect.textContent = type.emoji;
        insect.style.fontSize = `${type.size}px`;
        
        // Random starting position
        const startSide = Math.random() < 0.5 ? 'left' : 'right';
        const topPosition = Math.random() * (window.innerHeight - 100) + 50;
        
        insect.style.top = `${topPosition}px`;
        if (startSide === 'left') {
            insect.style.left = '-50px';
            insect.style.transform = 'scaleX(1)';
        } else {
            insect.style.left = `${window.innerWidth + 50}px`;
            insect.style.transform = 'scaleX(-1)';
        }

        this.container.appendChild(insect);

        // Animate the insect
        const duration = 15000 + Math.random() * 10000; // 15-25 seconds
        const targetX = startSide === 'left' ? window.innerWidth + 100 : -100;
        const curve = Math.random() * 200 - 100; // Random curve between -100 and 100 pixels

        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;

            if (progress < 1) {
                const x = startSide === 'left'
                    ? (window.innerWidth + 150) * progress - 50
                    : window.innerWidth - (window.innerWidth + 150) * progress;
                
                // Add a sine wave to create a curved path
                const y = topPosition + Math.sin(progress * Math.PI * 2) * curve;
                
                insect.style.left = `${x}px`;
                insect.style.top = `${y}px`;
                
                requestAnimationFrame(animate);
            } else {
                insect.remove();
            }
        };

        requestAnimationFrame(animate);

        // Remove the insect after animation
        setTimeout(() => {
            if (insect.parentNode === this.container) {
                insect.remove();
            }
        }, duration);
    }

    init() {
        // Create new insects periodically
        setInterval(() => {
            if (this.container.children.length < 5) { // Maximum 5 insects at a time
                this.createInsect();
            }
        }, 3000); // New insect every 3 seconds

        // Initial insects
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.createInsect(), i * 1000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InsectAnimation();
});
