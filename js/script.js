/*////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////CARRUSEL 3D PRINCIPAL////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////*/

// Obtener el elemento del carrusel 3D del DOM
const carousel = document.getElementById('carousel');

// Variables globales para controlar el carrusel 3D
let currentRotation = 0; // Rotación actual en grados
let anglePerItem = 60; // Ángulo entre cada item, se calcula dinámicamente
let autoRotateInterval; // Intervalo para la rotación automática
let restartTimeout; // Timeout para reiniciar la rotación después de interacción del usuario

// Función asíncrona para cargar los juegos desde la API
async function loadGames() {
    try {
        // Realizar petición GET a la API
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        console.log('Juegos cargados:', games);

        // Seleccionar los primeros 6 juegos para el carrusel 3D
        const selectedGames = games.slice(0, 6);

        // Calcular el ángulo de rotación entre items según la cantidad
        anglePerItem = 360 / selectedGames.length;

        // Crear dinámicamente los elementos del carrusel
        selectedGames.forEach((game, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            // Asignar índice como variable CSS para posicionamiento 3D
            carouselItem.style.setProperty('--i', index);

            const img = document.createElement('img');
            // Usar imagen de baja resolución si está disponible, sino la normal
            img.src = game.background_image_low_res || game.background_image || 'https://via.placeholder.com/400x300?text=No+Image';
            img.alt = game.name;
            // Manejar error de carga de imagen
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(game.name);
            };

            carouselItem.appendChild(img);
            carousel.appendChild(carouselItem);

            console.log(`${game.name} - Rating: ${game.rating}`);
        });

        // Iniciar rotación automática una vez cargadas las imágenes
        startAutoRotate();

    } catch (error) {
        console.error('Error al cargar los juegos:', error);
        // Si falla la API, cargar imágenes de respaldo
        loadPlaceholderImages();
    }
}

// Función de respaldo que carga imágenes placeholder si falla la API
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

// Función que ejecuta la rotación del carrusel 3D
function rotateCarousel() {
    currentRotation -= anglePerItem; // Decrementar rotación
    carousel.style.transform = `rotateY(${currentRotation}deg)`;
}

// Iniciar la rotación automática del carrusel
function startAutoRotate() {
    stopAutoRotate(); // Limpiar intervalos existentes
    autoRotateInterval = setInterval(rotateCarousel, 3000); // Rotar cada 3 segundos
}

// Detener la rotación automática del carrusel
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

// Variables para detectar gestos táctiles en dispositivos móviles
let touchStartX = 0;
let touchEndX = 0;

// Detectar inicio del toque
carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoRotate(); // Pausar rotación automática al tocar
}, false);

// Detectar fin del toque
carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe(); // Procesar el gesto de deslizamiento
    // Reiniciar rotación automática después de 5 segundos de inactividad
    stopAutoRotate();
    restartTimeout = setTimeout(() => {
        startAutoRotate();
    }, 5000);
}, false);

// Función que maneja los gestos de deslizamiento (swipe)
function handleSwipe() {
    const swipeThreshold = 50; // Distancia mínima para detectar swipe

    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe hacia la izquierda: siguiente item
        currentRotation -= anglePerItem;
        carousel.style.transform = `rotateY(${currentRotation}deg)`;
    }

    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe hacia la derecha: item anterior
        currentRotation += anglePerItem;
        carousel.style.transform = `rotateY(${currentRotation}deg)`;
    }
}

// Pausar rotación cuando el mouse entra al carrusel
carousel.addEventListener('mouseenter', stopAutoRotate);
// Reanudar rotación cuando el mouse sale del carrusel
carousel.addEventListener('mouseleave', startAutoRotate);

// Inicializar el carrusel 3D al cargar la página
loadGames();

/*////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////CARRUSEL HORIZONTAL DE JUEGOS (ACCIÓN)//////////////////////
/////////////////////////////////////////////////////////////////////////////////////////*/

