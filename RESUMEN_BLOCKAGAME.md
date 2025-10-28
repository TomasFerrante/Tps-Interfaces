# Resumen de blockaGame.js

## Descripción General
**blockaGame.js** es un juego completo de rompecabezas inspirado en League of Legends que combina una mecánica de slot machine con un puzzle de rotación de piezas. El juego está desarrollado completamente en JavaScript vanilla usando Canvas API.

---

## Arquitectura del Juego

### Estados del Juego (currentGameState)
El juego maneja 7 estados principales:
- **START**: Pantalla inicial con opciones de jugar o ver instrucciones
- **INSTRUCTIONS**: Pantalla de ayuda con las reglas del juego
- **SLOT**: Animación del slot machine para seleccionar campeón
- **DIFFICULTY**: Selección de dificultad (4, 6 u 8 piezas)
- **PUZZLE**: Pantalla principal del rompecabezas
- **VICTORY**: Pantalla de victoria al completar el puzzle
- **DEFEAT**: Pantalla de derrota cuando se acaba el tiempo

---

## Componentes Principales

### 1. Clase Button (líneas 10-97)
Sistema de botones personalizados dibujados en canvas.

**Propiedades:**
- Posición (x, y), dimensiones (width, height)
- Texto y callback de acción
- Colores normal y hover
- Soporte para iconos Material Design

**Métodos:**
- `draw(ctx)`: Dibuja el botón con gradientes y efectos
- `isPointInside(x, y)`: Detecta si un punto está dentro del botón
- `handleClick()`: Ejecuta el callback asociado

---

### 2. Sistema de Slot Machine (líneas 665-1180)

#### Configuración
- 6 columnas (SLOT_COLUMNS = 6)
- Duración de giro: 2100ms
- Delay entre columnas: 300ms
- 17 imágenes de campeones disponibles

#### Funcionalidades

**startSlotAnimation()** (línea 665)
- Inicializa el estado del slot machine
- Selecciona un campeón ganador aleatorio
- Muestra instrucción de palanca
- Precarga la imagen del campeón

**initializeSlotReels()** (línea 695)
- Crea 6 reels con dimensiones 130x180px
- Asigna campeones iniciales únicos
- Inicializa velocidad y estado de cada reel

**spinSlotReels()** (línea 737)
- Anima la palanca con efecto bounce
- Reproduce audio sincronizado
- Detiene reels progresivamente con delay
- Muestra efectos visuales (flash, glow, shake)

**drawLever()** (línea 1034)
- Dibuja palanca animada con base, brazo y bola roja
- Aplica efectos de gradiente y sombras
- Animación de bajada y subida con bounce

**Efectos Visuales:**
- Flash overlay al ganar
- Glow effect radial
- Shake de los reels
- Mensaje de victoria animado

---

### 3. Sistema de Rompecabezas (líneas 1258-1695)

#### startPuzzle(numPieces) (línea 1258)
Inicializa el rompecabezas según la dificultad:

**Dificultades:**
- **4 piezas** (2x2): Sin límite de tiempo, filtro gris
- **6 piezas** (3x2): 20 segundos, filtro gris
- **8 piezas** (4x2): 30 segundos, filtros aleatorios (gris, brillo, negativo)

**Proceso:**
1. Calcula grid y dimensiones de piezas cuadradas
2. Centra el puzzle en el área de juego (450x450px)
3. Pre-renderiza cada pieza en canvas temporal
4. Aplica filtros según dificultad
5. Asigna rotación aleatoria (0°, 90°, 180°, 270°)
6. Inicializa timer

