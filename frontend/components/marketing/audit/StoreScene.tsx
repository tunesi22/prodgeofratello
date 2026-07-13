'use client'

import { useMemo, useRef, type ReactElement } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Sparkles } from '@react-three/drei'
import type { Group } from 'three'

/**
 * The GEO-score storefront as an isometric diorama: a two-story container-style
 * store (corrugated walls, striped awnings, rooftop terrace with stairs) plus a
 * canopied patio, floating on a tiled platform against a soft studio backdrop,
 * in the style of stock isometric 3D renders. The score drives the life in the
 * scene: walkers on the plaza, guests at the patio tables, warm light in the
 * windows and sign, and celebratory sparkles at 75+.
 *
 * Real-time constraints, deliberately: primitives only (no models), no
 * shadow-map lights (one ContactShadows pass grounds the platform), no font or
 * HDRI fetches. `animate={false}` (reduced motion) renders one static frame.
 */

const PALETTE = {
  greenDeep: '#0a5c3a',
  greenRib: '#0d6b44',
  white: '#f3f1ea',
  whiteRib: '#e6e3d8',
  cream: '#f6f3ea',
  tile: '#cfa77f',
  tileDark: '#b88f68',
  rim: '#26292f',
  dark: '#2a2d33',
  wood: '#b08050',
  terracotta: '#e07a5f',
  plant: '#2f8f4e',
  plantLight: '#3aa45e',
  pot: '#efece4',
  glow: '#ffdf9e',
}

const SHOPPER_COLORS = ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f', '#5f9ea0', '#c1666b', '#7d8cc4', '#e3a857']
const SKIN_TONES = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524']

/** Deterministic pseudo-random in [0,1) from an index, keeps renders stable. */
function jitter(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** A row of vertical corrugation ribs across a container face. */
function Ribs({
  width,
  height,
  color,
  y,
  z,
  step = 0.5,
}: {
  width: number
  height: number
  color: string
  y: number
  z: number
  step?: number
}): ReactElement {
  const count = Math.floor(width / step)
  return (
    <group>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[-width / 2 + step / 2 + i * step, y, z]}>
          <boxGeometry args={[0.16, height, 0.07]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

/** Striped shop awning: alternating angled slats over an opening. */
function Awning({
  position,
  width,
  stripes = 5,
}: {
  position: [number, number, number]
  width: number
  stripes?: number
}): ReactElement {
  const slat = width / stripes
  return (
    <group position={position} rotation={[-0.45, 0, 0]}>
      {Array.from({ length: stripes }, (_, i) => (
        <mesh key={i} position={[-width / 2 + slat / 2 + i * slat, 0, 0]}>
          <boxGeometry args={[slat, 0.06, 0.9]} />
          <meshStandardMaterial color={i % 2 === 0 ? PALETTE.greenDeep : PALETTE.cream} />
        </mesh>
      ))}
    </group>
  )
}

/** A dark window/door opening with a warm, score-driven glow inside. */
function Opening({
  position,
  width,
  height,
  lit,
}: {
  position: [number, number, number]
  width: number
  height: number
  lit: number
}): ReactElement {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#1d2b26" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width * 0.86, height * 0.84, 0.1]} />
        <meshStandardMaterial color={PALETTE.glow} emissive={PALETTE.glow} emissiveIntensity={0.15 + lit * 1.15} />
      </mesh>
    </group>
  )
}

/** Potted plant: white pot + layered foliage. */
function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }): ReactElement {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.17, 0.44, 12]} />
        <meshStandardMaterial color={PALETTE.pot} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshStandardMaterial color={PALETTE.plant} />
      </mesh>
      <mesh position={[0.12, 0.86, 0.06]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={PALETTE.plantLight} />
      </mesh>
    </group>
  )
}

