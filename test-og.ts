import { extractOpenGraph } from './lib/extractOg'

// Test URLs
const testUrls = [
  'https://www.instagram.com/p/DBuH5rKSsT_/',  // Replace with real IG post
  'https://www.facebook.com/zuck/posts/10114920977830681',  // Replace with real FB post
]

async function test() {
  for (const url of testUrls) {
    console.log(`\nTesting: ${url}`)
    const result = await extractOpenGraph(url)
    console.log(JSON.stringify(result, null, 2))
  }
}

test().catch(console.error)
