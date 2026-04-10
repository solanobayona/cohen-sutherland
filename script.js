
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