/** Patio set: round table + chairs, optionally with seated guests. */
function PatioTable({
  position,
  guests,
  animate,
  seed,
}: {
  position: [number, number, number]
  guests: number
  animate: boolean
  seed: number
}): ReactElement {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (ref.current == null || !animate) return
    ref.current.position.y = Math.sin(clock.elapsedTime * 2 + seed * 4) * 0.015
  })
  const chairAngles = [0.4, 2.1, 4.2]
  return (
    <group position={position}>
      {/* Table */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.05, 20]} />
        <meshStandardMaterial color={PALETTE.cream} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
        <meshStandardMaterial color={PALETTE.dark} />
      </mesh>
      {/* Chairs + guests */}
      {chairAngles.map((a, i) => {
        const cx = Math.cos(a) * 0.72
        const cz = Math.sin(a) * 0.72
        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, -a + Math.PI / 2, 0]}>
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[0.34, 0.05, 0.34]} />
              <meshStandardMaterial color={PALETTE.cream} />
            </mesh>
            <mesh position={[0, 0.5, -0.16]}>
              <boxGeometry args={[0.34, 0.4, 0.05]} />
              <meshStandardMaterial color={PALETTE.cream} />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
              <meshStandardMaterial color={PALETTE.dark} />
            </mesh>
            {i < guests && (
              <group ref={i === 0 ? ref : undefined} position={[0, 0.32, 0.02]}>
                <mesh position={[0, 0.26, 0]}>
                  <capsuleGeometry args={[0.14, 0.26, 4, 10]} />
                  <meshStandardMaterial color={SHOPPER_COLORS[(seed + i) % SHOPPER_COLORS.length]} />
                </mesh>
                <mesh position={[0, 0.62, 0]}>
                  <sphereGeometry args={[0.13, 14, 14]} />
                  <meshStandardMaterial color={SKIN_TONES[(seed + i) % SKIN_TONES.length]} />
                </mesh>
              </group>
            )}
          </group>
        )
      })}
    </group>
  )
}

