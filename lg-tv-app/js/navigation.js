// TV Remote Navigation Handler
class TVNavigation {
    constructor() {
        this.focusableElements = [];
        this.currentFocusIndex = 0;
        this.setupKeyListeners();
    }

    setupKeyListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.keyCode) {
                case 37: // Left
                    this.navigate('left');
                    e.preventDefault();
                    break;
                case 38: // Up
                    this.navigate('up');
                    e.preventDefault();
                    break;
                case 39: // Right
                    this.navigate('right');
                    e.preventDefault();
                    break;
                case 40: // Down
                    this.navigate('down');
                    e.preventDefault();
                    break;
                case 13: // Enter/OK
                    this.select();
                    e.preventDefault();
                    break;
                case 461: // Back button (webOS)
                case 8: // Backspace
                    window.app.handleBack();
                    e.preventDefault();
                    break;
            }
        });
    }

    setFocusableElements(elements) {
        this.focusableElements = elements;
        if (elements.length > 0) {
            this.currentFocusIndex = 0;
            this.updateFocus();
        }
    }

    navigate(direction) {
        if (this.focusableElements.length === 0) return;

        this.removeFocus();

        if (direction === 'right') {
            this.currentFocusIndex = Math.min(
                this.currentFocusIndex + 1,
                this.focusableElements.length - 1
            );
        } else if (direction === 'left') {
            this.currentFocusIndex = Math.max(this.currentFocusIndex - 1, 0);
        } else if (direction === 'down') {
            this.currentFocusIndex = Math.min(
                this.currentFocusIndex + 4,
                this.focusableElements.length - 1
            );
        } else if (direction === 'up') {
            this.currentFocusIndex = Math.max(this.currentFocusIndex - 4, 0);
        }

        this.updateFocus();
    }

    updateFocus() {
        if (this.focusableElements[this.currentFocusIndex]) {
            const element = this.focusableElements[this.currentFocusIndex];
            element.classList.add('focused');

            // Scroll element into view
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    removeFocus() {
        this.focusableElements.forEach(el => el.classList.remove('focused'));
    }

    select() {
        if (this.focusableElements[this.currentFocusIndex]) {
            this.focusableElements[this.currentFocusIndex].click();
        }
    }

    reset() {
        this.removeFocus();
        this.currentFocusIndex = 0;
        this.focusableElements = [];
    }
}

window.tvNav = new TVNavigation();
