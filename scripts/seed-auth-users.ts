/**
 * One-time script to create auth users for demo accounts.
 * Run with: npx tsx scripts/seed-auth-users.ts
 * 
 * Requires SUPABASE_SECRET_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const DEMO_PASSWORD = 'Tvet@2026'

const users = [
  {
    email: 'director@nyeri.county.go.ke',
    appUserId: 'aaaa0000-0000-0000-0000-000000000003',
    name: 'Mary Njeri',
  },
  {
    email: 'principal@minap.ac.ke',
    appUserId: 'aaaa0000-0000-0000-0000-000000000002',
    name: 'Dr. James Mwangi',
  },
  {
    email: 'pithon.kariuki@minap.ac.ke',
    appUserId: 'aaaa0000-0000-0000-0000-000000000004',
    name: 'Pithon Kariuki',
  },
]

async function main() {
  for (const user of users) {
    console.log(`Creating auth user: ${user.email}...`)

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: user.name },
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        // User exists, get their ID
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existing = existingUsers?.users?.find(u => u.email === user.email)
        if (existing) {
          console.log(`  Already exists: ${existing.id}`)
          // Link to app_user
          const { error: updateError } = await supabase
            .from('app_user')
            .update({ auth_user_id: existing.id })
            .eq('id', user.appUserId)
          if (updateError) console.error(`  Failed to link: ${updateError.message}`)
          else console.log(`  Linked to app_user ${user.appUserId}`)
        }
      } else {
        console.error(`  Error: ${error.message}`)
      }
      continue
    }

    if (data.user) {
      console.log(`  Created: ${data.user.id}`)
      // Link to app_user
      const { error: updateError } = await supabase
        .from('app_user')
        .update({ auth_user_id: data.user.id })
        .eq('id', user.appUserId)
      if (updateError) console.error(`  Failed to link: ${updateError.message}`)
      else console.log(`  Linked to app_user ${user.appUserId}`)
    }
  }

  console.log('\nDone! All demo accounts:')
  console.log(`  Ministry:    hodelectrical@gmail.com / ${DEMO_PASSWORD}`)
  console.log(`  County:      director@nyeri.county.go.ke / ${DEMO_PASSWORD}`)
  console.log(`  Institution: principal@minap.ac.ke / ${DEMO_PASSWORD}`)
  console.log(`  Trainer:     pithon.kariuki@minap.ac.ke / ${DEMO_PASSWORD}`)
}

main().catch(console.error)
