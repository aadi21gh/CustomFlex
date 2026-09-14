/* ═══════════════════════════════════════════════════════════════════════════════
   XPBDSimulation.js — eXtended Position-Based Dynamics Cloth Simulation
   ─────────────────────────────────────────────────────────────────────────────
   A browser-side XPBD cloth simulation engine for realistic garment draping,
   canvas tension, and accessory surface deformation. Outputs particle positions
   for real-time Three.js BufferGeometry updates.

   Features:
   - Particle system with mass, position, velocity
   - Distance constraints (stretch) with XPBD compliance
   - Bending constraints for realistic fabric curvature
   - Collision with basic shapes (sphere, plane)
   - Real-time strain computation per edge
   - Seam gap tracking between corresponding vertices
   - Configurable material properties (stiffness, damping, friction)
   ═══════════════════════════════════════════════════════════════════════════════ */

export class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  clone() { return new Vec3(this.x, this.y, this.z); }
  add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
  sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
  scale(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  cross(v) {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }
  length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
  lengthSq() { return this.x * this.x + this.y * this.y + this.z * this.z; }
  normalize() {
    const len = this.length();
    if (len < 1e-10) return new Vec3();
    return this.scale(1 / len);
  }
  addInPlace(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  scaleInPlace(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  toArray() { return [this.x, this.y, this.z]; }
}

/* ── Particle ──────────────────────────────────────────────────────────────── */
class Particle {
  constructor(x, y, z, mass = 1.0) {
    this.pos = new Vec3(x, y, z);
    this.prevPos = new Vec3(x, y, z);
    this.vel = new Vec3();
    this.mass = mass;
    this.invMass = mass > 0 ? 1.0 / mass : 0; // 0 = pinned
    this.pinned = false;
    this.correction = new Vec3(); // accumulated correction for XPBD
    this.correctionCount = 0;
  }
}

/* ── Distance Constraint (stretch) ─────────────────────────────────────────── */
class DistanceConstraint {
  constructor(p1Idx, p2Idx, restLength, compliance = 0.0) {
    this.p1 = p1Idx;
    this.p2 = p2Idx;
    this.restLength = restLength;
    this.compliance = compliance; // XPBD compliance α (0 = infinitely stiff)
    this.lambda = 0; // Lagrange multiplier
    this.strain = 0; // current strain value
  }
}

/* ── Bending Constraint ────────────────────────────────────────────────────── */
class BendingConstraint {
  constructor(p1Idx, p2Idx, restLength, compliance = 0.001) {
    this.p1 = p1Idx;
    this.p2 = p2Idx;
    this.restLength = restLength;
    this.compliance = compliance;
    this.lambda = 0;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   XPBD Simulation Engine
   ═══════════════════════════════════════════════════════════════════════════════ */
export class XPBDSimulation {
  constructor(options = {}) {
    this.particles = [];
    this.distConstraints = [];
    this.bendConstraints = [];
    this.triangles = []; // for mesh rendering [i0, i1, i2]
    this.seamPairs = [];  // [{a: idx, b: idx}] for seam gap tracking

    // Simulation parameters
    this.gravity = new Vec3(0, options.gravity ?? -9.81, 0);
    this.wind = new Vec3(0, 0, 0);
    this.dt = options.dt ?? (1 / 60);
    this.subSteps = options.subSteps ?? 8;
    this.solverIterations = options.solverIterations ?? 10;
    this.damping = options.damping ?? 0.98;
    this.friction = options.friction ?? 0.5;

    // Material-driven compliance
    this.stretchCompliance = options.stretchCompliance ?? 0.0;
    this.bendCompliance = options.bendCompliance ?? 0.001;

    // Collision
    this.colliders = []; // { type: 'sphere', center: Vec3, radius: float } or { type: 'plane', point: Vec3, normal: Vec3 }
    this.groundY = options.groundY ?? -3.0;

    // Stats tracking
    this.stats = {
      maxStrain: 0,
      avgStrain: 0,
      maxSeamGap: 0,
      solverIterationsUsed: 0,
      particleCount: 0,
      constraintCount: 0,
      fps: 0,
      energy: 0,
      convergence: 1.0,
    };

    this.running = false;
    this.frameCount = 0;
    this._lastTime = performance.now();
    this._fpsAccum = 0;
    this._fpsFrames = 0;

    // Grid dimensions (for cloth mesh)
    this.gridW = 0;
    this.gridH = 0;
  }

  /* ── Create a cloth grid ──────────────────────────────────────────────── */
  createClothGrid(width, height, segW, segH, origin = new Vec3(0, 2, 0)) {
    this.gridW = segW + 1;
    this.gridH = segH + 1;
    const spacingX = width / segW;
    const spacingY = height / segH;

    // Create particles
    for (let j = 0; j <= segH; j++) {
      for (let i = 0; i <= segW; i++) {
        const x = origin.x + i * spacingX - width / 2;
        const y = origin.y;
        const z = origin.z + j * spacingY - height / 2;
        this.particles.push(new Particle(x, y, z, 1.0));
      }
    }

    // Pin top row
    for (let i = 0; i <= segW; i++) {
      this.particles[i].pinned = true;
      this.particles[i].invMass = 0;
    }

    // Distance constraints (structural)
    for (let j = 0; j <= segH; j++) {
      for (let i = 0; i <= segW; i++) {
        const idx = j * (segW + 1) + i;
        // Horizontal
        if (i < segW) {
          const idxR = idx + 1;
          const rest = this.particles[idx].pos.sub(this.particles[idxR].pos).length();
          this.distConstraints.push(new DistanceConstraint(idx, idxR, rest, this.stretchCompliance));
        }
        // Vertical
        if (j < segH) {
          const idxD = idx + (segW + 1);
          const rest = this.particles[idx].pos.sub(this.particles[idxD].pos).length();
          this.distConstraints.push(new DistanceConstraint(idx, idxD, rest, this.stretchCompliance));
        }
        // Shear diagonals
        if (i < segW && j < segH) {
          const idxBR = idx + segW + 2;
          const rest = this.particles[idx].pos.sub(this.particles[idxBR].pos).length();
          this.distConstraints.push(new DistanceConstraint(idx, idxBR, rest, this.stretchCompliance * 2));
        }
        if (i > 0 && j < segH) {
          const idxBL = idx + segW;
          const rest = this.particles[idx].pos.sub(this.particles[idxBL].pos).length();
          this.distConstraints.push(new DistanceConstraint(idx, idxBL, rest, this.stretchCompliance * 2));
        }
      }
    }

    // Bending constraints (skip one particle)
    for (let j = 0; j <= segH; j++) {
      for (let i = 0; i <= segW; i++) {
        const idx = j * (segW + 1) + i;
        if (i < segW - 1) {
          const idxR2 = idx + 2;
          const rest = this.particles[idx].pos.sub(this.particles[idxR2].pos).length();
          this.bendConstraints.push(new BendingConstraint(idx, idxR2, rest, this.bendCompliance));
        }
        if (j < segH - 1) {
          const idxD2 = idx + 2 * (segW + 1);
          const rest = this.particles[idx].pos.sub(this.particles[idxD2].pos).length();
          this.bendConstraints.push(new BendingConstraint(idx, idxD2, rest, this.bendCompliance));
        }
      }
    }

    // Triangle indices for rendering
    for (let j = 0; j < segH; j++) {
      for (let i = 0; i < segW; i++) {
        const a = j * (segW + 1) + i;
        const b = a + 1;
        const c = a + segW + 1;
        const d = c + 1;
        this.triangles.push(a, c, b);
        this.triangles.push(b, c, d);
      }
    }

    this.stats.particleCount = this.particles.length;
    this.stats.constraintCount = this.distConstraints.length + this.bendConstraints.length;
  }

  /* ── Set material properties ─────────────────────────────────────────── */
  setMaterial(material) {
    // Map material properties to simulation parameters
    this.stretchCompliance = Math.max(0, (1 - material.stiffness) * 0.01);
    this.bendCompliance = Math.max(0, (1 - material.bending) * 0.05);
    this.damping = material.damping;
    this.friction = material.friction;

    // Update existing constraints
    this.distConstraints.forEach(c => {
      c.compliance = this.stretchCompliance;
    });
    this.bendConstraints.forEach(c => {
      c.compliance = this.bendCompliance;
    });
  }

  /* ── Add collider ────────────────────────────────────────────────────── */
  addSphereCollider(center, radius) {
    this.colliders.push({ type: 'sphere', center, radius });
  }

  addPlaneCollider(point, normal) {
    this.colliders.push({ type: 'plane', point, normal: normal.normalize() });
  }

  /* ── Simulation Step (XPBD) ──────────────────────────────────────────── */
  step() {
    const dt = this.dt / this.subSteps;
    const dtSq = dt * dt;

    for (let sub = 0; sub < this.subSteps; sub++) {
      // 1. Predict positions (symplectic Euler)
      for (const p of this.particles) {
        if (p.pinned) continue;
        // Apply forces
        const force = this.gravity.add(this.wind.scale(0.01));
        p.vel = p.vel.add(force.scale(dt));
        p.vel = p.vel.scale(this.damping);
        p.prevPos = p.pos.clone();
        p.pos = p.pos.add(p.vel.scale(dt));
      }

      // 2. Reset Lagrange multipliers
      this.distConstraints.forEach(c => c.lambda = 0);
      this.bendConstraints.forEach(c => c.lambda = 0);

      // 3. Solve constraints (XPBD)
      for (let iter = 0; iter < this.solverIterations; iter++) {
        // Distance constraints
        for (const c of this.distConstraints) {
          const p1 = this.particles[c.p1];
          const p2 = this.particles[c.p2];
          const diff = p1.pos.sub(p2.pos);
          const dist = diff.length();
          if (dist < 1e-10) continue;

          const C = dist - c.restLength; // constraint value
          const alphaTilde = c.compliance / dtSq;
          const wSum = p1.invMass + p2.invMass;
          if (wSum < 1e-10) continue;

          const deltaLambda = (-C - alphaTilde * c.lambda) / (wSum + alphaTilde);
          c.lambda += deltaLambda;

          const correction = diff.normalize().scale(deltaLambda);
          if (!p1.pinned) p1.pos = p1.pos.add(correction.scale(p1.invMass));
          if (!p2.pinned) p2.pos = p2.pos.sub(correction.scale(p2.invMass));

          // Track strain
          c.strain = Math.abs(dist / c.restLength - 1.0);
        }

        // Bending constraints
        for (const c of this.bendConstraints) {
          const p1 = this.particles[c.p1];
          const p2 = this.particles[c.p2];
          const diff = p1.pos.sub(p2.pos);
          const dist = diff.length();
          if (dist < 1e-10) continue;

          const C = dist - c.restLength;
          const alphaTilde = c.compliance / dtSq;
          const wSum = p1.invMass + p2.invMass;
          if (wSum < 1e-10) continue;

          const deltaLambda = (-C - alphaTilde * c.lambda) / (wSum + alphaTilde);
          c.lambda += deltaLambda;

          const correction = diff.normalize().scale(deltaLambda);
          if (!p1.pinned) p1.pos = p1.pos.add(correction.scale(p1.invMass));
          if (!p2.pinned) p2.pos = p2.pos.sub(correction.scale(p2.invMass));
        }
      }

      // 4. Collision detection & response
      for (const p of this.particles) {
        if (p.pinned) continue;

        // Ground plane
        if (p.pos.y < this.groundY) {
          p.pos.y = this.groundY;
          p.vel.y = 0;
          // Friction
          p.vel.x *= (1 - this.friction);
          p.vel.z *= (1 - this.friction);
        }

        // Colliders
        for (const col of this.colliders) {
          if (col.type === 'sphere') {
            const toP = p.pos.sub(col.center);
            const dist = toP.length();
            if (dist < col.radius) {
              const normal = toP.normalize();
              p.pos = col.center.add(normal.scale(col.radius));
              // Reflect velocity
              const vn = p.vel.dot(normal);
              if (vn < 0) {
                p.vel = p.vel.sub(normal.scale(vn * (1 + 0.1))); // small restitution
              }
            }
          } else if (col.type === 'plane') {
            const d = p.pos.sub(col.point).dot(col.normal);
            if (d < 0) {
              p.pos = p.pos.sub(col.normal.scale(d));
              const vn = p.vel.dot(col.normal);
              if (vn < 0) {
                p.vel = p.vel.sub(col.normal.scale(vn));
              }
            }
          }
        }
      }

      // 5. Update velocities
      for (const p of this.particles) {
        if (p.pinned) continue;
        p.vel = p.pos.sub(p.prevPos).scale(1 / dt);
      }
    }

    // Update stats
    this._updateStats();
    this.frameCount++;
  }

  /* ── Update statistics ───────────────────────────────────────────────── */
  _updateStats() {
    let maxStrain = 0;
    let totalStrain = 0;
    let strainCount = 0;

    for (const c of this.distConstraints) {
      if (c.strain > maxStrain) maxStrain = c.strain;
      totalStrain += c.strain;
      strainCount++;
    }

    this.stats.maxStrain = maxStrain;
    this.stats.avgStrain = strainCount > 0 ? totalStrain / strainCount : 0;
    this.stats.solverIterationsUsed = this.solverIterations * this.subSteps;

    // Seam gaps
    let maxGap = 0;
    for (const seam of this.seamPairs) {
      const gap = this.particles[seam.a].pos.sub(this.particles[seam.b].pos).length();
      if (gap > maxGap) maxGap = gap;
    }
    this.stats.maxSeamGap = maxGap;

    // Energy (kinetic)
    let energy = 0;
    for (const p of this.particles) {
      if (!p.pinned) {
        energy += 0.5 * p.mass * p.vel.lengthSq();
      }
    }
    this.stats.energy = energy;

    // Convergence (ratio of max strain to threshold)
    this.stats.convergence = Math.max(0, 1 - maxStrain * 10);

    // FPS
    const now = performance.now();
    this._fpsFrames++;
    this._fpsAccum += (now - this._lastTime);
    this._lastTime = now;
    if (this._fpsAccum >= 1000) {
      this.stats.fps = Math.round(this._fpsFrames * 1000 / this._fpsAccum);
      this._fpsFrames = 0;
      this._fpsAccum = 0;
    }
  }

  /* ── Get position buffer for Three.js ────────────────────────────────── */
  getPositionBuffer() {
    const buf = new Float32Array(this.particles.length * 3);
    for (let i = 0; i < this.particles.length; i++) {
      buf[i * 3] = this.particles[i].pos.x;
      buf[i * 3 + 1] = this.particles[i].pos.y;
      buf[i * 3 + 2] = this.particles[i].pos.z;
    }
    return buf;
  }

  /* ── Get normal buffer for lighting ──────────────────────────────────── */
  getNormalBuffer() {
    const normals = new Float32Array(this.particles.length * 3);

    // Accumulate face normals per vertex
    for (let t = 0; t < this.triangles.length; t += 3) {
      const i0 = this.triangles[t];
      const i1 = this.triangles[t + 1];
      const i2 = this.triangles[t + 2];

      const p0 = this.particles[i0].pos;
      const p1 = this.particles[i1].pos;
      const p2 = this.particles[i2].pos;

      const e1 = p1.sub(p0);
      const e2 = p2.sub(p0);
      const n = e1.cross(e2);

      for (const idx of [i0, i1, i2]) {
        normals[idx * 3] += n.x;
        normals[idx * 3 + 1] += n.y;
        normals[idx * 3 + 2] += n.z;
      }
    }

    // Normalize
    for (let i = 0; i < this.particles.length; i++) {
      const nx = normals[i * 3];
      const ny = normals[i * 3 + 1];
      const nz = normals[i * 3 + 2];
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      if (len > 1e-10) {
        normals[i * 3] /= len;
        normals[i * 3 + 1] /= len;
        normals[i * 3 + 2] /= len;
      }
    }

    return normals;
  }

  /* ── Get strain color buffer for heatmap ─────────────────────────────── */
  getStrainColorBuffer() {
    // Map strain per vertex (average of connected edge strains)
    const vertexStrain = new Float32Array(this.particles.length);
    const vertexCount = new Uint8Array(this.particles.length);

    for (const c of this.distConstraints) {
      vertexStrain[c.p1] += c.strain;
      vertexStrain[c.p2] += c.strain;
      vertexCount[c.p1]++;
      vertexCount[c.p2]++;
    }

    // Create RGB color buffer (green → yellow → red)
    const colors = new Float32Array(this.particles.length * 3);
    for (let i = 0; i < this.particles.length; i++) {
      const s = vertexCount[i] > 0 ? vertexStrain[i] / vertexCount[i] : 0;
      const t = Math.min(s * 20, 1); // scale strain for visibility

      // Green (0) → Yellow (0.5) → Red (1)
      if (t < 0.5) {
        colors[i * 3] = t * 2;        // R: 0 → 1
        colors[i * 3 + 1] = 1;        // G: 1
        colors[i * 3 + 2] = 0;        // B: 0
      } else {
        colors[i * 3] = 1;            // R: 1
        colors[i * 3 + 1] = 2 - t * 2; // G: 1 → 0
        colors[i * 3 + 2] = 0;        // B: 0
      }
    }

    return colors;
  }

  /* ── Get triangle indices ────────────────────────────────────────────── */
  getIndexBuffer() {
    return new Uint16Array(this.triangles);
  }

  /* ── Get UV coordinates for texture mapping ──────────────────────────── */
  getUVBuffer() {
    const uvs = new Float32Array(this.particles.length * 2);
    for (let j = 0; j < this.gridH; j++) {
      for (let i = 0; i < this.gridW; i++) {
        const idx = j * this.gridW + i;
        uvs[idx * 2] = i / (this.gridW - 1);
        uvs[idx * 2 + 1] = 1 - j / (this.gridH - 1);
      }
    }
    return uvs;
  }

  /* ── Reset simulation ────────────────────────────────────────────────── */
  reset() {
    // Reset all particles to their original pinned position pattern
    const spacingX = this.gridW > 1 ? 1.0 : 0;
    const spacingZ = this.gridH > 1 ? 1.0 : 0;

    // Just reset velocities and unpin motion
    for (const p of this.particles) {
      p.vel = new Vec3();
      if (!p.pinned) {
        // Reset to flat position
        p.pos.y = this.particles[0].pos.y;
      }
    }

    this.distConstraints.forEach(c => { c.lambda = 0; c.strain = 0; });
    this.bendConstraints.forEach(c => c.lambda = 0);
    this.frameCount = 0;
    this.stats.maxStrain = 0;
    this.stats.avgStrain = 0;
    this.stats.maxSeamGap = 0;
    this.stats.energy = 0;
  }

  /* ── Get current statistics snapshot ─────────────────────────────────── */
  getStats() {
    return { ...this.stats };
  }

  /* ── Set wind force ──────────────────────────────────────────────────── */
  setWind(x, y, z) {
    this.wind = new Vec3(x, y, z);
  }

  /* ── Set gravity ─────────────────────────────────────────────────────── */
  setGravity(y) {
    this.gravity = new Vec3(0, y, 0);
  }

  /* ── Pin / Unpin particle ────────────────────────────────────────────── */
  pinParticle(idx) {
    if (idx >= 0 && idx < this.particles.length) {
      this.particles[idx].pinned = true;
      this.particles[idx].invMass = 0;
    }
  }

  unpinParticle(idx) {
    if (idx >= 0 && idx < this.particles.length) {
      this.particles[idx].pinned = false;
      this.particles[idx].invMass = 1.0 / this.particles[idx].mass;
    }
  }
}

/* ── Factory: Create simulation for a specific category ───────────────────── */
export function createSimulationForCategory(category, materialPreset) {
  const sim = new XPBDSimulation({
    gravity: -9.81,
    subSteps: 8,
    solverIterations: 10,
    stretchCompliance: Math.max(0, (1 - materialPreset.stiffness) * 0.01),
    bendCompliance: Math.max(0, (1 - materialPreset.bending) * 0.05),
    damping: materialPreset.damping,
    friction: materialPreset.friction,
  });

  switch (category) {
    case 'clothing':
      // Larger cloth grid for garment draping
      sim.createClothGrid(3.0, 4.0, 20, 26, new Vec3(0, 2.5, 0));
      // Add mannequin torso as sphere collider
      sim.addSphereCollider(new Vec3(0, 0, 0), 1.2);
      break;

    case 'artwork':
      // Taut canvas on frame — small grid, mostly pinned
      sim.createClothGrid(3.6, 2.7, 16, 12, new Vec3(0, 0, 0));
      // Pin all edges (stretched canvas)
      const artW = 17, artH = 13;
      for (let i = 0; i < artW; i++) {
        sim.pinParticle(i); // top
        sim.pinParticle((artH - 1) * artW + i); // bottom
      }
      for (let j = 0; j < artH; j++) {
        sim.pinParticle(j * artW); // left
        sim.pinParticle(j * artW + artW - 1); // right
      }
      sim.setGravity(-2.0); // reduced gravity for mounted canvas
      break;

    case 'accessories':
      // Smaller cloth/surface for accessories
      sim.createClothGrid(2.0, 2.0, 12, 12, new Vec3(0, 1.5, 0));
      // Add form collider
      sim.addSphereCollider(new Vec3(0, 0, 0), 0.8);
      break;

    default:
      sim.createClothGrid(3.0, 4.0, 16, 20, new Vec3(0, 2.5, 0));
  }

  return sim;
}

export default XPBDSimulation;
