"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Building2Icon, MapPinIcon, GraduationCapIcon, ShieldIcon } from "lucide-react"

const DEMO_ACCOUNTS = [
  { label: "Ministry", email: "hodelectrical@gmail.com", icon: ShieldIcon, color: "text-rose-600" },
  { label: "County", email: "director@nyeri.county.go.ke", icon: MapPinIcon, color: "text-blue-600" },
  { label: "Institution", email: "principal@minap.ac.ke", icon: Building2Icon, color: "text-emerald-600" },
  { label: "Trainer", email: "pithon.kariuki@minap.ac.ke", icon: GraduationCapIcon, color: "text-purple-600" },
]

const DEMO_PASSWORD = "Tvet@2026"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(loginEmail: string, loginPassword: string) {
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("Authentication failed")
      setLoading(false)
      return
    }

    const { data: appUser } = await supabase
      .from("app_user")
      .select("tier")
      .eq("auth_user_id", user.id)
      .single()

    if (!appUser) {
      setError("No user profile found. Contact your administrator.")
      setLoading(false)
      return
    }

    if (appUser.tier === "trainer") {
      router.push("/my-portal")
    } else {
      router.push("/dashboard")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await handleLogin(email, password)
  }

  function handleDemoLogin(demoEmail: string) {
    setEmail(demoEmail)
    setPassword(DEMO_PASSWORD)
    handleLogin(demoEmail, DEMO_PASSWORD)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form onSubmit={handleSubmit} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your credentials to access the TVET DMS
            </p>
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="name@institution.ac.ke"
              required
              className="bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              required
              className="bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      {/* Demo Quick Login */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <Button
              key={account.email}
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              disabled={loading}
              onClick={() => handleDemoLogin(account.email)}
            >
              <account.icon className={`mr-1.5 h-3.5 w-3.5 ${account.color}`} />
              {account.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
