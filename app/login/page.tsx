"use client"

import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraduationCapIcon } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between md:justify-start md:gap-4">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCapIcon className="size-4" />
            </div>
            <div>
              <span className="text-base font-semibold leading-none">TVET DMS</span>
              <span className="block text-[10px] text-muted-foreground leading-tight">State Department for TVET</span>
            </div>
          </a>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          State Department for Technical &amp; Vocational Education and Training
        </p>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/login-bg.jpg"
          alt="Students in a TVET training session"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="text-2xl font-bold">
            Management Information System
          </h2>
          <p className="mt-2 text-sm text-white/80">
            Streamlining data collection, trainer management, and institutional
            oversight across Kenya&apos;s TVET sector.
          </p>
        </div>
      </div>
    </div>
  )
}
