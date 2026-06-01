import { redirect } from "next/navigation"
import { getSessionUser, getDashboardPath } from "@/lib/auth"

export default async function Home() {
  const session = await getSessionUser()
  if (session) redirect(getDashboardPath(session.appUser.tier))
  redirect("/login")
}
