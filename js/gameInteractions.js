// ==================== GAME INTERACTIONS - INTERACCIONES DE LA PÁGINA DE JUEGO ====================
// FUNCIONALIDAD:
// - Marcar/desmarcar juego como favorito (estrella) con persistencia en localStorage
// - Compartir juego en redes sociales (WhatsApp, Facebook, Twitter, Email)
// - Modo pantalla completa para la imagen del juego
// - Sistema de likes en comentarios con persistencia en localStorage
// - Animaciones visuales para feedback de interacciones

// VARIABLES CRÍTICAS Y SU IMPACTO:

// FAVORITOS:
// - localStorage key (línea 19): 'gameFavorite' - MODIFICAR para cambiar nombre de almacenamiento
// - Escalas de animación (líneas 25-27): scale(1.3) rotate(15deg) - MODIFICAR para cambiar feedback visual
// - Duración animación (línea 27): 200ms - MODIFICAR para hacer animación más lenta/rápida

// COMPARTIR:
// - shareText (línea 74): Texto predefinido - MODIFICAR para cambiar mensaje de compartir
// - URLs redes sociales (líneas 78-96): MODIFICAR para agregar/quitar redes o cambiar formato
// - shareUrl: Usa window.location.href (actual URL de la página)

// FULLSCREEN:
// - Compatibilidad múltiples navegadores (líneas 110-116, 121-127)
//   MODIFICAR si necesitas agregar soporte para más navegadores

// LIKES COMENTARIOS:
// - localStorage key pattern (línea 153): 'comment-like-{index}' - Único por comentario
// - Color like activo (línea 184): '#e74c3c' (rojo) - MODIFICAR para cambiar color del corazón
// - Duración animación (línea 172): 200ms - MODIFICAR velocidad de feedback

