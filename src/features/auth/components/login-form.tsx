import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [serviceNumber, setServiceNumber] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!serviceNumber || !password) {
      setError("Please enter both service number and password")
      return
    }

    try {
      console.log('Attempting login with:', { serviceNumber })
      const result = await login(serviceNumber, password)
      console.log('Login result:', result)
      
      if (result.success) {
        // Cookie is automatically set by backend
        // Redirect to dashboard
        navigate('/dashboard')
      } else {
        // Display error message from backend
        const errorMsg = result.error || "Login failed. Please try again."
        console.log('Login failed, setting error:', errorMsg)
        setError(errorMsg)
        console.log('Error state after setError:', errorMsg)
      }
    } catch (err) {
      // Fallback error handling
      console.error('Unexpected login error in form:', err)
      setError("An unexpected error occurred. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Wifi className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-card-foreground">WMMS</CardTitle>
            <CardDescription className="text-muted-foreground">Wi-Fi Maintenance Management System</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceNumber" className="text-card-foreground">
                Service Number
              </Label>
              <Input
                id="serviceNumber"
                type="text"
                placeholder="WMMS-CUST-100234"
                value={serviceNumber}
                onChange={(e) => setServiceNumber(e.target.value.toUpperCase())}
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Format: WMMS-CUST-XXXXXX, WMMS-TECH-XXX, WMMS-SUP-XXX, or WMMS-MAN-XXX
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium" role="alert">
                  {error}
                </p>
              </div>
            )}
            {/* Debug: Show error state */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="text-xs text-muted-foreground">
                Debug: Error state = "{error}"
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
          <div className="text-center space-y-2">
            <Link
              to="/signup"
              className="text-sm text-primary hover:underline"
            >
              Don't have an account? Sign up
            </Link>
            <div>
              <Link
                to="/forgot-password"
                className="text-sm text-muted-foreground hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

