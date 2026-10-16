const Announcement = require('../models/Announcement')
const mongoose = require('mongoose')

// GET all announcements
const getAnnouncements = async (req, res) => {
    const announcements = await Announcement.find().sort({ published: 1 }).populate('category').populate('ownerId')
    .populate({
        path: "ownerId",
        select: "companyName email phone", // Only return these fields from Owner
        populate: [
          { path: "wilayaId", model: "Wilaya", select: "name" }, // Only return 'name' from Wilaya
          { path: "dairaId", model: "Daira", select: "name" },   // Only return 'name' from Daira
          { path: "communeId", model: "Commune", select: "name" } // Only return 'name' from Commune
        ]
    })
    res.status(200).json(announcements)
}

// GET a single announcement
const getAnnouncement = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such announcement'})
    }
    const announcement = await Announcement.findById(id).populate('category').populate('ownerId')
    .populate({
        path: "ownerId",
        select: "companyName email phone", // Only return these fields from Owner
        populate: [
          { path: "wilayaId", model: "Wilaya", select: "name" }, // Only return 'name' from Wilaya
          { path: "dairaId", model: "Daira", select: "name" },   // Only return 'name' from Daira
          { path: "communeId", model: "Commune", select: "name" } // Only return 'name' from Commune
        ]
    })

    if(!announcement){
        return res.status(404).json({error: 'no such announcement'})
    }

    res.status(200).json(announcement)
}

// POST a new announcement
const createAnnouncement = async (req, res) => {
    // const { name, category, price, description, img, ownerId } = req.body;
    try {
        const announcement = new Announcement(req.body);
        const savedAnnouncement = await announcement.save();
        res.json(savedAnnouncement);
    } catch (err) {
        res.status(400).send(err.message);
    }
}
// DELETE a announcement
const deleteAnnouncement = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such announcement'})
    }
    const announcement = await Announcement.findOneAndDelete({_id: id})

    if(!announcement){
        return res.status(404).json({error: 'no such announcement'})
    }

    res.status(200).json(announcement)
}

// UPDATE a announcement
const updateAnnouncement = async (req, res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such announcement'})
    }
    const announcement = await Announcement.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!announcement){
        return res.status(404).json({error: 'no such announcement'})
    }

    res.status(200).json(announcement)
}

// Get all announcements by category
const getAnnouncementsByCategory = async (req, res) => {
    try {
        const announcements = await Announcement.find({ category: req.params.categoryId, published: true });
        res.status(200).json(announcements);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

// Announcement by ID
const getAnnouncementsById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.announcementId).populate('category');
        if (!announcement) {
          return res.status(404).json({ error: 'Announcement not found' });
        }
        res.json({
          _id: announcement._id,
          name: announcement.name,
          price: announcement.price,
          description: announcement.description,
          img: announcement.img,
          categoryId: announcement.category ? announcement.category._id : null,
          categoryName: announcement.category ? announcement.category.name : 'Uncategorized',
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcement details' });
      }
}

// Announcement by OwnerID
const getAnnouncementsByOwnerId = async (req, res) => {

    const { ownerId } = req.params
   
    const announcements = await Announcement.find({ ownerId: ownerId}).sort({ createdAt: -1 }).populate("planId")
    .select('name published paid expirationOfSubscription')

    res.status(200).json(announcements)
}

// Get all announcements by category no images
const getAnnouncementsByCategoryNoImages = async (req, res) => {
    try {
        const announcements = await Announcement.find({ category: req.params.categoryId, published: true })
        .select('_id name price description category ownerId brandId features thumbnails expirationOfSubscription published planId')
        res.status(200).json(announcements)
    } catch (err) {
        res.status(400).send(err.message);
    }
}


module.exports = {
    getAnnouncements,
    getAnnouncement,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement,
    getAnnouncementsByCategory,
    getAnnouncementsById,
    getAnnouncementsByOwnerId,
    getAnnouncementsByCategoryNoImages
}