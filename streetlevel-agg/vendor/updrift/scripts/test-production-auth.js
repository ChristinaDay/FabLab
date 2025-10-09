#!/usr/bin/env node

/**
 * Production Authentication Test
 * Tests login to https://updrift.me/dashboard and captures console errors
 * Run with: node scripts/test-production-auth.js
 */

const puppeteer = require('puppeteer')

// Test credentials
const TEST_CREDENTIALS = {
  email: 'test2@updrift.me',
  password: 'testpass123'
}

async function testProductionAuth() {
  console.log('🧪 Testing Production Authentication on https://updrift.me/dashboard...\n')
  
  let browser
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Keep visible to see what's happening
      slowMo: 500, // Slow down for visibility
      devtools: true // Open DevTools to see console
    })
    
    const page = await browser.newPage()
    
    // Listen for console logs and errors
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()
      
      if (type === 'error') {
        console.log('🔴 Console Error:', text)
      } else if (type === 'warn') {
        console.log('🟡 Console Warning:', text)
      } else if (type === 'log') {
        console.log('🔵 Console Log:', text)
      }
    })

    // Listen for page errors
    page.on('pageerror', error => {
      console.log('💥 Page Error:', error.message)
    })

    // Listen for failed requests
    page.on('requestfailed', request => {
      console.log('❌ Failed Request:', request.url(), request.failure().errorText)
    })
    
    console.log('📍 Step 1: Navigating to https://updrift.me/dashboard')
    await page.goto('https://updrift.me/dashboard', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })
    
    // Wait a moment to see if there are immediate errors
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Check if we're redirected to login page
    const currentUrl = page.url()
    console.log('🌐 Current URL:', currentUrl)
    
    if (currentUrl.includes('/auth/signin')) {
      console.log('📍 Step 2: Login page detected, proceeding with authentication')
      
      // Wait for email input
      await page.waitForSelector('input[name="email"]', { timeout: 10000 })
      
      // Fill in credentials
      console.log('✏️  Filling in credentials...')
      await page.type('input[name="email"]', TEST_CREDENTIALS.email)
      await page.type('input[name="password"]', TEST_CREDENTIALS.password)
      
      // Submit form
      console.log('🚀 Submitting login form...')
      await page.click('button[type="submit"]')
      
      // Wait for navigation or error
      try {
        await page.waitForNavigation({ 
          waitUntil: 'networkidle2', 
          timeout: 15000 
        })
        console.log('📍 Step 3: Login completed, new URL:', page.url())
        
        // Wait additional time to capture any post-login errors
        console.log('⏳ Waiting 5 seconds to capture any authentication errors...')
        await new Promise(resolve => setTimeout(resolve, 5000))
        
      } catch (navError) {
        console.log('⚠️  Navigation timeout or error:', navError.message)
      }
      
    } else if (currentUrl.includes('/dashboard')) {
      console.log('✅ Already authenticated, on dashboard page')
      
      // Wait to capture any dashboard errors
      console.log('⏳ Waiting 5 seconds to capture any dashboard errors...')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
    } else {
      console.log('❓ Unexpected page:', currentUrl)
    }
    
    // Check final page state
    console.log('📍 Final Step: Checking page state')
    const finalUrl = page.url()
    console.log('🌐 Final URL:', finalUrl)
    
    // Try to capture any React error boundaries
    const errorBoundary = await page.$('.error-boundary, [data-testid="error-boundary"]')
    if (errorBoundary) {
      const errorText = await errorBoundary.textContent()
      console.log('🔴 Error Boundary Found:', errorText)
    }
    
    // Capture network status
    const networkStats = await page.evaluate(() => {
      return {
        readyState: document.readyState,
        title: document.title,
        errors: window.console?.errors || 'No console errors captured'
      }
    })
    console.log('📊 Page Stats:', networkStats)
    
    console.log('\n✅ Test completed successfully')
    
  } catch (error) {
    console.log('\n💥 Test failed with error:', error.message)
    console.log('Stack trace:', error.stack)
  } finally {
    if (browser) {
      console.log('\n🔄 Waiting 10 seconds before closing browser (check DevTools)...')
      await new Promise(resolve => setTimeout(resolve, 10000))
      await browser.close()
    }
  }
}

// Run the test
runE2ETest().catch(console.error)

async function runE2ETest() {
  await testProductionAuth()
}