// Función asíncrona para cargar los juegos del carrusel horizontal
async function loadGamesCarousel() {
    try {
        // Realizar petición GET a la API
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        // Filtrar solo los juegos que tengan el género "Action"
        const actionGames = games.filter(game =>
            game.genres && game.genres.some(genre =>
                genre.name && genre.name.toLowerCase() === 'action'
            )
        );

        // Seleccionar hasta 8 juegos de acción para mostrar
        const selectedGames = actionGames.slice(0, 8);
        const gamesCarousel = document.getElementById('games-carousel');

        if (!gamesCarousel) return;

        // Si no hay juegos de acción, mostrar mensaje
        if (selectedGames.length === 0) {
            gamesCarousel.innerHTML = '<p style="color: var(--White); padding: 20px;">No se encontraron juegos de acción</p>';
            return;
        }

        // Crear dinámicamente las tarjetas de juegos
        selectedGames.forEach((game, index) => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            // Calcular precios ficticios para demostración
            const hasDiscount = index % 3 === 0; // Cada tercer juego tiene descuento
            const originalPrice = Math.floor(Math.random() * 40) + 10; // Precio entre 10 y 50
            const discountPercent = hasDiscount ? 15 : 0;
            const currentPrice = hasDiscount ? originalPrice * (1 - discountPercent/100) : originalPrice;

            // Generar el HTML de la tarjeta
            gameCard.innerHTML = `
                <div class="game-card-image">
                    <span class="material-symbols-outlined favorite-icon" data-id="${game.id}">
                        ${index % 4 === 0 ? 'star' : 'star_border'}
                    </span>
                    <img src="${game.background_image_low_res || game.background_image || 'https://via.placeholder.com/220x130'}"
                         alt="${game.name}"
                         onerror="this.src='https://via.placeholder.com/220x130?text=${encodeURIComponent(game.name)}'">
                </div>
                <div class="game-card-content">
                    <h3 class="game-card-title">${game.name}</h3>
                    <div class="game-card-info">
                        <div class="game-price">
                            ${hasDiscount ? `
                                <span class="price-original">$${originalPrice}</span>
                                <span class="price-current">$${currentPrice.toFixed(2)}</span>
                                <span class="price-discount">${discountPercent}% OFF</span>
                            ` : `
                                <span class="game-tag">${game.rating ? `★ ${game.rating}` : 'Free'}</span>
                            `}
                        </div>
                    </div>
                </div>
            `;

            gamesCarousel.appendChild(gameCard);
        });

        // Inicializar estado de los botones
        updateButtonsVisibility();

        // Agregar funcionalidad de favoritos a las estrellas
        const favoriteIcons = document.querySelectorAll('.favorite-icon');
        favoriteIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que el click se propague a la tarjeta
                // Toggle entre estrella llena y vacía
                if (icon.textContent.trim() === 'star_border') {
                    icon.textContent = 'star';
                    icon.classList.add('active');
                } else {
                    icon.textContent = 'star_border';
                    icon.classList.remove('active');
                }
            });
        });

    } catch (error) {
        console.error('Error al cargar los juegos del carrusel:', error);
    }
}

