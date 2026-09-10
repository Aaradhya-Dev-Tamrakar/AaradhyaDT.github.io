/* ============================================================
   MODULE: graph-modal.js — aaradhyadt.github.io (v53.23)
   High-Performance ExplainGit-Style 2D & 3D WebGL Knowledge Graph HUD
   Dual-mode architecture:
   - 2D Mode: ExplainGit-inspired planar force clusters, hairline dark
     edges, and real-time neighbor spotlighting with background dimming.
   - 3D Mode: Hardware-instanced spherical multi-cluster orbit HUD.
   - Smooth animated morphing between 2D and 3D topologies.
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

  // View & mode state
  let currentMode = '2d'; // '2d' | '3d'
  let rotX = 0.0;
  let rotY = 0.0;
  let targetRotX = 0.35;
  let targetRotY = -0.45;
  let panX = 0.0;
  let panY = 0.0;
  let cameraDist = 135.0;
  let hoveredNodeIndex = -1;
  let resizeObserver = null;
  let listenersAttached = false;

  // Morph animation state
  let isMorphing = false;
  let morphProgress = 0.0; // 0.0 = 2D, 1.0 = 3D
  let startMorph = 0.0;
  let targetMorph = 0.0;
  let morphStartTime = 0;
  const MORPH_DURATION = 600; // ms

  // Coordinates & color buffers
  let nodePositions3D = null;
  let nodePositions2D = null;
  let currentPositions = null;
  let baseColors = null;
  let currentColors = null;
  let currentScales = null;
  let adjacency = []; // Array of Set()

  // WebGL resources
  let nodeProgram = null;
  let lineProgram = null;
  let nodeVAO = null;
  let lineVAO = null;
  let instanceMatrixBuffer = null;
  let instanceColorBuffer = null;
  let nodeScaleBuffer = null;
  let linePositionBuffer = null;
  let lineColorBuffer = null;
  let lineVertices = null;
  let lineColors = null;
  let lineIndicesCount = 0;

  // ExplainGit 12-color high-contrast community palette
  const PALETTE = [
    [0.345, 0.651, 1.000], // #58a6ff Signature Blue
    [0.969, 0.471, 0.729], // #f778ba Rose Pink
    [0.337, 0.827, 0.392], // #56d364 Mint Green
    [0.890, 0.702, 0.255], // #e3b341 Warm Gold
    [1.000, 0.482, 0.447], // #ff7b72 Coral Red
    [0.737, 0.549, 1.000], // #bc8cff Royal Purple
    [0.224, 0.773, 0.812], // #39c5cf Electric Teal
    [1.000, 0.651, 0.341], // #ffa657 Amber Orange
    [0.475, 0.753, 1.000], // #79c0ff Light Sky
    [0.494, 0.906, 0.529], // #7ee787 Lime Accent
    [0.824, 0.659, 1.000], // #d2a8ff Soft Violet
    [1.000, 0.671, 0.439], // #ffab70 Peach
  ];

  function getCommunityColor(commId) {
    const idx = Math.abs(commId || 0) % PALETTE.length;
    return PALETTE[idx];
  }

  /* ── Layout Generator: Dual 2D Planar & 3D Spherical Topologies ── */
  function generatePositions() {
    if (typeof GRAPH_DATA === 'undefined' || !GRAPH_DATA.nodes) return;
    const nodes = GRAPH_DATA.nodes;
    const count = nodes.length;

    nodePositions3D = new Float32Array(count * 3);
    nodePositions2D = new Float32Array(count * 3);
    currentPositions = new Float32Array(count * 3);
    baseColors = new Float32Array(count * 3);
    currentColors = new Float32Array(count * 3);
    currentScales = new Float32Array(count).fill(1.0);

    // Build adjacency graph for real-time spotlight lookups
    adjacency = Array.from({ length: count }, () => new Set());
    if (GRAPH_DATA.edges) {
      for (let i = 0; i < GRAPH_DATA.edges.length; i++) {
        const [s, t] = GRAPH_DATA.edges[i];
        if (s < count && t < count) {
          adjacency[s].add(t);
          adjacency[t].add(s);
        }
      }
    }

    // Community Centroids
    const centroids3D = {};
    const commOrder = [];
    nodes.forEach((n) => {
      const c = n.comm || 0;
      if (!centroids3D[c]) {
        commOrder.push(c);
        // 3D Spherical spiral centroids
        const phi = Math.acos(1 - 2 * ((c * 17) % 100) / 100);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (c * 7);
        const radius = 35 + ((c * 13) % 25);
        centroids3D[c] = [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi),
        ];
      }
    });

    // 2D ExplainGit Planar centroids (distributed radially on golden spiral)
    const centroids2D = {};
    commOrder.forEach((c, idx) => {
      const angle = idx * 2.3999632; // golden angle
      const r = Math.sqrt(idx + 1) * 16.5 + 10.0;
      centroids2D[c] = [r * Math.cos(angle), r * Math.sin(angle), 0.0];
    });

    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      const comm = n.comm || 0;

      // Deterministic spread inside cluster
      const u = ((i * 37) % 100) / 100;
      const v = ((i * 59) % 100) / 100;

      // 1. 3D Spherical Cluster offset
      const c3 = centroids3D[comm] || [0, 0, 0];
      const r3 = 4 + (u * 12);
      const theta3 = 2 * Math.PI * v;
      const phi3 = Math.PI * (u - 0.5);

      nodePositions3D[i * 3] = c3[0] + r3 * Math.cos(phi3) * Math.cos(theta3);
      nodePositions3D[i * 3 + 1] = c3[1] + r3 * Math.sin(phi3);
      nodePositions3D[i * 3 + 2] = c3[2] + r3 * Math.cos(phi3) * Math.sin(theta3);

      // 2. 2D Planar Cluster offset
      const c2 = centroids2D[comm] || [0, 0, 0];
      const r2 = 2.5 + (u * 11.0);
      const theta2 = 2 * Math.PI * v;

      nodePositions2D[i * 3] = c2[0] + r2 * Math.cos(theta2);
      nodePositions2D[i * 3 + 1] = c2[1] + r2 * Math.sin(theta2);
      nodePositions2D[i * 3 + 2] = 0.0;

      // Base color assignment
      const rgb = getCommunityColor(comm);
      baseColors[i * 3] = rgb[0];
      baseColors[i * 3 + 1] = rgb[1];
      baseColors[i * 3 + 2] = rgb[2];

      currentColors[i * 3] = rgb[0];
      currentColors[i * 3 + 1] = rgb[1];
      currentColors[i * 3 + 2] = rgb[2];
    }

    // Set initial position buffer according to currentMode
    const src = currentMode === '3d' ? nodePositions3D : nodePositions2D;
    currentPositions.set(src);
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
    uniform float uModeProgress; // 0.0 = 2D flat, 1.0 = 3D lit
    out vec4 fragColor;

    void main() {
      // 3D Lighting: directional light + ambient + rim emissive glow
      vec3 lightDir = normalize(vec3(0.5, 0.8, 1.0));
      float diff = max(dot(vNormal, lightDir), 0.0);
      float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
      rim = smoothstep(0.4, 0.9, rim);
      vec3 litColor = vColor * (0.65 + 0.5 * diff) + (vColor + vec3(0.3)) * (0.45 * rim);

      // 2D Flat look: crisp vibrant flat discs with subtle depth rim
      vec3 flatColor = vColor * (0.90 + 0.18 * rim);

      vec3 finalColor = mix(flatColor, litColor, uModeProgress);
      fragColor = vec4(finalColor, 0.98);
    }
  `;

  const lineVS = `#version 300 es
    precision highp float;
    layout(location = 0) in vec3 aPosition;
    layout(location = 1) in vec4 aColor;
    uniform mat4 uProjMatrix;
    uniform mat4 uViewMatrix;
    out vec4 vLineColor;

    void main() {
      vLineColor = aColor;
      gl_Position = uProjMatrix * uViewMatrix * vec4(aPosition, 1.0);
    }
  `;

  const lineFS = `#version 300 es
    precision highp float;
    in vec4 vLineColor;
    out vec4 fragColor;

    void main() {
      fragColor = vLineColor;
    }
  `;

  function createShader(glCtx, type, source) {
    const s = glCtx.createShader(type);
    glCtx.shaderSource(s, source);
    glCtx.compileShader(s);
    if (!glCtx.getShaderParameter(s, glCtx.COMPILE_STATUS)) {
      console.warn('[Graph HUD] Shader compile failed:', glCtx.getShaderInfoLog(s));
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
      console.warn('[Graph HUD] Program link failed:', glCtx.getProgramInfoLog(prog));
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

  /* ── Initialize WebGL 2 Context & Dynamic Buffers ───────────── */
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

    // 1. Build sphere mesh
    const sphere = createSphereMesh(gl);
    nodeVAO = gl.createVertexArray();
    gl.bindVertexArray(nodeVAO);

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
    gl.bufferData(gl.ARRAY_BUFFER, currentPositions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1); // instanced

    instanceColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, currentColors, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1); // instanced

    nodeScaleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeScaleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, currentScales, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(3, 1); // instanced

    gl.bindVertexArray(null);

    // 3. Build line mesh for edges
    buildEdgeBuffers();

    return true;
  }

  function buildEdgeBuffers() {
    if (!gl || !GRAPH_DATA || !GRAPH_DATA.edges) return;
    const edges = GRAPH_DATA.edges;
    lineVertices = new Float32Array(edges.length * 6);
    lineColors = new Float32Array(edges.length * 8);

    updateEdgePositions();

    lineVAO = gl.createVertexArray();
    gl.bindVertexArray(lineVAO);

    linePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineVertices, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    lineColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineColors, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    updateEdgeColors(-1);
  }

  function updateEdgePositions() {
    if (!GRAPH_DATA || !GRAPH_DATA.edges || !lineVertices) return;
    const edges = GRAPH_DATA.edges;
    let vIdx = 0;
    const totalNodes = currentPositions.length / 3;

    for (let i = 0; i < edges.length; i++) {
      const [sIdx, tIdx] = edges[i];
      if (sIdx < totalNodes && tIdx < totalNodes) {
        lineVertices[vIdx++] = currentPositions[sIdx * 3];
        lineVertices[vIdx++] = currentPositions[sIdx * 3 + 1];
        lineVertices[vIdx++] = currentPositions[sIdx * 3 + 2];
        lineVertices[vIdx++] = currentPositions[tIdx * 3];
        lineVertices[vIdx++] = currentPositions[tIdx * 3 + 1];
        lineVertices[vIdx++] = currentPositions[tIdx * 3 + 2];
      }
    }
    lineIndicesCount = vIdx / 3;
  }

  function updateEdgeColors(spotlightNodeIdx) {
    if (!GRAPH_DATA || !GRAPH_DATA.edges || !lineColors) return;
    const edges = GRAPH_DATA.edges;
    let cIdx = 0;

    const is2D = morphProgress < 0.5;
    // 2D: ExplainGit hairline dark blue-gray (prevents hairball)
    // 3D: Warm glowing amber/gold
    const defColor = is2D
      ? [0.32, 0.39, 0.55, 0.22]
      : [0.88, 0.72, 0.40, 0.32];

    const dimColor = [0.20, 0.25, 0.35, 0.04];
    const highlightColor = [0.12, 0.72, 1.00, 0.95]; // Electric Cyan/Blue

    for (let i = 0; i < edges.length; i++) {
      const [sIdx, tIdx] = edges[i];
      let color = defColor;

      if (spotlightNodeIdx >= 0) {
        if (sIdx === spotlightNodeIdx || tIdx === spotlightNodeIdx) {
          color = highlightColor;
        } else {
          color = dimColor;
        }
      }

      // 2 vertices per line edge
      lineColors[cIdx++] = color[0];
      lineColors[cIdx++] = color[1];
      lineColors[cIdx++] = color[2];
      lineColors[cIdx++] = color[3];

      lineColors[cIdx++] = color[0];
      lineColors[cIdx++] = color[1];
      lineColors[cIdx++] = color[2];
      lineColors[cIdx++] = color[3];
    }

    if (gl && lineColorBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineColors);
    }
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

    // Translation with 2D Pan and Zoom Distance
    out[12] = panX;
    out[13] = panY;
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

  /* ── Demand-Driven Render Loop & Animated Morphing ────────── */
  function requestRender() {
    if (!renderPending) {
      renderPending = true;
      animationFrameId = requestAnimationFrame(render);
    }
  }

  function render() {
    renderPending = false;
    if (!gl || !canvas) return;

    // Handle smooth morphing between 2D and 3D
    if (isMorphing) {
      const elapsed = performance.now() - morphStartTime;
      let t = Math.min(1.0, elapsed / MORPH_DURATION);
      // Cubic easing
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      morphProgress = startMorph + (targetMorph - startMorph) * ease;

      // Interpolate node positions
      const count = GRAPH_DATA.nodes.length;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        currentPositions[i3] = nodePositions2D[i3] * (1 - morphProgress) + nodePositions3D[i3] * morphProgress;
        currentPositions[i3 + 1] = nodePositions2D[i3 + 1] * (1 - morphProgress) + nodePositions3D[i3 + 1] * morphProgress;
        currentPositions[i3 + 2] = nodePositions3D[i3 + 2] * morphProgress;
      }

      // Update WebGL instance buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceMatrixBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, currentPositions);

      updateEdgePositions();
      gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineVertices);

      // Smooth camera tilt transition
      rotX = targetRotX * morphProgress;
      rotY = targetRotY * morphProgress;

      if (t >= 1.0) {
        isMorphing = false;
        morphProgress = targetMorph;
      } else {
        requestRender();
      }
    }

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
    perspective(projMatrix, Math.PI / 4, aspect, 1.0, 600.0);

    const viewMatrix = new Float32Array(16);
    computeViewMatrix(viewMatrix);

    // Update dynamic node scales & spotlight colors
    updateSpotlightState();

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
      gl.uniform1f(gl.getUniformLocation(nodeProgram, 'uModeProgress'), morphProgress);

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

  /* ── Real-Time Neighbor Spotlight & Dimming (ExplainGit Style) ── */
  function updateSpotlightState() {
    if (!GRAPH_DATA || !GRAPH_DATA.nodes) return;
    const count = GRAPH_DATA.nodes.length;
    const hIdx = hoveredNodeIndex;
    const nbrSet = hIdx >= 0 ? adjacency[hIdx] : null;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const baseR = baseColors[i3];
      const baseG = baseColors[i3 + 1];
      const baseB = baseColors[i3 + 2];

      if (hIdx >= 0) {
        if (i === hIdx) {
          // Hovered Node: enlarged, electric signature blue
          currentScales[i] = 2.6;
          currentColors[i3] = 0.12;
          currentColors[i3 + 1] = 0.72;
          currentColors[i3 + 2] = 1.00;
        } else if (nbrSet && nbrSet.has(i)) {
          // Direct Neighbor: illuminated and slightly enlarged
          currentScales[i] = 1.65;
          currentColors[i3] = baseR;
          currentColors[i3 + 1] = baseG;
          currentColors[i3 + 2] = baseB;
        } else {
          // Unconnected Background Node: dimmed down
          currentScales[i] = 0.85;
          currentColors[i3] = baseR * 0.22;
          currentColors[i3 + 1] = baseG * 0.22;
          currentColors[i3 + 2] = baseB * 0.22;
        }
      } else {
        currentScales[i] = 1.0;
        currentColors[i3] = baseR;
        currentColors[i3 + 1] = baseG;
        currentColors[i3 + 2] = baseB;
      }
    }

    if (gl && nodeScaleBuffer && instanceColorBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, nodeScaleBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, currentScales);

      gl.bindBuffer(gl.ARRAY_BUFFER, instanceColorBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, currentColors);
    }

    updateEdgeColors(hIdx);
  }

  /* ── Interaction: Raycast Hover Detection ─────────────────── */
  function findNodeUnderPointer(clientX, clientY) {
    if (!canvas || !currentPositions || !currentPositions.length) return -1;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return -1;

    // Convert mouse to NDC [-1, 1]
    const ndcX = (x / rect.width) * 2 - 1;
    const ndcY = -(y / rect.height) * 2 + 1;

    const aspect = rect.width / (rect.height || 1);
    const proj = new Float32Array(16);
    perspective(proj, Math.PI / 4, aspect, 1.0, 600.0);
    const view = new Float32Array(16);
    computeViewMatrix(view);
    const pv = new Float32Array(16);
    multiplyMatrices(pv, proj, view);

    let closestDist = 0.058; // screen threshold
    let closestIndex = -1;

    const count = GRAPH_DATA.nodes.length;
    for (let i = 0; i < count; i++) {
      const px = currentPositions[i * 3];
      const py = currentPositions[i * 3 + 1];
      const pz = currentPositions[i * 3 + 2];

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
    const wrap = document.getElementById('graphCanvasWrap');
    if (!tooltip || !wrap) return;
    if (nodeIdx < 0 || !GRAPH_DATA || !GRAPH_DATA.nodes[nodeIdx]) {
      tooltip.classList.remove('active');
      return;
    }

    const n = GRAPH_DATA.nodes[nodeIdx];
    tooltip.innerHTML = `
      <div class="graph-tooltip-head">
        <span class="graph-tooltip-type">${escapeHtml(n.type || 'AST Node')}</span>
        <span class="graph-tooltip-comm">${escapeHtml(n.comm_name || 'Community')}</span>
      </div>
      <div class="graph-tooltip-title">${escapeHtml(n.label || n.id)}</div>
      <div class="graph-tooltip-file">${escapeHtml(n.file || 'source')}</div>
    `;

    // Smart tooltip auto-flipping relative to #graphCanvasWrap bounds
    const wrapRect = wrap.getBoundingClientRect();
    const cursorX = clientX - wrapRect.left;
    const cursorY = clientY - wrapRect.top;

    const tooltipWidth = tooltip.offsetWidth || 230;
    const tooltipHeight = tooltip.offsetHeight || 90;

    // Flip horizontally if near right boundary
    let posX = cursorX + 16;
    if (posX + tooltipWidth > wrapRect.width - 12) {
      posX = cursorX - tooltipWidth - 16;
    }

    // Flip vertically if near bottom boundary
    let posY = cursorY + 16;
    if (posY + tooltipHeight > wrapRect.height - 12) {
      posY = cursorY - tooltipHeight - 16;
    }

    // Hard clamp within wrap borders
    posX = Math.max(10, Math.min(wrapRect.width - tooltipWidth - 10, posX));
    posY = Math.max(10, Math.min(wrapRect.height - tooltipHeight - 10, posY));

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

  /* ── 2D / 3D Mode Switching ───────────────────────────────── */
  function switchMode(newMode) {
    if (currentMode === newMode && !isMorphing) return;
    currentMode = newMode;

    const btn2D = document.getElementById('graphBtn2D');
    const btn3D = document.getElementById('graphBtn3D');
    const zoomControls = document.getElementById('graphZoomControls');
    const hint = document.getElementById('graphControlsHint');

    if (btn2D && btn3D) {
      btn2D.classList.toggle('active', newMode === '2d');
      btn3D.classList.toggle('active', newMode === '3d');
    }

    if (zoomControls) {
      zoomControls.classList.toggle('active', newMode === '2d');
    }

    if (hint) {
      if (newMode === '2d') {
        hint.innerHTML = '<span>Drag to Pan</span> · <span>Scroll / Buttons to Zoom</span> · <span>Hover to Inspect & Spotlight</span>';
      } else {
        hint.innerHTML = '<span>Left-drag to Orbit</span> · <span>Scroll to Zoom</span> · <span>Hover to Inspect & Spotlight</span>';
      }
    }

    // Trigger smooth coordinate morphing
    startMorph = morphProgress;
    targetMorph = newMode === '3d' ? 1.0 : 0.0;
    morphStartTime = performance.now();
    isMorphing = true;

    if (typeof playAudioCue === 'function') playAudioCue('click');
    requestRender();
  }

  /* ── Modal Creation & Lifecycle ───────────────────────────── */
  function openGraphModal() {
    if (typeof GRAPH_DATA === 'undefined') {
      const existing = document.querySelector('script[src*="graph-data.js"]');
      if (!existing) {
        const s = document.createElement('script');
        s.src = 'assets/js/data/graph-data.js';
        s.onload = () => openGraphModal();
        s.onerror = () => console.error('[Graph HUD] Failed to load assets/js/data/graph-data.js');
        document.head.appendChild(s);
        return;
      }
      setTimeout(openGraphModal, 80);
      return;
    }

    if (!graphModal) {
      graphModal = document.createElement('div');
      graphModal.id = 'graphModalOverlay';
      graphModal.className = 'access-modal-overlay graph-modal-overlay';
      graphModal.setAttribute('role', 'dialog');
      graphModal.setAttribute('aria-modal', 'true');
      graphModal.setAttribute('aria-label', 'Interactive AST Knowledge Graph HUD');
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
            <span class="graph-modal-title">Knowledge Graph HUD</span>
            <div class="graph-mode-toggle" role="group" aria-label="View Mode">
              <button type="button" class="graph-mode-btn ${currentMode === '2d' ? 'active' : ''}" id="graphBtn2D" aria-pressed="${currentMode === '2d'}">2D Map</button>
              <button type="button" class="graph-mode-btn ${currentMode === '3d' ? 'active' : ''}" id="graphBtn3D" aria-pressed="${currentMode === '3d'}">3D Orbit</button>
            </div>
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
          <div class="graph-corner-bracket graph-corner-tl"></div>
          <div class="graph-corner-bracket graph-corner-tr"></div>
          <div class="graph-corner-bracket graph-corner-bl"></div>
          <div class="graph-corner-bracket graph-corner-br"></div>
          <div class="graph-zoom-controls ${currentMode === '2d' ? 'active' : ''}" id="graphZoomControls">
            <button type="button" class="graph-zoom-btn" id="graphZoomIn" aria-label="Zoom in" title="Zoom in">+</button>
            <button type="button" class="graph-zoom-btn" id="graphZoomOut" aria-label="Zoom out" title="Zoom out">−</button>
            <button type="button" class="graph-zoom-btn" id="graphZoomReset" aria-label="Reset view" title="Reset view">⟲</button>
          </div>
          <div class="graph-node-tooltip" id="graphNodeTooltip"></div>
          <div class="graph-controls-hint" id="graphControlsHint">
            ${currentMode === '2d' 
              ? '<span>Drag to Pan</span> · <span>Scroll / Buttons to Zoom</span> · <span>Hover to Inspect & Spotlight</span>'
              : '<span>Left-drag to Orbit</span> · <span>Scroll to Zoom</span> · <span>Hover to Inspect & Spotlight</span>'
            }
          </div>
        </div>
      </div>
    `;

    canvas = document.getElementById('graphWebglCanvas');
    generatePositions();

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

    // Segmented 2D/3D Mode Buttons
    const btn2D = document.getElementById('graphBtn2D');
    const btn3D = document.getElementById('graphBtn3D');
    if (btn2D) btn2D.addEventListener('click', () => switchMode('2d'));
    if (btn3D) btn3D.addEventListener('click', () => switchMode('3d'));

    // Zoom Buttons
    const zoomIn = document.getElementById('graphZoomIn');
    const zoomOut = document.getElementById('graphZoomOut');
    const zoomReset = document.getElementById('graphZoomReset');
    if (zoomIn) zoomIn.addEventListener('click', () => {
      cameraDist = Math.max(35.0, cameraDist * 0.82);
      requestRender();
    });
    if (zoomOut) zoomOut.addEventListener('click', () => {
      cameraDist = Math.min(300.0, cameraDist * 1.22);
      requestRender();
    });
    if (zoomReset) zoomReset.addEventListener('click', () => {
      cameraDist = 120.0;
      panX = 0;
      panY = 0;
      if (currentMode === '3d') {
        rotX = targetRotX;
        rotY = targetRotY;
      } else {
        rotX = 0;
        rotY = 0;
      }
      requestRender();
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

          if (currentMode === '2d') {
            // 2D Pan mode
            const panSensitivity = cameraDist * 0.0018;
            panX += dx * panSensitivity;
            panY -= dy * panSensitivity;
          } else {
            // 3D Orbit mode
            rotY += dx * 0.008;
            rotX += dy * 0.008;
            rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));
          }
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

        if (currentMode === '2d') {
          const panSensitivity = cameraDist * 0.0022;
          panX += dx * panSensitivity;
          panY -= dy * panSensitivity;
        } else {
          rotY += dx * 0.01;
          rotX += dy * 0.01;
        }
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

