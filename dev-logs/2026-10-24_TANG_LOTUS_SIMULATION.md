# Tang Lotus Architecture: Pure SVG In-Hole Petal Socket Design & Parametric Multi-$N$ Simulation

- **Date**: 2026-10-24
- **Branch**: `feat/hero-svg-in-hole-badges-#47`
- **Target Component**: `#heroStarStage` in `index.html` & `assets/js/modules/home-widgets.js`
- **Status**: EMPIRICALLY_VERIFIED (Simulated across $N \in \{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12\}$)

---

## 1. Executive Summary & Epistemic Motivation

The Buddha's Fury Tang Lotus (佛怒唐莲) mechanical-bloom avatar replaces the legacy static SVG star with an interlocking, dual-ring multi-blade mechanism.

Prior iterations separated the SVG lotus blade geometry from the affiliation badges (rendered as floating HTML `<a>` tags with CSS offsets). This led to:
1. Coordination drift during dynamic rotation and scaling transitions.
2. The need for runtime JavaScript math recalculating `dx, dy` offsets for each badge.
3. Complex z-index layering to tuck badges behind the portrait during closing transitions.

**Solution: Pure SVG In-Hole Architecture (Option A)**. Each affiliation badge is embedded directly inside the primary golden blade group (`<g class="lotus-blade--primary">`) as an SVG `<image>` clipped inside a circular gold socket bezel (`<circle class="lotus-blade-cradle">`).

---

## 2. Geometric Specification & Coordinate Invariants

All measurements are calibrated to a $310 \times 310$ SVG `viewBox` centered at $(cx, cy) = (155, 155)$:

| Dimension / Metric | Nominal Value | Geometric Invariant / Physical Meaning |
| :--- | :---: | :--- |
| **Stage Viewport** | $310\text{px} \times 310\text{px}$ | Center origin $(155, 155)$. |
| **Portrait Radius ($r_{\text{portrait}}$)** | $98\text{px}$ | Diameter $196\text{px}$. Top rim at $y = 155 - 98 = 57\text{px}$. |
| **Petal Socket Center ($y_{\text{socket}}$)** | $(155, 35)$ | Center distance $r_{\text{socket}} = 155 - 35 = 120\text{px}$. |
| **Socket Hole Radius ($r_{\text{cradle}}$)** | $19.5\text{px}$ | Solid metallic gold bezel (`#f3cf82`) framing the badge. |
| **Badge Image Diameter** | $36\text{px}$ | Center at $(155, 35)$, rendered via `x="137" y="17" width="36" height="36"`. |
| **Badge Image Clip Radius** | $18.0\text{px}$ | `<clipPath>` ensures exact circular masking of logo marks. |
| **Outer Golden Blade Tip** | $(155, -5)$ | Extends $40\text{px}$ above socket center; sharp razor tip peak. |
| **Outer Ring Dormant Scale** | $0.64$ | $120\text{px} \times 0.64 = 76.8\text{px}$ from center ($< 98\text{px}$ portrait radius). |
| **Dormant State Tucking** | **$100\%$ Hidden** | Badge bottom rim at $76.8 - 18 = 58.8\text{px} < 98\text{px}$, safely tucked behind portrait. |
| **Deployed Rim Clearance** | **$+3.0\text{px}$** | Socket bottom at $120 - 19 = 101\text{px} > 98\text{px}$ portrait edge. |
| **Coaxial Radial Error** | **$0.00\text{px}$** | Badge and socket share identical $(155, 35)$ local coordinates. |

---

## 3. Parametric Multi-$N$ Behavioral Verification

The architecture was evaluated across $N \in \{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12\}$:

