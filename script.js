
// Obtenemos referencias al canvas
const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');

// Referencias a los inputs del viewport
const inputXmin = document.getElementById('inputXmin');
const inputXmax = document.getElementById('inputXmax');
const inputYmin = document.getElementById('inputYmin');
const inputYmax = document.getElementById('inputYmax');

// Referencias a los inputs de la línea
const inputX1 = document.getElementById('inputX1');
const inputY1 = document.getElementById('inputY1');
const inputX2 = document.getElementById('inputX2');
const inputY2 = document.getElementById('inputY2');

// Referencias a los botones
const btnActualizarViewport = document.getElementById('btnActualizarViewport');
const btnActualizarLinea = document.getElementById('btnActualizarLinea');
const btnResetear = document.getElementById('btnResetear');

// Referencias para actualizar los textos de los cálculos
const p1CoordsSpan = document.getElementById('p1Coords');
const p2CoordsSpan = document.getElementById('p2Coords');
const codigoP1Span = document.getElementById('codigoP1');
const codigoP2Span = document.getElementById('codigoP2');
const resultadoORSpan = document.getElementById('resultadoOR');
const resultadoANDSpan = document.getElementById('resultadoAND');
const estadoTexto = document.getElementById('estadoTexto');
const estadoContainer = document.getElementById('estadoContainer');

// Variables del VIEWPORT (se actualizarán con los inputs)
let VIEWPORT = {
    Xmin: 200,
    Xmax: 600,
    Ymin: 150,
    Ymax: 450
};

// Variables para los puntos de la línea
let p1 = { x: 100, y: 100 };
let p2 = { x: 700, y: 500 };

// Variable para controlar si estamos arrastrando algún punto
let puntoArrastrando = null; // 'p1', 'p2', o null

console.log('✅ Configuración inicial cargada');
console.log('📐 Viewport inicial: Xmin=200, Xmax=600, Ymin=150, Ymax=450');
console.log('📏 Línea inicial: P1(100,100), P2(700,500)');

const DENTRO = 0b0000;      // 0 en decimal
const IZQUIERDA = 0b0001;   // 1 en decimal - Bit 0
const DERECHA = 0b0010;     // 2 en decimal - Bit 1
const ABAJO = 0b0100;       // 4 en decimal - Bit 2
const ARRIBA = 0b1000;      // 8 en decimal - Bit 3

function calcularCodigo(x, y) {
    // Empezamos con el código 0000 (DENTRO)
    let codigo = DENTRO;
    
    // Verificamos posición vertical (Y)
    // Estudiante: Uso if-else porque un punto no puede estar ARRIBA y ABAJO al mismo tiempo
    if (y > VIEWPORT.Ymax) {
        // Activamos el bit de ARRIBA usando OR bit a bit (|)
        // Ejemplo: 0000 | 1000 = 1000
        codigo = codigo | ARRIBA;
    } else if (y < VIEWPORT.Ymin) {
        // Activamos el bit de ABAJO
        // Ejemplo: 0000 | 0100 = 0100
        codigo = codigo | ABAJO;
    }
    
    // Verificamos posición horizontal (X)
    // Puede estar a la DERECHA o a la IZQUIERDA
    if (x > VIEWPORT.Xmax) {
        // Activamos el bit de DERECHA
        codigo = codigo | DERECHA;
    } else if (x < VIEWPORT.Xmin) {
        // Activamos el bit de IZQUIERDA
        codigo = codigo | IZQUIERDA;
    }
    
    // Retornamos el código calculado
    return codigo;
}

/**
 * Convierte un código numérico a su representación binaria de 4 bits
 * Ejemplo: 9 (1001 en binario) -> "1001"
 * 
 * @param {number} codigo - El código en decimal
 * @returns {string} - Cadena de 4 caracteres con los bits
 */
function formatearBinario(codigo) {
    // toString(2) convierte a binario
    // padStart(4, '0') asegura que tenga 4 dígitos rellenando con ceros a la izquierda
    return codigo.toString(2).padStart(4, '0');
}

console.log('✅ Función calcularCodigo() implementada');

