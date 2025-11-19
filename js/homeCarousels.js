
// ==================== CARRUSEL 3D PRINCIPAL ====================

const carousel3D = {
    element: null,
    currentRotation: 0,
    anglePerItem: 60,
    autoRotateInterval: null,
    restartTimeout: null,
    touchStartX: 0,
    touchEndX: 0,

    async init() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        this.element = document.getElementById('carousel');
        if (!this.element) return;
        await this.loadGames();
        this.setupEventListeners();

        prevBtn.addEventListener('click', () => {
        this.rotateLeft()
    });

    nextBtn.addEventListener('click', () => {
        this.rotate();
    });
    },

    async loadGames() {
        try {
            // MODIFICAR URL para cambiar fuente de datos
            const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
            const games = await response.json();
            // MODIFICAR 6 para cambiar cantidad de juegos en el carrusel 3D
            const selectedGames = games.slice(0, 6);

            // Reemplaza el juego en la posición 1 con Blocka (juego personalizado)
            if (selectedGames.length > 1) {
                selectedGames[1] = {
                    name: 'Blocka - League of Legends',
                    background_image: '../assets/images/BlockaGame.png',
                    background_image_low_res: '../assets/images/BlockaGame.png',
                    isBlocka: true
                };
            }

            // Reemplaza el juego en la posición 2 con el Flappy Anivia (juego personalizado)
            if (selectedGames.length > 2) {
                selectedGames[2] = {
                    name: 'Flappy Anivia',
                    background_image: '../assets/images/flappy/FlappyAnivia.jpg',
                    background_image_low_res: '../assets/images/flappy/FlappyAnivia.jpg',
                    isFlappy: true
                };
            }

            // Calcula ángulo automáticamente basado en cantidad de juegos
            this.anglePerItem = 360 / selectedGames.length;

            selectedGames.forEach((game, index) => {
                this.createCarouselItem(game, index);
            });

            this.startAutoRotate();
        } catch (error) {
            console.error('Error al cargar los juegos:', error);
            this.loadPlaceholderImages();
        }
    },

    createCarouselItem(game, index) {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        carouselItem.style.setProperty('--i', index);
        carouselItem.style.setProperty('--angle', this.anglePerItem);

        const img = document.createElement('img');
        img.src = game.background_image_low_res || game.background_image || 'https://via.placeholder.com/400x300?text=No+Image';
        img.alt = game.name;
        const h2 = document.createElement('h2');
        h2.textContent = game.name;
        const btnPlay = document.createElement('button');
        btnPlay.className = 'play-btn';
        btnPlay.textContent = 'Jugar';
        
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/400x300?text=' + encodeURIComponent(game.name);
        };
        
        if (game.isBlocka) {
            btnPlay.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = './running-blocka.html';
            });
        } else {
            btnPlay.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Jugar: ${game.name}`);
            });
        }

        if (game.isFlappy) {
            btnPlay.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = './running-flappy-anivia.html';
            });
        } else {
            btnPlay.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Jugar: ${game.name}`);
            });
        }

        carouselItem.appendChild(h2);
        carouselItem.appendChild(btnPlay);
        carouselItem.appendChild(img);
        this.element.appendChild(carouselItem);
    },

    loadPlaceholderImages() {
        const count = 6; // Cantidad de placeholders
        this.anglePerItem = 360 / count;
        for (let i = 0; i < count; i++) {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.style.setProperty('--i', i);
            carouselItem.style.setProperty('--angle', this.anglePerItem);

            const img = document.createElement('img');
            img.src = `https://picsum.photos/400/300?random=${i + 1}`;
            img.alt = `Imagen ${i + 1}`;

            carouselItem.appendChild(img);
            this.element.appendChild(carouselItem);
        }
        this.startAutoRotate();
    },

    rotate() {
        this.currentRotation -= this.anglePerItem;
        this.element.style.transform = `rotateY(${this.currentRotation}deg)`;
    },

    rotateLeft() {
        this.currentRotation += this.anglePerItem;
        this.element.style.transform = `rotateY(${this.currentRotation}deg)`;
    },

    startAutoRotate() {
        this.stopAutoRotate();
        // MODIFICAR 3000 para cambiar velocidad de rotación automática (en ms)
        // Valores menores = rotación más rápida, mayores = más lenta
        this.autoRotateInterval = setInterval(() => this.rotate(), 3000);
    },

    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }
    },

    handleSwipe() {
        // MODIFICAR 50 para cambiar sensibilidad del swipe
        // Valor menor = más sensible (necesita menos desplazamiento)
        // Valor mayor = menos sensible (necesita más desplazamiento)
        const swipeThreshold = 50;

        if (this.touchEndX < this.touchStartX - swipeThreshold) {
            this.currentRotation -= this.anglePerItem;
            this.element.style.transform = `rotateY(${this.currentRotation}deg)`;
        }

        if (this.touchEndX > this.touchStartX + swipeThreshold) {
            this.currentRotation += this.anglePerItem;
            this.element.style.transform = `rotateY(${this.currentRotation}deg)`;
        }
    },

    setupEventListeners() {
        this.element.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
            this.stopAutoRotate();
        }, false);

        this.element.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
            this.stopAutoRotate();
            // MODIFICAR 5000 para cambiar cuánto tarda en reiniciar rotación automática tras interacción
            this.restartTimeout = setTimeout(() => {
                this.startAutoRotate();
            }, 5000);
        }, false);

        this.element.addEventListener('mouseenter', () => this.stopAutoRotate());
        this.element.addEventListener('mouseleave', () => this.startAutoRotate());
    }
};

