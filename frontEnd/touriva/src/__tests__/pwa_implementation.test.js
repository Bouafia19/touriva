import { describe, it, expect, beforeEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { setActivePinia, createPinia } from 'pinia'
import { usePwaStore } from '../stores/pwa'

describe('Touriva PWA Implementation Verification', () => {
  const rootDir = path.resolve(__dirname, '../../')
  const publicDir = path.resolve(rootDir, 'public')
  const distDir = path.resolve(rootDir, 'dist')

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()
  })

  describe('1. Web App Manifest Specification', () => {
    it('manifest.webmanifest exists and is valid JSON', () => {
      const manifestPath = path.resolve(publicDir, 'manifest.webmanifest')
      expect(fs.existsSync(manifestPath)).toBe(true)

      const content = fs.readFileSync(manifestPath, 'utf-8')
      const manifest = JSON.parse(content)

      expect(manifest.name).toBe('Touriva')
      expect(manifest.short_name).toBe('Touriva')
      expect(manifest.description).toBe('Touriva travel platform')
      expect(manifest.start_url).toBe('/')
      expect(manifest.scope).toBe('/')
      expect(manifest.display).toBe('standalone')
      expect(manifest.orientation).toBe('portrait-primary')
      expect(['#173f35', '#173f36']).toContain(manifest.theme_color.toLowerCase())
      expect(['#173f35', '#173f36']).toContain(manifest.background_color.toLowerCase())
    })

    it('manifest includes required 192x192, 512x512, and maskable icons', () => {
      const manifestPath = path.resolve(publicDir, 'manifest.webmanifest')
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

      const icon192 = manifest.icons.find(i => i.sizes === '192x192' && i.purpose === 'any')
      expect(icon192).toBeDefined()
      expect(icon192.src).toContain('192')

      const icon512 = manifest.icons.find(i => i.sizes === '512x512' && i.purpose === 'any')
      expect(icon512).toBeDefined()
      expect(icon512.src).toContain('512')

      const maskable512 = manifest.icons.find(i => i.sizes === '512x512' && i.purpose === 'maskable')
      expect(maskable512).toBeDefined()
      expect(maskable512.src).toContain('maskable')
    })

    it('manifest.json fallback copy exists and matches manifest.webmanifest', () => {
      const manifestJsonPath = path.resolve(publicDir, 'manifest.json')
      expect(fs.existsSync(manifestJsonPath)).toBe(true)

      const webmanifest = JSON.parse(fs.readFileSync(path.resolve(publicDir, 'manifest.webmanifest'), 'utf-8'))
      const jsonManifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf-8'))
      expect(jsonManifest.name).toBe(webmanifest.name)
      expect(jsonManifest.start_url).toBe(webmanifest.start_url)
    })
  })

  describe('2. PWA Icon Assets Verification', () => {
    const requiredIcons = [
      'icons/pwa-icon-192.png',
      'icons/pwa-icon-512.png',
      'icons/pwa-maskable-192.png',
      'icons/pwa-maskable-512.png',
      'icons/icon-192.png',
      'icons/icon-512.png',
      'icons/icon-maskable-192.png',
      'icons/icon-maskable-512.png',
      'icons/apple-touch-icon.png',
      'apple-touch-icon.png',
      'splash/apple-splash-universal.png'
    ]

    requiredIcons.forEach(iconFile => {
      it(`verifies asset exists in public and dist: ${iconFile}`, () => {
        const publicFile = path.resolve(publicDir, iconFile)
        expect(fs.existsSync(publicFile)).toBe(true)
        expect(fs.statSync(publicFile).size).toBeGreaterThan(1000)

        const distFile = path.resolve(distDir, iconFile)
        if (fs.existsSync(distDir)) {
          expect(fs.existsSync(distFile)).toBe(true)
        }
      })
    })
  })

  describe('3. Production Service Worker Architecture & API Safety', () => {
    it('service worker script sw.js exists in public directory', () => {
      const swPath = path.resolve(publicDir, 'sw.js')
      expect(fs.existsSync(swPath)).toBe(true)
    })

    it('service worker strictly forbids caching API and Authorization requests', () => {
      const swContent = fs.readFileSync(path.resolve(publicDir, 'sw.js'), 'utf-8')

      // Must explicitly check and bypass API endpoints
      expect(swContent).toContain("url.pathname.startsWith('/api')")
      expect(swContent).toContain("url.hostname.includes('api.touriva')")
      expect(swContent).toContain("url.hostname.includes('touriva-api')")
      expect(swContent).toContain("request.headers.has('Authorization')")

      // Must support skipWaiting message
      expect(swContent).toContain("event.data.type === 'SKIP_WAITING'")
      expect(swContent).toContain("self.skipWaiting()")

      // Must clean up obsolete caches
      expect(swContent).toContain("caches.delete")
      expect(swContent).toContain("self.clients.claim()")
    })

    it('service worker pre-caches offline fallback and core shell', () => {
      const swContent = fs.readFileSync(path.resolve(publicDir, 'sw.js'), 'utf-8')
      expect(swContent).toContain("'/offline.html'")
      expect(swContent).toContain("'/index.html'")
      expect(swContent).toContain("'/manifest.webmanifest'")
    })
  })

  describe('4. Offline Fallback Experience', () => {
    it('offline.html exists and provides authentic Touriva branding and retry functionality', () => {
      const offlinePath = path.resolve(publicDir, 'offline.html')
      expect(fs.existsSync(offlinePath)).toBe(true)

      const html = fs.readFileSync(offlinePath, 'utf-8')
      expect(html).toContain('Touriva')
      expect(html).toContain('offline')
      expect(html).toContain('Retry Connection')
      expect(html).toContain('#173F35')
      expect(html).toContain('#FAF8F2')
    })
  })

  describe('5. HTML Entry Point & PWA Metadata', () => {
    it('index.html contains all essential PWA and iOS meta tags', () => {
      const indexPath = path.resolve(rootDir, 'index.html')
      const html = fs.readFileSync(indexPath, 'utf-8')

      expect(html).toContain('rel="manifest"')
      expect(html).toMatch(/href="\/manifest\.webmanifest(\?v=\d+)?"/)
      expect(html).toContain('name="theme-color"')
      expect(html).toMatch(/content="#(173F35|173F36)"/i)
      expect(html).toContain('name="apple-mobile-web-app-capable"')
      expect(html).toContain('name="apple-mobile-web-app-status-bar-style"')
      expect(html).toContain('name="apple-mobile-web-app-title"')
      expect(html).toContain('rel="apple-touch-icon"')
      expect(html).toContain('rel="apple-touch-startup-image"')
    })
  })

  describe('6. PWA Pinia Store & Installation Experience Logic', () => {
    it('initializes with default online state and handles install prompt flow', async () => {
      const pwaStore = usePwaStore()
      expect(pwaStore.isOnline).toBe(true)
      expect(pwaStore.canInstall).toBe(false)
      expect(pwaStore.isStandalone).toBe(false)

      // Simulate beforeinstallprompt event
      const mockPromptEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      }

      pwaStore.deferredPrompt = mockPromptEvent
      expect(pwaStore.canInstall).toBe(true)
      expect(pwaStore.showInstallButton).toBe(true)

      // Trigger installation
      await pwaStore.promptInstall()
      expect(mockPromptEvent.prompt).toHaveBeenCalled()
      expect(pwaStore.isInstalled).toBe(true)
      expect(pwaStore.canInstall).toBe(false)
    })

    it('hides install button when app is running in standalone mode', () => {
      const pwaStore = usePwaStore()
      pwaStore.deferredPrompt = { prompt: vi.fn() }
      expect(pwaStore.showInstallButton).toBe(true)

      pwaStore.isStandalone = true
      expect(pwaStore.showInstallButton).toBe(false)
      expect(pwaStore.canInstall).toBe(false)
    })

    it('supports iOS detection and shows iOS guidance dialog on install request', async () => {
      const pwaStore = usePwaStore()
      pwaStore.deferredPrompt = null
      pwaStore.isIos = true
      pwaStore.isStandalone = false

      expect(pwaStore.showInstallButton).toBe(true)
      expect(pwaStore.showIosDialog).toBe(false)

      await pwaStore.promptInstall()
      expect(pwaStore.showIosDialog).toBe(true)
    })

    it('handles service worker update messaging', () => {
      const pwaStore = usePwaStore()
      const mockWorker = { postMessage: vi.fn() }
      pwaStore.waitingWorker = mockWorker
      pwaStore.updateAvailable = true

      pwaStore.applyUpdate()
      expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    })
  })
})
