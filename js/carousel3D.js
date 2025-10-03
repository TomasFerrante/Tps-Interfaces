// Carrusel 3D Principal - Rotación automática de juegos destacados

// Objeto principal que controla el carrusel 3D
const carousel3D = {
    // Referencia al elemento DOM del carrusel
    element: null,
    // Ángulo actual de rotación del carrusel en grados
    currentRotation: 0,
    // Ángulo de rotación por cada item (calculado dinámicamente)
    anglePerItem: 60,
    // Intervalo para la rotación automática
    autoRotateInterval: null,
    // Timeout para reiniciar la rotación después de interacción
    restartTimeout: null,
    // Coordenada X donde inicia el toque en pantalla táctil
    touchStartX: 0,
    // Coordenada X donde termina el toque en pantalla táctil
    touchEndX: 0,

    // Inicializa el carrusel 3D
    async init() {
        // Obtiene el elemento del DOM
        this.element = document.getElementById('carousel');
        if (!this.element) return;

        // Carga los juegos desde la API y configura los eventos
        await this.loadGames();
        this.setupEventListeners();
    },

    // Carga los juegos desde la API y los renderiza en el carrusel
    async loadGames() {
        try {
            // Realiza la petición a la API de videojuegos
            const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
            const games = await response.json();
            // Selecciona los primeros 6 juegos
            const selectedGames = games.slice(0, 6);

            // Calcula el ángulo de separación entre items según la cantidad
            this.anglePerItem = 360 / selectedGames.length;

            // Crea un elemento del carrusel por cada juego
            selectedGames.forEach((game, index) => {
                this.createCarouselItem(game, index);
            });

            // Inicia la rotación automática
            this.startAutoRotate();
        } catch (error) {
            // En caso de error, carga imágenes de respaldo
            console.error('Error al cargar los juegos:', error);
            this.loadPlaceholderImages();
        }
    },

    // Crea un item individual del carrusel con la información del juego
    createCarouselItem(game, index) {
        // Crea el contenedor del item
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        // Asigna un índice CSS para posicionamiento 3D
        carouselItem.style.setProperty('--i', index);

        // Crea la imagen del juego
        const img = document.createElement('img');
        // Prioriza imagen de baja resolución, luego alta, luego placeholder
        img.src = game.background_image_low_res || game.background_image || 'https://via.placeholder.com/400x300?text=No+Image';
        img.alt = game.name;
        // Maneja errores de carga de imagen
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(game.name);
        };

        // Agrega la imagen al item y el item al carrusel
        carouselItem.appendChild(img);
        this.element.appendChild(carouselItem);
    },

    // Carga imágenes de respaldo en caso de fallo de la API
    loadPlaceholderImages() {
        // Crea 6 items con imágenes aleatorias
        for (let i = 0; i < 6; i++) {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.style.setProperty('--i', i);

            const img = document.createElement('img');
            // Obtiene imagen aleatoria de Picsum
            img.src = `https://picsum.photos/400/300?random=${i + 1}`;
            img.alt = `Imagen ${i + 1}`;

            carouselItem.appendChild(img);
            this.element.appendChild(carouselItem);
        }
        // Inicia la rotación automática
        this.startAutoRotate();
    },

    // Rota el carrusel al siguiente item
    rotate() {
        // Decrementa el ángulo de rotación
        this.currentRotation -= this.anglePerItem;
        // Aplica la transformación CSS 3D
        this.element.style.transform = `rotateY(${this.currentRotation}deg)`;
    },

    // Inicia la rotación automática cada 3 segundos
    startAutoRotate() {
        // Detiene cualquier rotación previa
        this.stopAutoRotate();
        // Configura intervalo para rotar cada 3 segundos
        this.autoRotateInterval = setInterval(() => this.rotate(), 3000);
    },

    // Detiene la rotación automática y limpia los timers
    stopAutoRotate() {
        // Limpia el intervalo de rotación si existe
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
        // Limpia el timeout de reinicio si existe
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }
    },

    // Maneja el gesto de deslizamiento en pantallas táctiles
    handleSwipe() {
        // Umbral mínimo de píxeles para considerar un swipe
        const swipeThreshold = 50;

        // Swipe hacia la izquierda: rota hacia adelante
        if (this.touchEndX < this.touchStartX - swipeThreshold) {
            this.currentRotation -= this.anglePerItem;
            this.element.style.transform = `rotateY(${this.currentRotation}deg)`;
        }

        // Swipe hacia la derecha: rota hacia atrás
        if (this.touchEndX > this.touchStartX + swipeThreshold) {
            this.currentRotation += this.anglePerItem;
            this.element.style.transform = `rotateY(${this.currentRotation}deg)`;
        }
    },

    // Configura todos los event listeners del carrusel
    setupEventListeners() {
        // Al iniciar un toque, guarda la posición y detiene rotación
        this.element.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.stopAutoRotate();
        }, false);

        // Al terminar el toque, procesa el swipe y programa reinicio
        this.element.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.stopAutoRotate();
            // Reinicia la rotación automática después de 5 segundos
            this.restartTimeout = setTimeout(() => {
                this.startAutoRotate();
            }, 5000);
        }, false);

        // Al pasar el mouse por encima, detiene la rotación
        this.element.addEventListener('mouseenter', () => this.stopAutoRotate());
        // Al salir el mouse, reinicia la rotación
        this.element.addEventListener('mouseleave', () => this.startAutoRotate());
    }
};

// Inicializa el carrusel cuando se carga el script
carousel3D.init();
