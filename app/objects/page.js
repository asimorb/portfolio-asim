'use server'

import { redirect } from 'next/navigation'

export default function ObjectsRedirect() {
  redirect('/make/things')
}
