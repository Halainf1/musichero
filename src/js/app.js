// MusicHero - Aplicación Web de Música
class MusicHero {
    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.tracks = [
            {
                id: 1,
                title: "Canción Demo 1",
                artist: "Artista Demo",
                duration: "3:45",
                src: "src/assets/audio/demo1.mp3"
            },
            {
                id: 2,
                title: "Canción Demo 2",
                artist: "Otro Artista",
                duration: "4:12",
                src: "src/assets/audio/demo2.mp3"
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTrackList();
        this.setupAudioPlayer();
    }

    setupEventListeners() {
        // Controles del reproductor
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousTrack());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextTrack());
        
        // Botón CTA
        document.querySelector('.cta-button').addEventListener('click', () => {
            document.getElementById('library').scrollIntoView({ behavior: 'smooth' });
        });

        // Navegación suave
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupAudioPlayer() {
        this.audio = new Audio();
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateProgressBar();
        });
        
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgressBar();
        });

        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });

        // Control de progreso
        const progressSlider = document.getElementById('progressSlider');
        progressSlider.addEventListener('input', () => {
            if (this.audio.duration) {
                this.audio.currentTime = (progressSlider.value / 100) * this.audio.duration;
            }
        });
    }

    renderTrackList() {
        const trackList = document.getElementById('trackList');
        trackList.innerHTML = '';

        this.tracks.forEach(track => {
            const trackElement = document.createElement('div');
            trackElement.className = 'track-item';
            trackElement.innerHTML = `
                <img src="src/assets/images/default-album.jpg" alt="Album cover" onerror="this.style.display='none'">
                <div class="track-details">
                    <h4>${track.title}</h4>
                    <p>${track.artist} • ${track.duration}</p>
                </div>
            `;
            
            trackElement.addEventListener('click', () => this.playTrack(track));
            trackList.appendChild(trackElement);
        });
    }

    playTrack(track) {
        this.currentTrack = track;
        this.audio.src = track.src;
        
        // Actualizar información de la pista
        document.getElementById('trackTitle').textContent = track.title;
        document.getElementById('trackArtist').textContent = track.artist;
        
        // Intentar reproducir (puede fallar si no hay archivo de audio)
        this.audio.play().then(() => {
            this.isPlaying = true;
            this.updatePlayButton();
        }).catch(error => {
            console.log('No se pudo reproducir el audio:', error);
            this.showNotification(`Reproduciendo: ${track.title} - ${track.artist}`);
        });
    }

    togglePlay() {
        if (!this.currentTrack) {
            // Si no hay pista seleccionada, reproducir la primera
            if (this.tracks.length > 0) {
                this.playTrack(this.tracks[0]);
            }
            return;
        }

        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play().then(() => {
                this.isPlaying = true;
            }).catch(error => {
                console.log('No se pudo reproducir el audio:', error);
                this.showNotification(`Reproduciendo: ${this.currentTrack.title}`);
                this.isPlaying = true;
            });
        }
        
        this.updatePlayButton();
    }

    previousTrack() {
        if (!this.currentTrack) return;
        
        const currentIndex = this.tracks.findIndex(track => track.id === this.currentTrack.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : this.tracks.length - 1;
        this.playTrack(this.tracks[prevIndex]);
    }

    nextTrack() {
        if (!this.currentTrack) return;
        
        const currentIndex = this.tracks.findIndex(track => track.id === this.currentTrack.id);
        const nextIndex = currentIndex < this.tracks.length - 1 ? currentIndex + 1 : 0;
        this.playTrack(this.tracks[nextIndex]);
    }

    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
    }

    updateProgressBar() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progressSlider').value = progress;
        }
    }

    showNotification(message) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Método para añadir nuevas canciones
    addTrack(track) {
        this.tracks.push({
            ...track,
            id: this.tracks.length + 1
        });
        this.renderTrackList();
    }

    // Método para buscar canciones
    searchTracks(query) {
        const filteredTracks = this.tracks.filter(track => 
            track.title.toLowerCase().includes(query.toLowerCase()) ||
            track.artist.toLowerCase().includes(query.toLowerCase())
        );
        return filteredTracks;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.musicHero = new MusicHero();
    
    // Añadir estilos para las animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🎵 MusicHero iniciado correctamente!');
});

// Funciones de utilidad
const utils = {
    formatTime: (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    shuffleArray: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};
