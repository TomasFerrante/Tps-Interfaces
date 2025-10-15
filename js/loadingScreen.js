// ==================== LOADING SCREEN - PANTALLA DE CARGA ====================

document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingPercent = document.getElementById('loadingPercent');
  const loadingProgress = document.querySelector('.loading-progress');
  const body = document.body;

  if (!loadingScreen) return;

  // Prevenir scroll mientras carga
  body.style.overflow = 'hidden';

  // Duración del loading: 5 segundos
  // MODIFICAR 5000 para cambiar la duración total (en milisegundos)
  const LOADING_DURATION = 5000;
  // MODIFICAR 50 para cambiar la frecuencia de actualización (menor = más suave)
  const UPDATE_INTERVAL = 50;

  // Sincronizar la animación CSS con la duración de JavaScript
  if (loadingProgress) {
    loadingProgress.style.setProperty('--loading-duration', `${LOADING_DURATION}ms`);
  }

  let currentPercent = 0;
  const incrementAmount = 100 / (LOADING_DURATION / UPDATE_INTERVAL);

  // Actualizar porcentaje gradualmente
  const percentageInterval = setInterval(() => {
    currentPercent += incrementAmount;

    // Asegurar que no pase de 100
    if (currentPercent >= 100) {
      currentPercent = 100;
      clearInterval(percentageInterval);
    }

    // Actualizar el texto del porcentaje
    if (loadingPercent) {
      loadingPercent.textContent = Math.floor(currentPercent);
    }
  }, UPDATE_INTERVAL);

  // Ocultar el loading después de la duración configurada
  setTimeout(() => {
    // Asegurar que llegue a 100%
    if (loadingPercent) {
      loadingPercent.textContent = '100';
    }

    // Agregar clase para animación de salida
    loadingScreen.classList.add('hidden');

    // Restaurar scroll
    body.style.overflow = '';

    // Limpiar intervalo
    clearInterval(percentageInterval);

    // Remover del DOM después de la animación
    // MODIFICAR 500 si cambias la duración de la transición CSS (debe coincidir)
    setTimeout(() => {
      loadingScreen.remove();
    }, 300); // Tiempo de la transición CSS
  }, LOADING_DURATION);
});
