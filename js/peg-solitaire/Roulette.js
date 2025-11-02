// ========================================================================================
// CLASE ROULETTE - Ruleta de Casino para Peg Solitaire
// ========================================================================================

class Roulette {
    constructor(x, y, radius, ctx) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.ctx = ctx;
        this.spinning = false;
        this.currentAngle = 0;
        this.spinSpeed = 0;
        this.targetAngle = 0;
        this.selectedChipIndex = 0;

        // Cargar las fichas disponibles (rutas relativas desde html/running-game.html)
        this.chips = [
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_36PM-removebg-preview.png',
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_37PM-removebg-preview.png',
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_37PM__1_-removebg-preview.png',
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_38PM-removebg-preview.png',
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_41PM-removebg-preview.png',
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_41PM__1_-removebg-preview.png',
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_41PM__2_-removebg-preview.png',
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_42PM-removebg-preview.png',
            '../assets/images/fichas_peg/Generated_Image_October_22__2025_-_3_45PM-removebg-preview.png'
        ];

        this.chipsLoaded = [];
        this.loadChipImages();

        // Colores para cada segmento (alternando para visibilidad)
        this.segmentColors = [
            '#5603ad', '#03ad56', '#8a38f5', '#74e0a9',
            '#7d13eb', '#f7b731', '#a34cff', '#03ad56',
            '#5603ad'
        ];

        this.anglePerSegment = (Math.PI * 2) / this.chips.length;

        // Animación de partículas
        this.particles = [];

