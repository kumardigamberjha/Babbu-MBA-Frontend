import { useState } from "react"
import { X, Loader2, KeyRound, Mail, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { type User } from "../types"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (token: string, user: User) => void
}

const API_BASE = "http://127.0.0.1:8000"

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const url = mode === "login" 
      ? `${API_BASE}/api/auth/login/` 
      : `${API_BASE}/api/auth/register/`

    const body = mode === "login"
      ? { username, password }
      : { username, email, password, first_name: firstName, last_name: lastName }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error)
        } else if (data.non_field_errors) {
          throw new Error(data.non_field_errors.join(", "))
        } else {
          const errorMsg = Object.entries(data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join(" | ")
          throw new Error(errorMsg || "Authentication failed. Please check your credentials.")
        }
      }

      // Success
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      onSuccess(data.token, data.user)
      onClose()
      
      // Clear form
      setUsername("")
      setEmail("")
      setPassword("")
      setFirstName("")
      setLastName("")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200">
        <Card className="border-border/60 shadow-2xl">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your MBA study account"
                : "Fill out the information below to register and start studying"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/25">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute top-3 left-3 size-4 text-muted-foreground" />
                  <Input
                    id="username"
                    required
                    placeholder="johndoe"
                    className="pl-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="email">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute top-3 left-3 size-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none" htmlFor="first_name">
                        First Name
                      </label>
                      <Input
                        id="first_name"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none" htmlFor="last_name">
                        Last Name
                      </label>
                      <Input
                        id="last_name"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute top-3 left-3 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Logging in..." : "Signing up..."}
                  </>
                ) : mode === "login" ? (
                  "Log In"
                ) : (
                  "Create Account"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary underline-offset-4 hover:underline cursor-pointer"
                      onClick={() => {
                        setMode("register")
                        setError(null)
                      }}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="font-semibold text-primary underline-offset-4 hover:underline cursor-pointer"
                      onClick={() => {
                        setMode("login")
                        setError(null)
                      }}
                    >
                      Log In
                    </button>
                  </>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
