import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { useNotificationsStore } from '../stores/notifications'

vi.mock('axios')

describe('Phase 3 Remediation Suite — MOB-02, MOB-05, API-01, ADM-01', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('MOB-05: Browser Filesystem Guard', () => {
    it('App.vue guards native Filesystem directory creation with Capacitor.isNativePlatform()', () => {
      const appVuePath = path.resolve(__dirname, '../App.vue')
      const content = fs.readFileSync(appVuePath, 'utf8')

      // Must check Capacitor.isNativePlatform() before calling native methods
      expect(content).toContain('Capacitor.isNativePlatform()')
      expect(content).toContain('createImageCacheFolder()')

      // Ensure createImageCacheFolder is enclosed inside the native platform guard
      const onMountedSection = content.match(/onMounted\(\s*\(\)\s*=>\s*\{([\s\S]*?)\}\)/)?.[1] || ''
      expect(onMountedSection).toContain('if (Capacitor.isNativePlatform())')
      
      const nativeBlock = onMountedSection.match(/if\s*\(Capacitor\.isNativePlatform\(\)\)\s*\{([\s\S]*?)\}/)?.[1] || ''
      expect(nativeBlock).toContain('createImageCacheFolder()')
      expect(nativeBlock).toContain('setStatusBarStyle()')
    })
  })

  describe('MOB-02: Android Back Navigation', () => {
    it('App.vue registers App backButton listener and handles history vs root navigation', () => {
      const appVuePath = path.resolve(__dirname, '../App.vue')
      const content = fs.readFileSync(appVuePath, 'utf8')

      expect(content).toContain("import { App } from '@capacitor/app'")
      expect(content).toContain("App.addListener('backButton'")
      expect(content).toContain('router.back()')
      expect(content).toContain('App.exitApp()')

      // Verify cleanup on unmount
      expect(content).toContain('onUnmounted')
      expect(content).toContain('backButtonListener.remove()')
    })
  })

  describe('API-01: Remove Private LAN IP Fallback', () => {
    it('main.js does not contain hardcoded private LAN IP fallback (172.20.10.3)', () => {
      const mainJsPath = path.resolve(__dirname, '../main.js')
      const content = fs.readFileSync(mainJsPath, 'utf8')

      expect(content).not.toContain('172.20.10.3')
      expect(content).not.toContain('localhost:4004')
      expect(content).toContain("import.meta.env.VITE_API_BASE_URL || 'https://touriva-api.onrender.com'")
    })
  })

  describe('ADM-01: In-App Notifications Store & Component', () => {
    it('notifications store fetches compliance and account notifications via GET /api/users/me/notifications', async () => {
      const mockNotifications = [
        {
          _id: 'notif_01',
          title: 'Dossier Partenaire Validé',
          message: 'Votre dossier a été validé.',
          type: 'compliance',
          status: 'unread',
          metadata: { fileStatus: 'confirmed' },
          createdAt: new Date().toISOString()
        },
        {
          _id: 'notif_02',
          title: 'Dossier Partenaire Non Conforme',
          message: 'RC expiré.',
          type: 'compliance',
          status: 'read',
          metadata: { fileStatus: 'rejected', rejectionReason: 'RC expiré' },
          createdAt: new Date().toISOString()
        }
      ]

      axios.get.mockResolvedValueOnce({ data: { notifications: mockNotifications } })

      const store = useNotificationsStore()
      const result = await store.fetchUserNotifications()

      expect(axios.get).toHaveBeenCalledWith('/api/users/me/notifications')
      expect(result).toHaveLength(2)
      expect(store.userNotifications).toHaveLength(2)
      expect(store.unreadCount).toBe(1)
    })

    it('notifications store marks notification as read via PATCH /api/users/me/notifications/:notifId/read', async () => {
      axios.patch.mockResolvedValueOnce({ data: { message: 'Notification marked as read' } })

      const store = useNotificationsStore()
      store.userNotifications = [
        { _id: 'notif_01', status: 'unread' }
      ]

      await store.markAsRead('notif_01')

      expect(axios.patch).toHaveBeenCalledWith('/api/users/me/notifications/notif_01/read')
      expect(store.userNotifications[0].status).toBe('read')
      expect(store.unreadCount).toBe(0)
    })
  })
})
