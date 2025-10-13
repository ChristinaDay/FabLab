import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  // Return masked values to verify they're loaded
  return res.status(200).json({
    FB_APP_ID: process.env.FB_APP_ID ? `${process.env.FB_APP_ID.substring(0, 4)}...` : 'NOT SET',
    FB_APP_SECRET: process.env.FB_APP_SECRET ? `${process.env.FB_APP_SECRET.substring(0, 4)}...` : 'NOT SET',
  })
}
