# Peg Solitaire - Documentación del Proyecto

## Descripción General

Implementación completa del juego Peg Solitaire (Solitario Inglés) con temática de League of Legends. El juego utiliza un patrón de arquitectura **MVC (Model-View-Controller)** limpio y está construido con JavaScript vanilla y Canvas 2D.

## Estructura del Proyecto

```
js/peg-solitaire/
├── controller/
│   └── pegController.js          # Manejo de eventos y coordinación MVC
├── model/
│   ├── Board.js                  # Lógica del juego y estado del tablero
│   ├── Cell.js                   # Representación de celdas individuales
│   └── Chip.js                   # [DEPRECADO] Clase legacy de fichas
├── view/
│   ├── BoardView.js              # Renderizado completo del juego
│   ├── CellView.js               # [DEPRECADO] Renderizado de celdas
│   └── ChipView.js               # [DEPRECADO] Renderizado de fichas
├── pegSolitaireGame.js           # Punto de entrada principal
└── Roulette.js                   # Ruleta de selección de campeones

html/
└── running-game.html             # Página HTML principal

assets/images/fichas_peg/         # Imágenes de campeones (9 fichas)
```

---

## 📋 Componentes Principales

### 🎮 Punto de Entrada

#### [`pegSolitaireGame.js`](js/peg-solitaire/pegSolitaireGame.js) (16.3 KB)

**Responsabilidades:**
- Inicialización del canvas (1340x507 px)
- Orquestación de la arquitectura MVC
- Gestión de estados del juego:
  - `'roulette'` - Selección de ficha de campeón
  - `'playing'` - Juego activo
- Countdown de 3 segundos antes de iniciar
- Efectos visuales: gradientes, estrellas, viñeta
- Transiciones entre pantallas

**Funciones clave:**
```javascript
initPegSolitaire()         // Inicializa el juego
startCountdown()           // Cuenta regresiva de 3 segundos
startGame()                // Activa el controlador del juego
backToRouletteScreen()     // Vuelve a la selección de fichas
drawAll()                  // Loop principal de renderizado
```

---

## 📦 MODEL (Lógica del Juego)

### [`Board.js`](js/peg-solitaire/model/Board.js) (15.3 KB)

**Lógica central del juego y gestión de estado**

**Responsabilidades:**
- Gestiona tablero 7x7 con tres estados de celda:
  - `-1` = celda inválida (esquinas)
  - `0` = celda vacía
  - `1` = celda con ficha
- Implementa reglas del Peg Solitaire:
  - Saltar sobre ficha adyacente a espacio vacío 2 celdas adelante
  - Eliminar ficha saltada
- Seguimiento de celdas seleccionadas y movimientos válidos
- Timer de 10 minutos máximo
- Detección de victoria/derrota

**Métodos principales:**
```javascript
selectCell(row, col)            // Selecciona una celda
deselectAllChips()              // Deselecciona todas las fichas
isValidMove(fromRow, fromCol, toRow, toCol)  // Valida movimiento
moveChip(fromRow, fromCol, toRow, toCol)     // Ejecuta movimiento
getValidMovesFrom(row, col)     // Calcula movimientos posibles
hasValidMoves()                 // Verifica si hay movimientos disponibles
checkWin()                      // Verifica condición de victoria
startTimer()                    // Inicia el timer de juego
stopTimer()                     // Detiene el timer
getTimerData()                  // Obtiene tiempo transcurrido
setChipImage(img)               // Actualiza imagen de fichas
getBoardState()                 // Serializa estado para el view
reset()                         // Reinicia el tablero
```

**Condiciones de victoria/derrota:**
- **Victoria**: Solo queda 1 ficha en el centro del tablero
- **Derrota**: No hay movimientos válidos disponibles
- **Time Up**: Se agota el timer de 10 minutos

### [`Cell.js`](js/peg-solitaire/model/Cell.js) (1.9 KB)

**Representación de una celda individual**

**Responsabilidades:**
- Almacena posición (row, col)
- Gestiona estado de la celda (inválida/vacía/ocupada)
- Mantiene referencia a imagen de ficha

**Métodos principales:**
```javascript
hasChip()                 // Verifica si contiene ficha
addChip(chipImage)        // Agrega ficha a la celda
removeChip()              // Elimina ficha de la celda
setChipImage(img)         // Actualiza imagen de ficha
```

