/*
 * 3D Mosaic CAPTCHA
 * (c) 2025 Mehver
 * Released under BSD 3-Clause License
 * https://github.com/Mehver/3D-Mosaic-CAPTCHA
 */


;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser globals
        root.MosaicMatrix = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /**
     * MosaicMatrix constructor
     * @param {number} size - dimension of the square matrix (default 15)
     */
    function MosaicMatrix(size) {
        // default size is 15
        this.size = (typeof size === 'number' && size > 0) ? size : 15;
        this.reset();
    }

    /**
     * Reset to identity permutation:
     *   rowPerm[i] = i, colPerm[i] = i
     * @returns {MosaicMatrix}
     */
    MosaicMatrix.prototype.reset = function () {
        var n = this.size;
        this.rowPerm = new Array(n);
        this.colPerm = new Array(n);
        for (var i = 0; i < n; i++) {
            this.rowPerm[i] = i;
            this.colPerm[i] = i;
        }
        return this;
    };

    /**
     * Swap two rows in the permutation
     * @param {number} i - first row index
     * @param {number} j - second row index
     * @returns {MosaicMatrix}
     */
    MosaicMatrix.prototype.swapRows = function (i, j) {
        var tmp = this.rowPerm[i];
        this.rowPerm[i] = this.rowPerm[j];
        this.rowPerm[j] = tmp;
        return this;
    };

    /**
     * Swap two columns in the permutation
     * @param {number} i - first column index
     * @param {number} j - second column index
     * @returns {MosaicMatrix}
     */
    MosaicMatrix.prototype.swapCols = function (i, j) {
        var tmp = this.colPerm[i];
        this.colPerm[i] = this.colPerm[j];
        this.colPerm[j] = tmp;
        return this;
    };

    /**
     * Apply current permutation to a 2D array
     * @param {Array.<Array>} matrix - original N×N array
     * @returns {Array.<Array>} - permuted N×N array
     */
    MosaicMatrix.prototype.permute = function (matrix) {
        var n = this.size;
        if (!Array.isArray(matrix) || matrix.length !== n) {
            throw new Error('Input matrix must be an array of length ' + n);
        }
        var result = new Array(n);
        for (var r = 0; r < n; r++) {
            var origRow = matrix[this.rowPerm[r]];
            if (!Array.isArray(origRow) || origRow.length !== n) {
                throw new Error('Row ' + this.rowPerm[r] + ' must be an array of length ' + n);
            }
            var newRow = new Array(n);
            for (var c = 0; c < n; c++) {
                newRow[c] = origRow[this.colPerm[c]];
            }
            result[r] = newRow;
        }
        return result;
    };

    return MosaicMatrix;
}));