function analizarLinea() {
    // PASO 1: Calcular códigos de los dos extremos de la línea
    const codigoP1 = calcularCodigo(p1.x, p1.y);
    const codigoP2 = calcularCodigo(p2.x, p2.y);
    
    // PASO 2: Operación OR bit a bit
    // Estudiante: OR devuelve 1 si AL MENOS UNO de los bits es 1
    // Si OR == 0000, significa que AMBOS códigos son 0000 (AMBOS DENTRO)
    const resultadoOR = codigoP1 | codigoP2;
    
    // PASO 3: Operación AND bit a bit
    // Estudiante: AND devuelve 1 SOLO SI AMBOS bits son 1
    // Si AND != 0000, significa que AMBOS puntos comparten al menos un bit '1'
    // Geométricamente: AMBOS están fuera del MISMO lado
    const resultadoAND = codigoP1 & codigoP2;
    
    // PASO 4: Determinar el estado según las reglas de Cohen-Sutherland
    let estado = '';
    let colorEstado = '';
    
    // REGLA 1: Aceptación Trivial
    // Estudiante: Si OR == 0000, ambos códigos son 0000
    if (resultadoOR === DENTRO) {
        estado = '✅ DENTRO (Aceptación Trivial)';
        colorEstado = '#2ecc71';  // Verde
    }
    // REGLA 2: Rechazo Trivial
    // Estudiante: Si AND != 0000, comparten al menos un bit '1'
    else if (resultadoAND !== DENTRO) {
        estado = '❌ FUERA (Rechazo Trivial)';
        colorEstado = '#e74c3c';  // Rojo
    }
    // REGLA 3: La línea cruza la ventana (ni dentro ni completamente fuera del mismo lado)
    else {
        estado = '✂️ CRUZA (Requiere Recorte - Cálculo de intersección)';
        colorEstado = '#3498db';  // Azul
    }
    
    // Retornamos todos los datos para mostrarlos en pantalla
    return {
        codigoP1: codigoP1,
        codigoP2: codigoP2,
        resultadoOR: resultadoOR,
        resultadoAND: resultadoAND,
        estado: estado,
        colorEstado: colorEstado
    };
}

console.log('✅ Función analizarLinea() con OR y AND implementada');

function dibujarViewport() {
    // Relleno semitransparente para identificar el área de recorte
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.fillRect(
        VIEWPORT.Xmin, 
        VIEWPORT.Ymin, 
        VIEWPORT.Xmax - VIEWPORT.Xmin, 
        VIEWPORT.Ymax - VIEWPORT.Ymin
    );
    
    // Borde del viewport (línea blanca punteada para que se vea claro)
    ctx.strokeStyle = '#a8dadc';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
        VIEWPORT.Xmin, 
        VIEWPORT.Ymin, 
        VIEWPORT.Xmax - VIEWPORT.Xmin, 
        VIEWPORT.Ymax - VIEWPORT.Ymin
    );
    ctx.setLineDash([]); // Resetear a línea continua
    
    // Dibujar líneas de referencia Xmin, Xmax, Ymin, Ymax
    ctx.strokeStyle = '#457b9d';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    
    // Línea vertical Xmin
    ctx.beginPath();
    ctx.moveTo(VIEWPORT.Xmin, 0);
    ctx.lineTo(VIEWPORT.Xmin, canvas.height);
    ctx.stroke();
    
    // Línea vertical Xmax
    ctx.beginPath();
    ctx.moveTo(VIEWPORT.Xmax, 0);
    ctx.lineTo(VIEWPORT.Xmax, canvas.height);
    ctx.stroke();
    
    // Línea horizontal Ymin
    ctx.beginPath();
    ctx.moveTo(0, VIEWPORT.Ymin);
    ctx.lineTo(canvas.width, VIEWPORT.Ymin);
    ctx.stroke();
    
    // Línea horizontal Ymax
    ctx.beginPath();
    ctx.moveTo(0, VIEWPORT.Ymax);
    ctx.lineTo(canvas.width, VIEWPORT.Ymax);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Etiquetas de texto para identificar los bordes
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#6c757d';
    ctx.fillText(`Xmin=${VIEWPORT.Xmin}`, VIEWPORT.Xmin - 70, VIEWPORT.Ymin - 5);
    ctx.fillText(`Xmax=${VIEWPORT.Xmax}`, VIEWPORT.Xmax + 5, VIEWPORT.Ymin - 5);
    ctx.fillText(`Ymin=${VIEWPORT.Ymin}`, VIEWPORT.Xmin - 70, VIEWPORT.Ymin + 15);
    ctx.fillText(`Ymax=${VIEWPORT.Ymax}`, VIEWPORT.Xmin - 70, VIEWPORT.Ymax - 5);
}

