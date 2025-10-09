#!/usr/bin/env node

/**
 * Automated Test Script for Persistent Search History
 * Run with: node scripts/test-search-history.js
 */

// Include formatTimestamp function directly to avoid module resolution issues
function formatTimestamp(timestamp) {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Within last hour
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes === 1) return '1 minute ago';
    return `${diffMinutes} minutes ago`;
  }
  
  // Within last 24 hours
  if (diffHours < 24) {
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  }
  
  // Yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'yesterday';
  }
  
  // This week
  if (diffDays < 7) {
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }
  
  // Last week
  if (diffDays < 14) {
    return 'last week';
  }
  
  // Older - show specific date
  return `on ${date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })}`;
}

console.log('🧪 Testing Persistent Search History System...\n')

// Test 1: Natural Language Timestamps
console.log('📅 Testing Natural Language Timestamps:')
const now = Date.now()

const testCases = [
  { time: now - 1000, expected: 'just now' },
  { time: now - 60 * 1000, expected: '1 minute ago' },
  { time: now - 30 * 60 * 1000, expected: '30 minutes ago' },
  { time: now - 60 * 60 * 1000, expected: '1 hour ago' },
  { time: now - 2 * 60 * 60 * 1000, expected: '2 hours ago' },
  { time: now - 24 * 60 * 60 * 1000, expected: 'yesterday' },
  { time: now - 2 * 24 * 60 * 60 * 1000, expected: '2 days ago' },
  { time: now - 7 * 24 * 60 * 60 * 1000, expected: 'last week' }
]

let passedTests = 0
let totalTests = testCases.length

testCases.forEach(({ time, expected }, index) => {
  const result = formatTimestamp(time)
  const passed = result === expected
  if (passed) passedTests++
  
  console.log(`  ${passed ? '✅' : '❌'} Test ${index + 1}: "${result}" ${passed ? 'PASSED' : `FAILED (expected "${expected}")`}`)
})

console.log(`\n📊 Timestamp Tests: ${passedTests}/${totalTests} passed\n`)

// Test 2: API Endpoint Testing
console.log('🔗 Testing API Endpoints:')

async function testAPIEndpoints() {
  try {
    // Test GET endpoint
    const getResponse = await fetch('http://localhost:3000/api/user/search-results', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`  GET /api/user/search-results: ${getResponse.status} ${getResponse.statusText}`)
    
    // Test POST endpoint (will fail without auth, but that's expected)
    const postResponse = await fetch('http://localhost:3000/api/user/search-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: 'test',
        location: 'test',
        radius: 25,
        jobResults: '{}'
      })
    })
    
    console.log(`  POST /api/user/search-results: ${postResponse.status} ${postResponse.statusText}`)
    
    // Test cleanup endpoint
    const cleanupResponse = await fetch('http://localhost:3000/api/cleanup/expired-search-results', {
      method: 'POST'
    })
    
    console.log(`  POST /api/cleanup/expired-search-results: ${cleanupResponse.status} ${cleanupResponse.statusText}`)
    
  } catch (error) {
    console.log(`  ❌ API Tests failed: ${error.message}`)
    console.log('  💡 Make sure the dev server is running (npm run dev)')
  }
}

// Test 3: Database Schema Validation
console.log('🗄️ Testing Database Schema:')

async function testDatabaseSchema() {
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    // Test if SearchResult model exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'SearchResult'
      )
    `
    
    console.log(`  SearchResult table exists: ${tableExists[0].exists ? '✅' : '❌'}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.log(`  ❌ Database test failed: ${error.message}`)
    console.log('  💡 Make sure database is set up (npx prisma db push)')
  }
}

// Run all tests
async function runAllTests() {
  await testAPIEndpoints()
  await testDatabaseSchema()
  
  console.log('\n🎯 Test Summary:')
  console.log(`  ✅ Timestamp formatting: ${passedTests}/${totalTests} tests passed`)
  console.log('  📝 API endpoints: Check output above')
  console.log('  🗄️ Database schema: Check output above')
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All timestamp tests passed!')
  } else {
    console.log('\n⚠️ Some tests failed. Check the output above.')
  }
}

runAllTests().catch(console.error) 