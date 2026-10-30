const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const app = require('../server')
const User = require('../models/User')

describe('Phase 3 — ADM-01: Partner Document Compliance Notifications', () => {
  let adminUser, adminToken
  let partnerUser, partnerToken
  let otherClientUser, otherClientToken

  const secret = process.env.SECRET || 'touriva_jwt_secret_dev'

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }

    // Clear test collections
    await User.deleteMany({ email: { $in: ['admin_adm01@touriva.test', 'partner_adm01@touriva.test', 'client_adm01@touriva.test'] } })

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash('Password123!', salt)

    adminUser = await User.create({
      email: 'admin_adm01@touriva.test',
      password: hash,
      phone: '+213550000091',
      role: 'administrator',
      typeAccount: 'others',
      complete: true,
      fileStatus: 'confirmed'
    })
    adminToken = jwt.sign({ _id: adminUser._id.toString(), role: adminUser.role }, secret, { expiresIn: '1d' })

    partnerUser = await User.create({
      email: 'partner_adm01@touriva.test',
      password: hash,
      phone: '+213550000092',
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Numidia Voyages Test',
      complete: true,
      fileStatus: 'pending'
    })
    partnerToken = jwt.sign({ _id: partnerUser._id.toString(), role: partnerUser.role }, secret, { expiresIn: '1d' })

    otherClientUser = await User.create({
      email: 'client_adm01@touriva.test',
      password: hash,
      phone: '+213550000093',
      role: 'client',
      typeAccount: 'visitor',
      complete: true,
      fileStatus: 'confirmed'
    })
    otherClientToken = jwt.sign({ _id: otherClientUser._id.toString(), role: otherClientUser.role }, secret, { expiresIn: '1d' })
  })

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['admin_adm01@touriva.test', 'partner_adm01@touriva.test', 'client_adm01@touriva.test'] } })
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
  })

  it('1.1: Rejection Workflow creates compliance notification with reason', async () => {
    const rejectionNote = 'Le registre de commerce fourni est expiré depuis plus de 6 mois.'

    const res = await request(app)
      .patch(`/api/users/update_existing_user/${partnerUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fileStatus: 'rejected',
        rejectionReason: rejectionNote
      })

    expect(res.status).toBe(200)
    expect(res.body.fileStatus).toBe('rejected')
    expect(res.body.rejectionReason).toBe(rejectionNote)

    // Verify notification was added to the user
    const updated = await User.findById(partnerUser._id)
    expect(updated.notifications).toBeDefined()
    expect(updated.notifications.length).toBeGreaterThan(0)

    const notif = updated.notifications[updated.notifications.length - 1]
    expect(notif.type).toBe('compliance')
    expect(notif.status).toBe('unread')
    expect(notif.metadata.fileStatus).toBe('rejected')
    expect(notif.metadata.rejectionReason).toBe(rejectionNote)
    expect(notif.message).toContain(rejectionNote)
  })

  it('1.2: Avoids duplicate notifications on identical repeated updates', async () => {
    const initialUser = await User.findById(partnerUser._id)
    const initialCount = initialUser.notifications.length

    // Re-send the exact same rejection update
    const res = await request(app)
      .patch(`/api/users/update_existing_user/${partnerUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fileStatus: 'rejected',
        rejectionReason: 'Le registre de commerce fourni est expiré depuis plus de 6 mois.'
      })

    expect(res.status).toBe(200)

    const reloaded = await User.findById(partnerUser._id)
    expect(reloaded.notifications.length).toBe(initialCount)
  })

  it('1.3: Approval Workflow creates approval notification and clears rejectionReason', async () => {
    const res = await request(app)
      .patch(`/api/users/update_existing_user/${partnerUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fileStatus: 'confirmed'
      })

    expect(res.status).toBe(200)
    expect(res.body.fileStatus).toBe('confirmed')
    expect(res.body.rejectionReason).toBeNull()

    const updated = await User.findById(partnerUser._id)
    const notif = updated.notifications[updated.notifications.length - 1]
    expect(notif.type).toBe('compliance')
    expect(notif.status).toBe('unread')
    expect(notif.metadata.fileStatus).toBe('confirmed')
    expect(notif.title).toContain('Validé')
  })

  it('1.4: Partner can retrieve their own notifications via GET /api/users/me/notifications', async () => {
    const res = await request(app)
      .get('/api/users/me/notifications')
      .set('Authorization', `Bearer ${partnerToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.notifications)).toBe(true)
    expect(res.body.notifications.length).toBeGreaterThanOrEqual(2)

    // Most recent notification first (descending)
    expect(res.body.notifications[0].metadata.fileStatus).toBe('confirmed')
    expect(res.body.notifications[1].metadata.fileStatus).toBe('rejected')
  })

  it('1.5: Cross-user IDOR check: another client CANNOT read partner notifications', async () => {
    const res = await request(app)
      .get(`/api/users/${partnerUser._id}/notifications`)
      .set('Authorization', `Bearer ${otherClientToken}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/Access forbidden/i)
  })

  it('1.6: Partner can mark a notification as read via PATCH /api/users/me/notifications/:notifId/read', async () => {
    const listRes = await request(app)
      .get('/api/users/me/notifications')
      .set('Authorization', `Bearer ${partnerToken}`)

    const unreadNotif = listRes.body.notifications.find(n => n.status === 'unread')
    expect(unreadNotif).toBeDefined()

    const markRes = await request(app)
      .patch(`/api/users/me/notifications/${unreadNotif._id}/read`)
      .set('Authorization', `Bearer ${partnerToken}`)

    expect(markRes.status).toBe(200)
    expect(markRes.body.notification.status).toBe('read')

    const reloaded = await User.findById(partnerUser._id)
    const target = reloaded.notifications.id(unreadNotif._id)
    expect(target.status).toBe('read')
  })
})
