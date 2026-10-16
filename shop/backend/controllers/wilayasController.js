const Wilaya = require('../models/Wilaya')
const Daira = require('../models/Daira')
const Commune = require('../models/Commune')
const mongoose = require('mongoose')

// GET all wilayas
const getWilayas = async (req, res) => {
    const wilayas = await Wilaya.find({}, 'name').sort({ createdAt: -1})
    res.status(200).json(wilayas)
}

// GET a single wilaya
const getWilaya = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such wilaya'})
    }
    const wilaya = await Wilaya.findById(id)

    if(!wilaya){
        return res.status(404).json({error: 'no such wilaya'})
    }

    res.status(200).json(wilaya)
}

// POST a new wilaya
const createWilaya = async (req, res) => {
    const { 
        name,
        nameFr,
        nameAr
    } = req.body
    try {
        // add doc to db
        const wilaya = await Wilaya.create({ 
            name,
            nameFr,
            nameAr
        })
        res.status(200).json(wilaya)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a wilaya
const deleteWilaya = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such wilaya'})
    }
    const wilaya = await Wilaya.findOneAndDelete({_id: id})

    if(!wilaya){
        return res.status(404).json({error: 'no such wilaya'})
    }

    res.status(200).json(wilaya)
}

// UPDATE a wilaya
const updateWilaya = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such wilaya'})
    }
    const wilaya = await Wilaya.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!wilaya){
        return res.status(404).json({error: 'no such wilaya'})
    }

    res.status(200).json(wilaya)
}

// POST a new wilaya
const createMultWilaya = async (req, res) => {
    // try {
    //     const wilaya = await Wilaya.insertMany(req.body)
    //     res.status(200).json(wilaya)
    // } catch (error) {
    //     res.status(400).json({ error: error.message })
    // }
    const csvData = req.body.data;  // Les données CSV parsées depuis le front-end

    if (!csvData || csvData.length === 0) {
        return res.status(400).json({ error: 'Aucune donnée trouvée dans le fichier CSV.' });
    }

    try {
        // Utiliser des Map pour éviter les doublons
        const wilayasMap = new Map();
        const dairasMap = new Map();

        // Parcourir chaque ligne du CSV
        for (const row of csvData) {
            const { wilaya, daira, commune } = row;

            // Créer ou récupérer la Wilaya
            let wilayaDoc = wilayasMap.get(wilaya);
            if (!wilayaDoc) {
                wilayaDoc = await Wilaya.findOneAndUpdate(
                    { name: wilaya },
                    { name: wilaya },
                    { upsert: true, new: true }
                );
                wilayasMap.set(wilaya, wilayaDoc);
            }

            // Créer ou récupérer la Daira
            let dairaDoc = dairasMap.get(`${daira}-${wilaya}`);
            if (!dairaDoc) {
                dairaDoc = await Daira.findOneAndUpdate(
                    { name: daira, wilayaId: wilayaDoc._id },
                    { name: daira, wilayaId: wilayaDoc._id },
                    { upsert: true, new: true }
                );
                dairasMap.set(`${daira}-${wilaya}`, dairaDoc);
            }

            // Créer la Commune
            await Commune.create({
                name: commune,
                dairaId: dairaDoc._id
            });
        }

        res.json({ message: 'Données CSV importées avec succès !' });
    } catch (error) {
        console.error('Erreur lors de l\'importation des données :', error);
        res.status(500).json({ error: 'Erreur lors de l\'importation des données.' });
    }
}

// DELETE a wilaya
const deleteMultWilaya = async (req, res) => {
    const wilaya = await Wilaya.deleteMany({})
    const daira = await Daira.deleteMany({})
    const commune = await Commune.deleteMany({})
    res.status(200).json(wilaya)
}

module.exports = {
    getWilayas,
    getWilaya,
    createWilaya,
    deleteWilaya,
    updateWilaya,
    createMultWilaya,
    deleteMultWilaya
}