#### drawPuzzle() (línea 1383)
- Dibuja cada pieza con rotación aplicada
- Usa clipping para evitar superposición
- Bordes coloreados según estado:
  - Dorado (#f7b731): Pieza fija por ayuda
  - Morado (#5603ad): Pieza incorrecta
  - Sin borde: Pieza correcta

#### Sistema de Piezas
Cada pieza contiene:
```javascript
{
    x, y: Posición en canvas
    width, height: Dimensiones
    rotation: Rotación actual (0-270)
    correctRotation: 0 (siempre)
    isFixed: Marca si fue colocada con ayuda
    filter: Tipo de filtro aplicado
    preRenderedImage: Canvas con imagen filtrada
}
```

---

### 4. Sistema de Ayuda (líneas 1459-1491)

**useHelp()** (línea 1459)
- Máximo 3 ayudas por partida
- Selecciona una pieza incorrecta aleatoriamente
- Coloca en rotación correcta y marca como fija
- Aplica penalización de +5 segundos
- Verifica si se completó el puzzle

---

### 5. Sistema de Filtros de Imagen (líneas 1186-1252)

#### Filtros Disponibles:
- **Gray**: Escala de grises (0.299R + 0.587G + 0.114B)
- **Brightness**: Aumenta brillo +30 en cada canal
- **Negative**: Invierte colores (255 - valor)

**applyFilter(imageData, filterType)** (línea 1227)
- Procesa pixel por pixel (RGBA)
- Retorna ImageData modificado
- Usado en pre-renderizado de piezas

---

### 6. Sistema de Temporizador (líneas 1701-1740)

**startTimer()** (línea 1701)
- Usa Date.now() para precisión
- Actualiza cada 100ms
- Incluye penalización de tiempo

**updateTimerDisplay()** (línea 1718)
- Modo cuenta regresiva (6 y 8 piezas)
- Modo normal (4 piezas)
- Colores según tiempo restante:
  - Verde: >30 segundos
  - Amarillo: 10-30 segundos
  - Rojo: <10 segundos

**stopTimer()** (línea 1711)
- Limpia interval
- Llamado al completar o perder

---

### 7. Sistema de Interacción (líneas 1497-1613)

**handleCanvasMouseMove(e)** (línea 1497)
- Detecta hover sobre botones
- Cambia cursor a pointer
- Redibuja para mostrar efectos hover
- Detecta hover sobre palanca del slot

**handleCanvasClick(e)** (línea 1546)
- Click en botones
- Click en palanca (inicia slot)
- Click en piezas: rota -90° (antihorario)

**handleCanvasRightClick(e)** (línea 1588)
- Previene menú contextual
- Rota pieza +90° (horario)
- Solo en piezas no fijas

---

## Constantes y Configuración

### Dimensiones Canvas
```javascript
CANVAS_WIDTH: 1340px
CANVAS_HEIGHT: 507px
GAME_SIZE: 450px (área cuadrada centrada)
```

### Imágenes
- 17 campeones de League of Legends
- Pre-carga completa al inicio
- Sistema de manejo de errores

### Audio
- Slot Machine Jackpot Sound Effect
- Volumen: 0.5
- Reproducción sincronizada con animación

---

## Funciones Auxiliares

### drawImageCover(ctx, img, x, y, width, height) (línea 1152)
- Simula CSS object-fit: cover
- Mantiene aspect ratio
- Centra imagen en área destino

### shuffleArray(array) (línea 728)
- Algoritmo Fisher-Yates
- Usado para aleatorizar campeones en reels

### clearCanvas() (línea 280)
- Limpia canvas completo
- Aplica fondo con gradiente morado (#100527 → #3a0477 → #100527)

### Funciones de Easing
- **easeOutCubic(t)** (línea 829): Desaceleración suave
- **easeOutBounce(t)** (línea 834): Efecto rebote

---

## Pantallas Detalladas

### START Screen (línea 296)
- Título con gradiente verde
- 2 botones: Instrucciones y Jugar

### INSTRUCTIONS Screen (línea 343)
- 6 pasos numerados
- Botón de volver

### DIFFICULTY Screen (línea 389)
- 3 botones grandes (240x160px)
- Muestra número de piezas
- Botones morados con hover

### VICTORY Screen (línea 464)
- Título con efecto glow verde
- Muestra tiempo final (MM:SS)
- Botones: Jugar de Nuevo, Menú Principal

### DEFEAT Screen (línea 519)
- Título rojo con glow
- Muestra dificultad y tiempo límite
- Botones: Reintentar, Nuevo Juego, Menú Principal

### PUZZLE HUD (línea 587)
- Timer en esquina superior izquierda
- Contador de ayudas (💡)
- Muestra penalización acumulada
- Botón de Ayuda
- Botón de Reiniciar

---

## Verificación de Completitud

**checkPuzzleComplete()** (línea 1615)
1. Verifica si todas las piezas están en rotación 0°
2. Si todas correctas y no completado antes:
   - Marca puzzle como completado
   - Detiene timer
   - Dibuja imagen completa sin filtros
   - Espera 1.5s y muestra victoria

**drawPuzzleComplete()** (línea 1630)
- Dibuja imagen original sin filtros
- Marco verde con glow effect
- Transición suave a pantalla de victoria

---

## Flujo del Juego

1. **Inicio** → Usuario ve pantalla START
2. **Slot** → Click en palanca → Animación de reels → Selección de campeón
3. **Dificultad** → Usuario elige 4, 6 u 8 piezas
4. **Puzzle** → Jugar rotando piezas
   - Click izquierdo: -90°
   - Click derecho: +90°
   - Botón ayuda: Coloca pieza correcta (+5s)
5. **Final** → Victoria (completa a tiempo) o Derrota (tiempo agotado)
6. **Reinicio** → Volver a jugar o menú principal

---

## Características Técnicas

### Optimizaciones
- Pre-renderizado de piezas con filtros
- Precarga de todas las imágenes
- Canvas temporal para aplicar filtros
- RequestAnimationFrame para animaciones suaves

### Efectos Visuales
- Gradientes en botones y fondos
- Sombras y glow effects
- Animaciones de escala y rotación
- Efectos de blur en reels girando

### Accesibilidad
- Cursor pointer en elementos interactivos
- Colores contrastantes
- Feedback visual claro (bordes coloreados)
- Mensajes descriptivos

---

## Variables Globales Principales

```javascript
canvas, ctx: Referencias al canvas
currentGameState: Estado actual del juego
currentChampionImage: Imagen del campeón seleccionado
selectedDifficulty: 4, 6 u 8 piezas
puzzlePieces: Array de objetos pieza
timerInterval: Referencia al interval del timer
elapsedTime: Tiempo transcurrido en ms
timePenalty: Penalización acumulada en ms
puzzleCompleted: Flag de completitud
helpUsed: Contador de ayudas usadas (0-3)
maxHelps: 3 ayudas máximas
maxTime: Tiempo límite (0 = sin límite)
slotReels: Array de 6 reels
isSlotSpinning: Flag de animación activa
currentButtons: Array de botones activos
```

---

## Puntos Destacables

1. **Sistema Modular**: Cada funcionalidad está bien separada
2. **Pre-renderizado Eficiente**: Los filtros se aplican una sola vez
3. **Animaciones Fluidas**: Uso de easing functions
4. **UX Pulida**: Feedback visual y auditivo constante
5. **Escalable**: Fácil agregar más dificultades o campeones
6. **Sin Dependencias**: JavaScript vanilla puro

---

## Inicialización

**init()** (línea 192)
- Obtiene referencias al canvas y contexto
- Carga audio del slot machine
- Precarga todas las imágenes
- Configura event listeners
- Muestra pantalla START

**window.addEventListener('DOMContentLoaded', init)** (línea 1746)
- Ejecuta init() al cargar el DOM