// Función para inicializar los botones de navegación del carrusel
function initCarouselButtons() {
    const carousel = document.getElementById('games-carousel');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (!carousel || !prevBtn || !nextBtn) return;

    const scrollAmount = 300; // Cantidad de píxeles a desplazar

    // Función para actualizar la visibilidad de los botones
    function updateButtonsVisibility() {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;

        // Ocultar botón izquierdo si está al inicio
        if (currentScroll <= 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        // Ocultar botón derecho si está al final
        if (currentScroll >= maxScroll - 5) { // -5 para margen de error
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    // Función para animar el scroll suavemente
    function smoothScroll(element, targetScroll, duration) {
        const startScroll = element.scrollLeft;
        const distance = targetScroll - startScroll;
        const startTime = performance.now();

        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            element.scrollLeft = startScroll + (distance * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Botón anterior: desplazar hacia la izquierda
    prevBtn.addEventListener('click', () => {
        // Agregar clase de animación skew
        carousel.classList.add('scrolling-left');

        // Animar el desplazamiento
        const targetScroll = carousel.scrollLeft - scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        // Remover clase y actualizar botones después de la animación
        setTimeout(() => {
            carousel.classList.remove('scrolling-left');
            updateButtonsVisibility();
        }, 600);
    });

    // Botón siguiente: desplazar hacia la derecha
    nextBtn.addEventListener('click', () => {
        // Agregar clase de animación skew
        carousel.classList.add('scrolling-right');

        // Animar el desplazamiento
        const targetScroll = carousel.scrollLeft + scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        // Remover clase y actualizar botones después de la animación
        setTimeout(() => {
            carousel.classList.remove('scrolling-right');
            updateButtonsVisibility();
        }, 600);
    });

    // Actualizar botones al hacer scroll manual
    carousel.addEventListener('scroll', updateButtonsVisibility);

    // Variables para funcionalidad de arrastre con mouse
    let isDown = false;
    let startX;
    let scrollLeft;

    // Detectar cuando se presiona el mouse
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    // Detectar cuando el mouse sale del carrusel
    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    // Detectar cuando se suelta el mouse
    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    // Detectar movimiento del mouse para arrastrar
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return; // Solo si el mouse está presionado
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Multiplicador para velocidad de desplazamiento
        carousel.scrollLeft = scrollLeft - walk;
    });
}

// Inicializar el carrusel de Acción usando la función genérica
if (document.getElementById('games-carousel')) {
    loadGenreCarousel('Action', 'games-carousel', 'prev-btn-action', 'next-btn-action');
}

/*////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////CARRUSEL TOP JUEGOS (MÁS JUGADOS)///////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////*/

// Función asíncrona para cargar los top juegos por rating
async function loadTopGamesCarousel() {
    try {
        // Realizar petición GET a la API
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        // Ordenar juegos por rating de mayor a menor
        const sortedGames = games
            .filter(game => game.rating && game.rating > 0)
            .sort((a, b) => b.rating - a.rating);

        // Seleccionar los top 9 juegos
        const topGames = sortedGames.slice(0, 9);
        const topCarousel = document.getElementById('top-carousel');

        if (!topCarousel) return;

        // Crear dinámicamente las tarjetas de top juegos
        topGames.forEach((game, index) => {
            const topGameCard = document.createElement('div');
            topGameCard.className = 'top-game-card';

            // Generar el HTML de la tarjeta
            topGameCard.innerHTML = `
                <div class="top-game-number">${index + 1}</div>
                <div class="top-game-image">
                    <img src="${game.background_image_low_res || game.background_image || 'https://via.placeholder.com/400x280'}"
                         alt="${game.name}"
                         onerror="this.src='https://via.placeholder.com/400x280?text=${encodeURIComponent(game.name)}'">
                    <div class="top-game-content">
                        <h3 class="top-game-title">${game.name}</h3>
                        <div class="top-game-rating">
                            <span class="material-symbols-outlined">star</span>
                            <span>${game.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            `;

            topCarousel.appendChild(topGameCard);
        });

        // Inicializar estado de los botones
        updateTopButtonsVisibility();

    } catch (error) {
        console.error('Error al cargar los top juegos:', error);
    }
}

// Función para inicializar los botones del carrusel de top juegos
function initTopCarouselButtons() {
    const carousel = document.getElementById('top-carousel');
    const prevBtn = document.querySelector('.prev-btn-top');
    const nextBtn = document.querySelector('.next-btn-top');

    if (!carousel || !prevBtn || !nextBtn) return;

    const scrollAmount = 400; // Cantidad de píxeles a desplazar

    // Función para actualizar la visibilidad de los botones
    function updateTopButtonsVisibility() {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;

        // Ocultar botón izquierdo si está al inicio
        if (currentScroll <= 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        // Ocultar botón derecho si está al final
        if (currentScroll >= maxScroll - 5) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    // Función para animar el scroll suavemente
    function smoothScroll(element, targetScroll, duration) {
        const startScroll = element.scrollLeft;
        const distance = targetScroll - startScroll;
        const startTime = performance.now();

        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            element.scrollLeft = startScroll + (distance * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Botón anterior: desplazar hacia la izquierda
    prevBtn.addEventListener('click', () => {
        // Agregar clase de animación skew
        carousel.classList.add('scrolling-left');

        // Animar el desplazamiento
        const targetScroll = carousel.scrollLeft - scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        // Remover clase y actualizar botones después de la animación
        setTimeout(() => {
            carousel.classList.remove('scrolling-left');
            updateTopButtonsVisibility();
        }, 600);
    });

    // Botón siguiente: desplazar hacia la derecha
    nextBtn.addEventListener('click', () => {
        // Agregar clase de animación skew
        carousel.classList.add('scrolling-right');

        // Animar el desplazamiento
        const targetScroll = carousel.scrollLeft + scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        // Remover clase y actualizar botones después de la animación
        setTimeout(() => {
            carousel.classList.remove('scrolling-right');
            updateTopButtonsVisibility();
        }, 600);
    });

    // Actualizar botones al hacer scroll manual
    carousel.addEventListener('scroll', updateTopButtonsVisibility);

    // Variables para funcionalidad de arrastre con mouse
    let isDown = false;
    let startX;
    let scrollLeft;

    // Detectar cuando se presiona el mouse
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    // Detectar cuando el mouse sale del carrusel
    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    // Detectar cuando se suelta el mouse
    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    // Detectar movimiento del mouse para arrastrar
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Hacer la función disponible globalmente
    window.updateTopButtonsVisibility = updateTopButtonsVisibility;
}

// Inicializar el carrusel de top juegos si existe en la página
if (document.getElementById('top-carousel')) {
    loadTopGamesCarousel();
    initTopCarouselButtons();
}

/*////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////CARRUSELES DE CATEGORÍAS/////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////*/

// Función genérica para cargar carrusel por género
async function loadGenreCarousel(genre, carouselId, prevBtnClass, nextBtnClass) {
    try {
        // Realizar petición GET a la API
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        // Filtrar juegos por género
        const genreGames = games.filter(game =>
            game.genres && game.genres.some(g =>
                g.name && g.name.toLowerCase() === genre.toLowerCase()
            )
        );

        // Seleccionar hasta 8 juegos del género
        const selectedGames = genreGames.slice(0, 8);
        const gamesCarousel = document.getElementById(carouselId);

        if (!gamesCarousel) return;

        // Si no hay juegos del género, mostrar mensaje
        if (selectedGames.length === 0) {
            gamesCarousel.innerHTML = `<p style="color: var(--White); padding: 20px;">No se encontraron juegos de ${genre}</p>`;
            return;
        }

        // Crear dinámicamente las tarjetas de juegos
        selectedGames.forEach((game, index) => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            // Calcular precios ficticios para demostración
            const hasDiscount = index % 3 === 0;
            const originalPrice = Math.floor(Math.random() * 40) + 10;
            const discountPercent = hasDiscount ? 15 : 0;
            const currentPrice = hasDiscount ? originalPrice * (1 - discountPercent/100) : originalPrice;

            // Generar el HTML de la tarjeta
            gameCard.innerHTML = `
                <div class="game-card-image">
                    <span class="material-symbols-outlined favorite-icon" data-id="${game.id}">
                        ${index % 4 === 0 ? 'star' : 'star_border'}
                    </span>
                    <img src="${game.background_image_low_res || game.background_image || 'https://via.placeholder.com/220x130'}"
                         alt="${game.name}"
                         onerror="this.src='https://via.placeholder.com/220x130?text=${encodeURIComponent(game.name)}'">
                </div>
                <div class="game-card-content">
                    <h3 class="game-card-title">${game.name}</h3>
                    <div class="game-card-info">
                        <div class="game-price">
                            ${hasDiscount ? `
                                <span class="price-original">$${originalPrice}</span>
                                <span class="price-current">$${currentPrice.toFixed(2)}</span>
                                <span class="price-discount">${discountPercent}% OFF</span>
                            ` : `
                                <span class="game-tag">${game.rating ? `★ ${game.rating}` : 'Free'}</span>
                            `}
                        </div>
                    </div>
                </div>
            `;

            gamesCarousel.appendChild(gameCard);
        });

        // Agregar funcionalidad de favoritos
        const favoriteIcons = gamesCarousel.querySelectorAll('.favorite-icon');
        favoriteIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                if (icon.textContent.trim() === 'star_border') {
                    icon.textContent = 'star';
                    icon.classList.add('active');
                } else {
                    icon.textContent = 'star_border';
                    icon.classList.remove('active');
                }
            });
        });

        // Inicializar botones
        initGenreCarouselButtons(carouselId, prevBtnClass, nextBtnClass);

    } catch (error) {
        console.error(`Error al cargar los juegos de ${genre}:`, error);
    }
}

// Función genérica para inicializar botones de carrusel por género
function initGenreCarouselButtons(carouselId, prevBtnClass, nextBtnClass) {
    const carousel = document.getElementById(carouselId);
    const prevBtn = document.querySelector(`.${prevBtnClass}`);
    const nextBtn = document.querySelector(`.${nextBtnClass}`);

    if (!carousel || !prevBtn || !nextBtn) return;

    const scrollAmount = 300;

    // Función para actualizar visibilidad de botones
    function updateButtonsVisibility() {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;

        if (currentScroll <= 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        if (currentScroll >= maxScroll - 5) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    // Función de scroll suave
    function smoothScroll(element, targetScroll, duration) {
        const startScroll = element.scrollLeft;
        const distance = targetScroll - startScroll;
        const startTime = performance.now();

        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            element.scrollLeft = startScroll + (distance * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Botón anterior
    prevBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-left');
        const targetScroll = carousel.scrollLeft - scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        setTimeout(() => {
            carousel.classList.remove('scrolling-left');
            updateButtonsVisibility();
        }, 600);
    });

    // Botón siguiente
    nextBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-right');
        const targetScroll = carousel.scrollLeft + scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        setTimeout(() => {
            carousel.classList.remove('scrolling-right');
            updateButtonsVisibility();
        }, 600);
    });

    // Actualizar botones al hacer scroll
    carousel.addEventListener('scroll', updateButtonsVisibility);

    // Arrastre con mouse
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Inicializar visibilidad de botones
    updateButtonsVisibility();
}

// Inicializar carrusel RPG
if (document.getElementById('rpg-carousel')) {
    loadGenreCarousel('RPG', 'rpg-carousel', 'prev-btn-rpg', 'next-btn-rpg');
}

// Inicializar carrusel Shooter
if (document.getElementById('shooter-carousel')) {
    loadGenreCarousel('Shooter', 'shooter-carousel', 'prev-btn-shooter', 'next-btn-shooter');
}