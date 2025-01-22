class BugAnimation {
    constructor() {
        this.bugTypes = [
            { icon: '<i class="fas fa-bug"></i>', color: '#8B4513', size: 20 },           // Brown Bug
            { icon: '<i class="fas fa-spider"></i>', color: '#000000', size: 24 },        // Black Spider
            { icon: '<i class="fas fa-virus"></i>', color: '#4A4A4A', size: 18 },         // Gray Small Bug
            { icon: '<i class="fas fa-bacteria"></i>', color: '#654321', size: 22 },      // Dark Brown Bug
            { icon: '<i class="fas fa-mosquito"></i>', color: '#2F4F4F', size: 20 },      // Dark Mosquito
            { icon: '<i class="fas fa-worm"></i>', color: '#8B4513', size: 22 },          // Brown Worm
            { icon: '<i class="fas fa-disease"></i>', color: '#696969', size: 19 }        // Gray Small Bug
        ];
        this.container = this.createContainer();
        this.maxBugs = 3;
        this.init();
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'bug-container';
        document.body.appendChild(container);
        return container;
    }

    getRandomMotionPattern() {
        const patterns = [
            'zigzag',
            'circular',
            'straight',
            'wavy'
        ];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    createBug() {
        const bug = document.createElement('div');
        const bugType = this.bugTypes[Math.floor(Math.random() * this.bugTypes.length)];
        
        bug.className = 'bug';
        bug.innerHTML = bugType.icon;
        bug.style.color = bugType.color;
        bug.style.fontSize = `${bugType.size}px`;
        
        // Random vertical position
        const top = Math.random() * (window.innerHeight - 100) + 50;
        bug.style.top = `${top}px`;

        // Random direction
        const goingRight = Math.random() > 0.5;
        const motionPattern = this.getRandomMotionPattern();
        bug.className = `bug ${goingRight ? 'crawl-left-to-right' : 'crawl-right-to-left'} motion-${motionPattern}`;

        // Add custom motion based on pattern
        const startY = top;
        const amplitude = 20 + Math.random() * 30; // Random amplitude between 20-50px
        const frequency = 0.001 + Math.random() * 0.002; // Random frequency
        let startTime = Date.now();

        const animate = () => {
            const dx = Date.now() - startTime;
            let dy = 0;

            switch(motionPattern) {
                case 'zigzag':
                    dy = ((dx / 500) % 2 < 1 ? amplitude : -amplitude);
                    break;
                case 'circular':
                    dy = Math.sin(dx * frequency) * amplitude;
                    bug.style.transform += ' rotate(' + (dx * 0.05) % 360 + 'deg)';
                    break;
                case 'wavy':
                    dy = Math.sin(dx * frequency) * amplitude;
                    break;
                case 'straight':
                    dy = Math.sin(dx * frequency * 0.3) * (amplitude * 0.3);
                    break;
            }

            bug.style.top = `${startY + dy}px`;
            
            if (bug.parentNode === this.container) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);

        // Remove bug after animation
        bug.addEventListener('animationend', () => {
            bug.remove();
        });

        return bug;
    }

    addBug() {
        if (this.container.children.length < this.maxBugs) {
            const bug = this.createBug();
            this.container.appendChild(bug);
        }
    }

    init() {
        // Add initial bugs
        for (let i = 0; i < 2; i++) {
            setTimeout(() => this.addBug(), i * 1000);
        }

        // Add new bugs periodically
        setInterval(() => {
            if (Math.random() > 0.5) { // 50% chance to add a new bug
                this.addBug();
            }
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BugAnimation();
});
