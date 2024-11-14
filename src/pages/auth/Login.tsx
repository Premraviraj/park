import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, TextField, Button, Typography, Paper } from '@mui/material'
import NebulaBackground from './NebulaBackground'

interface LoginCredentials {
  username: string
  password: string
}

const Login = () => {
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  })
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Basic validation
      if (!credentials.username || !credentials.password) {
        throw new Error('Please enter both username and password')
      }

      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check credentials and route accordingly
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        localStorage.setItem('token', 'admin-token')
        localStorage.setItem('userRole', 'admin')
        navigate('/localconfig')
      } else if (credentials.username === 'user' && credentials.password === 'user123') {
        localStorage.setItem('token', 'user-token')
        localStorage.setItem('userRole', 'user')
        navigate('/dashboard')
      } else {
        throw new Error('Invalid username or password')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    >
      <NebulaBackground />
      
      <Paper
        elevation={24}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          mx: 2
        }}
      >
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: 'center',
              color: 'white',
              mb: 3,
              textShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}
          >
            Login
          </Typography>

          <TextField
            label="Username"
            variant="outlined"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
          />

          {error && (
            <Typography 
              color="error" 
              textAlign="center"
              sx={{ mt: -1 }}
            >
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default Login