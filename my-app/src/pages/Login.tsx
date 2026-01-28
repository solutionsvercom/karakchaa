import {
  Card,
  Flex,
  Text,
  TextField,
  Button,
  Separator,
  IconButton,
} from '@radix-ui/themes'
import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from '@radix-ui/react-icons'
import { useState } from 'react'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <Flex align="center" justify="center" minHeight="100vh">
      <Card
        size="4"
        style={{
          width: 420,
          padding: '32px',
          borderRadius: 16,
          boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
          border: '1px solid #e5e7eb',
        }}
      >
        <Flex direction="column" gap="4">

          {/* Header */}
          <Flex direction="column" align="center" gap="1">
            <Text size="6" weight="bold">
              Sign in
            </Text>
            <Text size="2" color="gray">
              Access your CRM dashboard
            </Text>
          </Flex>

          <Separator size="4" />

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">

              {/* Email */}
              <TextField.Root
                size="3"
                type="email"
                placeholder="Email address"
                required
              >
                <TextField.Slot>
                  <EnvelopeClosedIcon />
                </TextField.Slot>
              </TextField.Root>

              {/* Password */}
              <TextField.Root
                size="3"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                required
              >
                <TextField.Slot>
                  <LockClosedIcon />
                </TextField.Slot>

                <TextField.Slot>
                  <IconButton
                    variant="ghost"
                    size="1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </IconButton>
                </TextField.Slot>
              </TextField.Root>

              <Button
                size="3"
                type="submit"
                style={{ marginTop: 10, height: 44 }}
              >
                Login
              </Button>

            </Flex>
          </form>

          <Text size="2" align="center" color="gray">
            Secure CRM Access
          </Text>

        </Flex>
      </Card>
    </Flex>
  )
}

export default Login
