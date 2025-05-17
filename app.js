class DancePlatform {
    constructor() {
        this.config = {
            repo: 'jockextreme/mcgi-dance-data',
            dataPath: 'data/dances.json',
            adminCode: 'MCGI'
        };
        this.state = {
            dances: [],
            isAdmin: false
        };
    }

    async init() {
        await this.loadDances();
        this.setupEventListeners();
        this.setupAutoRefresh();
    }

    async loadDances() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.config.repo}/contents/${this.config.dataPath}`);
            const data = await response.json();
            this.state.dances = JSON.parse(atob(data.content));
            this.renderDances();
        } catch (error) {
            console.error('Failed to load dances:', error);
        }
    }

    renderDances() {
        const grid = document.getElementById('danceGrid');
        grid.innerHTML = this.state.dances
            .map(dance => this.createDanceCard(dance))
            .join('');
    }

    createDanceCard(dance) {
        return `
            <div class="dance-card">
                <div class="video-container">
                    ${this.getVideoEmbed(dance.videoUrl)}
                </div>
                <div class="card-body">
                    <h3>${dance.title}</h3>
                    <p>${dance.description}</p>
                </div>
            </div>
        `;
    }

    getVideoEmbed(url) {
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        return ytMatch 
            ? `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" allowfullscreen></iframe>`
            : `<video controls><source src="${url}"></video>`;
    }

    setupEventListeners() {
        document.getElementById('adminToggle').addEventListener('click', () => {
            document.getElementById('accessModal').style.display = 'block';
        });

        document.getElementById('danceForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const danceData = {
                title: formData.get('danceTitle'),
                description: formData.get('danceDescription'),
                videoUrl: formData.get('danceVideo'),
                date: new Date().toISOString()
            };
            
            if (this.validateDance(danceData)) {
                await this.saveDance(danceData);
                e.target.reset();
            }
        });
    }

    validateDance(data) {
        return data.title && data.videoUrl && this.validateUrl(data.videoUrl);
    }

    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    setupAutoRefresh() {
        setInterval(() => this.loadDances(), 30000);
    }
}

// Initialize
const app = new DancePlatform();
app.init();