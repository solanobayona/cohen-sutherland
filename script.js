// Traemos el canvas y el contexto para dibujar
const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');

// Elementos de la interfaz para el Viewport
const inputXmin = document.getElementById('inputXmin');
const inputXmax = document.getElementById('inputXmax');
const inputYmin = document.getElementById('inputYmin');
const inputYmax = document.getElementById('inputYmax');

// Elementos para la línea
const inputX1 = document.getElementById('inputX1');
const inputY1 = document.getElementById('inputY1');
const inputX2 = document.getElementById('inputX2');
const inputY2 = document.getElementById('inputY2');

// Botones
const btnActualizarViewport = document.getElementById('btnActualizarViewport');
const btnActualizarLinea = document.getElementById('btnActualizarLinea');
const btnResetear = document.getElementById('btnResetear');

// Panel de datos
const p1CoordsSpan = document.getElementById('p1Coords');
const p2CoordsSpan = document.getElementById('p2Coords');
const codigoP1Span = document.getElementById('codigoP1');
const codigoP2Span = document.getElementById('codigoP2');
const resultadoORSpan = document.getElementById('resultadoOR');
const resultadoANDSpan = document.getElementById('resultadoAND');
const estadoTexto = document.getElementById('estadoTexto');
const estadoContainer = document.getElementById('estadoContainer');

// Variables globales del programa
let VIEWPORT = { Xmin: 200, Xmax: 600, Ymin: 150, Ymax: 450 };
let p1 = { x: 100, y: 100 };
let p2 = { x: 700, y: 500 };
let puntoArrastrando = null; // Para saber qué punto estamos moviendo

// Definición de los bits (los de la clase del profe)
const DENTRO = 0;    // 0000
const IZQUIERDA = 1; // 0001
const DERECHA = 2;   // 0010
const ABAJO = 4;     // 0100
const ARRIBA = 8;    // 1000

// Función para calcular el código de región (OutCode)
function calcularCodigo(x, y) {
    let codigo = DENTRO;
    if (x < VIEWPORT.Xmin) codigo |= IZQUIERDA;
    else if (x > VIEWPORT.Xmax) codigo |= DERECHA;
    if (y < VIEWPORT.Ymin) codigo |= ARRIBA; // En canvas Y=0 es arriba
    else if (y > VIEWPORT.Ymax) codigo |= ABAJO;
    return codigo;
}

function formatearBinario(codigo) {
    return codigo.toString(2).padStart(4, '0');
}

// El algoritmo de Cohen-Sutherland para recortar
function analizarLinea() {
    let x1 = p1.x, y1 = p1.y;
    let x2 = p2.x, y2 = p2.y;
    
    const codInicial1 = calcularCodigo(x1, y1);
    const codInicial2 = calcularCodigo(x2, y2);
    
    let aceptada = false;
    let xFinal1 = x1, yFinal1 = y1, xFinal2 = x2, yFinal2 = y2;

    while (true) {
        let c1 = calcularCodigo(x1, y1);
        let c2 = calcularCodigo(x2, y2);

        if ((c1 | c2) === 0) { // Aceptación total
            aceptada = true;
            xFinal1 = x1; yFinal1 = y1; xFinal2 = x2; yFinal2 = y2;
            break;
        } else if ((c1 & c2) !== 0) { // Rechazo total
            aceptada = false;
            break;
        } else {
            // Hay que recortar
            let cFuera = c1 !== 0 ? c1 : c2;
            let x, y;

            if (cFuera & ARRIBA) {
                x = x1 + (x2 - x1) * (VIEWPORT.Ymin - y1) / (y2 - y1);
                y = VIEWPORT.Ymin;
            } else if (cFuera & ABAJO) {
                x = x1 + (x2 - x1) * (VIEWPORT.Ymax - y1) / (y2 - y1);
                y = VIEWPORT.Ymax;
            } else if (cFuera & DERECHA) {
                y = y1 + (y2 - y1) * (VIEWPORT.Xmax - x1) / (x2 - x1);
                x = VIEWPORT.Xmax;
            } else if (cFuera & IZQUIERDA) {
                y = y1 + (y2 - y1) * (VIEWPORT.Xmin - x1) / (x2 - x1);
                x = VIEWPORT.Xmin;
            }

            if (cFuera === c1) { x1 = x; y1 = y; }
            else { x2 = x; y2 = y; }
        }
    }

    // Configuración visual del estado
    let resOR = codInicial1 | codInicial2;
    let resAND = codInicial1 & codInicial2;
    let msj = '', col = '';

    if (resOR === 0) { msj = '✅ DENTRO'; col = '#2ecc71'; }
    else if (resAND !== 0) { msj = '❌ FUERA (R. Trivial)'; col = '#e74c3c'; }
    else { msj = aceptada ? '✂️ RECORTADA' : '❌ FUERA'; col = '#3498db'; }

    return { cod1: codInicial1, cod2: codInicial2, resOR, resAND, msj, col, aceptada,
             linea: { x1: xFinal1, y1: yFinal1, x2: xFinal2, y2: yFinal2 } };
}

