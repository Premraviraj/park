import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const NebulaBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 50

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 1)
    containerRef.current.appendChild(renderer.domElement)

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCnt = 10000
    const posArray = new Float32Array(particlesCnt * 3)
    const scaleArray = new Float32Array(particlesCnt)

    // Create random positions and scales
    for (let i = 0; i < particlesCnt * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 100
      posArray[i + 1] = (Math.random() - 0.5) * 100
      posArray[i + 2] = (Math.random() - 0.5) * 100
      scaleArray[i / 3] = Math.random() * 0.5
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1))

    // Create shader material with white dots
    const particlesMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float scale;
        varying float vOpacity;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Point size based on scale and distance - reduced size
          gl_PointSize = scale * 1.0 * (300.0 / -mvPosition.z);
          
          // Pass opacity based on z-position for depth effect
          vOpacity = 0.2 + (scale * 0.5); // Reduced opacity
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        
        void main() {
          // Create circular point with soft edges
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          float alpha = smoothstep(0.5, 0.3, dist) * vOpacity;
          
          // Pure white color with varying opacity
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    // Mouse interaction with reduced sensitivity
    let mouseX = 0
    let mouseY = 0
    const mouseMoveHandler = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.00002
      mouseY = (event.clientY - window.innerHeight / 2) * 0.00002
    }
    window.addEventListener('mousemove', mouseMoveHandler)

    // Animation
    const clock = new THREE.Clock()
    const animate = () => {
      const elapsedTime = clock.getElapsedTime()

      // Rotate particles based on mouse position with reduced speed
      particlesMesh.rotation.x += mouseY * 0.1
      particlesMesh.rotation.y += mouseX * 0.1

      // Gentle wave motion with reduced speed
      const positions = particlesGeometry.attributes.position.array as Float32Array
      for (let i = 0; i < particlesCnt * 3; i += 3) {
        const x = positions[i]
        const y = positions[i + 1]
        
        // Reduced wave speed and amplitude
        positions[i + 1] = y + Math.sin(elapsedTime * 0.02 + x * 0.02) * 0.02
      }
      particlesGeometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler)
      window.removeEventListener('resize', handleResize)
      scene.remove(particlesMesh)
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      renderer.dispose()
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: '#000000',
        overflow: 'hidden'
      }} 
    />
  )
}

export default NebulaBackground