// ==================== CARRUSEL TOP JUEGOS ====================

async function loadTopGamesCarousel() {
    try {
        // MODIFICAR URL para cambiar fuente de datos
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        // Filtra juegos con rating y los ordena de mayor a menor
        const sortedGames = games
            .filter(game => game.rating && game.rating > 0)
            .sort((a, b) => b.rating - a.rating);

        // MODIFICAR 9 para cambiar cantidad de juegos en top juegos
        const topGames = sortedGames.slice(0, 9);

        // Reemplaza el juego en la posición 3 con Peg Solitaire (juego personalizado)
        // MODIFICAR topGames[2] para cambiar posición del juego personalizado
        // MODIFICAR toda esta sección para cambiar/eliminar el juego personalizado
        if (topGames.length > 2) {
            topGames[2] = {
                name: 'Peg Solitaire - League of Legends',
                background_image: '../assets/images/RunningGame.jpg',
                background_image_low_res: '../assets/images/RunningGame.jpg',
                rating: topGames[2].rating,
                isPegSolitaire: true
            };
        }

        const topCarousel = document.getElementById('top-carousel');
        if (!topCarousel) return;

        topGames.forEach((game, index) => {
            const topGameCard = createTopGameCard(game, index);
            topCarousel.appendChild(topGameCard);
        });

        updateTopButtonsVisibility();

    } catch (error) {
        console.error('Error al cargar los top juegos:', error);
    }
}

function createTopGameCard(game, index) {
    const topGameCard = document.createElement('div');
    topGameCard.className = 'top-game-card';

    topGameCard.innerHTML = `
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
        <button class="play-btn">Jugar</button>
    `;

    // Si es Peg Solitaire, hace la tarjeta clickeable y redirige a la página del juego
    // MODIFICAR './running-game.html' para cambiar destino del click
    if (game.isPegSolitaire) {
        const playBtn = topGameCard.querySelector('.play-btn');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = './running-game.html';
        });
    }

    return topGameCard;
}

function initTopCarouselButtons() {
    const carousel = document.getElementById('top-carousel');
    const prevBtn = document.querySelector('.prev-btn-top');
    const nextBtn = document.querySelector('.next-btn-top');

    if (!carousel || !prevBtn || !nextBtn) return;

    // MODIFICAR 400 para cambiar distancia de scroll por click (en px)
    const scrollAmount = 600;

    function updateTopButtonsVisibility() {
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

    prevBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-left');
        const targetScroll = carousel.scrollLeft - scrollAmount;
        // MODIFICAR 600 para cambiar duración de la animación de scroll (en ms)
        smoothScroll(carousel, targetScroll, 600);

        setTimeout(() => {
            carousel.classList.remove('scrolling-left');
            updateTopButtonsVisibility();
        }, 600);
    });

    nextBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-right');
        const targetScroll = carousel.scrollLeft + scrollAmount;
        // MODIFICAR 600 para cambiar duración de la animación de scroll (en ms)
        smoothScroll(carousel, targetScroll, 600);

        setTimeout(() => {
            carousel.classList.remove('scrolling-right');
            updateTopButtonsVisibility();
        }, 600);
    });

    carousel.addEventListener('scroll', updateTopButtonsVisibility);
    setupCarouselDragScroll(carousel);
    window.updateTopButtonsVisibility = updateTopButtonsVisibility;
}

// ==================== CARRUSELES POR GÉNERO ====================

async function loadGenreCarousel(genre, carouselId, prevBtnClass, nextBtnClass) {
    try {
        // MODIFICAR URL para cambiar fuente de datos
        const response = await fetch('https://vj.interfaces.jima.com.ar/api/v2');
        const games = await response.json();

        // Filtra juegos que contengan el género especificado
        const genreGames = games.filter(game =>
            game.genres && game.genres.some(g =>
                g.name && g.name.toLowerCase() === genre.toLowerCase()
            )
        );

        // MODIFICAR 8 para cambiar cantidad de juegos por carrusel de género
        const selectedGames = genreGames.slice(0, 8);
        const gamesCarousel = document.getElementById(carouselId);

        if (!gamesCarousel) return;

        if (selectedGames.length === 0) {
            gamesCarousel.innerHTML = `<p style="color: var(--White); padding: 20px;">No se encontraron juegos de ${genre}</p>`;
            return;
        }

        selectedGames.forEach((game, index) => {
            const gameCard = createGameCard(game, index);
            gamesCarousel.appendChild(gameCard);
        });

        setupFavoriteIcons(gamesCarousel);
        initGenreCarouselButtons(carouselId, prevBtnClass, nextBtnClass);

    } catch (error) {
        console.error(`Error al cargar los juegos de ${genre}:`, error);
    }
}

