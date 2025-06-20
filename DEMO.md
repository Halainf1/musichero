# 🎵 Demo de MusicHero

## Cómo probar la aplicación

### Opción 1: Servidor de desarrollo (Recomendado)
```bash
cd ~/Projects/musichero
npm start
```
Esto abrirá la aplicación en `http://localhost:3000`

### Opción 2: Abrir directamente en el navegador
1. Navega a la carpeta del proyecto
2. Haz doble clic en `index.html`
3. Se abrirá en tu navegador predeterminado

## Funcionalidades disponibles

### ✅ Funciona actualmente:
- ✅ Interfaz responsive y moderna
- ✅ **Grabación de audio desde micrófono** 🎤
- ✅ **Reproducción de grabaciones**
- ✅ **Guardado automático de grabaciones**
- ✅ **Timer de grabación en tiempo real**
- ✅ Navegación suave entre secciones
- ✅ Controles de reproductor (botones)
- ✅ Lista de canciones demo y grabaciones
- ✅ Tema oscuro elegante
- ✅ Animaciones CSS
- ✅ Notificaciones del sistema

### 🔄 En desarrollo:
- 🔄 Reproducción real de audio (requiere archivos MP3)
- 🔄 Barra de progreso funcional
- 🔄 Subida de archivos de música
- 🔄 Creación de playlists

## 🎤 Cómo usar el Grabador de Audio

### Paso a paso:
1. **Abrir la aplicación** en tu navegador
2. **Ir a la sección "Grabador"** (segundo elemento del menú)
3. **Permitir acceso al micrófono** cuando el navegador lo solicite
4. **Hacer clic en "🎤 Iniciar Grabación"**
5. **Hablar, cantar o hacer sonidos** cerca del micrófono
6. **Ver el timer** que muestra el tiempo de grabación
7. **Hacer clic en "⏹️ Detener"** cuando termines
8. **Reproducir tu grabación** con "▶️ Reproducir"
9. **Guardar la grabación** con "💾 Guardar" (se descarga automáticamente)
10. **Ver tu grabación** en la biblioteca con el icono 🎤

### Requisitos:
- ✅ Navegador moderno (Chrome, Firefox, Safari, Edge)
- ✅ Micrófono funcional
- ✅ Permisos de micrófono habilitados
- ✅ Conexión HTTPS (para producción) o localhost

### Formatos soportados:
- **Grabación:** WebM con codec Opus
- **Reproducción:** Todos los formatos soportados por el navegador

## Cómo añadir música real

1. **Añade archivos MP3 a:** `src/assets/audio/`
2. **Actualiza la lista en:** `src/js/app.js` (línea ~8)
3. **Ejemplo:**
```javascript
this.tracks = [
    {
        id: 1,
        title: "Mi Canción",
        artist: "Mi Artista",
        duration: "3:45",
        src: "src/assets/audio/mi-cancion.mp3",
        type: "demo"
    }
];
```

## Próximos pasos de desarrollo

1. **Añadir archivos de audio reales**
2. **Implementar búsqueda de canciones**
3. **Crear sistema de playlists**
4. **Añadir ecualizador visual**
5. **Implementar modo aleatorio**
6. **Añadir soporte para diferentes formatos de audio**

## Estructura de archivos importantes

```
musichero/
├── index.html          # Página principal
├── src/
│   ├── css/styles.css  # Todos los estilos
│   ├── js/app.js       # Lógica principal
│   └── assets/
│       ├── audio/      # Archivos de música
│       └── images/     # Imágenes y logos
└── package.json        # Configuración del proyecto
```

## Comandos útiles

```bash
# Iniciar servidor de desarrollo
npm start

# Instalar nuevas dependencias
npm install nombre-paquete

# Ver el proyecto en GitHub
gh repo view --web
```