/** A walker strolling the plaza loop; visitors detour to the door and pause. */
function Walker({ index, pace, animate }: { index: number; pace: number; animate: boolean }): ReactElement {
  const ref = useRef<Group>(null)
  const visitor = index % 3 !== 2
  const dir = index % 2 === 0 ? 1 : -1
  const phase = jitter(index, 1) * 24
  const speed = pace * (0.7 + jitter(index, 2) * 0.5)
  const color = SHOPPER_COLORS[index % SHOPPER_COLORS.length]
  const skin = SKIN_TONES[index % SKIN_TONES.length]
  // Plaza ellipse (stays well inside the platform edge).
  const cx = 1.2
  const cz = 2.6
  const rx = 6.4
  const rz = 2.2
  const door = { x: -2.2, z: 0.6 }

  useFrame(({ clock }) => {
    const g = ref.current
    if (g == null || !animate) return
    const t = (clock.elapsedTime * speed + phase) % 24
    let x: number
    let z: number
    let heading: number

    if (visitor) {
      // Segment walk: plaza edge -> door -> pause -> back out, then rest.
      const start = { x: cx + rx * (dir > 0 ? 0.9 : -0.9), z: cz + 1.4 }
      if (t < 8) {
        const k = t / 8
        x = start.x + (door.x - start.x) * k
        z = start.z + (door.z - start.z) * k
        heading = Math.atan2(door.x - start.x, door.z - start.z)
      } else if (t < 11.5) {
        x = door.x
        z = door.z
        heading = Math.PI // face the store
      } else if (t < 20) {
        const k = (t - 11.5) / 8.5
        x = door.x + (start.x - door.x) * k
        z = door.z + (start.z - door.z) * k
        heading = Math.atan2(start.x - door.x, start.z - door.z)
      } else {
        g.visible = false
        return
      }
    } else {
      // Passerby: laps the plaza ellipse.
      const a = ((t / 24) * Math.PI * 2 + jitter(index, 4) * Math.PI * 2) * dir
      x = cx + Math.cos(a) * rx
      z = cz + Math.sin(a) * rz
      heading = Math.atan2(-Math.sin(a) * rx * dir, Math.cos(a) * rz * dir) + Math.PI / 2
    }

    g.visible = true
    g.position.set(x, 0.4 + Math.abs(Math.sin(t * 7)) * 0.05, z)
    g.rotation.y = heading
  })

  return (
    <group ref={ref} position={[cx + rx, 0.4, cz]}>
      <mesh>
        <capsuleGeometry args={[0.15, 0.34, 4, 10]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial color={skin} />
      </mesh>
    </group>
  )
}

/** The two-story container store with terrace, stairs, sign, and roof mark. */
function ContainerStore({ lit }: { lit: number }): ReactElement {
  return (
    <group position={[-2.6, 0, -2.4]}>
      {/* Bottom container: brand green, corrugated */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[6.6, 2.8, 4.4]} />
        <meshStandardMaterial color={PALETTE.greenDeep} />
      </mesh>
      <Ribs width={6.6} height={2.8} color={PALETTE.greenRib} y={1.4} z={2.22} />
      <Ribs width={6.6} height={2.8} color={PALETTE.greenRib} y={1.4} z={-2.22} />

      {/* Bottom openings: service window + door, with awnings */}
      <Opening position={[-1.7, 1.35, 2.24]} width={2.2} height={1.5} lit={lit} />
      <Opening position={[1.6, 1.15, 2.24]} width={1.1} height={2.1} lit={lit * 0.8} />
      <Awning position={[-1.7, 2.35, 2.55]} width={2.6} />
      <Awning position={[1.6, 2.45, 2.5]} width={1.5} stripes={3} />
      {/* Counter bar + stools at the service window */}
      <mesh position={[-1.7, 0.95, 2.55]}>
        <boxGeometry args={[2.4, 0.08, 0.5]} />
        <meshStandardMaterial color={PALETTE.wood} />
      </mesh>
      {[-2.4, -1.7, -1].map((x) => (
        <mesh key={x} position={[x, 0.42, 3.1]}>
          <cylinderGeometry args={[0.14, 0.16, 0.55, 10]} />
          <meshStandardMaterial color={PALETTE.terracotta} />
        </mesh>
      ))}

      {/* Top container: white, set back, corrugated */}
      <group position={[-0.7, 4.15, -0.5]}>
        <mesh>
          <boxGeometry args={[5.2, 2.7, 3.4]} />
          <meshStandardMaterial color={PALETTE.white} />
        </mesh>
        <Ribs width={5.2} height={2.7} color={PALETTE.whiteRib} y={0} z={1.72} />
        <Ribs width={5.2} height={2.7} color={PALETTE.whiteRib} y={0} z={-1.72} />
        <Opening position={[1.1, -0.15, 1.74]} width={1.7} height={1.3} lit={lit} />
        <Awning position={[1.1, 0.75, 2.05]} width={2.1} />
        {/* Sign board: white plate + abstract brand mark (no text, no font fetch) */}
        <group position={[-1.2, 0.45, 1.78]}>
          <mesh>
            <boxGeometry args={[2.2, 0.75, 0.12]} />
            <meshStandardMaterial color={PALETTE.cream} />
          </mesh>
          <mesh position={[-0.6, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.05, 20]} />
            <meshStandardMaterial color={PALETTE.greenDeep} emissive={PALETTE.greenDeep} emissiveIntensity={0.2 + lit * 1.3} />
          </mesh>
          <mesh position={[0.35, 0, 0.08]}>
            <boxGeometry args={[1.1, 0.16, 0.05]} />
            <meshStandardMaterial color={PALETTE.greenDeep} emissive={PALETTE.greenDeep} emissiveIntensity={0.2 + lit * 1.3} />
          </mesh>
        </group>
        {/* Roof topper: the brand "peak" mark, like a mascot on the roof */}
        <group position={[0.6, 1.85, 0]}>
          <mesh position={[-0.35, 0, 0]}>
            <coneGeometry args={[0.55, 1.1, 4]} />
            <meshStandardMaterial color={PALETTE.greenDeep} flatShading />
          </mesh>
          <mesh position={[0.35, -0.12, 0.15]}>
            <coneGeometry args={[0.42, 0.85, 4]} />
            <meshStandardMaterial color={PALETTE.plantLight} flatShading />
          </mesh>
        </group>
      </group>

      {/* Rooftop terrace on the bottom container, in front of the top box */}
      <mesh position={[0.4, 2.86, 1.6]}>
        <boxGeometry args={[5.6, 0.12, 1.5]} />
        <meshStandardMaterial color={PALETTE.wood} />
      </mesh>
      {/* Railing: posts + top rail */}
      {[-2.2, -1.1, 0, 1.1, 2.2, 3.1].map((x) => (
        <mesh key={x} position={[0.4 + x * 0.85, 3.25, 2.32]}>
          <cylinderGeometry args={[0.025, 0.025, 0.65, 6]} />
          <meshStandardMaterial color={PALETTE.rim} />
        </mesh>
      ))}
      <mesh position={[0.4, 3.56, 2.32]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 5.6, 6]} />
        <meshStandardMaterial color={PALETTE.rim} />
      </mesh>
      {/* Terrace stools */}
      {[-1.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 3.12, 1.6]}>
          <cylinderGeometry args={[0.13, 0.15, 0.4, 10]} />
          <meshStandardMaterial color={PALETTE.terracotta} />
        </mesh>
      ))}

      {/* Side stairs (left), step boxes + stringer */}
      <group position={[-3.6, 0, 0.4]}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[-0.15, 0.2 + i * 0.36, 1.5 - i * 0.42]}>
            <boxGeometry args={[0.9, 0.08, 0.4]} />
            <meshStandardMaterial color={PALETTE.rim} />
          </mesh>
        ))}
        <mesh position={[-0.15, 1.55, 0.05]} rotation={[0.7, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 4]} />
          <meshStandardMaterial color={PALETTE.rim} />
        </mesh>
      </group>
    </group>
  )
}