| $N$ | Symmetry Archetype | Step ($\Delta\theta$) | Counter-Blade Phase ($\Delta\phi$) | Inter-Badge Chord ($d$) | Visual Cohesion |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | Zen Monolith / Crown Blade | $360.0^\circ$ | $180.0^\circ$ | N/A | Single North crown blade with South counter-blade. Halo ring. |
| **2** | Bipolar Dual-Spear Lotus | $180.0^\circ$ | $90.0^\circ$ | $240.0\text{px}$ | North/South blades with East/West counter-blades. Diamond diamond. |
| **3** | Tri-Blade Trilateral Gear | $120.0^\circ$ | $60.0^\circ$ | $207.8\text{px}$ | Balanced trilateral mechanical bloom. Wide breathing room. |
| **4** | Quad-Blade Quadrant Lotus | $90.0^\circ$ | $45.0^\circ$ | $169.7\text{px}$ | Cardinal orientation (N, E, S, W). Crystalline diagonal blades. |
| **5** | Pentagonal Tang Lotus | $72.0^\circ$ | $36.0^\circ$ | $141.1\text{px}$ | Signature 5-star golden lotus layout. Production default. |
| **6** | Hexagonal Grand Lotus | $60.0^\circ$ | $30.0^\circ$ | $120.0\text{px}$ | Dense mechanical interlocking; $82\text{px}$ inter-disc clearance. |
| **7** | Heptagonal Lotus Swarm | $51.4^\circ$ | $25.7^\circ$ | $104.1\text{px}$ | High-density petal formation. |
| **8** | Octagonal Tang Mandala | $45.0^\circ$ | $22.5^\circ$ | $91.8\text{px}$ | Mandala gear structure; $53.8\text{px}$ clearance between discs. |
| **10**| Decagonal Emperor Lotus | $36.0^\circ$ | $18.0^\circ$ | $74.2\text{px}$ | Fine watchmaker complication aesthetic. |
| **12**| Duodecimal Chrono Lotus | $30.0^\circ$ | $15.0^\circ$ | $62.1\text{px}$ | Maximum density limit before petal shoulder occlusion. |

---

## 4. Architectural Comparison: Option A (Pure SVG In-Hole) vs Option B (Coaxial HTML Overlay)

Both architectures were implemented and benchmarked during simulation:

### Option A: Pure SVG In-Hole Blade Node (Selected Standard)
- **DOM Placement**: Embedded directly inside `<g class="lotus-blade--primary">` as an SVG `<image>` clipped via `<clipPath>` inside `<circle class="lotus-blade-cradle">`.
- **Motion Kinematics**: Inherits all parent SVG group transformations. When `.lotus-ring--outer` rotates and scales from dormant (`scale(0.64) rotate(-18deg)`) to deployed (`scale(1) rotate(0deg)`), the badge moves synchronously with the petal with $0.0\text{px}$ drift and zero runtime JavaScript translation math.
- **Tucking Invariant**: Naturally rotates behind the central portrait stage (`z-index: 10`) during closing transitions.
- **Trade-offs**: Tooltips rely on native SVG `<title>` or SVG `<text>` elements; CSS hover scaling on individual badges requires SVG `transform-origin` relative to local socket coordinates $(155, 35)$.

### Option B: Coaxial HTML Overlay (Engineered Alternative)
- **DOM Placement**: Badges are standard HTML `<a>` tags inside `.hero-star-badges` (`z-index: 4`) positioned over the SVG canvas.
- **Motion Kinematics**: Badges are translated radially via CSS variables `--dx` and `--dy` computed as:
  $$\text{dx} = \text{round}\left(r_{\text{socket}} \cdot \cos\left(-\frac{\pi}{2} + \frac{2\pi \cdot i}{N}\right)\right)$$
  $$\text{dy} = \text{round}\left(r_{\text{socket}} \cdot \sin\left(-\frac{\pi}{2} + \frac{2\pi \cdot i}{N}\right)\right)$$
  where $r_{\text{socket}} = 120\text{px}$.
- **Strengths**: Native HTML accessibility, keyboard navigation (`:focus-visible`), standard HTML tooltips (`.star-badge-tooltip`) with rich typography, and seamless `:hover` scaling (`scale(1.14)`).
- **Trade-offs**: Requires runtime JavaScript to recalculate and set `--dx` / `--dy` inline styles upon dynamically changing affiliations; requires cubic-bezier curve calibration (`cubic-bezier(0.16, 1, 0.3, 1)`) to visually align badge expansion with SVG petal rotation.

---

## 5. Key Architectural Insights & Decisions

1. **Elimination of Dashed Lines**:
   - The artificial dashed orbit circles (`lotus-mech-ring`) and socket dashed borders (`lotus-blade-cradle-rim`) have been eliminated.
   - Clean, solid metallic gold bezels (`#f3cf82`) provide a jewelry-grade finish that respects the portfolio's calm luxury aesthetic.

2. **Zero-Math Dynamic Scaling**:
   - Because the `<image>` is inside `<g class="lotus-blade--primary">`, applying `transform: scale(0.64) rotate(-18deg)` to `.lotus-ring--outer` automatically pulls all $N$ badges behind the portrait during the dormant state.
   - Hovering triggers `transform: scale(1) rotate(0deg)`, automatically unfurling all badges into their fully cleared sockets without runtime coordinate recalculation.

3. **Standalone Simulation Harness**:
   - Preserved in the repository under [`scripts/simulate_tang_lotus.html`](file:///F:/AaradhyaDT/AaradhyaDT.github.io/scripts/simulate_tang_lotus.html) for regression testing and visual review. Supports both Option A and Option B configurations across $N \in \{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12\}$.
