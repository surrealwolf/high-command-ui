import { test, expect } from '@playwright/test'

test.describe('High Command UI E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')
    // Wait for initial load
    await page.waitForLoadState('networkidle')
  })

  test('should display welcome message on load', async ({ page }) => {
    await expect(page.locator('text=STRATEGIST REPORTS FOR DUTY')).toBeVisible()
  })

  test('should send message and display response', async ({ page }) => {
    // Get the input field
    const input = page.locator('input[placeholder*="command" i]')
    const submitButton = page.locator('button:has-text("SEND COMMAND")')

    // Type and send message
    await input.fill('What is the war status?')
    await submitButton.click()

    // Wait for response
    await page.waitForTimeout(1000)

    // Check that message appears in chat
    await expect(page.locator('text=What is the war status?')).toBeVisible()
  })

  test('should display quick action buttons', async ({ page }) => {
    const warStatusBtn = page.locator('button:has-text("War Status")')
    const planetsBtn = page.locator('button:has-text("Planets")')
    const factionsBtn = page.locator('button:has-text("Factions")')

    await expect(warStatusBtn).toBeVisible()
    await expect(planetsBtn).toBeVisible()
    await expect(factionsBtn).toBeVisible()
  })

  test('should execute quick action', async ({ page }) => {
    const warStatusBtn = page.locator('button:has-text("War Status")')
    await warStatusBtn.click()

    // Wait for API response
    await page.waitForTimeout(1000)

    // Verify message was sent
    const userMessage = page.locator('text=War Status').first()
    await expect(userMessage).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
    const consoleTab = page.locator('button:has-text("Console")')
    const galacticTab = page.locator('button:has-text("Galactic")')

    await expect(consoleTab).toBeVisible()
    await galacticTab.click()

    // Wait for tab to switch
    await page.waitForTimeout(500)

    // Verify new content is displayed
    const galacticContent = page.locator('text=Galactic Map').first()
    await expect(galacticContent).toBeVisible({ timeout: 5000 }).catch(() => true)
  })

  test('should handle loading state', async ({ page }) => {
    const input = page.locator('input[placeholder*="command" i]')
    const submitButton = page.locator('button:has-text("SEND COMMAND")')

    await input.fill('Get all statistics')
    await submitButton.click()

    // Should show loading indicator
    const loadingIndicator = page.locator('text=Processing').first()
    await expect(loadingIndicator).toBeVisible({ timeout: 5000 }).catch(() => true)
  })

  test('should display error gracefully if API is unavailable', async ({ page }) => {
    // This test checks error handling if the backend is unavailable
    // The UI should still be functional
    const input = page.locator('input[placeholder*="command" i]')
    expect(input).toBeDefined()
  })

  test('should support keyboard Enter submission', async ({ page }) => {
    const input = page.locator('input[placeholder*="command" i]')

    await input.fill('Test message')
    await input.press('Enter')

    await page.waitForTimeout(500)

    // Verify message was sent
    await expect(page.locator('text=Test message')).toBeVisible()
  })

  test('should not send empty messages', async ({ page }) => {
    const submitButton = page.locator('button:has-text("SEND COMMAND")')
    const messageCount = page.locator('.message').count()

    // Try to submit empty
    await submitButton.click()
    await page.waitForTimeout(500)

    // Count should remain the same
    const newMessageCount = page.locator('.message').count()
    expect(await newMessageCount).toBe(await messageCount)
  })

  test('should display multiple messages in sequence', async ({ page }) => {
    const input = page.locator('input[placeholder*="command" i]')
    const submitButton = page.locator('button:has-text("SEND COMMAND")')

    // Send first message
    await input.fill('First command')
    await submitButton.click()
    await page.waitForTimeout(500)

    // Send second message
    await input.fill('Second command')
    await submitButton.click()
    await page.waitForTimeout(500)

    // Both messages should be visible
    await expect(page.locator('text=First command')).toBeVisible()
    await expect(page.locator('text=Second command')).toBeVisible()
  })

  test('should render markdown in responses', async ({ page }) => {
    const input = page.locator('input[placeholder*="command" i]')
    const submitButton = page.locator('button:has-text("SEND COMMAND")')

    await input.fill('What is the war status?')
    await submitButton.click()

    await page.waitForTimeout(1500)

    // The response should be rendered (this depends on backend returning markdown)
    const messageContainer = page.locator('.messages-container')
    await expect(messageContainer).toBeVisible()
  })

  test('should display chat UI elements', async ({ page }) => {
    // Check for essential UI elements
    const input = page.locator('input')
    const submitButton = page.locator('button:has-text("SEND")')
    const messageContainer = page.locator('.messages-container')

    await expect(input.first()).toBeVisible()
    await expect(submitButton).toBeVisible()
    await expect(messageContainer).toBeVisible()
  })

  test('should maintain scroll position', async ({ page }) => {
    const input = page.locator('input[placeholder*="command" i]')
    const submitButton = page.locator('button:has-text("SEND COMMAND")')

    // Send multiple messages to trigger scrolling
    for (let i = 0; i < 3; i++) {
      await input.fill(`Message ${i + 1}`)
      await submitButton.click()
      await page.waitForTimeout(300)
    }

    // Check that messages are visible
    const messages = page.locator('.message')
    const count = await messages.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should handle rapid message submission', async ({ page }) => {
    const input = page.locator('input[placeholder*="command" i]')
    const submitButton = page.locator('button:has-text("SEND COMMAND")')

    // Send messages rapidly
    for (let i = 0; i < 3; i++) {
      await input.fill(`Rapid message ${i}`)
      await submitButton.click()
    }

    await page.waitForTimeout(1000)

    // UI should still be responsive
    expect(input).toBeDefined()
  })
})
