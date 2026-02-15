import {
  Card,
  Flex,
  Text,
  TextField,
  Button,
  IconButton,
} from '@radix-ui/themes'
import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  PersonIcon,
} from '@radix-ui/react-icons'
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../store/Store'
import { login, clearError } from '../features/AuthSlice'

const Login = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  
  const { loading, error, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  )

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Redirect based on role after successful login
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(clearError())
      
      // Redirect based on role
      switch (user.role) {
        case 'admin':
        case 'manager':
          navigate('/dashboard')
          break
        case 'staff':
          navigate('/dashboard/pos')
          break
        default:
          navigate('/dashboard')
      }
    }
  }, [isAuthenticated, user, navigate, dispatch])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(clearError())
    
    try {
      await dispatch(login({ email, password })).unwrap()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      overflow: 'hidden',
      background: '#0F0F23',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Custom Cursor */}
      <div
        style={{
          position: 'fixed',
          width: isHovering ? '40px' : '20px',
          height: isHovering ? '40px' : '20px',
          pointerEvents: 'none',
          zIndex: 10000,
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.3s ease, height 0.3s ease',
        }}
        ref={cursorRef}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          background: isHovering ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.6)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.2s ease',
          boxShadow: isHovering ? '0 0 20px rgba(139, 92, 246, 0.6)' : 'none',
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: isHovering ? '80px' : '40px',
          height: isHovering ? '80px' : '40px',
          background: isHovering 
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          transition: 'all 0.3s ease',
        }}></div>
      </div>

      {/* Animated Background - Gradient Orbs */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, #4F46E5, #6366F1)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.5,
          top: '-15%',
          left: '-10%',
          animation: 'orbFloat1 25s ease-in-out infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, #8B5CF6, #A855F7)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.5,
          bottom: '-10%',
          right: '-5%',
          animation: 'orbFloat2 20s ease-in-out infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, #3B82F6, #60A5FA)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.5,
          top: '40%',
          right: '-15%',
          animation: 'orbFloat3 30s ease-in-out infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, #6366F1, #818CF8)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.5,
          bottom: '30%',
          left: '-5%',
          animation: 'orbFloat4 22s ease-in-out infinite',
        }}></div>
      </div>

      {/* Floating Particles */}
      <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `particleDrift ${15 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Login Container */}
      <Flex align="center" justify="center" minHeight="100vh" style={{ position: 'relative', zIndex: 10 }}>
        <Card
          size="4"
          style={{
            width: 480,
            padding: '48px',
            borderRadius: 28,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
            animation: 'cardFadeIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), cardBreath 6s ease-in-out 2s infinite',
          }}
        >
          <Flex direction="column" gap="6">
            {/* Logo & Title */}
            <Flex direction="column" align="center" gap="3">
              <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  border: '2px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '50%',
                  animation: 'logoRingPulse 3s ease-in-out infinite',
                }}></div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
                  backgroundSize: '200% 200%',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 10px 40px rgba(139, 92, 246, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)',
                  animation: 'logoFloat 4s ease-in-out infinite, logoGradientRotate 6s ease-in-out infinite',
                }}>
                  <PersonIcon width="28" height="28" />
                </div>
              </div>

              <Text
                size="8"
                weight="bold"
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #EC4899 50%, #F59E0B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.05em',
                  fontSize: '42px',
                  textShadow: '0 10px 30px rgba(139, 92, 246, 0.4), 0 0 40px rgba(236, 72, 153, 0.3)',
                  backgroundSize: '200% 200%',
                  animation: 'titleSlideIn 0.8s ease-out 0.2s both, titleGradientShift 8s ease-in-out infinite',
                }}
              >
                KARAKCHAA
              </Text>

              <Text size="2" style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontWeight: '500',
                animation: 'subtitleFade 1s ease-out 0.5s both',
              }}>
                CRM Portal - Secure Dashboard Access
              </Text>
            </Flex>

            {/* Error Alert */}
            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '12px',
                animation: 'fadeInUp 0.3s ease-out',
              }}>
                <Text size="2" style={{ color: '#fca5a5' }}>
                  {error}
                </Text>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="4">
                {/* Email Input */}
                <div style={{ 
                  position: 'relative',
                  animation: 'fadeInUp 0.6s ease-out 0.4s both',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '-1px',
                    right: '-1px',
                    bottom: '-1px',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)',
                    borderRadius: '14px',
                    opacity: emailFocused ? 0.6 : 0,
                    filter: 'blur(8px)',
                    transition: 'opacity 0.3s ease',
                    zIndex: -1,
                    animation: emailFocused ? 'glowPulse 2s ease-in-out infinite' : 'none',
                  }}></div>
                  <TextField.Root
                    size="3"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    required
                    disabled={loading}
                    style={{
                      background: emailFocused ? 'rgba(50, 50, 70, 0.95)' : 'rgba(30, 30, 50, 0.95)',
                      border: emailFocused ? '1px solid rgba(167, 139, 250, 0.7)' : '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      height: '54px',
                      fontSize: '15px',
                      fontWeight: '500',
                      borderRadius: '14px',
                      transition: 'all 0.3s ease',
                      transform: emailFocused ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: emailFocused ? '0 10px 30px rgba(139, 92, 246, 0.3)' : '0 0 0 transparent',
                    }}
                  >
                    <TextField.Slot>
                      <div style={{
                        color: emailFocused ? '#A78BFA' : 'rgba(255, 255, 255, 0.6)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: emailFocused ? 'scale(1.1)' : 'scale(1)',
                        filter: emailFocused ? 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.8))' : 'none',
                      }}>
                        <EnvelopeClosedIcon width="18" height="18" />
                      </div>
                    </TextField.Slot>
                  </TextField.Root>
                </div>

                {/* Password Input */}
                <div style={{ 
                  position: 'relative',
                  animation: 'fadeInUp 0.6s ease-out 0.5s both',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-1px',
                    left: '-1px',
                    right: '-1px',
                    bottom: '-1px',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)',
                    borderRadius: '14px',
                    opacity: passwordFocused ? 0.6 : 0,
                    filter: 'blur(8px)',
                    transition: 'opacity 0.3s ease',
                    zIndex: -1,
                    animation: passwordFocused ? 'glowPulse 2s ease-in-out infinite' : 'none',
                  }}></div>
                  <TextField.Root
                    size="3"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    required
                    disabled={loading}
                    style={{
                      background: passwordFocused ? 'rgba(50, 50, 70, 0.95)' : 'rgba(30, 30, 50, 0.95)',
                      border: passwordFocused ? '1px solid rgba(167, 139, 250, 0.7)' : '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#FFFFFF',
                      height: '54px',
                      fontSize: '15px',
                      fontWeight: '500',
                      borderRadius: '14px',
                      transition: 'all 0.3s ease',
                      transform: passwordFocused ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: passwordFocused ? '0 10px 30px rgba(139, 92, 246, 0.3)' : '0 0 0 transparent',
                    }}
                  >
                    <TextField.Slot>
                      <div style={{
                        color: passwordFocused ? '#A78BFA' : 'rgba(255, 255, 255, 0.6)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: passwordFocused ? 'scale(1.1)' : 'scale(1)',
                        filter: passwordFocused ? 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.8))' : 'none',
                      }}>
                        <LockClosedIcon width="18" height="18" />
                      </div>
                    </TextField.Slot>

                    <TextField.Slot>
                      <IconButton
                        variant="ghost"
                        size="2"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          background: 'transparent',
                          cursor: 'none',
                        }}
                      >
                        {showPassword ? (
                          <EyeOpenIcon width="18" height="18" />
                        ) : (
                          <EyeClosedIcon width="18" height="18" />
                        )}
                      </IconButton>
                    </TextField.Slot>
                  </TextField.Root>
                </div>

                {/* Forgot Password */}
                <Flex justify="end" style={{ animation: 'fadeInUp 0.6s ease-out 0.6s both' }}>
                  <Text
                    size="2"
                    style={{
                      color: 'rgba(139, 92, 246, 0.8)',
                      cursor: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      setIsHovering(true);
                      e.currentTarget.style.color = 'rgba(139, 92, 246, 1)';
                    }}
                    onMouseLeave={(e) => {
                      setIsHovering(false);
                      e.currentTarget.style.color = 'rgba(139, 92, 246, 0.8)';
                    }}
                  >
                    Forgot password?
                  </Text>
                </Flex>

                {/* Login Button */}
                <div style={{ position: 'relative', animation: 'fadeInUp 0.6s ease-out 0.6s both' }}>
                  <Button
                    size="4"
                    type="submit"
                    disabled={loading}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    style={{
                      width: '100%',
                      height: 56,
                      background: loading 
                        ? 'rgba(99, 102, 241, 0.5)'
                        : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      letterSpacing: '0.3px',
                      borderRadius: '14px',
                      boxShadow: '0 10px 40px rgba(99, 102, 241, 0.3)',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px', color: 'white', justifyContent: 'center' }}>
                      {loading ? 'Signing In...' : 'Sign In'}
                      {!loading && <span style={{ transition: 'transform 0.3s ease', display: 'inline-block' }}>→</span>}
                    </span>
                  </Button>
                </div>
              </Flex>
            </form>

            {/* Footer Badge */}
            <Flex justify="center" style={{ animation: 'fadeInUp 0.6s ease-out 0.8s both' }}>
              <div style={{
                position: 'relative',
                padding: '12px 20px',
                background: 'rgba(15, 15, 35, 0.5)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '50px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)',
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.3), transparent)',
                  animation: 'badgeShimmer 3s linear infinite',
                }}></div>
                <Text size="1" weight="medium" style={{ color: 'rgba(255, 255, 255, 0.9)', position: 'relative', zIndex: 1 }}>
                  🔒 Secure Authentication
                </Text>
              </div>
            </Flex>
          </Flex>
        </Card>
      </Flex>

      {/* Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          cursor: none !important;
        }

        input[type="email"],
        input[type="password"],
        input[type="text"] {
          color: #FFFFFF !important;
          font-weight: 500 !important;
          -webkit-text-fill-color: #FFFFFF !important;
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
          opacity: 1 !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.6) !important;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(100px, -80px) scale(1.05); }
          50% { transform: translate(-80px, 100px) scale(0.95); }
          75% { transform: translate(80px, 80px) scale(1.02); }
        }

        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-70px, -90px) scale(1.1); }
          66% { transform: translate(90px, 70px) scale(0.9); }
        }

        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-100px, -100px) scale(1.08); }
        }

        @keyframes orbFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(60px, -60px) scale(1.05); }
          80% { transform: translate(-60px, 60px) scale(0.98); }
        }

        @keyframes particleDrift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }

        @keyframes cardFadeIn {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes cardBreath {
          0%, 100% { box-shadow: 0 20px 80px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05); }
          50% { box-shadow: 0 25px 100px rgba(139, 92, 246, 0.2), inset 0 0 0 1px rgba(167, 139, 250, 0.1); }
        }

        @keyframes logoRingPulse {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
          50% { transform: scale(1.15) rotate(180deg); opacity: 0.6; }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }

        @keyframes logoGradientRotate {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes titleSlideIn {
          from { opacity: 0; transform: translateY(15px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes titleGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes subtitleFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }

        @keyframes badgeShimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}

export default Login