#!/usr/bin/env node

/**
 * Signin Page Test
 * Tests the signin page at https://updrift.me/auth/signin
 * Run with: node scripts/test-signin-page.js
 */

const puppeteer = require('puppeteer')

async function testSigninPage() {
  console.log('🧪 Testing Signin Page at https://updrift.me/auth/signin...\n')
  
  let browser
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Keep visible to see what's happening
      slowMo: 500,
      devtools: true
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
    
    console.log('📍 Step 1: Navigating to https://updrift.me/auth/signin')
    await page.goto('https://updrift.me/auth/signin', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })
    
    // Wait to see immediate errors
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('🌐 Current URL:', page.url())
    
    // Check if page loaded properly
    console.log('📍 Step 2: Checking page elements')
    
    // Check for key elements
    const elements = {
      emailInput: await page.$('input[name="email"]'),
      passwordInput: await page.$('input[name="password"]'),
      submitButton: await page.$('button[type="submit"]'),
      signinForm: await page.$('form'),
      title: await page.$('h1, h2'),
    }
    
    console.log('📋 Element Check Results:')
    for (const [name, element] of Object.entries(elements)) {
      console.log(`  ${element ? '✅' : '❌'} ${name}: ${element ? 'Found' : 'Missing'}`)
    }
    
    // Get page title and any visible text
    const pageTitle = await page.title()
    console.log('📄 Page Title:', pageTitle)
    
    // Try to get any error messages on the page
    const errorMessages = await page.evaluate(() => {
      const errors = []
      
      // Look for common error selectors
      const errorSelectors = [
        '.error',
        '.error-message',
        '[role="alert"]',
        '.text-red-500',
        '.text-destructive'
      ]
      
      errorSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
          if (el.textContent.trim()) {
            errors.push(`${selector}: ${el.textContent.trim()}`)
          }
        })
      })
      
      return errors
    })
    
    if (errorMessages.length > 0) {
      console.log('🔴 Visible Error Messages:')
      errorMessages.forEach(msg => console.log(`  - ${msg}`))
    } else {
      console.log('✅ No visible error messages found')
    }
    
    // Check if the page is completely blank or has content
    const bodyText = await page.evaluate(() => document.body.textContent.trim())
    console.log('📄 Page has content:', bodyText.length > 0 ? 'Yes' : 'No')
    
    if (bodyText.length === 0) {
      console.log('⚠️  Page appears to be blank!')
    } else {
      console.log('📄 Page content length:', bodyText.length, 'characters')
    }
    
    // Check if there's a loading state stuck
    const loadingElements = await page.evaluate(() => {
      const loading = []
      const loadingSelectors = [
        '.loading',
        '.spinner',
        '.animate-spin',
        '[data-loading="true"]'
      ]
      
      loadingSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          loading.push(`${selector}: ${elements.length} elements`)
        }
      })
      
      return loading
    })
    
    if (loadingElements.length > 0) {
      console.log('⏳ Loading elements found:')
      loadingElements.forEach(msg => console.log(`  - ${msg}`))
    }
    
    console.log('\n✅ Signin page test completed')
    
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

// Run the test
testSigninPage().catch(console.error)