import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"

export function SignupForm() {
  const { signupInitiate, signupVerifyOtp, isLoading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<"initiate" | "verify">("initiate")
  const [serviceNumber, setServiceNumber] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [otp, setOtp] = useState("")
  const [userInfo, setUserInfo] = useState<{ fullName: string; email: string } | null>(null)
  const [error, setError] = useState("")

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!serviceNumber || !password || !passwordConfirm) {
      setError("Please fill in all fields")
      return
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match")
      return
    }

    const result = await signupInitiate(serviceNumber, password, passwordConfirm)
    if (result.success && result.data) {
      setUserInfo(result.data)
      setStep("verify")
    } else {
      setError(result.error || "Signup initiation failed. Please try again.")
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP")
      return
    }

    const result = await signupVerifyOtp(serviceNumber, otp)
    if (result.success) {
      // Cookie is automatically set by backend
      // Redirect to dashboard
      navigate('/dashboard')
    } else {
      setError(result.error || "OTP verification failed. Please try again.")
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
            <CardTitle className="text-2xl font-bold text-card-foreground">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">Sign up for WMMS</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "initiate" ? (
            <form onSubmit={handleInitiate} className="space-y-4">
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
                  Only customer accounts (WMMS-CUST-XXXXXX) can sign up
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm" className="text-card-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-card-foreground">
                  OTP sent to <span className="font-medium">{userInfo?.email}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Valid for 5 minutes
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-card-foreground">
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="bg-input border-border text-card-foreground text-center text-2xl tracking-widest placeholder:text-muted-foreground placeholder:text-base placeholder:tracking-normal"
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Create Account"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep("initiate")
                    setOtp("")
                    setError("")
                  }}
                  className="w-full text-muted-foreground hover:text-card-foreground"
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </form>
          )}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-primary hover:underline"
            >
              Already have an account? Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

