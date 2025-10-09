#!/usr/bin/env node

/**
 * Full Login Flow Test
 * Actually attempts to log in with test credentials and captures all errors
 * Run with: node scripts/test-full-login.js
 */

const puppeteer = require('puppeteer')

// Test credentials
const TEST_CREDENTIALS = {
  email: 'test2@updrift.me',
  password: 'testpass123'
}

async function testFullLogin() {
  console.log('🧪 Testing Full Login Flow on Production...\n')
  
  let browser
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 1000,
      devtools: true
    })
    
    const page = await browser.newPage()
    
    // Capture all console messages
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

    // Capture page errors
    page.on('pageerror', error => {
      console.log('💥 Page Error:', error.message)
      console.log('Stack:', error.stack)
    })

    // Capture failed requests
    page.on('requestfailed', request => {
      console.log('❌ Failed Request:', request.url(), request.failure().errorText)
    })

    // Capture successful requests for debugging
    page.on('response', response => {
      if (response.url().includes('/api/auth/') && response.status() !== 200) {
        console.log('🔍 Auth API Response:', response.url(), response.status(), response.statusText())
      }
    })
    
    console.log('📍 Step 1: Navigating to signin page')
    await page.goto('https://updrift.me/auth/signin', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('📍 Step 2: Filling in credentials')
    await page.waitForSelector('input[name="email"]', { timeout: 10000 })
    
    // Clear and fill email
    await page.click('input[name="email"]', { clickCount: 3 })
    await page.type('input[name="email"]', TEST_CREDENTIALS.email)
    
    // Clear and fill password
    await page.click('input[name="password"]', { clickCount: 3 })
    await page.type('input[name="password"]', TEST_CREDENTIALS.password)
    
    console.log('📍 Step 3: Submitting login form')
    console.log('🔐 Using credentials:', { 
      email: TEST_CREDENTIALS.email, 
      password: '***' 
    })
    
    // Click submit and wait
    await page.click('button[type="submit"]')
    
    console.log('⏳ Waiting for authentication response...')
    
    // Wait for either navigation or error
    try {
      await Promise.race([
        page.waitForNavigation({ 
          waitUntil: 'networkidle2', 
          timeout: 15000 
        }),
        page.waitForSelector('.error, [role="alert"], .text-red-500', { timeout: 15000 })
      ])
    } catch (waitError) {
      console.log('⚠️  Wait timeout - checking current state')
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const finalUrl = page.url()
    console.log('🌐 Final URL:', finalUrl)
    
    // Check for error messages
    const errorMessages = await page.evaluate(() => {
      const errors = []
      
      // Look for error messages
      const errorSelectors = [
        '.error',
        '.error-message', 
        '[role="alert"]',
        '.text-red-500',
        '.text-destructive',
        'p[class*="error"]',
        'div[class*="error"]'
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
    }
    
    // Check if we're on dashboard (success) or still on signin (failure)
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Redirected to dashboard!')
      
      // Wait a bit more to see dashboard load
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Check dashboard content
      const dashboardContent = await page.evaluate(() => {
        return {
          hasWelcome: document.body.textContent.includes('Welcome back'),
          hasMyJobs: document.body.textContent.includes('My Jobs'),
          contentLength: document.body.textContent.length
        }
      })
      
      console.log('📊 Dashboard Content:', dashboardContent)
      
    } else if (finalUrl.includes('/auth/signin')) {
      console.log('❌ FAILURE: Still on signin page - login failed')
      
      // Get form state
      const formState = await page.evaluate(() => {
        const emailInput = document.querySelector('input[name="email"]')
        const passwordInput = document.querySelector('input[name="password"]')
        const submitButton = document.querySelector('button[type="submit"]')
        
        return {
          emailValue: emailInput?.value || 'not found',
          hasPassword: passwordInput?.value ? 'has value' : 'empty/not found',
          submitButtonText: submitButton?.textContent?.trim() || 'not found',
          submitButtonDisabled: submitButton?.disabled || false
        }
      })
      
      console.log('📋 Form State:', formState)
      
    } else {
      console.log('❓ UNEXPECTED: Ended up at', finalUrl)
    }
    
    console.log('\n✅ Test completed')
    
  } catch (error) {
    console.log('\n💥 Test failed with error:', error.message)
    console.log('Stack trace:', error.stack)
  } finally {
    if (browser) {
      console.log('\n🔄 Waiting 15 seconds before closing (check what happened)...')
      await new Promise(resolve => setTimeout(resolve, 15000))
      await browser.close()
    }
  }
}

testFullLogin().catch(console.error)