import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Box, LinearProgress, useTheme, useMediaQuery } from '@mui/material'

const SpinnerLoader = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const theme = useTheme()
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  
  // Calculate sizes based on screen size
  const getLoaderSize = () => {
    if (isMobile) return 100
    if (isTablet) return 120
    return 150
  }

  const getProgressBarWidth = () => {
    if (isMobile) return '120px'
    if (isTablet) return '150px'
    return '180px'
  }
  
  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    })
    
    const size = getLoaderSize()
    renderer.setSize(size, size)
    containerRef.current.appendChild(renderer.domElement)

    // Create outer ring
    const torusGeometry = new THREE.TorusGeometry(1, 0.1, 16, 100)
    const torusMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88,
      transparent: true,
      opacity: 0.8,
    })
    const torus = new THREE.Mesh(torusGeometry, torusMaterial)
    scene.add(torus)

    // Create inner ring
    const innerTorusGeometry = new THREE.TorusGeometry(0.7, 0.05, 16, 100)
    const innerTorusMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4488ff,
      transparent: true,
      opacity: 0.6,
    })
    const innerTorus = new THREE.Mesh(innerTorusGeometry, innerTorusMaterial)
    innerTorus.rotation.x = Math.PI / 2
    scene.add(innerTorus)

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    camera.position.z = 3

    // Progress animation
    const startTime = Date.now()
    const duration = 2000 // 2 seconds

    // Animation
    const animate = () => {
      // Rotate outer ring
      torus.rotation.x += 0.01
      torus.rotation.y += 0.02

      // Rotate inner ring
      innerTorus.rotation.y += 0.03
      innerTorus.rotation.z += 0.02

      // Pulsing effect
      const time = Date.now() * 0.001
      const pulse = Math.sin(time * 2) * 0.1 + 0.9
      torus.scale.set(pulse, pulse, pulse)
      innerTorus.scale.set(pulse, pulse, pulse)

      // Update progress
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      renderer.render(scene, camera)
      return requestAnimationFrame(animate)
    }

    const animationId = animate()

    // Handle window resize
    const handleResize = () => {
      const newSize = getLoaderSize()
      renderer.setSize(newSize, newSize)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      renderer.dispose()
      torusGeometry.dispose()
      torusMaterial.dispose()
      innerTorusGeometry.dispose()
      innerTorusMaterial.dispose()
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [isMobile, isTablet]) // Re-initialize when screen size changes

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 1, sm: 1.5, md: 2 },
        padding: { xs: 1, sm: 1.5, md: 2 },
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        backgroundColor: '#000000'
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: { xs: '100px', sm: '120px', md: '150px' },
          height: { xs: '100px', sm: '120px', md: '150px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      />
      <Box
        sx={{
          width: getProgressBarWidth(),
          position: 'relative',
          mt: { xs: 0.5, sm: 1 },
          maxWidth: '90vw'
        }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: { xs: 2, sm: 3, md: 4 },
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 1,
              background: 'linear-gradient(90deg, #4488ff, #00ff88)',
              transition: 'transform 0.1s linear',
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: { xs: '8px', sm: '9px', md: '10px' },
            mt: { xs: 0.25, sm: 0.5 }
          }}
        >
          {Math.round(progress)}%
        </Box>
      </Box>
    </Box>
  )
}

export default SpinnerLoader 