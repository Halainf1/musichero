// MusicHero - Aplicación Web de Música con Grabación
class MusicHero {
    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.recordingStartTime = null;
        this.recordingTimer = null;
        this.recordedBlob = null;
        this.tracks = [
            {
                id: 1,
                title: "Canción Demo 1",
                artist: "Artista Demo",
                duration: "3:45",
                src: "src/assets/audio/demo1.mp3",
                type: "demo"
            },
            {
                id: 2,
                title: "Canción Demo 2",
                artist: "Otro Artista",
                duration: "4:12",
                src: "src/assets/audio/demo2.mp3",
                type: "demo"
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTrackList();
        this.setupAudioPlayer();
        this.setupAudioRecorder();
    }

    setupEventListeners() {
        // Controles del reproductor
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousTrack());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextTrack());
        
        // Controles del grabador
        document.getElementById('startRecordBtn').addEventListener('click', () => this.startRecording());
        document.getElementById('stopRecordBtn').addEventListener('click', () => this.stopRecording());
        document.getElementById('playRecordBtn').addEventListener('click', () => this.playRecording());
        document.getElementById('saveRecordBtn').addEventListener('click', () => this.saveRecording());
        
        // Botón CTA
        document.querySelector('.cta-button').addEventListener('click', () => {
            document.getElementById('recorder').scrollIntoView({ behavior: 'smooth' });
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

    async setupAudioRecorder() {
        try {
            // Verificar soporte del navegador
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Tu navegador no soporta grabación de audio');
            }

            // Solicitar permisos de micrófono
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            console.log('🎤 Micrófono configurado correctamente');
            this.showNotification('🎤 Micrófono listo para grabar');
            
        } catch (error) {
            console.error('Error al configurar el micrófono:', error);
            this.showNotification('❌ Error: No se pudo acceder al micrófono', 'error');
            this.disableRecordingControls();
        }
    }

    startRecording() {
        if (!this.stream) {
            this.showNotification('❌ Micrófono no disponible', 'error');
            return;
        }

        try {
            // Configurar MediaRecorder
            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.recordedBlob = new Blob(this.recordedChunks, { 
                    type: 'audio/webm;codecs=opus' 
                });
                this.setupRecordedAudio();
            };
            
            // Iniciar grabación
            this.mediaRecorder.start(100); // Capturar datos cada 100ms
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            
            // Actualizar UI
            this.updateRecordingUI();
            this.startRecordingTimer();
            
            this.showNotification('🎤 Grabación iniciada');
            
        } catch (error) {
            console.error('Error al iniciar grabación:', error);
            this.showNotification('❌ Error al iniciar grabación', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Actualizar UI
            this.updateRecordingUI();
            this.stopRecordingTimer();
            
            this.showNotification('⏹️ Grabación detenida');
        }
    }

    setupRecordedAudio() {
        const audioElement = document.getElementById('recordedAudio');
        const audioUrl = URL.createObjectURL(this.recordedBlob);
        
        audioElement.src = audioUrl;
        audioElement.style.display = 'block';
        
        // Habilitar botones
        document.getElementById('playRecordBtn').disabled = false;
        document.getElementById('saveRecordBtn').disabled = false;
    }

    playRecording() {
        const audioElement = document.getElementById('recordedAudio');
        if (audioElement.src) {
            audioElement.play();
            this.showNotification('▶️ Reproduciendo grabación');
        }
    }

    saveRecording() {
        if (!this.recordedBlob) {
            this.showNotification('❌ No hay grabación para guardar', 'error');
            return;
        }

        // Crear nombre de archivo con timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `grabacion-${timestamp}.webm`;
        
        // Crear enlace de descarga
        const url = URL.createObjectURL(this.recordedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Añadir a la biblioteca
        this.addRecordingToLibrary(filename);
        
        this.showNotification('💾 Grabación guardada: ' + filename);
    }

    addRecordingToLibrary(filename) {
        const recordingTrack = {
            id: this.tracks.length + 1,
            title: filename.replace('.webm', ''),
            artist: 'Grabación Propia',
            duration: this.formatRecordingDuration(),
            src: URL.createObjectURL(this.recordedBlob),
            type: 'recording'
        };
        
        this.tracks.unshift(recordingTrack); // Añadir al principio
        this.renderTrackList();
    }

    formatRecordingDuration() {
        if (!this.recordingStartTime) return '0:00';
        
        const duration = Date.now() - this.recordingStartTime;
        const seconds = Math.floor(duration / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateRecordingUI() {
        const startBtn = document.getElementById('startRecordBtn');
        const stopBtn = document.getElementById('stopRecordBtn');
        const indicator = document.getElementById('recordingIndicator');
        
        if (this.isRecording) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            indicator.classList.remove('hidden');
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            indicator.classList.add('hidden');
        }
    }

    startRecordingTimer() {
        const timerElement = document.getElementById('recordingTimer');
        
        this.recordingTimer = setInterval(() => {
            if (this.recordingStartTime) {
                const elapsed = Date.now() - this.recordingStartTime;
                const seconds = Math.floor(elapsed / 1000);
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                
                timerElement.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    disableRecordingControls() {
        document.getElementById('startRecordBtn').disabled = true;
        document.getElementById('startRecordBtn').textContent = '❌ Micrófono no disponible';
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
            
            // Icono según el tipo de pista
            const icon = track.type === 'recording' ? '🎤' : '🎵';
            
            trackElement.innerHTML = `
                <div class="track-icon">${icon}</div>
                <div class="track-details">
                    <h4>${track.title}</h4>
                    <p>${track.artist} • ${track.duration}</p>
                </div>
                ${track.type === 'recording' ? '<span class="recording-badge">Grabación</span>' : ''}
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

    showNotification(message, type = 'success') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? '#ff4444' : 'var(--primary-color)';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
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
