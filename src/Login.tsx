import logo from '../assets/logo.webp'

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
    sx={{
      display: 'flex',
      justifyContent: 'center',
      mb: 3
    }}
  >
    <Box
      component="img"
      src={logo}
      alt="Logo"
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        padding: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(5px)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
        }
      }}
    />
  </Box>

  <Box
    component="form"
    onSubmit={handleLogin}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }}
  >
    {/* Rest of the form content remains the same */}
  </Box>
</Paper> 