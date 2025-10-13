import { extractOpenGraph, fetchGraphOEmbed } from './lib/extractOg'

const testUrl = 'https://www.instagram.com/reel/DJ-LQD9u2gW/'

async function test() {
  console.log('Testing Instagram Reel URL:', testUrl)
  console.log('\n--- Testing fetchGraphOEmbed directly ---')
  const graphResult = await fetchGraphOEmbed(testUrl)
  console.log('Graph API result:', JSON.stringify(graphResult, null, 2))

  console.log('\n--- Testing extractOpenGraph (full flow) ---')
  const ogResult = await extractOpenGraph(testUrl)
  console.log('OpenGraph result:', JSON.stringify(ogResult, null, 2))

  console.log('\n--- Environment Check ---')
  console.log('FB_APP_ID:', process.env.FB_APP_ID ? '✓ Set' : '✗ Not set')
  console.log('FB_APP_SECRET:', process.env.FB_APP_SECRET ? '✓ Set' : '✗ Not set')
}

test().catch(console.error)
