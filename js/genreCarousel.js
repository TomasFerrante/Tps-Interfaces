// Carrusel horizontal de juegos por género - Filtra y muestra juegos por categorías

// Función principal que carga un carrusel de juegos filtrado por género específico
// Parámetros:
// - genre: nombre del género a filtrar (Action, RPG, Shooter, etc.)
// - carouselId: ID del elemento HTML donde se renderizará el carrusel
// - prevBtnClass: clase CSS del botón de navegación anterior
// - nextBtnClass: clase CSS del botón de navegación siguiente
async function loadGenreCarousel(genre, carouselId, prevBtnClass, nextBtnClass) {
    try {
        // Obtiene todos los juegos desde la API
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        // Filtra los juegos que pertenecen al género especificado
        // Compara el nombre del género de forma insensible a mayúsculas
        const genreGames = games.filter(game =>
            game.genres && game.genres.some(g =>
                g.name && g.name.toLowerCase() === genre.toLowerCase()
            )
        );

        // Selecciona hasta 8 juegos del género filtrado
        const selectedGames = genreGames.slice(0, 8);
        const gamesCarousel = document.getElementById(carouselId);

        if (!gamesCarousel) return;

        // Si no hay juegos del género, muestra un mensaje
        if (selectedGames.length === 0) {
            gamesCarousel.innerHTML = `<p style="color: var(--White); padding: 20px;">No se encontraron juegos de ${genre}</p>`;
            return;
        }

        // Crea y agrega una tarjeta por cada juego
        selectedGames.forEach((game, index) => {
            const gameCard = createGameCard(game, index);
            gamesCarousel.appendChild(gameCard);
        });

        // Configura la funcionalidad de favoritos y navegación
        setupFavoriteIcons(gamesCarousel);
        initGenreCarouselButtons(carouselId, prevBtnClass, nextBtnClass);

    } catch (error) {
        console.error(`Error al cargar los juegos de ${genre}:`, error);
    }
}

// Crea la tarjeta HTML de un juego individual
// Incluye imagen, título, precio y descuento aleatorio
function createGameCard(game, index) {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';

    // Genera información de precio y descuento de forma aleatoria
    // Cada tercer juego tiene descuento (index % 3 === 0)
    const hasDiscount = index % 3 === 0;
    const originalPrice = Math.floor(Math.random() * 40) + 10;
    const discountPercent = hasDiscount ? 15 : 0;
    const currentPrice = hasDiscount ? originalPrice * (1 - discountPercent/100) : originalPrice;

    // Construye el HTML de la tarjeta con template literals
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

    return gameCard;
}

// Configura la interactividad de los iconos de favoritos
// Permite alternar entre estrella llena y vacía al hacer clic
function setupFavoriteIcons(container) {
    const favoriteIcons = container.querySelectorAll('.favorite-icon');
    favoriteIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            // Evita que el clic se propague a la tarjeta del juego
            e.stopPropagation();
            // Alterna entre estado favorito y no favorito
            if (icon.textContent.trim() === 'star_border') {
                icon.textContent = 'star';
                icon.classList.add('active');
            } else {
                icon.textContent = 'star_border';
                icon.classList.remove('active');
            }
        });
    });
}

// Inicializa los botones de navegación del carrusel y el scroll
function initGenreCarouselButtons(carouselId, prevBtnClass, nextBtnClass) {
    const carousel = document.getElementById(carouselId);
    const prevBtn = document.querySelector(`.${prevBtnClass}`);
    const nextBtn = document.querySelector(`.${nextBtnClass}`);

    if (!carousel || !prevBtn || !nextBtn) return;

    // Cantidad de píxeles que se desplazará el carrusel por clic
    const scrollAmount = 300;

    // Actualiza la visibilidad de los botones según la posición del scroll
    // Oculta el botón anterior si está al inicio y el siguiente si está al final
    function updateButtonsVisibility() {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        const currentScroll = carousel.scrollLeft;

        // Oculta botón anterior si está al inicio
        if (currentScroll <= 0) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }

        // Oculta botón siguiente si está al final
        if (currentScroll >= maxScroll - 5) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    // Implementa scroll suave con animación personalizada
    // Usa requestAnimationFrame y función de easing cúbica
    function smoothScroll(element, targetScroll, duration) {
        const startScroll = element.scrollLeft;
        const distance = targetScroll - startScroll;
        const startTime = performance.now();

        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Función de easing: ease-out cúbico
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            element.scrollLeft = startScroll + (distance * easeProgress);

            // Continúa la animación si no ha terminado
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Evento del botón anterior: desplaza hacia la izquierda
    prevBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-left');
        const targetScroll = carousel.scrollLeft - scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        // Remueve clase de animación y actualiza botones después del scroll
        setTimeout(() => {
            carousel.classList.remove('scrolling-left');
            updateButtonsVisibility();
        }, 600);
    });

    // Evento del botón siguiente: desplaza hacia la derecha
    nextBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-right');
        const targetScroll = carousel.scrollLeft + scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        // Remueve clase de animación y actualiza botones después del scroll
        setTimeout(() => {
            carousel.classList.remove('scrolling-right');
            updateButtonsVisibility();
        }, 600);
    });

    // Actualiza la visibilidad de los botones mientras se hace scroll
    carousel.addEventListener('scroll', updateButtonsVisibility);

    // Habilita arrastrar con el mouse para hacer scroll
    setupDragScroll(carousel);
    // Actualiza estado inicial de los botones
    updateButtonsVisibility();
}

// Implementa funcionalidad de arrastrar con el mouse para hacer scroll
// Permite navegar el carrusel haciendo clic y arrastrando
function setupDragScroll(carousel) {
    // Variables de estado para el drag
    let isDown = false;
    let startX;
    let scrollLeft;

    // Al presionar el mouse, inicia el drag
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    // Al salir del carrusel, cancela el drag
    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    // Al soltar el mouse, finaliza el drag
    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    // Mientras se mueve el mouse, actualiza el scroll si está en drag
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        // Multiplica por 2 para hacer el scroll más sensible
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
}

// Inicializa el carrusel de juegos de Acción si existe en el DOM
if (document.getElementById('games-carousel')) {
    loadGenreCarousel('Action', 'games-carousel', 'prev-btn-action', 'next-btn-action');
}

// Inicializa el carrusel de juegos RPG si existe en el DOM
if (document.getElementById('rpg-carousel')) {
    loadGenreCarousel('RPG', 'rpg-carousel', 'prev-btn-rpg', 'next-btn-rpg');
}

// Inicializa el carrusel de juegos Shooter si existe en el DOM
if (document.getElementById('shooter-carousel')) {
    loadGenreCarousel('Shooter', 'shooter-carousel', 'prev-btn-shooter', 'next-btn-shooter');
}
