// Traemos el canvas para poder dibujar en él
const canvas = document.getElementById('miCanvas');
const ctx = canvas.getContext('2d');

// Elementos del HTML para el cuadro de recorte (el viewport)
const inputXmin = document.getElementById('inputXmin');
const inputXmax = document.getElementById('inputXmax');
const inputYmin = document.getElementById('inputYmin');
const inputYmax = document.getElementById('inputYmax');

// Elementos para las coordenadas de la línea
const inputX1 = document.getElementById('inputX1');
const inputY1 = document.getElementById('inputY1');
const inputX2 = document.getElementById('inputX2');
const inputY2 = document.getElementById('inputY2');

// Botones de la interfaz
const btnActualizarViewport = document.getElementById('btnActualizarViewport');
const btnActualizarLinea = document.getElementById('btnActualizarLinea');
const btnResetear = document.getElementById('btnResetear');

// Spans y cajas donde mostramos los cálculos de los bits y el estado
const p1CoordsSpan = document.getElementById('p1Coords');
const p2CoordsSpan = document.getElementById('p2Coords');
const codigoP1Span = document.getElementById('codigoP1');
const codigoP2Span = document.getElementById('codigoP2');
const resultadoORSpan = document.getElementById('resultadoOR');
const resultadoANDSpan = document.getElementById('resultadoAND');
const estadoTexto = document.getElementById('estadoTexto');
const estadoContainer = document.getElementById('estadoContainer');

// Estos son los límites iniciales de nuestra "ventana" de recorte
let VIEWPORT = {
    Xmin: 200,
    Xmax: 600,
    Ymin: 150,
    Ymax: 450
};

// Coordenadas iniciales de la línea (P1 es el origen, P2 el final)
let p1 = { x: 100, y: 100 };
let p2 = { x: 700, y: 500 };

// Para saber si estoy moviendo un punto con el mouse
let puntoArrastrando = null; 

// Definimos las constantes de los bits (el profe explicó que son potencias de 2)
const DENTRO = 0b0000;    // 0: El punto está en la zona segura
const IZQUIERDA = 0b0001; // 1: Bit 0
const DERECHA = 0b0010;   // 2: Bit 1
const ABAJO = 0b0100;     // 4: Bit 2
const ARRIBA = 0b1000;    // 8: Bit 3

// Función para ponerle su "etiqueta" (código) a cada punto según dónde esté
function calcularCodigo(x, y) {
    let codigo = DENTRO;
    
    // Ojo: En Canvas la Y crece hacia abajo, por eso ARRIBA es menor a Ymin
    if (y < VIEWPORT.Ymin) {
        codigo |= ARRIBA; 
    } else if (y > VIEWPORT.Ymax) {
        codigo |= ABAJO;
    }
    
    // Lo mismo para los lados (X)
    if (x > VIEWPORT.Xmax) {
        codigo |= DERECHA;
    } else if (x < VIEWPORT.Xmin) {
        codigo |= IZQUIERDA;
    }
    
    return codigo;
}

// Para que el binario se vea bonito en el panel (ej. 0001 en vez de 1)
function formatearBinario(codigo) {
    return codigo.toString(2).padStart(4, '0');
}