        // Estado de visibilidad
        this.visible = false;
    }

    loadChipImages() {
        this.chips.forEach((chipPath, index) => {
            const img = new Image();
            
            img.style.imageRendering = 'high-quality';
            
            img.src = chipPath;
            img.onload = () => {
                this.chipsLoaded[index] = img;
                console.log(`Ficha ${index + 1} cargada correctamente: ${chipPath}`);
            };
            img.onerror = () => {
                console.error(`Error cargando ficha ${index + 1}: ${chipPath}`);
                this.chipsLoaded[index] = null;
            };
        });
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    spin() {
        if (this.spinning) return;

        this.spinning = true;
        // Velocidad inicial muy alta
        this.spinSpeed = 1.2;

        // Seleccionar ficha aleatoria
        this.selectedChipIndex = Math.floor(Math.random() * this.chips.length);

        // Calcular ángulo objetivo (1.5-2 vueltas para ser muy rápido)
        const extraSpins = 1.5 + Math.random() * 0.5; // 1.5-2 vueltas
        this.targetAngle = (Math.PI * 2 * extraSpins) + (this.selectedChipIndex * this.anglePerSegment) + (this.anglePerSegment / 2);

        // Crear partículas
        this.createParticles();
    }

    update() {
        if (!this.spinning) return;

        // Desaceleración muy rápida
        const remainingAngle = this.targetAngle - this.currentAngle;

        if (remainingAngle > 0.005) {
            // Ease out lineal para desaceleración inmediata
            const progress = 1 - (remainingAngle / this.targetAngle);
            const easeOut = progress; // Lineal, sin curva

            // Velocidad muy alta con desaceleración agresiva
            this.spinSpeed = 1.2 * (1 - easeOut);
            this.currentAngle += this.spinSpeed;
        } else {
            // Detener
            this.currentAngle = this.targetAngle;
            this.spinning = false;
            this.spinSpeed = 0;

            // Crear explosión de partículas al terminar
            this.createWinParticles();

            // Notificar que terminó el giro
            if (this.onSpinComplete) {
                this.onSpinComplete(this.getSelectedChip());
            }
        }

        // Actualizar partículas
        this.updateParticles();
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * (2 + Math.random() * 3),
                vy: Math.sin(angle) * (2 + Math.random() * 3),
                life: 1,
                decay: 0.01 + Math.random() * 0.02,
                size: 2 + Math.random() * 3,
                color: this.segmentColors[Math.floor(Math.random() * this.segmentColors.length)]
            });
        }
    }

    createWinParticles() {
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * (3 + Math.random() * 5),
                vy: Math.sin(angle) * (3 + Math.random() * 5),
                life: 1,
                decay: 0.008 + Math.random() * 0.015,
                size: 3 + Math.random() * 5,
                color: '#f7b731'
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

   draw() {
    if (!this.visible) return;

    this.ctx.save();
    
    // RESETEAR cualquier transformación previa
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Dibujar sombra de la ruleta
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 30;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 10;

    // Dibujar marco exterior decorativo
    this.drawOuterFrame();

    // Dibujar ruleta
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.currentAngle);

    // Dibujar segmentos
    for (let i = 0; i < this.chips.length; i++) {
        this.drawSegment(i);
    }

    // Dibujar fichas en los segmentos
    for (let i = 0; i < this.chips.length; i++) {
        this.drawChipInSegment(i);
    }

    this.ctx.rotate(-this.currentAngle);
    this.ctx.translate(-this.x, -this.y);

    // Dibujar centro decorativo
    this.drawCenter();

    // Dibujar indicador (flecha)
    this.drawIndicator();

    // Dibujar partículas
    this.drawParticles();

    this.ctx.restore();
}

    drawOuterFrame() {
        // Sombra externa muy pronunciada
        this.ctx.shadowColor = 'rgba(0, 255, 136, 0.6)';
        this.ctx.shadowBlur = 50;

        // Marco exterior verde brillante (estilo slot)
        const outerGradient = this.ctx.createLinearGradient(
            this.x - this.radius - 25,
            this.y - this.radius - 25,
            this.x + this.radius + 25,
            this.y + this.radius + 25
        );
        outerGradient.addColorStop(0, '#00ff88');
        outerGradient.addColorStop(0.5, '#00ffcc');
        outerGradient.addColorStop(1, '#00ff88');

        this.ctx.strokeStyle = outerGradient;
        this.ctx.lineWidth = 12;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius + 20, 0, Math.PI * 2);
        this.ctx.stroke();

        // Marco dorado interior
        this.ctx.shadowColor = 'rgba(247, 183, 49, 0.8)';
        this.ctx.shadowBlur = 30;

        const goldGradient = this.ctx.createLinearGradient(
            this.x - this.radius - 15,
            this.y - this.radius - 15,
            this.x + this.radius + 15,
            this.y + this.radius + 15
        );
        goldGradient.addColorStop(0, '#ffd32a');
        goldGradient.addColorStop(0.5, '#f7b731');
        goldGradient.addColorStop(1, '#ffd32a');

        this.ctx.strokeStyle = goldGradient;
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
        this.ctx.stroke();

        // Marco interior oscuro para contraste
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#1a0033';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawSegment(index) {
        const startAngle = index * this.anglePerSegment - Math.PI / 2;
        const endAngle = startAngle + this.anglePerSegment;

        // Gradiente radial más atractivo
        const gradient = this.ctx.createRadialGradient(0, 0, this.radius * 0.2, 0, 0, this.radius);
        const color = this.segmentColors[index];

        // Punto central más claro
        gradient.addColorStop(0, this.lightenColor(color, 0.3));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.4));

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, this.radius, startAngle, endAngle);
        this.ctx.closePath();
        this.ctx.fill();

        // Borde del segmento con brillo
        const borderGradient = this.ctx.createLinearGradient(
            Math.cos(startAngle) * this.radius,
            Math.sin(startAngle) * this.radius,
            Math.cos(endAngle) * this.radius,
            Math.sin(endAngle) * this.radius
        );
        borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        borderGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
        borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

        this.ctx.strokeStyle = borderGradient;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Línea divisoria brillante
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(Math.cos(endAngle) * this.radius, Math.sin(endAngle) * this.radius);
        this.ctx.stroke();
    }

    drawChipInSegment(index) {
        // Calcular el ángulo del centro del segmento (igual que en drawSegment)
        const startAngle = index * this.anglePerSegment - Math.PI / 2;
        const centerAngle = startAngle + (this.anglePerSegment / 2);

        if (!this.chipsLoaded[index]) {
            // Si la ficha no está cargada, dibujar un círculo indicador
            const distance = this.radius * 0.65;
            const x = Math.cos(centerAngle) * distance;
            const y = Math.sin(centerAngle) * distance;
            const chipSize = this.radius * 0.35;

            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, chipSize / 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            return;
        }

        const distance = this.radius * 0.65;
        const x = Math.cos(centerAngle) * distance;
        const y = Math.sin(centerAngle) * distance;

        const chipSize = this.radius * 0.35;

        this.ctx.save();

        // Sombra más pronunciada
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 5;

        // Dibujar círculo de fondo para las fichas
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, chipSize / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Dibujar la imagen de la ficha
        this.ctx.shadowColor = 'transparent';
        this.ctx.drawImage(
            this.chipsLoaded[index],
            x - chipSize / 2,
            y - chipSize / 2,
            chipSize,
            chipSize
        );

        this.ctx.restore();
    }

    drawCenter() {
        // Resetear sombras antes de empezar
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Sombra del centro
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        this.ctx.shadowBlur = 20;

        // Centro con gradiente radial dorado brillante
        const centerGradient = this.ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 0.28
        );
        centerGradient.addColorStop(0, '#ffffff');
        centerGradient.addColorStop(0.2, '#ffd32a');
        centerGradient.addColorStop(0.6, '#f7b731');
        centerGradient.addColorStop(1, '#e08e00');

        this.ctx.fillStyle = centerGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius * 0.28, 0, Math.PI * 2);
        this.ctx.fill();

        // Borde dorado brillante
        this.ctx.shadowColor = 'rgba(247, 183, 49, 0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeStyle = '#ffd32a';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();

        // Círculo interior oscuro
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#1a0033';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius * 0.15, 0, Math.PI * 2);
        this.ctx.fill();

        // Texto "SPIN" en el centro
        this.ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#00ff88';
        this.ctx.font = 'bold 20px Arial Black';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('SPIN', this.x, this.y);

        // Brillo superior
        this.ctx.shadowBlur = 0;
        const highlightGradient = this.ctx.createRadialGradient(
            this.x - this.radius * 0.1,
            this.y - this.radius * 0.1,
            0,
            this.x,
            this.y,
            this.radius * 0.2
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        highlightGradient.addColorStop(1, 'transparent');

        this.ctx.fillStyle = highlightGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawIndicator() {
        // Flecha indicadora en la parte superior (más grande y brillante)
        const indicatorSize = 25;

        this.ctx.save();
        this.ctx.translate(this.x, this.y - this.radius - 30);

        // Sombra de la flecha
        this.ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
        this.ctx.shadowBlur = 20;

        // Gradiente verde brillante para la flecha
        const arrowGradient = this.ctx.createLinearGradient(
            -indicatorSize, -indicatorSize,
            indicatorSize, indicatorSize
        );
        arrowGradient.addColorStop(0, '#00ff88');
        arrowGradient.addColorStop(0.5, '#00ffcc');
        arrowGradient.addColorStop(1, '#00ff88');

        this.ctx.fillStyle = arrowGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(0, indicatorSize);
        this.ctx.lineTo(-indicatorSize, -indicatorSize / 2);
        this.ctx.lineTo(indicatorSize, -indicatorSize / 2);
        this.ctx.closePath();
        this.ctx.fill();

        // Borde brillante de la flecha
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Brillo interno
        this.ctx.shadowBlur = 0;
        const highlight = this.ctx.createLinearGradient(0, -indicatorSize, 0, indicatorSize);
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlight.addColorStop(1, 'transparent');
        this.ctx.fillStyle = highlight;
        this.ctx.fill();

        this.ctx.restore();
    }

    drawParticles() {
        this.ctx.save();

        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 5;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
    }

    darkenColor(color, factor) {
        // Convertir color hex a RGB y oscurecer
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const newR = Math.floor(r * (1 - factor));
        const newG = Math.floor(g * (1 - factor));
        const newB = Math.floor(b * (1 - factor));

        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    lightenColor(color, factor) {
        // Convertir color hex a RGB y aclarar
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
        const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
        const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

        return `rgb(${newR}, ${newG}, ${newB})`;
    }

    getSelectedChip() {
        return this.chips[this.selectedChipIndex];
    }

    getSelectedChipImage() {
        return this.chipsLoaded[this.selectedChipIndex];
    }

    reset() {
        this.spinning = false;
        this.currentAngle = 0;
        this.spinSpeed = 0;
        this.targetAngle = 0;
        this.selectedChipIndex = 0;
        this.particles = []; // Limpiar partículas
        this.visible = false;
    }
}
