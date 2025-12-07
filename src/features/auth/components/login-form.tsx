import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wifi, Loader2 } from "lucide-react"
import { useAuth } from "@/features/auth/hooks/useAuth"
import type { UserRole } from "@/features/auth/types"

export function LoginForm() {
  const { login, isLoading } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [role, setRole] = useState<UserRole>("customer")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [error, setError] = useState("")

  const handleSendOtp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      return
    }
    setError("")
    setStep("otp")
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP")
      return
    }
    setError("")
    const success = await login(phoneNumber, role)
    if (!success) {
      setError("Login failed. Please try again.")
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
          {step === "phone" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-card-foreground">
                  Login as
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger id="role" className="bg-input border-border text-card-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-card-foreground">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+251 9XX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSendOtp} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Send OTP
              </Button>
            </>
          ) : (
            <>
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
                />
                <p className="text-sm text-muted-foreground">Code sent to {phoneNumber}</p>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="space-y-2">
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Login"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="w-full text-muted-foreground hover:text-card-foreground"
                >
                  Change Number
                </Button>
              </div>
            </>
          )}
          <p className="text-xs text-center text-muted-foreground">Demo: Use any phone number and OTP 123456</p>
        </CardContent>
      </Card>
    </div>
  )
}