### [`Chip.js`](js/peg-solitaire/model/Chip.js) (3.4 KB) ⚠️ DEPRECADO

**Estado:** No se usa activamente, funcionalidad reemplazada por lógica en `Cell`
**Nota:** Mantenido para compatibilidad, candidato para eliminación

---

## 🎨 VIEW (Renderizado)

### [`BoardView.js`](js/peg-solitaire/view/BoardView.js) (27.0 KB)

**Todo el renderizado del canvas y UI**

**Responsabilidades:**
- Renderiza tablero 7x7 con estilos personalizados
- Dibuja fichas como imágenes (retratos de campeones) o círculos dorados (fallback)
- Gestiona HUD: timer, contador de fichas, botones restart/back
- Pantallas de fin de juego: victoria, derrota, tiempo agotado
- Efectos visuales: sombras, gradientes, brillos, animaciones
- Conversión de coordenadas canvas ↔ celdas del tablero
- Detección de clicks en botones interactivos

**Métodos principales:**
```javascript
draw()                          // Método principal de renderizado
drawBoardBackground()           // Contenedor del tablero con bordes
drawBoard()                     // Renderiza celdas con highlights
drawPegs()                      // Renderiza fichas con imágenes
drawHUD()                       // Timer, contador, botones
drawDraggedChip()               // Ficha siguiendo el mouse
drawVictoryScreen()             // Pantalla de victoria
drawDefeatScreen()              // Pantalla de derrota
drawTimeUpScreen()              // Pantalla de tiempo agotado
canvasToCell(canvasX, canvasY)  // Convierte coordenadas canvas a tablero
isRestartButtonClicked(x, y)    // Detecta click en botón restart
isBackButtonClicked(x, y)       // Detecta click en botón back
```

**Clase interna: `PegButton`**
Botones interactivos con efectos hover y callbacks de click

**Especificaciones visuales:**
- Tamaño de celda: 55px
- Colores: Paleta dorada/verde estilo casino
- Efectos: Sombras, gradientes, glows
- Fuente: Titillium Web

### [`CellView.js`](js/peg-solitaire/view/CellView.js) (4.7 KB) ⚠️ DEPRECADO

**Estado:** Funcionalidad integrada en BoardView
**Propósito original:** Renderizado individual de celdas con efectos 3D

### [`ChipView.js`](js/peg-solitaire/view/ChipView.js) (8.2 KB) ⚠️ DEPRECADO

**Estado:** Funcionalidad integrada en BoardView
**Propósito original:** Renderizado individual de fichas con imágenes personalizadas

---

## 🎮 CONTROLLER (Manejo de Eventos)

### [`pegController.js`](js/peg-solitaire/controller/pegController.js) (11.3 KB)

**Mediador entre Model y View, maneja toda la interacción del usuario**

**Responsabilidades:**
- Implementa mecánica drag-and-drop para mover fichas
- Gestiona eventos del mouse: mousedown, mousemove, mouseup
- Valida movimientos a través del modelo
- Actualiza estado del tablero y dispara re-renderizado
- Gestiona ciclo de vida: playing, victory, defeat, time-up
- Maneja interacciones con botones (restart, back)
- Controla timer y condiciones de victoria/derrota

**Métodos principales:**
```javascript
init()                    // Configura listeners y inicia juego
handleMouseDown(e)        // Inicia operación de drag o detecta clicks
handleMouseMove(e)        // Actualiza posición de ficha arrastrada
handleMouseUp(e)          // Completa drag y valida movimiento
redraw()                  // Coordina renderizado Model-View
restart()                 // Reinicia juego para nueva partida
backToRoulette()          // Vuelve a pantalla de selección
handleWin()               // Maneja condición de victoria
handleLoss()              // Maneja condición de derrota
handleTimeUp()            // Maneja tiempo agotado
destroy()                 // Limpia event listeners
```

**Flujo de interacción:**
```
1. Usuario hace mousedown en ficha → Selecciona y empieza drag
2. Usuario mueve mouse → Actualiza posición visual
3. Usuario suelta (mouseup) → Valida movimiento
4. Si válido → Ejecuta movimiento, actualiza modelo, re-renderiza
5. Si inválido → Devuelve ficha a posición original
```