document.addEventListener('DOMContentLoaded', () => {

  // ==================== ESTRELLA DE FAVORITO ====================

  const starIcon = document.querySelector('.menu-game .star');

  if (starIcon) {
    // Inicializar estado desde localStorage
    // MODIFICAR 'gameFavorite' para cambiar la clave de almacenamiento
    const isFavorite = localStorage.getItem('gameFavorite') === 'true';
    updateStarState(starIcon, isFavorite);

    starIcon.addEventListener('click', function() {
      const currentState = this.textContent.trim() === 'star';
      const newState = !currentState;

      // Guardar en localStorage
      localStorage.setItem('gameFavorite', newState);

      // Actualizar visualmente
      updateStarState(this, newState);

      // Animación de feedback
      // MODIFICAR scale y rotate para cambiar intensidad de animación
      this.style.transform = 'scale(1.3) rotate(15deg)';
      // MODIFICAR 200 para cambiar duración de la animación (en ms)
      setTimeout(() => {
        this.style.transform = 'scale(1) rotate(0deg)';
      }, 200);
    });
  }

  function updateStarState(element, isFavorite) {
    if (isFavorite) {
      element.textContent = 'star';
      element.classList.add('active-favorite');
    } else {
      element.textContent = 'star_border';
      element.classList.remove('active-favorite');
    }
  }

  // ==================== BOTÓN COMPARTIR ====================

  const shareIcon = document.querySelector('.menu-game .share');
  const menuShare = document.querySelector('.menu-share');

  if (shareIcon && menuShare) {
    shareIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      menuShare.classList.toggle('active');

      // Animación del icono
      // MODIFICAR rotate y scale para cambiar animación del icono compartir
      this.style.transform = 'rotate(180deg) scale(1.1)';
      // MODIFICAR 300 para cambiar duración de la animación (en ms)
      setTimeout(() => {
        this.style.transform = 'rotate(0deg) scale(1)';
      }, 300);
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!menuShare.contains(e.target) && e.target !== shareIcon) {
        menuShare.classList.remove('active');
      }
    });

    // Funcionalidad de compartir en redes sociales
    const whatsappIcon = menuShare.querySelector('.fa-whatsapp');
    const facebookIcon = menuShare.querySelector('.fa-facebook');
    const instagramIcon = menuShare.querySelector('.fa-instagram');
    const twitterIcon = menuShare.querySelector('.fa-x-twitter');
    const emailIcon = menuShare.querySelector('.material-symbols-outlined');

    const shareUrl = encodeURIComponent(window.location.href);
    // MODIFICAR el texto para cambiar mensaje de compartir en redes sociales
    const shareText = encodeURIComponent('¡Mira este increíble juego en Quantum Arcade!');

    if (whatsappIcon) {
      whatsappIcon.addEventListener('click', () => {
        // MODIFICAR URL o formato para cambiar cómo se comparte en WhatsApp
        window.open(`https://wa.me/?text=${shareText} ${shareUrl}`, '_blank');
      });
    }

    if (facebookIcon) {
      facebookIcon.addEventListener('click', () => {
        // MODIFICAR URL para cambiar cómo se comparte en Facebook
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
      });
    }

    if (twitterIcon) {
      twitterIcon.addEventListener('click', () => {
        // MODIFICAR URL para cambiar cómo se comparte en Twitter/X
        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
      });
    }

    if (emailIcon) {
      emailIcon.addEventListener('click', () => {
        // MODIFICAR subject y body para cambiar contenido del email
        window.location.href = `mailto:?subject=Juego en Quantum Arcade&body=${shareText} ${shareUrl}`;
      });
    }
  }

  // ==================== FULLSCREEN ====================

  const fullscreenIcon = document.querySelector('.menu-game .fullscreen');
  const gameImage = document.querySelector('#canvas-game');

  if (fullscreenIcon && gameImage) {
    fullscreenIcon.addEventListener('click', function() {
      if (!document.fullscreenElement) {
        // Entrar a fullscreen - Compatibilidad múltiples navegadores
        // MODIFICAR para agregar soporte de más navegadores si es necesario
        if (gameImage.requestFullscreen) {
          gameImage.requestFullscreen();
        } else if (gameImage.webkitRequestFullscreen) { // Safari
          gameImage.webkitRequestFullscreen();
        } else if (gameImage.msRequestFullscreen) { // IE11
          gameImage.msRequestFullscreen();
        }

        this.textContent = 'fullscreen_exit';
      } else {
        // Salir de fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE11
          document.msExitFullscreen();
        }

        this.textContent = 'fullscreen';
      }

      // Animación de feedback
      // MODIFICAR scale para cambiar intensidad de animación
      this.style.transform = 'scale(1.2)';
      // MODIFICAR 200 para cambiar duración (en ms)
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });

    // Detectar cuando se sale de fullscreen con ESC
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && fullscreenIcon) {
        fullscreenIcon.textContent = 'fullscreen';
      }
    });
  }

  // ==================== CORAZONES EN COMENTARIOS ====================

  const favoriteComments = document.querySelectorAll('.favorite-comment');

  favoriteComments.forEach((heart, index) => {
    // Inicializar estado desde localStorage
    // MODIFICAR 'comment-like-' para cambiar patrón de clave de almacenamiento
    const likeKey = `comment-like-${index}`;
    const isLiked = localStorage.getItem(likeKey) === 'true';
    updateHeartState(heart, isLiked);

    heart.addEventListener('click', function(e) {
      e.stopPropagation();

      const currentState = this.classList.contains('liked');
      const newState = !currentState;

      // Guardar en localStorage
      localStorage.setItem(likeKey, newState);

      // Actualizar visualmente
      updateHeartState(this, newState);

      // Animación de latido
      // MODIFICAR scale para cambiar intensidad del efecto de like
      this.style.transform = 'scale(1.3)';
      // MODIFICAR 200 para cambiar duración de la animación (en ms)
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });

    // Cambiar cursor a pointer para indicar que es clickeable
    heart.style.cursor = 'pointer';
  });

  function updateHeartState(element, isLiked) {
    if (isLiked) {
      element.textContent = 'favorite';
      element.classList.add('liked');
      // MODIFICAR '#e74c3c' para cambiar color del corazón cuando está activo (actualmente rojo)
      element.style.color = '#e74c3c';
    } else {
      element.textContent = 'favorite_border';
      element.classList.remove('liked');
      element.style.color = ''; // Color por defecto del CSS
    }
  }

  // ==================== ANIMACIONES ADICIONALES ====================

  // Hover en iconos del menú de juego
  const menuGameIcons = document.querySelectorAll('.menu-game .material-symbols-outlined');

  menuGameIcons.forEach(icon => {
    icon.style.cursor = 'pointer';
    // MODIFICAR '0.3s' para cambiar velocidad de transición del hover
    icon.style.transition = 'all 0.3s ease';

    icon.addEventListener('mouseenter', function() {
      if (!this.classList.contains('fullscreen') && !this.classList.contains('share')) {
        // MODIFICAR scale(1.15) para cambiar intensidad del efecto hover
        this.style.transform = 'scale(1.15)';
      }
    });

    icon.addEventListener('mouseleave', function() {
      if (!this.classList.contains('fullscreen') && !this.classList.contains('share')) {
        this.style.transform = 'scale(1)';
      }
    });
  });

  // Animación en iconos del menú compartir
  const shareMenuIcons = document.querySelectorAll('.menu-share i, .menu-share .material-symbols-outlined');

  shareMenuIcons.forEach(icon => {
    icon.style.cursor = 'pointer';
    // MODIFICAR '0.3s' para cambiar velocidad de transición
    icon.style.transition = 'all 0.3s ease';

    icon.addEventListener('mouseenter', function() {
      // MODIFICAR scale y translateY para cambiar efecto de elevación al hacer hover
      this.style.transform = 'scale(1.2) translateY(-3px)';
    });

    icon.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) translateY(0)';
    });
  });
});
