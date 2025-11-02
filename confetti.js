/**
 * Confetti Animation for Draw Success
 * Celebratory visual feedback when names are drawn
 */

function createConfetti() {
    const colors = ['#b71c3a', '#0d6630', '#d4a574', '#dc2626', '#16a34a', '#fbbf24'];
    const confettiCount = 50;
    const container = document.createElement('div');
    container.id = 'confetti-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    `;
    
    document.body.appendChild(container);
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
            position: absolute;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            top: -10px;
            opacity: ${Math.random() * 0.7 + 0.3};
            animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        container.appendChild(confetti);
    }
    
    // Remove after animation
    setTimeout(() => {
        if (container.parentElement) {
            container.parentElement.removeChild(container);
        }
    }, 5000);
}

// Add confetti animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export to window
window.createConfetti = createConfetti;

