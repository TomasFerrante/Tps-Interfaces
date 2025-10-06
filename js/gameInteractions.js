// Funcionalidades interactivas del juego (estrella favorita, compartir, fullscreen, likes en comentarios)

document.addEventListener('DOMContentLoaded', () => {

  // ==================== ESTRELLA DE FAVORITO ====================

  const starIcon = document.querySelector('.menu-game .star');

  if (starIcon) {
    // Inicializar estado desde localStorage
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
      this.style.transform = 'scale(1.3) rotate(15deg)';
      setTimeout(() => {
        this.style.transform = 'scale(1) rotate(0deg)';
      }, 200);
    });
  }

  function updateStarState(element, isFavorite) {
    if (isFavorite) {
      element.textContent = 'star';
      element.classList.add('active-favorite');
      element.style.color = '#FFD700'; // Dorado
    } else {
      element.textContent = 'star_border';
      element.classList.remove('active-favorite');
      element.style.color = ''; // Color por defecto
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
      this.style.transform = 'rotate(180deg) scale(1.1)';
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
    const shareText = encodeURIComponent('¡Mira este increíble juego en Quantum Arcade!');

    if (whatsappIcon) {
      whatsappIcon.addEventListener('click', () => {
        window.open(`https://wa.me/?text=${shareText} ${shareUrl}`, '_blank');
      });
    }

    if (facebookIcon) {
      facebookIcon.addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
      });
    }

    if (twitterIcon) {
      twitterIcon.addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
      });
    }

    if (emailIcon) {
      emailIcon.addEventListener('click', () => {
        window.location.href = `mailto:?subject=Juego en Quantum Arcade&body=${shareText} ${shareUrl}`;
      });
    }
  }

  // ==================== FULLSCREEN ====================

  const fullscreenIcon = document.querySelector('.menu-game .fullscreen');
  const gameImage = document.querySelector('.image-game');

  if (fullscreenIcon && gameImage) {
    fullscreenIcon.addEventListener('click', function() {
      if (!document.fullscreenElement) {
        // Entrar a fullscreen
        if (gameImage.requestFullscreen) {
          gameImage.requestFullscreen();
        } else if (gameImage.webkitRequestFullscreen) {
          gameImage.webkitRequestFullscreen();
        } else if (gameImage.msRequestFullscreen) {
          gameImage.msRequestFullscreen();
        }

        this.textContent = 'fullscreen_exit';
      } else {
        // Salir de fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }

        this.textContent = 'fullscreen';
      }

      // Animación
      this.style.transform = 'scale(1.2)';
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
      this.style.transform = 'scale(1.3)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
    });

    // Cambiar cursor
    heart.style.cursor = 'pointer';
  });

  function updateHeartState(element, isLiked) {
    if (isLiked) {
      element.textContent = 'favorite';
      element.classList.add('liked');
      element.style.color = '#e74c3c'; // Rojo
    } else {
      element.textContent = 'favorite_border';
      element.classList.remove('liked');
      element.style.color = ''; // Color por defecto
    }
  }

  // ==================== ANIMACIONES ADICIONALES ====================

  // Hover en iconos del menú de juego
  const menuGameIcons = document.querySelectorAll('.menu-game .material-symbols-outlined');

  menuGameIcons.forEach(icon => {
    icon.style.cursor = 'pointer';
    icon.style.transition = 'all 0.3s ease';

    icon.addEventListener('mouseenter', function() {
      if (!this.classList.contains('fullscreen') && !this.classList.contains('share')) {
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
    icon.style.transition = 'all 0.3s ease';

    icon.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.2) translateY(-3px)';
    });

    icon.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) translateY(0)';
    });
  });
});
