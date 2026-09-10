/* ============================================================
   MODULE: graph-modal.js — aaradhyadt.github.io (v53.21)
   High-Performance 3D WebGL Knowledge Graph HUD (CodeWiki Architecture)
   Visualizes the repository's AST & semantic knowledge graph (720+ nodes,
   980+ links) using zero-dependency WebGL 2, hardware instancing,
   and a demand-driven (dirty) throttled render loop.
   ============================================================ */

(function initGraphModalModule() {
  'use strict';

  let graphModal = null;
  let gl = null;
  let canvas = null;
  let animationFrameId = null;
  let renderPending = false;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let rotX = 0.35;
  let rotY = -0.45;
  let cameraDist = 140.0;
  let hoveredNodeIndex = -1;
  let filterQuery = '';
  let resizeObserver = null;
  let listenersAttached = false;

  // Node position & community color cache
  let nodePositions = []; // [x, y, z] per node
  let nodeColors = [];    // [r, g, b] per node
  let filteredIndices = [];

  // WebGL resources
  let nodeProgram = null;
  let lineProgram = null;
  let nodeVAO = null;
  let lineVAO = null;
  let instanceMatrixBuffer = null;
  let instanceColorBuffer = null;
  let nodeScaleBuffer = null;
  let linePositionBuffer = null;
  let lineIndicesCount = 0;

  // 10 distinct high-contrast tech accent colors for communities
  const PALETTE = [
    [0.83, 0.66, 0.35], // Gold / Primary
    [0.26, 0.52, 0.96], // Google Blue
    [0.20, 0.66, 0.33], // Emerald Green
    [0.92, 0.26, 0.21], // Ruby Red
    [0.67, 0.28, 0.94], // Royal Purple
    [0.00, 0.74, 0.83], // Cyan Teal
    [0.98, 0.45, 0.09], // Amber Orange
    [0.91, 0.12, 0.39], // Neon Magenta
    [0.46, 0.78, 0.94], // Light Sky
    [0.60, 0.80, 0.20], // Lime Green
  ];

  function getCommunityColor(commId) {
    const idx = Math.abs(commId || 0) % PALETTE.length;
    return PALETTE[idx];
  }

  /* ── Layout Generator: Spherical Multi-Cluster Layout ─────── */
  function generate3DPositions() {
    if (typeof GRAPH_DATA === 'undefined' || !GRAPH_DATA.nodes) return;
    const nodes = GRAPH_DATA.nodes;
    const count = nodes.length;
    nodePositions = new Float32Array(count * 3);
    nodeColors = new Float32Array(count * 3);
    filteredIndices = [];

    // Group communities to compute cluster centroids
    const communityCentroids = {};
    nodes.forEach((n) => {
      const c = n.comm || 0;
      if (!communityCentroids[c]) {
        // Deterministic cluster centroid using golden ratio spiral
        const phi = Math.acos(1 - 2 * ((c * 17) % 100) / 100);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (c * 7);
        const radius = 35 + ((c * 13) % 25);
        communityCentroids[c] = [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ];
      }
    });

    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      const centroid = communityCentroids[n.comm || 0] || [0, 0, 0];
      // Offset within cluster
      const u = ((i * 37) % 100) / 100;
      const v = ((i * 59) % 100) / 100;
      const r = 4 + (u * 12);
      const theta = 2 * Math.PI * v;
      const phi = Math.PI * (u - 0.5);

      const x = centroid[0] + r * Math.cos(phi) * Math.cos(theta);
      const y = centroid[1] + r * Math.sin(phi);
      const z = centroid[2] + r * Math.cos(phi) * Math.sin(theta);

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      const rgb = getCommunityColor(n.comm);
      nodeColors[i * 3] = rgb[0];
      nodeColors[i * 3 + 1] = rgb[1];
      nodeColors[i * 3 + 2] = rgb[2];

      filteredIndices.push(i);
    }
  }

  /* ── WebGL Shader Sources ─────────────────────────────────── */
  const nodeVS = `#version 300 es
    precision highp float;
    layout(location = 0) in vec3 aVertexPos;
    layout(location = 1) in vec3 aInstanceOffset;
    layout(location = 2) in vec3 aInstanceColor;
    layout(location = 3) in float aInstanceScale;

    uniform mat4 uProjMatrix;
    uniform mat4 uViewMatrix;

    out vec3 vColor;
    out vec3 vNormal;
    out vec3 vFragPos;

    void main() {
      vColor = aInstanceColor;
      vNormal = normalize(aVertexPos);
      vec3 pos = aVertexPos * aInstanceScale + aInstanceOffset;
      vFragPos = pos;
      gl_Position = uProjMatrix * uViewMatrix * vec4(pos, 1.0);
    }
  `;

  const nodeFS = `#version 300 es
    precision highp float;
    in vec3 vColor;
    in vec3 vNormal;
    in vec3 vFragPos;
    out vec4 fragColor;

    void main() {
      // Directional light + ambient + rim emissive glow
      vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
      float diff = max(dot(vNormal, lightDir), 0.0);
      float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
      rim = smoothstep(0.4, 0.9, rim);
      
      vec3 finalColor = vColor * (0.65 + 0.5 * diff) + (vColor + vec3(0.3)) * (0.45 * rim);
      fragColor = vec4(finalColor, 0.98);
    }
  `;

  const lineVS = `#version 300 es
    precision highp float;
    layout(location = 0) in vec3 aPosition;
    uniform mat4 uProjMatrix;
    uniform mat4 uViewMatrix;

    void main() {
      gl_Position = uProjMatrix * uViewMatrix * vec4(aPosition, 1.0);
    }
  `;

  const lineFS = `#version 300 es
    precision highp float;
    out vec4 fragColor;

    void main() {
      // Clearly visible glowing connector lines with amber/gold tint
      fragColor = vec4(0.88, 0.72, 0.40, 0.38);
    }
  `;

  function createShader(glCtx, type, source) {
    const s = glCtx.createShader(type);
    glCtx.shaderSource(s, source);
    glCtx.compileShader(s);
    if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
      console.warn('Shader compile failed:', glCtx.getShaderInfoLog(s));
      glCtx.deleteShader(s);
      return null;
    }
    return s;
  }

  function createProgram(glCtx, vsSrc, fsSrc) {
    const vs = createShader(glCtx, glCtx.VERTEX_SHADER, vsSrc);
    const fs = createShader(glCtx, glCtx.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const prog = glCtx.createProgram();
    glCtx.attachShader(prog, vs);
    glCtx.attachShader(prog, fs);
    glCtx.linkProgram(prog);
    if (!glCtx.getProgramParameter(prog, glCtx.LINK_STATUS)) {
      console.warn('Program link failed:', glCtx.getProgramInfoLog(prog));
      return null;
    }
    return prog;
  }

  /* ── Sphere Geometry for Instancing ────────────────────────── */
  function createSphereMesh(glCtx) {
    const lats = 8;
    const lons = 8;
    const radius = 1.75;
    const positions = [];
    for (let i = 0; i <= lats; i++) {
      const theta = (i * Math.PI) / lats;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let j = 0; j <= lons; j++) {
        const phi = (j * 2 * Math.PI) / lons;
        positions.push(
          radius * Math.cos(phi) * sinTheta,
          radius * cosTheta,
          radius * Math.sin(phi) * sinTheta
        );
      }
    }
    const indices = [];
    for (let i = 0; i < lats; i++) {
      for (let j = 0; j < lons; j++) {
        const first = i * (lons + 1) + j;
        const second = first + lons + 1;
        indices.push(first, second, first + 1);
        indices.push(second, second + 1, first + 1);
      }
    }
    return {
      positions: new Float32Array(positions),
      indices: new Uint16Array(indices),
      indexCount: indices.length,
    };
  }

  /* ── Initialize WebGL 2 Context & Buffers ───────────────────── */
  function initWebGL() {
    if (!canvas) return false;
    gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    if (!gl) {
      console.warn('[Graph HUD] WebGL 2 not supported by browser.');
      return false;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    nodeProgram = createProgram(gl, nodeVS, nodeFS);
    lineProgram = createProgram(gl, lineVS, lineFS);
    if (!nodeProgram || !lineProgram) return false;

    // Build sphere mesh
    const sphere = createSphereMesh(gl);
    nodeVAO = gl.createVertexArray();
    gl.bindVertexArray(nodeVAO);

    // 1. Sphere vertex positions
    const sphereVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const sphereEBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereEBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);
    nodeVAO.indexCount = sphere.indexCount;

    // 2. Hardware Instanced Attributes: Offset, Color, Scale
    instanceMatrixBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceMatrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, nodePositions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1); // instanced!

    instanceColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, nodeColors, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1); // instanced!

    nodeScaleBuffer = gl.createBuffer();
    const scales = new Float32Array(GRAPH_DATA.nodes.length).fill(1.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeScaleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, scales, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(3, 1); // instanced!

    gl.bindVertexArray(null);

    // Build line mesh for edges
    buildEdgeBuffers();

    return true;
  }

  function buildEdgeBuffers() {
    if (!gl || !GRAPH_DATA || !GRAPH_DATA.edges) return;
    const edges = GRAPH_DATA.edges;
    const lineVertices = new Float32Array(edges.length * 6);

    let vIdx = 0;
    for (let i = 0; i < edges.length; i++) {
      const [sIdx, tIdx] = edges[i];
      if (sIdx < nodePositions.length / 3 && tIdx < nodePositions.length / 3) {
        lineVertices[vIdx++] = nodePositions[sIdx * 3];
        lineVertices[vIdx++] = nodePositions[sIdx * 3 + 1];
        lineVertices[vIdx++] = nodePositions[sIdx * 3 + 2];
        lineVertices[vIdx++] = nodePositions[tIdx * 3];
        lineVertices[vIdx++] = nodePositions[tIdx * 3 + 1];
        lineVertices[vIdx++] = nodePositions[tIdx * 3 + 2];
      }
    }

    lineIndicesCount = vIdx / 3;
    lineVAO = gl.createVertexArray();
    gl.bindVertexArray(lineVAO);

    linePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  /* ── 4x4 Matrix Mathematics ──────────────────────────────── */
  function perspective(out, fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    out.fill(0);
    out[0] = f / aspect;
    out[5] = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
    return out;
  }

  function computeViewMatrix(out) {
    out.fill(0);
    out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;

    // Translation along -Z
    out[14] = -cameraDist;

    // Rotation around X axis
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const rotXMat = new Float32Array([
      1, 0, 0, 0,
      0, cosX, sinX, 0,
      0, -sinX, cosX, 0,
      0, 0, 0, 1
    ]);

    // Rotation around Y axis
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const rotYMat = new Float32Array([
      cosY, 0, -sinY, 0,
      0, 1, 0, 0,
      sinY, 0, cosY, 0,
      0, 0, 0, 1
    ]);

    // Multiply: out = translation * rotX * rotY
    const temp = new Float32Array(16);
    multiplyMatrices(temp, out, rotXMat);
    multiplyMatrices(out, temp, rotYMat);
  }

  function multiplyMatrices(out, a, b) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[k * 4 + i] * b[j * 4 + k];
        }
        out[j * 4 + i] = sum;
      }
    }
  }

  /* ── Demand-Driven Render Loop (Pillar 2) ─────────────────── */
  function requestRender() {
    if (!renderPending) {
      renderPending = true;
      animationFrameId = requestAnimationFrame(render);
    }
  }

  function render() {
    renderPending = false;
    if (!gl || !canvas) return;

    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    gl.clearColor(0.04, 0.04, 0.05, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = width / (height || 1);
    const projMatrix = new Float32Array(16);
    perspective(projMatrix, Math.PI / 4, aspect, 1.0, 500.0);

    const viewMatrix = new Float32Array(16);
    computeViewMatrix(viewMatrix);

    // 1. Draw Edges in a single draw call
    if (lineProgram && lineVAO && lineIndicesCount > 0) {
      gl.useProgram(lineProgram);
      gl.uniformMatrix4fv(gl.getUniformLocation(lineProgram, 'uProjMatrix'), false, projMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(lineProgram, 'uViewMatrix'), false, viewMatrix);
      gl.bindVertexArray(lineVAO);
      gl.drawArrays(gl.LINES, 0, lineIndicesCount);
      gl.bindVertexArray(null);
    }

    // 2. Draw Nodes via Hardware Instancing in a single draw call
    if (nodeProgram && nodeVAO) {
      gl.useProgram(nodeProgram);
      gl.uniformMatrix4fv(gl.getUniformLocation(nodeProgram, 'uProjMatrix'), false, projMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(nodeProgram, 'uViewMatrix'), false, viewMatrix);
      
      // Dynamic scale update for hovered node highlight
      if (nodeScaleBuffer && GRAPH_DATA.nodes) {
        const scales = new Float32Array(GRAPH_DATA.nodes.length).fill(1.0);
        if (hoveredNodeIndex >= 0 && hoveredNodeIndex < scales.length) {
          scales[hoveredNodeIndex] = 2.4;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, nodeScaleBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, scales);
      }

      gl.bindVertexArray(nodeVAO);
      gl.drawElementsInstanced(
        gl.TRIANGLES,
        nodeVAO.indexCount,
        gl.UNSIGNED_SHORT,
        0,
        GRAPH_DATA.nodes.length
      );
      gl.bindVertexArray(null);
    }
  }

  /* ── Interaction: Raycast Hover Detection ─────────────────── */
  function findNodeUnderPointer(clientX, clientY) {
    if (!canvas || !nodePositions.length) return -1;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return -1;

    // Convert mouse to NDC [-1, 1]
    const ndcX = (x / rect.width) * 2 - 1;
    const ndcY = -(y / rect.height) * 2 + 1;

    const aspect = rect.width / (rect.height || 1);
    const proj = new Float32Array(16);
    perspective(proj, Math.PI / 4, aspect, 1.0, 500.0);
    const view = new Float32Array(16);
    computeViewMatrix(view);
    const pv = new Float32Array(16);
    multiplyMatrices(pv, proj, view);

    let closestDist = 0.065; // screen threshold
    let closestIndex = -1;

    const count = GRAPH_DATA.nodes.length;
    for (let i = 0; i < count; i++) {
      const px = nodePositions[i * 3];
      const py = nodePositions[i * 3 + 1];
      const pz = nodePositions[i * 3 + 2];

      // Clip space projection
      const clipX = pv[0] * px + pv[4] * py + pv[8] * pz + pv[12];
      const clipY = pv[1] * px + pv[5] * py + pv[9] * pz + pv[13];
      const clipW = pv[3] * px + pv[7] * py + pv[11] * pz + pv[15];

      if (clipW > 0) {
        const screenX = clipX / clipW;
        const screenY = clipY / clipW;
        const dx = screenX - ndcX;
        const dy = screenY - ndcY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      }
    }
    return closestIndex;
  }

  function updateTooltip(nodeIdx, clientX, clientY) {
    const tooltip = document.getElementById('graphNodeTooltip');
    if (!tooltip) return;
    if (nodeIdx < 0 || !GRAPH_DATA || !GRAPH_DATA.nodes[nodeIdx]) {
      tooltip.classList.remove('active');
      return;
    }

    const n = GRAPH_DATA.nodes[nodeIdx];
    tooltip.innerHTML = `
      <div class="graph-tooltip-head">
        <span class="graph-tooltip-type">${n.type || 'AST Node'}</span>
        <span class="graph-tooltip-comm">${escapeHtml(n.comm_name || 'Community')}</span>
      </div>
      <div class="graph-tooltip-title">${escapeHtml(n.label || n.id)}</div>
      <div class="graph-tooltip-file">${escapeHtml(n.file || 'source')}</div>
    `;

    const modalRect = graphModal.getBoundingClientRect();
    const posX = Math.min(clientX - modalRect.left + 15, modalRect.width - 240);
    const posY = Math.min(clientY - modalRect.top + 15, modalRect.height - 100);

    tooltip.style.left = `${posX}px`;
    tooltip.style.top = `${posY}px`;
    tooltip.classList.add('active');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ── Modal Creation & Lifecycle ───────────────────────────── */
  function openGraphModal() {
    if (typeof GRAPH_DATA === 'undefined') {
      console.warn('[Graph HUD] GRAPH_DATA is not defined yet.');
      return;
    }

    if (!graphModal) {
      graphModal = document.createElement('div');
      graphModal.id = 'graphModalOverlay';
      graphModal.className = 'access-modal-overlay graph-modal-overlay';
      graphModal.setAttribute('role', 'dialog');
      graphModal.setAttribute('aria-modal', 'true');
      graphModal.setAttribute('aria-label', '3D AST Knowledge Graph HUD');
      document.body.appendChild(graphModal);
    }

    const totalNodes = GRAPH_DATA.nodes ? GRAPH_DATA.nodes.length : 0;
    const totalEdges = GRAPH_DATA.edges ? GRAPH_DATA.edges.length : 0;

    graphModal.innerHTML = `
      <div class="access-modal-card graph-modal-card">
        <div class="graph-modal-header">
          <div class="graph-modal-title-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <circle cx="12" cy="12" r="3"/>
              <circle cx="4" cy="6" r="2"/>
              <circle cx="20" cy="6" r="2"/>
              <circle cx="4" cy="18" r="2"/>
              <circle cx="20" cy="18" r="2"/>
              <line x1="6" y1="7" x2="10" y2="10"/>
              <line x1="18" y1="7" x2="14" y2="10"/>
              <line x1="6" y1="17" x2="10" y2="14"/>
              <line x1="18" y1="17" x2="14" y2="14"/>
            </svg>
            <span class="graph-modal-title">3D Knowledge Graph HUD</span>
            <span class="graph-modal-badge">WebGL 2 Instanced</span>
          </div>
          <div class="graph-modal-actions">
            <span class="graph-stat-pill">${totalNodes} Nodes</span>
            <span class="graph-stat-pill">${totalEdges} Edges</span>
            <button type="button" class="access-modal-close" id="graphModalClose" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="graph-canvas-wrap" id="graphCanvasWrap">
          <canvas id="graphWebglCanvas"></canvas>
          <div class="graph-node-tooltip" id="graphNodeTooltip"></div>
          <div class="graph-controls-hint">
            <span>Left-drag to Orbit</span> · <span>Scroll to Zoom</span> · <span>Hover to Inspect</span>
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('graphWebglCanvas');
    generate3DPositions();

    if (!initWebGL()) {
      const wrap = document.getElementById('graphCanvasWrap');
      if (wrap) {
        wrap.innerHTML = `<div class="graph-error-msg">WebGL 2 is disabled or unavailable on this device.</div>`;
      }
      return;
    }

    bindInteractions();

    const wrap = document.getElementById('graphCanvasWrap');
    if (wrap && typeof ResizeObserver !== 'undefined') {
      if (resizeObserver) resizeObserver.disconnect();
      resizeObserver = new ResizeObserver(() => {
        requestRender();
      });
      resizeObserver.observe(wrap);
    }

    document.getElementById('graphModalClose').addEventListener('click', closeGraphModal);
    graphModal.addEventListener('click', (e) => {
      if (e.target === graphModal) closeGraphModal();
    });

    requestAnimationFrame(() => graphModal.classList.add('open'));
    document.body.style.overflow = 'hidden';
    if (typeof playAudioCue === 'function') playAudioCue('open');

    // Trigger initial renders (immediate + progressive settling frames)
    render();
    requestRender();
    setTimeout(() => { render(); requestRender(); }, 50);
    setTimeout(() => { render(); requestRender(); }, 150);
    setTimeout(() => { render(); requestRender(); }, 300);
  }

  function bindInteractions() {
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });

    if (!listenersAttached) {
      listenersAttached = true;

      window.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const dx = e.clientX - lastMouseX;
          const dy = e.clientY - lastMouseY;
          lastMouseX = e.clientX;
          lastMouseY = e.clientY;

          rotY += dx * 0.008;
          rotX += dy * 0.008;
          rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));
          requestRender();
        } else if (graphModal && graphModal.classList.contains('open')) {
          const nodeIdx = findNodeUnderPointer(e.clientX, e.clientY);
          if (nodeIdx !== hoveredNodeIndex) {
            hoveredNodeIndex = nodeIdx;
            updateTooltip(nodeIdx, e.clientX, e.clientY);
            requestRender();
          } else if (nodeIdx >= 0) {
            updateTooltip(nodeIdx, e.clientX, e.clientY);
          }
        }
      });

      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }

    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        cameraDist += e.deltaY * 0.06;
        cameraDist = Math.max(35.0, Math.min(300.0, cameraDist));
        requestRender();
      },
      { passive: false }
    );

    // Touch support for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        rotY += dx * 0.01;
        rotX += dy * 0.01;
        requestRender();
      }
    }, { passive: true });
  }

  function closeGraphModal() {
    if (!graphModal) return;
    graphModal.classList.remove('open');
    document.body.style.overflow = '';
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    const tooltip = document.getElementById('graphNodeTooltip');
    if (tooltip) tooltip.classList.remove('active');
    if (typeof playAudioCue === 'function') playAudioCue('close');
  }

  // Keyboard shortcut binding: Esc closes HUD
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && graphModal && graphModal.classList.contains('open')) {
      closeGraphModal();
    }
  });

  // Global exports
  window.openGraphModal = openGraphModal;
  window.closeGraphModal = closeGraphModal;
})();
