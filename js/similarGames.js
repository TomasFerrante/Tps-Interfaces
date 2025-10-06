// Carrusel de juegos similares - Muestra juegos del mismo género en la página de detalle

// Carga y renderiza las tarjetas de juegos similares
// Obtiene juegos de la API y muestra aquellos del género "Strategy"
async function loadSimilarGames() {
    try {
        // Obtiene todos los juegos desde la API
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        // Filtra juegos del género "Strategy" (similar a League of Legends)
        const strategyGames = games.filter(game =>
            game.genres && game.genres.some(g =>
                g.name && g.name.toLowerCase() === 'strategy'
            )
        );

        // Inicializa el array de juegos similares
        let similarGames = strategyGames.slice(0, 8);

        // Si hay menos de 8 juegos de estrategia, completa con otros juegos
        if (similarGames.length < 8) {
            // Obtiene IDs de los juegos ya seleccionados para no duplicar
            const selectedIds = new Set(similarGames.map(game => game.id));

            // Filtra los juegos que no están ya seleccionados
            const otherGames = games.filter(game => !selectedIds.has(game.id));

            // Calcula cuántos juegos faltan para llegar a 8
            const needed = 8 - similarGames.length;

            // Agrega juegos adicionales hasta completar 8
            similarGames = [...similarGames, ...otherGames.slice(0, needed)];
        }

        const container = document.getElementById('similar-games-container');

        if (!container) return;

        // Si no hay juegos, muestra un mensaje
        if (similarGames.length === 0) {
            container.innerHTML = `<p style="color: var(--White); padding: 20px;">No se encontraron juegos similares</p>`;
            return;
        }

        // Crea y agrega una tarjeta por cada juego similar
        similarGames.forEach((game, index) => {
            const gameCard = createSimilarGameCard(game, index);
            container.appendChild(gameCard);
        });

        // Configura la funcionalidad de favoritos
        setupFavoriteIcons(container);

    } catch (error) {
        console.error('Error al cargar los juegos similares:', error);
    }
}

// Crea la tarjeta HTML de un juego similar
// Sigue el mismo diseño que las cards de la página principal
function createSimilarGameCard(game, index) {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';

    // Genera información de precio y descuento de forma aleatoria
    const hasDiscount = index % 3 === 0;
    const originalPrice = Math.floor(Math.random() * 40) + 10;
    const discountPercent = hasDiscount ? 15 : 0;
    const currentPrice = hasDiscount ? originalPrice * (1 - discountPercent/100) : originalPrice;

    // Construye el HTML de la tarjeta
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

// Inicializa el carrusel de juegos similares si existe en el DOM
if (document.getElementById('similar-games-container')) {
    loadSimilarGames();
}