/**
 * Dibuja la línea y los puntos en el canvas
 * @param {Object} analisis - Resultado de la función analizarLinea()
 */
function dibujarLineaYPuntos(analisis) {
    // Dibujar la línea con el color según su estado
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = analisis.colorEstado;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Dibujar P1 (punto fijo) - Círculo blanco
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Dibujar P2 (punto móvil) - Círculo azul
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Etiquetas P1 y P2
    ctx.font = 'bold 14px Courier New';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('P1', p1.x + 10, p1.y - 10);
    ctx.fillStyle = '#3498db';
    ctx.fillText('P2', p2.x + 10, p2.y - 10);
}

function actualizarPanelInfo(analisis) {
    // Actualizar coordenadas
    p1CoordsSpan.textContent = `(${p1.x}, ${p1.y})`;
    p2CoordsSpan.textContent = `(${p2.x}, ${p2.y})`;
    
    // Actualizar códigos en formato binario
    codigoP1Span.textContent = formatearBinario(analisis.codigoP1);
    codigoP2Span.textContent = formatearBinario(analisis.codigoP2);
    
    // Actualizar resultado OR (Aceptación Trivial)
    resultadoORSpan.textContent = formatearBinario(analisis.resultadoOR);
    
    // Actualizar resultado AND (Rechazo Trivial)
    resultadoANDSpan.textContent = formatearBinario(analisis.resultadoAND);
    
    // Actualizar estado
    estadoTexto.textContent = analisis.estado;
    estadoContainer.style.backgroundColor = analisis.colorEstado + '22'; // con transparencia
    estadoContainer.style.color = analisis.colorEstado;
    estadoContainer.style.border = `2px solid ${analisis.colorEstado}`;
    
    // Actualizar los inputs con los valores actuales
    inputX1.value = p1.x;
    inputY1.value = p1.y;
    inputX2.value = p2.x;
    inputY2.value = p2.y;
}

/**
 * Función auxiliar para dibujar etiquetas de las 9 regiones
 * Esto ayuda a visualizar la cuadrícula que explicó el profesor
 */
function dibujarEtiquetasRegiones() {
    ctx.font = '10px Courier New';
    ctx.fillStyle = '#555555';
    
    // Región Superior Izquierda
    ctx.fillText('1001', 50, 50);
    // Región Superior Central
    ctx.fillText('1000', 380, 50);
    // Región Superior Derecha
    ctx.fillText('1010', 650, 50);
    
    // Región Central Izquierda
    ctx.fillText('0001', 50, 300);
    // Región Central (DENTRO)
    ctx.fillStyle = '#2ecc71';
    ctx.fillText('0000', 380, 300);
    ctx.fillStyle = '#555555';
    // Región Central Derecha
    ctx.fillText('0010', 650, 300);
    
    // Región Inferior Izquierda
    ctx.fillText('0101', 50, 550);
    // Región Inferior Central
    ctx.fillText('0100', 380, 550);
    // Región Inferior Derecha
    ctx.fillText('0110', 650, 550);
}

/**
 * Función principal de renderizado
 * Se llama cada vez que hay un cambio
 */
function renderizar() {
    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar el fondo negro
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar el viewport
    dibujarViewport();
    
    // Analizar la línea actual (aquí ocurren las operaciones OR y AND)
    const analisis = analizarLinea();
    
    // Dibujar la línea y los puntos
    dibujarLineaYPuntos(analisis);
    
    // Actualizar el panel de información con los cálculos
    actualizarPanelInfo(analisis);
    
    // Dibujar la cuadrícula de regiones (las