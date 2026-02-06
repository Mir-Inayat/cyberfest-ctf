// Prevent Bootstrap from creating modal backdrops
document.addEventListener('DOMContentLoaded', function() {
    // Override Bootstrap modal to disable backdrop
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const originalModalShow = bootstrap.Modal.prototype.show;
        bootstrap.Modal.prototype.show = function() {
            this._config.backdrop = false;
            originalModalShow.call(this);
        };
    }
    
    // Remove any existing backdrops
    const removeBackdrops = () => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
    };
    
    // Watch for new backdrops being added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('modal-backdrop')) {
                    node.remove();
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: false
    });
    
    // Clean up any existing backdrops on page load
    removeBackdrops();
    
    // Also remove backdrops periodically as a fallback
    setInterval(removeBackdrops, 500);
});
