import React from 'react'
import Nav from '@/components/Nav'

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">We respect your privacy. This page outlines what information we collect and how we use it.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Information we collect</h2>
        <p className="mb-4">When you use this site, we may collect minimal information such as bookmarks, likes, and your selected interests to personalize your experience. If you sign in, we may store your email for account purposes.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">How we use information</h2>
        <p className="mb-4">We use your information to provide features like the dashboard, bookmarks, and recommendations. We do not sell your data.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Third‑party services</h2>
        <p className="mb-4">We may use third‑party services (e.g., analytics, authentication) that process data in accordance with their own policies.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
        <p>If you have questions about this policy, contact us via the email listed on our site or through the admin page.</p>
      </main>
    </>
  )
}


