// Main App Logic
class MediaApp {
    constructor() {
        this.currentView = 'home';
        this.currentMedia = null;
        this.allMedia = [];
        this.init();
    }

    async init() {
        console.log('MediaFlix TV App Starting...');
        this.setupMenuNavigation();
        await this.loadHomeScreen();
    }

    setupMenuNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                this.handleMenuAction(action);

                // Update menu focus
                menuItems.forEach(mi => mi.classList.remove('focused'));
                item.classList.add('focused');
            });
        });
    }

    async handleMenuAction(action) {
        switch(action) {
            case 'home':
                await this.loadHomeScreen();
                break;
            case 'movies':
                await this.loadMovies();
                break;
            case 'series':
                await this.loadSeries();
                break;
            case 'search':
                // Search functionality would go here
                break;
        }
    }

    async loadHomeScreen() {
        this.showLoading();
        this.currentView = 'home';

        try {
            const [featured, allMedia] = await Promise.all([
                api.getFeatured(),
                api.getAllMedia()
            ]);

            this.allMedia = allMedia;

            // Show hero section
            if (featured.length > 0) {
                this.renderHero(featured[0]);
            }

            // Group media by genre
            const byGenre = this.groupByGenre(allMedia);
            this.renderMediaRows(byGenre);

            this.showView('home');
        } catch (error) {
            console.error('Error loading home screen:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadMovies() {
        this.showLoading();
        this.currentView = 'movies';

        try {
            const movies = await api.getAllMedia({ type: 'movie' });
            const byGenre = this.groupByGenre(movies);

            document.getElementById('hero').classList.add('hidden');
            this.renderMediaRows(byGenre);
            this.showView('home');
        } catch (error) {
            console.error('Error loading movies:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadSeries() {
        this.showLoading();
        this.currentView = 'series';

        try {
            const series = await api.getAllMedia({ type: 'series' });
            const byGenre = this.groupByGenre(series);

            document.getElementById('hero').classList.add('hidden');
            this.renderMediaRows(byGenre);
            this.showView('home');
        } catch (error) {
            console.error('Error loading series:', error);
        } finally {
            this.hideLoading();
        }
    }

    groupByGenre(media) {
        const genres = {};
        media.forEach(item => {
            if (item.genre) {
                if (!genres[item.genre]) {
                    genres[item.genre] = [];
                }
                genres[item.genre].push(item);
            }
        });
        return genres;
    }

    renderHero(media) {
        const hero = document.getElementById('hero');
        const title = document.getElementById('hero-title');
        const meta = document.getElementById('hero-meta');
        const description = document.getElementById('hero-description');
        const playBtn = document.getElementById('hero-play');
        const infoBtn = document.getElementById('hero-info');

        hero.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%), url(${media.backdrop})`;
        title.textContent = media.title;
        meta.innerHTML = `
            <span>★ ${media.rating}</span>
            <span>${media.year}</span>
            <span>${media.genre}</span>
        `;
        description.textContent = media.description;

        playBtn.onclick = () => this.playMedia(media.id);
        infoBtn.onclick = () => this.showDetails(media.id);

        hero.classList.remove('hidden');
    }

    renderMediaRows(mediaByGenre) {
        const container = document.getElementById('media-rows');
        container.innerHTML = '';

        Object.entries(mediaByGenre).forEach(([genre, items]) => {
            const row = document.createElement('div');
            row.className = 'media-row';

            const title = document.createElement('h2');
            title.className = 'row-title';
            title.textContent = genre;
            row.appendChild(title);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'row-items';

            items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'row-item';
                itemEl.innerHTML = `
                    <img src="${item.thumbnail}" alt="${item.title}">
                    <div class="item-overlay">
                        <div class="item-title">${item.title}</div>
                        <div class="item-meta">★ ${item.rating} • ${item.year}</div>
                    </div>
                `;
                itemEl.onclick = () => this.showDetails(item.id);
                itemsContainer.appendChild(itemEl);
            });

            row.appendChild(itemsContainer);
            container.appendChild(row);
        });

        // Set up navigation for media items
        const focusableItems = document.querySelectorAll('.row-item');
        window.tvNav.setFocusableElements(Array.from(focusableItems));
    }

    async showDetails(mediaId) {
        this.showLoading();

        try {
            const media = await api.getMediaById(mediaId);
            this.currentMedia = media;

            const detailsView = document.getElementById('details-view');
            const title = document.getElementById('details-title');
            const meta = document.getElementById('details-meta');
            const description = document.getElementById('details-description');
            const playBtn = document.getElementById('details-play');

            detailsView.style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.95) 100%), url(${media.backdrop})`;
            title.textContent = media.title;
            meta.innerHTML = `
                <span>★ ${media.rating}</span>
                <span>${media.year}</span>
                <span>${media.duration} min</span>
                <span>${media.genre}</span>
            `;
            description.textContent = media.description;

            playBtn.onclick = () => this.playMedia(media.id);

            this.showView('details');

            const focusable = [
                document.getElementById('details-back'),
                playBtn
            ];
            window.tvNav.setFocusableElements(focusable);

        } catch (error) {
            console.error('Error showing details:', error);
        } finally {
            this.hideLoading();
        }
    }

    playMedia(mediaId) {
        if (!this.currentMedia || this.currentMedia.id !== mediaId) {
            api.getMediaById(mediaId).then(media => {
                this.currentMedia = media;
                this.startPlayback();
            });
        } else {
            this.startPlayback();
        }
    }

    startPlayback() {
        const player = document.getElementById('player');
        const video = document.getElementById('video-player');
        const source = document.getElementById('video-source');
        const title = document.getElementById('player-title');

        if (this.currentMedia.video_url) {
            source.src = `http://192.168.1.100:3001/media/${this.currentMedia.video_url}`;
            video.load();
            video.play();
        }

        title.textContent = this.currentMedia.title;

        this.showView('player');

        const focusable = [document.getElementById('player-back')];
        window.tvNav.setFocusableElements(focusable);
    }

    showView(viewName) {
        document.getElementById('hero').classList.add('hidden');
        document.getElementById('media-rows').classList.add('hidden');
        document.getElementById('details-view').classList.add('hidden');
        document.getElementById('player').classList.add('hidden');

        switch(viewName) {
            case 'home':
                document.getElementById('media-rows').classList.remove('hidden');
                break;
            case 'details':
                document.getElementById('details-view').classList.remove('hidden');
                break;
            case 'player':
                document.getElementById('player').classList.remove('hidden');
                break;
        }

        this.currentView = viewName;
    }

    handleBack() {
        const video = document.getElementById('video-player');

        switch(this.currentView) {
            case 'player':
                video.pause();
                if (this.currentMedia) {
                    this.showDetails(this.currentMedia.id);
                } else {
                    this.loadHomeScreen();
                }
                break;
            case 'details':
                this.loadHomeScreen();
                break;
            default:
                // Exit app or do nothing
                break;
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.app = new MediaApp();

    // Setup back button handlers
    document.getElementById('details-back').onclick = () => window.app.handleBack();
    document.getElementById('player-back').onclick = () => window.app.handleBack();
});
