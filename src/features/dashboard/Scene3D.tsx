import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles, Sphere } from '@react-three/drei'
import * as THREE from 'three'

function SceneContents() {
  const group = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    g.rotation.y += delta * 0.04
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.025
    g.scale.setScalar(breathe)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.14, 0.035)
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -pointer.current.x * 0.08, 0.035)
    g.position.x = THREE.MathUtils.lerp(g.position.x, pointer.current.x * 0.25, 0.035)
    g.position.y = THREE.MathUtils.lerp(g.position.y, pointer.current.y * 0.18, 0.035)
  })

  return (
    <group ref={group}>
      <Float speed={0.9} rotationIntensity={0.25} floatIntensity={0.5}>
        <Sphere args={[1.3, 48, 48]} position={[-1.8, 0.2, -1.5]}>
          <MeshDistortMaterial
            color="#312e81"
            roughness={0.85}
            metalness={0}
            distort={0.18}
            speed={0.5}
            transparent
            opacity={0.26}
          />
        </Sphere>
      </Float>

      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.4}>
        <Sphere args={[1.05, 48, 48]} position={[1.9, -0.7, -2.5]}>
          <MeshDistortMaterial
            color="#155e75"
            roughness={0.85}
            metalness={0}
            distort={0.22}
            speed={0.45}
            transparent
            opacity={0.16}
          />
        </Sphere>
      </Float>

      <Float speed={1} rotationIntensity={0.28} floatIntensity={0.45}>
        <Sphere args={[0.75, 48, 48]} position={[0.5, 1.0, -3.5]}>
          <MeshDistortMaterial
            color="#3b2f6b"
            roughness={0.9}
            metalness={0}
            distort={0.18}
            speed={0.45}
            transparent
            opacity={0.12}
          />
        </Sphere>
      </Float>

      <Sparkles count={22} scale={[10, 6, 4]} size={1.2} speed={0.16} opacity={0.18} color="#6d75b8" />
    </group>
  )
}

interface Scene3DProps {
  active: boolean
}

export default function Scene3D({ active }: Scene3DProps) {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 6], fov: 45 }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={0.55} />
      <SceneContents />
    </Canvas>
  )
}