// Aquí es donde ocurre la magia del recorte real
function analizarLinea() {
    let x1 = p1.x, y1 = p1.y;
    let x2 = p2.x, y2 = p2.y;
    
    // Guardamos los códigos del principio para mostrarlos en el panel
    const codigoInicialP1 = calcularCodigo(x1, y1);
    const codigoInicialP2 = calcularCodigo(x2, y2);
    
    let aceptada = false;
    let lineaRecortada = { x1, y1, x2, y2 };

    // Bucle para ir recortando la línea pedazo a pedazo hasta que quepa o se descarte
    while (true) {
        let cod1 = calcularCodigo(x1, y1);
        let cod2 = calcularCodigo(x2, y2);

        // Caso fácil 1: Si ambos están dentro, la aceptamos de una
        if ((cod1 | cod2) === 0) {
            aceptada = true; 
            break;
        } 
        // Caso fácil 2: Si comparten un bit fuera, la línea no se ve (está totalmente afuera)
        else if ((cod1 & cod2) !== 0) {
            aceptada = false; 
            break;
        } 
        // Caso difícil: La línea cruza un borde, hay que calcular dónde se corta
        else {
            // Elegimos el punto que esté afuera para "mocharlo"
            let codFuera = cod1 !== 0 ? cod1 : cod2;
            let x, y;

            // Usamos las fórmulas de intersección de líneas que vimos en clase
            if (codFuera & ARRIBA) {
                x = x1 + (x2 - x1) * (VIEWPORT.Ymin - y1) / (y2 - y1);
                y = VIEWPORT.Ymin;
            } else if (codFuera & ABAJO) {
                x = x1 + (x2 - x1) * (VIEWPORT.Ymax - y1) / (y2 - y1);
                y = VIEWPORT.Ymax;
            } else if (codFuera & DERECHA) {
                y = y1 + (y2 - y1) * (VIEWPORT.Xmax - x1) / (x2 - x1);
                x = VIEWPORT.Xmax;
            } else if (codFuera & IZQUIERDA) {
                y = y1 + (y2 - y1) * (VIEWPORT.Xmin - x1) / (x2 - x1);
                x = VIEWPORT.Xmin;
            }

            // Actualizamos el punto original con las nuevas coordenadas del recorte
            if (codFuera === cod1) {
                x1 = x; y1 = y;
            } else {
                x2 = x; y2 = y;
            }
        }
    }

    lineaRecortada = { x1, y1, x2, y2 };

    // Definimos el texto y el color del estado para que la UI se vea pro
    let estado = '';
    let color = '';
    const resOR = codigoInicialP1 | codigoInicialP2;
    const resAND = codigoInicialP1 & codigoInicialP2;

    if (resOR === 0) {
        estado = '✅ DENTRO (Aceptación Trivial)';
        color = '#2ecc71'; // Verde
    } else if (resAND !== 0) {
        estado = '❌ FUERA (Rechazo Trivial)';
        color = '#e74c3c'; // Rojo
    } else {
        estado = aceptada ? '✂️ RECORTADA (Intersección)' : '❌ FUERA (Tras recorte)';
        color = '#3498db'; // Azul
    }

    return {
        codigoP1: codigoInicialP1,
        codigoP2: codigoInicialP2,
        resultadoOR: resOR,
        resultadoAND: resAND,
        estado: estado,
        colorEstado: color,
        aceptada: aceptada,
        lineaFinal: lineaRecortada
    };
}

// Dibujamos el área de visión (el cuadrito azul claro)
function dibujarViewport() {
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.fillRect(VIEWPORT.Xmin, VIEWPORT.Ymin, VIEWPORT.Xmax - VIEWPORT.Xmin, VIEWPORT.Ymax - VIEWPORT.Ymin);
    
    ctx.strokeStyle = '#a8dadc';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Línea punteada para los bordes
    ctx.strokeRect(VIEWPORT.Xmin, VIEWPORT.Ymin, VIEWPORT.Xmax - VIEWPORT.Xmin, VIEWPORT.Ymax - VIEWPORT.Ymin);
    ctx.setLineDash([]); 

    // Dibujamos unas líneas guía que atraviesen todo el canvas
    ctx.strokeStyle = '#457b9d';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    
    // Verticales (X)
    ctx.beginPath(); ctx.moveTo(VIEWPORT.Xmin, 0); ctx.lineTo(VIEWPORT.Xmin, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(VIEWPORT.Xmax, 0); ctx.lineTo(VIEWPORT.Xmax, canvas.height); ctx.stroke();
    
    // Horizontales (Y)
    ctx.beginPath(); ctx.moveTo(0, VIEWPORT.Ymin); ctx.lineTo(canvas.width, VIEWPORT.Ymin); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, VIEWPORT.Ymax); ctx.lineTo(canvas.width, VIEWPORT.Ymax); ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Texto para saber cuáles son los valores de los bordes
    ctx.font = '12px Courier New';
    ctx.fillStyle = '#6c757d';
    ctx.fillText(`Xmin=${VIEWPORT.Xmin}`, VIEWPORT.Xmin - 70, VIEWPORT.Ymin - 5);
    ctx.fillText(`Xmax=${VIEWPORT.Xmax}`, VIEWPORT.Xmax + 5, VIEWPORT.Ymin - 5);
    ctx.fillText(`Ymin=${VIEWPORT.Ymin}`, VIEWPORT.Xmin - 70, VIEWPORT.Ymin + 15);
    ctx.fillText(`Ymax=${VIEWPORT.Ymax}`, VIEWPORT.Xmin - 70, VIEWPORT.Ymax - 5);
}