// --- DIBUJO ---
function renderizar() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar Viewport
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.fillRect(VIEWPORT.Xmin, VIEWPORT.Ymin, VIEWPORT.Xmax - VIEWPORT.Xmin, VIEWPORT.Ymax - VIEWPORT.Ymin);
    ctx.strokeStyle = '#a8dadc';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(VIEWPORT.Xmin, VIEWPORT.Ymin, VIEWPORT.Xmax - VIEWPORT.Xmin, VIEWPORT.Ymax - VIEWPORT.Ymin);
    ctx.setLineDash([]);

    const res = analizarLinea();

    // Línea original "fantasma"
    ctx.strokeStyle = '#333';
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

    // Línea recortada
    if (res.aceptada) {
        ctx.strokeStyle = res.col;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(res.linea.x1, res.linea.y1); ctx.lineTo(res.linea.x2, res.linea.y2); ctx.stroke();
        ctx.lineWidth = 1;
    }

    // Puntos
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(p1.x, p1.y, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#3498db';
    ctx.beginPath(); ctx.arc(p2.x, p2.y, 8, 0, Math.PI*2); ctx.fill();

    actualizarUI(res);
}

function actualizarUI(res) {
    p1CoordsSpan.textContent = `(${Math.round(p1.x)}, ${Math.round(p1.y)})`;
    p2CoordsSpan.textContent = `(${Math.round(p2.x)}, ${Math.round(p2.y)})`;
    codigoP1Span.textContent = formatearBinario(res.cod1);
    codigoP2Span.textContent = formatearBinario(res.cod2);
    resultadoORSpan.textContent = formatearBinario(res.resOR);
    resultadoANDSpan.textContent = formatearBinario(res.resAND);
    estadoTexto.textContent = res.msj;
    estadoContainer.style.borderColor = res.col;
    estadoContainer.style.color = res.col;
}

// --- EVENTOS DE INTERACCIÓN ---

// Mover puntos con el mouse
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (Math.hypot(mx - p1.x, my - p1.y) < 20) puntoArrastrando = 'p1';
    else if (Math.hypot(mx - p2.x, my - p2.y) < 20) puntoArrastrando = 'p2';
});

window.addEventListener('mousemove', (e) => {
    if (!puntoArrastrando) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (puntoArrastrando === 'p1') { p1.x = mx; p1.y = my; }
    else { p2.x = mx; p2.y = my; }
    renderizar();
});

window.addEventListener('mouseup', () => { puntoArrastrando = null; });

// Botones
btnActualizarViewport.onclick = () => {
    VIEWPORT = { Xmin: +inputXmin.value, Xmax: +inputXmax.value, Ymin: +inputYmin.value, Ymax: +inputYmax.value };
    renderizar();
};

btnActualizarLinea.onclick = () => {
    p1 = { x: +inputX1.value, y: +inputY1.value };
    p2 = { x: +inputX2.value, y: +inputY2.value };
    renderizar();
};

btnResetear.onclick = () => location.reload();

// Inicio
renderizar();