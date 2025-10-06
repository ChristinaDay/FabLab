import React from 'react'
import { fetchVisibleJobs } from '@/lib/db'

export default function Jobs({ jobs }: { jobs: any[] }) {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Jobs</h1>
      {jobs.length === 0 ? (
        <div className="text-gray-600">No jobs yet. Check back soon.</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((j: any) => (
            <article key={j.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="font-semibold text-lg">{j.title}</div>
                  <div className="text-sm text-gray-600">{j.company} {j.location ? `• ${j.location}` : ''}</div>
                  <p className="mt-2 text-sm text-gray-700">{j.description}</p>
                </div>
                <a href={j.link} target="_blank" rel="noreferrer" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Apply</a>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export async function getServerSideProps() {
  const jobs = await fetchVisibleJobs(50)
  return { props: { jobs } }
}