---

## 🎰 Característica Especial: Ruleta

### [`Roulette.js`](js/peg-solitaire/Roulette.js) (20.1 KB)

**Ruleta interactiva para seleccionar ficha de campeón antes del juego**

**Responsabilidades:**
- Muestra ruleta giratoria con 9 opciones de campeones
- Carga imágenes de campeones de forma asíncrona
- Implementa animación de giro con desaceleración
- Efectos de partículas durante giro y victoria
- Segmentos con código de colores por campeón
- Estilo visual: gradientes, brillos, efectos 3D
- Notifica cuando termina el giro vía callback

**Campeones disponibles:**
1. Ahri
2. Amumu
3. Ashe
4. Braum
5. Ezreal
6. Jinx
7. Lux
8. Teemo
9. Yasuo

**Métodos principales:**
```javascript
loadChipImages()          // Carga asíncrona de imágenes
spin()                    // Inicia rotación de ruleta
update()                  // Actualiza animación y partículas
draw()                    // Renderiza ruleta con efectos
reset()                   // Reinicia estado para nuevo juego
getSelectedChip()         // Obtiene campeón elegido
getSelectedChipImage()    // Obtiene imagen del campeón
```

**Características:**
- Rotación suave con física de desaceleración
- Sistema de partículas para efectos visuales
- Botón SPIN en el centro
- Estética dorada/verde estilo casino/arcade

---

## 🌐 Punto de Entrada HTML

### [`running-game.html`](html/running-game.html)

**Página HTML principal del juego**

**Elementos clave:**
- Canvas principal: `<canvas id="canvas-game-peg" width="1340" height="507">`
- Menú de navegación lateral
- Header con barra de búsqueda
- Breadcrumb navigation
- Descripción y manual del juego
- Sección de comentarios
- Botones de compartir en redes sociales

**Scripts cargados (en orden):**
```html
1. ../js/peg-solitaire/model/Cell.js
2. ../js/peg-solitaire/model/Board.js
3. ../js/peg-solitaire/view/BoardView.js
4. ../js/peg-solitaire/controller/pegController.js
5. ../js/peg-solitaire/Roulette.js
6. ../js/peg-solitaire/pegSolitaireGame.js
```

---

## 🎯 Arquitectura MVC

El proyecto sigue un patrón **MVC limpio**:

### **Model** (Board, Cell)
- Lógica pura del juego
- Sin dependencias de UI
- Gestión de estado y reglas

### **View** (BoardView)
- Renderizado del canvas
- Recibe datos del Model vía Controller
- Sin lógica de negocio

### **Controller** (PegController)
- Mediador entre Model y View
- Maneja eventos del usuario
- Coordina actualizaciones

### Flujo de Datos
```
Entrada Usuario (Mouse) → Controller → Model (valida) → View (renderiza)
                              ↓
                     Redibuja Canvas
```

---

## 🎮 Estados del Juego

1. **Roulette** - Selección de ficha vía ruleta giratoria
2. **Countdown** - Timer de 3 segundos antes del juego
3. **Playing** - Gameplay activo con drag-and-drop
4. **Victory** - Todas las fichas eliminadas excepto la del centro
5. **Defeat** - No hay movimientos válidos disponibles
6. **TimeUp** - Timer de 10 minutos expirado

---

## 📊 Especificaciones Técnicas

| Aspecto | Detalle |
|---------|---------|
| **Lenguaje** | JavaScript (ES6+) |
| **Gráficos** | HTML5 Canvas 2D API |
| **Timer** | 10 minutos (600,000 ms) |
| **Tablero** | 7x7 celdas, 55px por celda |
| **Canvas** | 1340x507 píxeles |
| **Características** | Drag-and-drop, animaciones, partículas, UI responsiva |

---

## 📁 Assets

### Imágenes
- `assets/images/fichas_peg/` - 9 imágenes de campeones (LoL)
- `assets/images/fondo_peg.webp` - Fondo del tablero
- `assets/images/Logo_header.png` - Logo del header
- `assets/images/icono.png` - Favicon

---

## 📈 Resumen de Archivos

