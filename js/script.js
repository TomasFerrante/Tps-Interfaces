// Obtener el carrusel
const carousel = document.getElementById('carousel');

// Variables del carrusel
let currentRotation = 0;
let anglePerItem = 60; // Se actualizará según la cantidad de juegos
let autoRotateInterval;
let restartTimeout; // Para controlar el timeout de reinicio

// Función para cargar los juegos desde la API
async function loadGames() {
    try {
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();
        
        console.log('Juegos cargados:', games);
        
        // Tomar solo los primeros 6 juegos
        const selectedGames = games.slice(0, 6);
        
        // Calcular el ángulo por item según la cantidad de juegos
        anglePerItem = 360 / selectedGames.length;
        
        // Crear los elementos del carrusel
        selectedGames.forEach((game, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.style.setProperty('--i', index);
            
            const img = document.createElement('img');
            // Usar la imagen optimizada si existe, sino la normal
            img.src = game.background_image_low_res || game.background_image || 'https://via.placeholder.com/400x300?text=No+Image';
            img.alt = game.name;
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(game.name);
            };
            
            carouselItem.appendChild(img);
            carousel.appendChild(carouselItem);
            
            console.log(`${game.name} - Rating: ${game.rating}`);
        });
        
        // Iniciar la rotación automática después de cargar las imágenes
        startAutoRotate();
        
    } catch (error) {
        console.error('Error al cargar los juegos:', error);
        // Cargar imágenes de placeholder en caso de error
        loadPlaceholderImages();
    }
}

// Función de respaldo con imágenes placeholder
function loadPlaceholderImages() {
    for (let i = 0; i < 6; i++) {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.style.setProperty('--i', i);
        
        const img = document.createElement('img');
        img.src = `https://picsum.photos/400/300?random=${i + 1}`;
        img.alt = `Imagen ${i + 1}`;
        
        carouselItem.appendChild(img);
        carousel.appendChild(carouselItem);
    }
    
    startAutoRotate();
}

// Función para rotar el carrusel
function rotateCarousel() {
    currentRotation -= anglePerItem;
    carousel.style.transform = `rotateY(${currentRotation}deg)`;
}

// Iniciar rotación automática
function startAutoRotate() {
    // Limpiar cualquier intervalo existente antes de crear uno nuevo
    stopAutoRotate();
    autoRotateInterval = setInterval(rotateCarousel, 3000);
}

// Detener rotación automática
function stopAutoRotate() {
    if (autoRotateInterval) {
        clearInterval(autoRotateInterval);
        autoRotateInterval = null;
    }
    if (restartTimeout) {
        clearTimeout(restartTimeout);
        restartTimeout = null;
    }
}

// Soporte para gestos táctiles (swipe en móvil)
let touchStartX = 0;
let touchEndX = 0;

carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoRotate();
}, false);

carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    // Reiniciar auto-rotación después de 5 segundos
    stopAutoRotate(); // Limpia tanto el intervalo como cualquier timeout pendiente
    restartTimeout = setTimeout(() => {
        startAutoRotate();
    }, 5000);
}, false);

function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe izquierda - siguiente
        currentRotation -= anglePerItem;
        carousel.style.transform = `rotateY(${currentRotation}deg)`;
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe derecha - anterior
        currentRotation += anglePerItem;
        carousel.style.transform = `rotateY(${currentRotation}deg)`;
    }
}

// Pausar rotación al pasar el mouse
carousel.addEventListener('mouseenter', stopAutoRotate);
carousel.addEventListener('mouseleave', startAutoRotate);

// Cargar los juegos al iniciar
loadGames();