window.onload = function () {
    // DOM references
    const btnLow = document.getElementById('btnLow');
    const btnMed = document.getElementById('btnMedium');
    const btnHigh = document.getElementById('btnHigh');
    const btnSubmit = document.getElementById('btnSubmit');
    const slider = document.getElementById('rotationSlider');
    const statusDiv = document.getElementById('status');
    const mosaicTable = document.getElementById('mosaicTable');
    const tbody = mosaicTable.querySelector('tbody');
    const theadTr = mosaicTable.querySelector('thead tr');
    const canvas = document.getElementById('viewerCanvas');

    // Configuration
    const GRID_SIZE = 15;
    const BORDER_WIDTH = 2;
    const MAX_ATTEMPTS = 2;
    const TIME_LIMIT = 60;    // seconds
    const NOISE_RATE = 0.05;  // 5%
    const SLIDER_STEP = 5;     // step size
    const ANGLE_LIMIT = 60;    // ±60°

    // State
    let currentDiff = 'Low';
    let attempts = {Low: MAX_ATTEMPTS, Medium: MAX_ATTEMPTS, High: MAX_ATTEMPTS};
    let timeLeft, timerId;
    let perm = new MosaicMatrix(GRID_SIZE);
    let baseAngle, span;

    // Update status line
    function updateStatus(text) {
        if (text) {
            statusDiv.textContent = text;
        } else {
            statusDiv.textContent =
                `Difficulty: ${currentDiff} | Attempts: ${attempts[currentDiff]} | Time left: ${timeLeft}s`;
        }
    }

    // Countdown timer
    function startTimer() {
        clearInterval(timerId);
        timeLeft = TIME_LIMIT;
        updateStatus();
        timerId = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerId);
                updateStatus('Time up! Please refresh.');
                btnSubmit.disabled = true;
            } else {
                updateStatus();
            }
        }, 1000);
    }

    // Shuffle according to difficulty
    function shuffleByDifficulty(diff) {
        perm.reset();
        const range = GRID_SIZE - 2 * BORDER_WIDTH;

        function swap(arr) {
            let i = BORDER_WIDTH + Math.floor(Math.random() * range);
            let j = BORDER_WIDTH + Math.floor(Math.random() * range);
            while (j === i) j = BORDER_WIDTH + Math.floor(Math.random() * range);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        if (diff === 'Low') {
            Math.random() < 0.5 ? swap(perm.rowPerm) : swap(perm.colPerm);
        } else if (diff === 'Medium') {
            swap(perm.rowPerm);
            swap(perm.colPerm);
        } else {
            swap(perm.rowPerm);
            swap(perm.rowPerm);
            swap(perm.colPerm);
        }
    }

    // Reset mosaic and slider
    function resetAll() {
        // always ±ANGLE_LIMIT
        span = ANGLE_LIMIT * 2;
        baseAngle = Math.random() * 360;

        slider.min = 0;
        slider.max = span;
        slider.step = SLIDER_STEP;
        slider.value = span / 2;

        shuffleByDifficulty(currentDiff);
        attempts[currentDiff] = MAX_ATTEMPTS;
        btnSubmit.disabled = false;
        startTimer();
    }

    // Handle difficulty selection
    btnLow.onclick = () => {
        currentDiff = 'Low';
        resetAll();
    };
    btnMed.onclick = () => {
        currentDiff = 'Medium';
        resetAll();
    };
    btnHigh.onclick = () => {
        currentDiff = 'High';
        resetAll();
    };

    // Handle submit
    btnSubmit.onclick = () => {
        let success = true;
        for (let i = 0; i < GRID_SIZE; i++) {
            if (perm.rowPerm[i] !== i || perm.colPerm[i] !== i) {
                success = false;
                break;
            }
        }
        if (success) {
            updateStatus('SUCCESS');
            clearInterval(timerId);
            btnSubmit.disabled = true;
        } else {
            attempts[currentDiff]--;
            if (attempts[currentDiff] > 0) {
                updateStatus();
            } else {
                updateStatus('FAILED');
                clearInterval(timerId);
                btnSubmit.disabled = true;
            }
        }
    };

    // Build the mosaic table
    (function buildTable() {
        let hdr = '<th></th>';
        for (let c = 0; c < GRID_SIZE; c++) {
            hdr += (c >= BORDER_WIDTH && c < GRID_SIZE - BORDER_WIDTH)
                ? '<th class="colHeader">·</th>'
                : '<th></th>';
        }
        theadTr.innerHTML = hdr;

        for (let r = 0; r < GRID_SIZE; r++) {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            if (r >= BORDER_WIDTH && r < GRID_SIZE - BORDER_WIDTH) {
                th.className = 'rowHeader';
                th.textContent = '·';
            }
            tr.appendChild(th);
            for (let c = 0; c < GRID_SIZE; c++) {
                tr.appendChild(document.createElement('td'));
            }
            tbody.appendChild(tr);
        }
    })();

    // WebGL setup
    const gl = WebGLUtils.setupWebGL(canvas);
    const prog = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(prog);
    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);

    // Cube data
    function createCube() {
        const faceColors = [
            [1, 0, 0], [0, 1, 0], [0, 0, 1],
            [1, 1, 0], [1, 0, 1], [0, 1, 1]
        ];
        const positions = [], colors = [], indices = [];
        const quads = [
            [[.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5], [.5, -.5, .5]],
            [[-.5, -.5, .5], [-.5, .5, .5], [-.5, .5, -.5], [-.5, -.5, -.5]],
            [[-.5, .5, -.5], [.5, .5, -.5], [.5, .5, .5], [-.5, .5, .5]],
            [[-.5, -.5, .5], [.5, -.5, .5], [.5, -.5, -.5], [-.5, -.5, -.5]],
            [[-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]],
            [[-.5, .5, -.5], [.5, .5, -.5], [.5, -.5, -.5], [-.5, -.5, -.5]]
        ];
        let off = 0;
        quads.forEach((quad, i) => {
            quad.forEach(v => {
                positions.push(...v);
                colors.push(...faceColors[i]);
            });
            indices.push(off, off + 1, off + 2, off, off + 2, off + 3);
            off += 4;
        });
        return {
            pos: new Float32Array(positions),
            col: new Float32Array(colors),
            idx: new Uint16Array(indices)
        };
    }

    const cube = createCube();

    function setupAttrib(buf, data, name, size) {
        const loc = gl.getAttribLocation(prog, name);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    }

    const posBuf = gl.createBuffer();
    const colBuf = gl.createBuffer();
    const idxBuf = gl.createBuffer();
    setupAttrib(posBuf, cube.pos, 'vPosition', 3);
    setupAttrib(colBuf, cube.col, 'vColor', 3);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cube.idx, gl.STATIC_DRAW);

    const uP = gl.getUniformLocation(prog, 'uPMatrix');
    const uM = gl.getUniformLocation(prog, 'uMVMatrix');
    const uT = gl.getUniformLocation(prog, 'uTheta');

    // Drag-and-drop
    Sortable.create(tbody, {
        animation: 150,
        handle: '.rowHeader',
        onMove(evt) {
            let i = Array.prototype.indexOf.call(tbody.children, evt.related);
            if (evt.willInsertAfter) i++;
            return i >= BORDER_WIDTH && i < GRID_SIZE - BORDER_WIDTH;
        },
        onEnd(evt) {
            const v = perm.rowPerm.splice(evt.oldIndex, 1)[0];
            perm.rowPerm.splice(evt.newIndex, 0, v);
        }
    });
    Sortable.create(theadTr, {
        animation: 150,
        handle: '.colHeader',
        onMove(evt) {
            let i = Array.prototype.indexOf.call(theadTr.children, evt.related);
            if (evt.willInsertAfter) i++;
            const c = i - 1;
            return c >= BORDER_WIDTH && c < GRID_SIZE - BORDER_WIDTH;
        },
        onEnd(evt) {
            const o = evt.oldIndex - 1, n = evt.newIndex - 1;
            if (o >= 0 && n >= 0) {
                const v = perm.colPerm.splice(o, 1)[0];
                perm.colPerm.splice(n, 0, v);
            }
        }
    });

    // Offscreen canvas
    const off = document.createElement('canvas');
    off.width = off.height = GRID_SIZE;
    const offCtx = off.getContext('2d');
    offCtx.imageSmoothingEnabled = false;

    // Render loop
    function render() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const offset = Number(slider.value) - span / 2;
        const actual = baseAngle + offset;
        const theta = [actual, actual, 0];

        const asp = canvas.width / canvas.height;
        const proj = ortho(-asp, asp, -1, 1, -10, 10);
        let mv = mat4();
        mv = mult(rotate(theta[0], [1, 0, 0]), mv);
        mv = mult(rotate(theta[1], [0, 1, 0]), mv);

        gl.uniformMatrix4fv(uP, false, flatten(proj));
        gl.uniformMatrix4fv(uM, false, flatten(mv));
        gl.uniform3fv(uT, theta);
        gl.drawElements(gl.TRIANGLES, cube.idx.length, gl.UNSIGNED_SHORT, 0);

        // sample mosaic
        offCtx.clearRect(0, 0, GRID_SIZE, GRID_SIZE);
        offCtx.drawImage(canvas, 0, 0, GRID_SIZE, GRID_SIZE);
        const data = offCtx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;

        const matrix = Array.from({length: GRID_SIZE}, (_, r) =>
            Array.from({length: GRID_SIZE}, (_, c) => {
                const i = (r * GRID_SIZE + c) * 4;
                return `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
            })
        );
        const disp = perm.permute(matrix);

        for (let r = 0; r < GRID_SIZE; r++) {
            const row = tbody.children[r];
            for (let c = 0; c < GRID_SIZE; c++) {
                row.cells[c + 1].style.backgroundColor =
                    Math.random() < NOISE_RATE ? 'rgb(128,128,128)' : disp[r][c];
            }
        }

        requestAnimationFrame(render);
    }

    // Start
    resetAll();
    render();
};
