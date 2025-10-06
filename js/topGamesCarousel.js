// Carrusel de top juegos - Muestra los juegos mejor valorados ordenados por rating

// Carga y renderiza el carrusel de los juegos mejor valorados
// Obtiene los juegos de la API, los ordena por rating descendente y muestra los 9 mejores
async function loadTopGamesCarousel() {
    try {
        // Obtiene todos los juegos desde la API
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        // Filtra juegos que tengan rating válido y los ordena de mayor a menor
        const sortedGames = games
            .filter(game => game.rating && game.rating > 0)
            .sort((a, b) => b.rating - a.rating);

        // Selecciona los 9 juegos con mejor rating
        const topGames = sortedGames.slice(0, 9);

        // Reemplaza el juego en la posición 3 (índice 2) con Peg Solitaire
        if (topGames.length > 2) {
            topGames[2] = {
                name: 'Peg Solitaire - League of Legends',
                background_image: '../assets/images/RunningGame.png',
                background_image_low_res: '../assets/images/RunningGame.png',
                rating: topGames[2].rating, // Mantiene el rating original
                isPegSolitaire: true // Marca para redirección especial
            };
        }

        const topCarousel = document.getElementById('top-carousel');

        if (!topCarousel) return;

        // Crea y agrega una tarjeta por cada top juego
        topGames.forEach((game, index) => {
            const topGameCard = createTopGameCard(game, index);
            topCarousel.appendChild(topGameCard);
        });

        // Actualiza la visibilidad inicial de los botones de navegación
        updateTopButtonsVisibility();

    } catch (error) {
        console.error('Error al cargar los top juegos:', error);
    }
}

// Crea la tarjeta HTML para un juego del top
// Incluye el número de posición, imagen, título y rating del juego
function createTopGameCard(game, index) {
    const topGameCard = document.createElement('div');
    topGameCard.className = 'top-game-card';

    // Construye el HTML con número de ranking, imagen y rating
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

    // Agrega evento de click para redireccionar a running-game si es Peg Solitaire
    if (game.isPegSolitaire) {
        topGameCard.style.cursor = 'pointer';
        topGameCard.addEventListener('click', () => {
            window.location.href = './html/running-game.html';
        });
    }

    return topGameCard;
}

// Inicializa los botones de navegación del carrusel de top juegos
// Configura eventos de click, scroll suave y arrastrar con mouse
function initTopCarouselButtons() {
    const carousel = document.getElementById('top-carousel');
    const prevBtn = document.querySelector('.prev-btn-top');
    const nextBtn = document.querySelector('.next-btn-top');

    if (!carousel || !prevBtn || !nextBtn) return;

    // Cantidad de píxeles que se desplazará el carrusel por clic
    const scrollAmount = 400;

    // Actualiza la visibilidad de los botones según la posición del scroll
    // Oculta el botón anterior si está al inicio y el siguiente si está al final
    function updateTopButtonsVisibility() {
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
    // Usa requestAnimationFrame y función de easing cúbica para transición fluida
    function smoothScroll(element, targetScroll, duration) {
        const startScroll = element.scrollLeft;
        const distance = targetScroll - startScroll;
        const startTime = performance.now();

        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Función de easing: ease-out cúbico para desaceleración suave
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            element.scrollLeft = startScroll + (distance * easeProgress);

            // Continúa la animación si no ha terminado
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // Evento del botón anterior: desplaza el carrusel hacia la izquierda
    prevBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-left');
        const targetScroll = carousel.scrollLeft - scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        // Remueve clase de animación y actualiza botones después del scroll
        setTimeout(() => {
            carousel.classList.remove('scrolling-left');
            updateTopButtonsVisibility();
        }, 600);
    });

    // Evento del botón siguiente: desplaza el carrusel hacia la derecha
    nextBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-right');
        const targetScroll = carousel.scrollLeft + scrollAmount;
        smoothScroll(carousel, targetScroll, 600);

        // Remueve clase de animación y actualiza botones después del scroll
        setTimeout(() => {
            carousel.classList.remove('scrolling-right');
            updateTopButtonsVisibility();
        }, 600);
    });

    // Actualiza la visibilidad de los botones mientras se hace scroll
    carousel.addEventListener('scroll', updateTopButtonsVisibility);

    // Habilita arrastrar con el mouse para hacer scroll
    setupTopCarouselDragScroll(carousel);
    // Expone la función globalmente para uso externo si es necesario
    window.updateTopButtonsVisibility = updateTopButtonsVisibility;
}

// Implementa funcionalidad de arrastrar con el mouse para hacer scroll
// Permite navegar el carrusel haciendo clic y arrastrando
function setupTopCarouselDragScroll(carousel) {
    // Variables de estado para controlar el drag
    let isDown = false;
    let startX;
    let scrollLeft;

    // Al presionar el mouse, inicia el modo drag
    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    // Al salir del área del carrusel, cancela el drag
    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    // Al soltar el mouse, finaliza el modo drag
    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    // Mientras se mueve el mouse en modo drag, actualiza el scroll
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        // Multiplica por 2 para hacer el scroll más sensible al movimiento
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
}

// Inicializa el carrusel de top juegos si existe en el DOM
if (document.getElementById('top-carousel')) {
    loadTopGamesCarousel();
    initTopCarouselButtons();
}