| Archivo | Tamaño | Tipo | Estado | Propósito |
|---------|--------|------|--------|-----------|
| [pegSolitaireGame.js](js/peg-solitaire/pegSolitaireGame.js) | 16.3 KB | Main | ✅ Activo | Inicialización y gestión de estados |
| [Board.js](js/peg-solitaire/model/Board.js) | 15.3 KB | Model | ✅ Activo | Lógica del juego y estado |
| [Cell.js](js/peg-solitaire/model/Cell.js) | 1.9 KB | Model | ✅ Activo | Representación de celdas |
| [Chip.js](js/peg-solitaire/model/Chip.js) | 3.4 KB | Model | ⚠️ Deprecado | Clase legacy de fichas |
| [BoardView.js](js/peg-solitaire/view/BoardView.js) | 27.0 KB | View | ✅ Activo | Renderizado completo |
| [CellView.js](js/peg-solitaire/view/CellView.js) | 4.7 KB | View | ⚠️ Deprecado | Renderizado legacy de celdas |
| [ChipView.js](js/peg-solitaire/view/ChipView.js) | 8.2 KB | View | ⚠️ Deprecado | Renderizado legacy de fichas |
| [pegController.js](js/peg-solitaire/controller/pegController.js) | 11.3 KB | Controller | ✅ Activo | Manejo de eventos |
| [Roulette.js](js/peg-solitaire/Roulette.js) | 20.1 KB | Feature | ✅ Activo | Ruleta de selección |
| [running-game.html](html/running-game.html) | 494 líneas | HTML | ✅ Activo | Página principal |

**Total código activo:** ~93.9 KB en 6 archivos + HTML

---

## 🔄 Flujo del Juego

```
1. Usuario carga running-game.html
   ↓
2. pegSolitaireGame.js se inicializa
   ↓
3. Estado 'roulette' - Muestra ruleta de selección
   ↓
4. Usuario hace click en SPIN
   ↓
5. Ruleta gira y selecciona campeón
   ↓
6. Countdown de 3 segundos
   ↓
7. Estado 'playing' - Controller se activa
   ↓
8. Loop de juego:
   - Usuario arrastra ficha
   - Controller valida con Model
   - View renderiza estado actualizado
   ↓
9. Fin del juego (Victory/Defeat/TimeUp)
   ↓
10. Usuario puede reiniciar o volver a ruleta
```

---

## 🚀 Características Destacadas

- ✨ **Arquitectura limpia MVC** con separación clara de responsabilidades
- 🎨 **Efectos visuales avanzados** (partículas, gradientes, sombras)
- 🎮 **Drag-and-drop fluido** para mover fichas
- 🎰 **Ruleta interactiva** para selección de personajes
- ⏱️ **Sistema de timer** con límite de 10 minutos
- 🏆 **Múltiples pantallas de fin** (victoria, derrota, tiempo)
- 🎭 **Temática de League of Legends** con 9 campeones
- 📱 **Canvas responsivo** con UI profesional

---

## 🛠️ Notas de Desarrollo

### Archivos Deprecados
Los siguientes archivos están marcados como deprecados pero se mantienen para compatibilidad:
- `Chip.js` - Funcionalidad absorbida por `Cell.js`
- `CellView.js` - Funcionalidad absorbida por `BoardView.js`
- `ChipView.js` - Funcionalidad absorbida por `BoardView.js`

Se recomienda eliminarlos en una futura refactorización.

### Buenas Prácticas Implementadas
- Separación clara de responsabilidades (MVC)
- Sin dependencias externas (JavaScript vanilla)
- Código modular y reutilizable
- Manejo apropiado de eventos
- Limpieza de listeners al destruir

---

## 📝 Reglas del Juego

**Objetivo:** Eliminar todas las fichas excepto una, que debe quedar en el centro del tablero.

**Mecánica:**
1. Seleccionar una ficha arrastrándola
2. Mover sobre una ficha adyacente a un espacio vacío (2 celdas de distancia)
3. La ficha saltada se elimina
4. Solo movimientos horizontales y verticales (no diagonales)

**Condiciones:**
- **Ganar:** 1 ficha restante en el centro
- **Perder:** No hay movimientos válidos disponibles
- **Time Up:** Se agotó el timer de 10 minutos

---

**Desarrollado con 💛 para Interfaces de Usuario**