/** Round patio canopy on poles over the seating area. */
function Canopy(): ReactElement {
  return (
    <group position={[3.6, 0, 2.2]}>
      <mesh position={[0, 3.05, 0]}>
        <cylinderGeometry args={[2.55, 2.7, 0.22, 28]} />
        <meshStandardMaterial color={PALETTE.greenDeep} />
      </mesh>
      <mesh position={[0, 2.9, 0]}>
        <cylinderGeometry args={[2.7, 2.7, 0.1, 28]} />
        <meshStandardMaterial color={PALETTE.cream} />
      </mesh>
      {[
        [-1.9, -1.4],
        [1.9, -1.4],
        [-1.9, 1.6],
        [1.9, 1.6],
      ].map(([px, pz]) => (
        <mesh key={`${px}${pz}`} position={[px, 1.5, pz]}>
          <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
          <meshStandardMaterial color={PALETTE.rim} />
        </mesh>
      ))}
    </group>
  )
}

function Platform(): ReactElement {
  return (
    <group>
      <mesh position={[0, -0.26, 0]}>
        <boxGeometry args={[19.6, 0.52, 13.6]} />
        <meshStandardMaterial color={PALETTE.tile} />
      </mesh>
      {/* Dark base rim, slightly wider, sells the floating-diorama edge */}
      <mesh position={[0, -0.56, 0]}>
        <boxGeometry args={[20, 0.16, 14]} />
        <meshStandardMaterial color={PALETTE.rim} />
      </mesh>
      {/* Tile seams: thin darker strips */}
      {[-6, -2, 2, 6].map((x) => (
        <mesh key={`x${x}`} position={[x, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, 13.6]} />
          <meshStandardMaterial color={PALETTE.tileDark} />
        </mesh>
      ))}
      {[-4, 0, 4].map((z) => (
        <mesh key={`z${z}`} position={[0, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[19.6, 0.06]} />
          <meshStandardMaterial color={PALETTE.tileDark} />
        </mesh>
      ))}
    </group>
  )
}

export interface StoreSceneProps {
  score: number
  /** False under prefers-reduced-motion: renders one static frame. */
  animate: boolean
}

export function StoreScene({ score, animate }: StoreSceneProps): ReactElement {
  const lit = score / 100
  const walkers = useMemo(() => {
    const count = Math.max(1, Math.round(score / 8))
    const pace = 0.55 + lit * 0.85
    return Array.from({ length: count }, (_, i) => ({ index: i, pace }))
  }, [score, lit])
  const guestsPerTable = score >= 70 ? [2, 2, 1] : score >= 45 ? [1, 1, 0] : [0, 0, 0]

  return (
    <Canvas
      orthographic
      dpr={[1, 2]}
      frameloop={animate ? 'always' : 'demand'}
      camera={{ position: [17, 14, 17], zoom: 33, near: -60, far: 120 }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Soft studio lighting, no shadow maps */}
      <hemisphereLight args={['#ffffff', '#d8cbb8', 0.55]} />
      <ambientLight intensity={0.35 + lit * 0.2} />
      <directionalLight position={[10, 14, 8]} intensity={1.05} />
      <directionalLight position={[-8, 10, -6]} intensity={0.35} />

      <Platform />
      <ContainerStore lit={lit} />
      <Canopy />
      <PatioTable position={[2.6, 0, 1.6]} guests={guestsPerTable[0]} animate={animate} seed={1} />
      <PatioTable position={[4.6, 0, 3]} guests={guestsPerTable[1]} animate={animate} seed={2} />
      <PatioTable position={[3.2, 0, 4]} guests={guestsPerTable[2]} animate={animate} seed={3} />

      <Plant position={[0.6, 0, 2.6]} scale={1.2} />
      <Plant position={[6.6, 0, 0.9]} />
      <Plant position={[-6.3, 0, 3.6]} scale={0.9} />
      <Plant position={[6.9, 0, 4.6]} scale={0.8} />

      {walkers.map((w) => (
        <Walker key={w.index} index={w.index} pace={w.pace} animate={animate} />
      ))}

      {score >= 75 && animate && (
        <Sparkles count={45} scale={[7, 3, 5]} position={[-2, 6.2, -1.5]} size={3.5} speed={0.4} color="#ffd76e" />
      )}

      {/* One soft grounding pass under everything (the studio-floor shadow) */}
      <ContactShadows position={[0, -0.63, 0]} opacity={0.35} scale={30} blur={2.6} far={9} resolution={512} frames={animate ? Infinity : 1} />

      <OrbitControls
        target={[0, 2.2, 0]}
        enableZoom={false}
        enablePan={false}
        autoRotate={animate}
        autoRotateSpeed={0.4}
        minPolarAngle={0.85}
        maxPolarAngle={1.02}
      />
    </Canvas>
  )
}
