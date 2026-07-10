import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh w-screen items-center justify-center overflow-hidden bg-neutral-50 p-6 dark:bg-neutral-950">
      {/* Background radial highlights */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-200 via-neutral-50 to-neutral-50 opacity-40 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-950 dark:opacity-80" />
      <div className="absolute top-0 right-0 -z-10 size-96 rounded-full bg-neutral-200/30 blur-3xl dark:bg-neutral-900/10" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 rounded-full bg-neutral-200/30 blur-3xl dark:bg-neutral-900/10" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <main className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
        {children}
      </main>
    </div>
  )
}