// Función para pintar la línea y sus puntos en el canvas
function dibujarLineaYPuntos(analisis) {
    // Primero pinto la línea original completa en gris oscuro para que se note el rastro
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = '#333'; 
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Si el algoritmo dice que algo de la línea es visible, pintamos el recorte
    if (analisis.aceptada) {
        ctx.beginPath();
        ctx.moveTo(analisis.lineaFinal.x1, analisis.lineaFinal.y1);
        ctx.lineTo(analisis.lineaFinal.x2, analisis.lineaFinal.y2);
        ctx.strokeStyle = analisis.colorEstado;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Dibujamos las bolitas de los extremos para poder moverlas
    ctx.fillStyle = '#ffffff'; // P1 blanco (fijo)
    ctx.beginPath(); ctx.arc(p1.x, p1.y, 6, 0, 2 * Math.PI); ctx.fill();
    
    ctx.fillStyle = '#3498db'; // P2 azul (móvil)
    ctx.beginPath(); ctx.arc(p2.x, p2.y, 6, 0, 2 * Math.PI); ctx.fill();
}

// Para llenar de información el panel que está debajo del canvas
function actualizarPanelInfo(analisis) {
    // Redondeamos para que no se vea feo con tantos decimales
    p1CoordsSpan.textContent = `(${Math.round(p1.x)}, ${Math.round(p1.y)})`;
    p2CoordsSpan.textContent = `(${Math.round(p2.x)}, ${Math.round(p2.y)})`;
    
    codigoP1Span.textContent = formatearBinario(analisis.codigoP1);
    codigoP2Span.textContent = formatearBinario(analisis.codigoP2);
    resultadoORSpan.textContent = formatearBinario(analisis.resultadoOR);
    resultadoANDSpan.textContent = formatearBinario(analisis.resultadoAND);
    
    estadoTexto.textContent = analisis.estado;
    estadoContainer.style.backgroundColor = analisis.colorEstado + '22';
    estadoContainer.style.color = analisis.colorEstado;
    estadoContainer.style.border = `2px solid ${analisis.colorEstado}`;
    
    // Mantenemos los inputs de texto sincronizados con lo que hacemos con el mouse
    inputX1.value = Math.round(p1.x);
    inputY1.value = Math.round(p1.y);
    inputX2.value = Math.round(p2.x);
    inputY2.value = Math.round(p2.y);
}

// Guía visual de las 9 regiones para entender los códigos binarios
function dibujarEtiquetasRegiones() {
    ctx.font = '10px Courier New';
    ctx.fillStyle = '#555555';
    
    // Fila superior
    ctx.fillText('1001', 50, 50);  ctx.fillText('1000', 380, 50); ctx.fillText('1010', 650, 50);
    // Fila central
    ctx.fillText('0001', 50, 300); ctx.fillStyle = '#2ecc71'; ctx.fillText('0000', 380, 300); ctx.fillStyle = '#555555'; ctx.fillText('0010', 650, 300);
    // Fila inferior
    ctx.fillText('0101', 50, 550); ctx.fillText('0100', 380, 550); ctx.fillText('0110', 650, 550);
}

// Esta es la función principal que refresca todo el dibujo
function renderizar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar para no dejar manchas
    
    ctx.fillStyle = '#000000'; // Fondo negro como de terminal
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    dibujarViewport();
    dibujarEtiquetasRegiones();
    
    const analisis = analizarLinea(); // Calculamos el recorte
    dibujarLineaYPuntos(analisis); // Pintamos la línea mochadita
    actualizarPanelInfo(analisis); // Ponemos los datos en el HTML
}

// Arrancamos el renderizado por primera vez
renderizar();