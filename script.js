
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