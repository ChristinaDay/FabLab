#!/usr/bin/env node

/**
 * Landing Page Authentication Error Test
 * Tests what happens when visiting the main landing page
 * Run with: node scripts/test-landing-page.js
 */

const puppeteer = require('puppeteer')

async function testLandingPage() {
  console.log('🧪 Testing Landing Page Authentication Error...\n')
  
  let browser
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 500,
      devtools: true
    })
    
    const page = await browser.newPage()
    
    // Capture all console messages with timestamps
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()
      const timestamp = new Date().toISOString().slice(11, 23)
      
      if (type === 'error') {
        console.log(`[${timestamp}] 🔴 Console Error:`, text)
      } else if (type === 'warn') {
        console.log(`[${timestamp}] 🟡 Console Warning:`, text)
      } else if (type === 'log') {
        console.log(`[${timestamp}] 🔵 Console Log:`, text)
      }
    })

    // Capture page errors with timestamps
    page.on('pageerror', error => {
      const timestamp = new Date().toISOString().slice(11, 23)
      console.log(`[${timestamp}] 💥 Page Error:`, error.message)
      if (error.stack) {
        console.log('Stack trace:', error.stack)
      }
    })

    // Monitor page title changes
    let titleChanges = []
    setInterval(async () => {
      try {
        const title = await page.title()
        const url = page.url()
        const timestamp = new Date().toISOString().slice(11, 23)
        
        if (titleChanges.length === 0 || titleChanges[titleChanges.length - 1].title !== title) {
          titleChanges.push({ timestamp, title, url })
          console.log(`[${timestamp}] 📄 Page Title: "${title}" at ${url}`)
        }
      } catch (e) {
        // Ignore errors during title checking
      }
    }, 500)
    
    console.log('📍 Step 1: Navigating to https://updrift.me')
    await page.goto('https://updrift.me', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    })
    
    console.log('⏳ Waiting 10 seconds to observe the authentication error transition...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // Check what's currently on the page
    const pageState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyText: document.body.textContent.slice(0, 500) + '...',
        hasErrorBoundary: !!document.querySelector('[class*="error"], [data-testid="error"]'),
        hasLandingContent: document.body.textContent.includes('UpDrift'),
        hasAuthError: document.body.textContent.includes('Authentication Error') || 
                     document.body.textContent.includes('Something went wrong'),
        hasRefreshButton: !!document.querySelector('button'),
        visibleButtons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(Boolean)
      }
    })
    
    console.log('\n📊 Final Page State:')
    console.log('  URL:', pageState.url)
    console.log('  Title:', pageState.title)
    console.log('  Has Error Boundary:', pageState.hasErrorBoundary)
    console.log('  Has Landing Content:', pageState.hasLandingContent)
    console.log('  Has Auth Error:', pageState.hasAuthError)
    console.log('  Visible Buttons:', pageState.visibleButtons)
    console.log('  Body Text Preview:', pageState.bodyText.slice(0, 200))
    
    // Try clicking refresh button if it exists
    if (pageState.visibleButtons.includes('Refresh Page')) {
      console.log('\n📍 Step 2: Trying to click "Refresh Page" button')
      try {
        await page.click('button:has-text("Refresh Page")')
        console.log('✅ Clicked refresh button')
        
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        const afterRefresh = await page.evaluate(() => ({
          url: window.location.href,
          hasAuthError: document.body.textContent.includes('Authentication Error')
        }))
        
        console.log('After refresh - URL:', afterRefresh.url)
        console.log('After refresh - Still has auth error:', afterRefresh.hasAuthError)
        
      } catch (refreshError) {
        console.log('❌ Failed to click refresh button:', refreshError.message)
      }
    }
    
    console.log('\n📈 Title Change Timeline:')
    titleChanges.forEach(change => {
      console.log(`  [${change.timestamp}] "${change.title}" at ${change.url}`)
    })
    
    console.log('\n✅ Test completed')
    
  } catch (error) {
    console.log('\n💥 Test failed with error:', error.message)
    console.log('Stack trace:', error.stack)
  } finally {
    if (browser) {
      console.log('\n🔄 Waiting 10 seconds before closing browser...')
      await new Promise(resolve => setTimeout(resolve, 10000))
      await browser.close()
    }
  }
}

testLandingPage().catch(console.error)