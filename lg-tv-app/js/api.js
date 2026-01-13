// API client for media server
const API_BASE_URL = 'http://192.168.1.100:3001/api'; // Update with your server IP

const api = {
    async getFeatured() {
        try {
            const response = await fetch(`${API_BASE_URL}/featured`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching featured:', error);
            return [];
        }
    },

    async getAllMedia(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_BASE_URL}/media${queryString ? '?' + queryString : ''}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching media:', error);
            return [];
        }
    },

    async getMediaById(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/media/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching media details:', error);
            return null;
        }
    },

    async getGenres() {
        try {
            const response = await fetch(`${API_BASE_URL}/genres`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching genres:', error);
            return [];
        }
    }
};