function createGameCard(game, index) {
    const gameCard = document.createElement('div');
    gameCard.className = 'game-card';

    // MODIFICAR index % 3 para cambiar cada cuántos juegos tienen descuento
    const hasDiscount = index % 3 === 0;
    // MODIFICAR rango (40) y base (10) para cambiar precios: random * RANGO + BASE = $10-$50
    const originalPrice = Math.floor(Math.random() * 40) + 10;
    // MODIFICAR 15 para cambiar porcentaje de descuento
    const discountPercent = hasDiscount ? 15 : 0;
    const currentPrice = hasDiscount ? originalPrice * (1 - discountPercent/100) : originalPrice;

    gameCard.innerHTML = `
        <div class="game-card-image">
            <span class="material-symbols-outlined favorite-icon" data-id="${game.id}">
                star
            </span>
            <img src="${game.background_image_low_res || game.background_image || 'https://via.placeholder.com/220x130'}"
                alt="${game.name}"
                onerror="this.src='https://via.placeholder.com/220x130?text=${encodeURIComponent(game.name)}'">
            <button class="play-btn-genre">Jugar</button>
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

function setupFavoriteIcons(container) {
    const favoriteIcons = container.querySelectorAll('.favorite-icon');
    favoriteIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            icon.classList.toggle('active');
        });
    });
}

function initGenreCarouselButtons(carouselId, prevBtnClass, nextBtnClass) {
    const carousel = document.getElementById(carouselId);
    const prevBtn = document.querySelector(`.${prevBtnClass}`);
    const nextBtn = document.querySelector(`.${nextBtnClass}`);

    if (!carousel || !prevBtn || !nextBtn) return;

    // MODIFICAR 300 para cambiar distancia de scroll por click en carruseles de género (en px)
    const scrollAmount = 300;

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

    prevBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-left');
        const targetScroll = carousel.scrollLeft - scrollAmount;
        // MODIFICAR 600 para cambiar duración del scroll animado (en ms)
        smoothScroll(carousel, targetScroll, 600);

        setTimeout(() => {
            carousel.classList.remove('scrolling-left');
            updateButtonsVisibility();
        }, 600);
    });

    nextBtn.addEventListener('click', () => {
        carousel.classList.add('scrolling-right');
        const targetScroll = carousel.scrollLeft + scrollAmount;
        // MODIFICAR 600 para cambiar duración del scroll animado (en ms)
        smoothScroll(carousel, targetScroll, 600);

        setTimeout(() => {
            carousel.classList.remove('scrolling-right');
            updateButtonsVisibility();
        }, 600);
    });

    carousel.addEventListener('scroll', updateButtonsVisibility);
    setupCarouselDragScroll(carousel);
    updateButtonsVisibility();
}

// ==================== FUNCIONALIDAD COMPARTIDA ====================
// Drag scroll compartido por todos los carruseles horizontales
// Permite arrastrar con el mouse para hacer scroll

function setupCarouselDragScroll(carousel) {
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
        // MODIFICAR multiplicador *2 para cambiar sensibilidad del drag
        // Valor mayor = más sensible (scroll más rápido), menor = menos sensible
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
}

// ==================== INICIALIZACIÓN ====================
// Se ejecuta automáticamente al cargar el script
// Solo inicializa los carruseles si los elementos existen en el DOM

// Carrusel 3D
if (document.getElementById('carousel')) {
    carousel3D.init();
}

// Top juegos carousel
if (document.getElementById('top-carousel')) {
    loadTopGamesCarousel();
    initTopCarouselButtons();
}

// Carruseles por género
// MODIFICAR 'Action', 'RPG', 'Shooter' para cambiar los géneros cargados
// MODIFICAR IDs y clases de botones si cambias el HTML
// Para agregar más géneros, copia el patrón y agrega un nuevo bloque if
if (document.getElementById('games-carousel')) {
    loadGenreCarousel('Action', 'games-carousel', 'prev-btn-action', 'next-btn-action');
}

if (document.getElementById('rpg-carousel')) {
    loadGenreCarousel('RPG', 'rpg-carousel', 'prev-btn-rpg', 'next-btn-rpg');
}

if (document.getElementById('shooter-carousel')) {
    loadGenreCarousel('Shooter', 'shooter-carousel', 'prev-btn-shooter', 'next-btn-shooter');
}
