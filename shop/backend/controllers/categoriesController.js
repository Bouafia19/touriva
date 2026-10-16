const Category = require('../models/Category')
const mongoose = require('mongoose')

// GET all categories
const getAllCategories = async (req, res) => {
    const categories = await Category.find().sort({ createdAt: -1})
    res.status(200).json(categories)
}

// GET all categories
// const getCategories = async (req, res) => {
//     const { typeAccount } = req.body
//     try {
//         const categories = await Category.find({ typeAccount: typeAccount, parent: null })
//         for (const category of categories) {
//             await populateChildren(category);
//         }
//         console.log('categories', categories)
//         res.json(categories)
//     } catch (err) {
//         res.status(400).send(err.message);
//     }
// }

const getCategoriesNoParent = async (req, res) => {
    try {
        const categories = await Category.find({ parent: null })
        .select('name img')
        res.json(categories)
    } catch (err) {
        res.status(400).send(err.message);
    }
}

const getCategoriesNoParentNoImages = async (req, res) => {
    try {
        const categories = await Category.find({ parent: null })
        .select('name')
        res.json(categories)
    } catch (err) {
        res.status(400).send(err.message);
    }
}

const getCategoriesChild = async (req, res) => {
    const { id } = req.body
    try {
        const categories = await Category.find({ parent: id })
        .select('name img children')
        res.json(categories)
    } catch (err) {
        res.status(400).send(err.message);
    }
}

const getCategoriesChildNoImages = async (req, res) => {
    const { id } = req.body
    try {
        const categories = await Category.find({ parent: id })
        .select('name parent children')
        .populate({
            path: 'parent',
            select: 'name'
        })
        res.json(categories)
    } catch (err) {
        res.status(400).send(err.message);
    }
}

async function populateChildren(category) {
  await category.populate('children');
  for (const child of category.children) {
    await populateChildren(child); // Recursively populate each child
  }
}

// GET all categories
// const getCategoriesNoImages = async (req, res) => {
//     const { typeAccount } = req.body
//     try {
//         const categories = await Category.find({ typeAccount: typeAccount, parent: null })
//         .select('_id name parent children typeAccount')
//         .populate({
//             path: 'children',
//             select: '_id name parent children typeAccount',
//             populate: [
//                 { 
//                     path: 'children',
//                     select: '_id name parent children typeAccount',
//                 },
//                 { 
//                     path: 'parent',
//                     select: '_id name parent children typeAccount',
//                 }
//             ]
//         });
//         res.json(categories);
//     } catch (err) {
//         res.status(400).send(err.message);
//     }
// }

// GET a single category
const getCategory = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such category'})
    }
    const category = await Category.findById(id)

    if(!category){
        return res.status(404).json({error: 'no such category'})
    }

    res.status(200).json(category)
}

// POST a new category
const createCategory = async (req, res) => {
    const { name, img, parent } = req.body
    try {
        const category = new Category({ name, img, parent });
        const savedCategory = await category.save();

        if (parent) {
            const parentCategory = await Category.findById(parent);
            parentCategory.children.push(savedCategory._id);
            await parentCategory.save();
        }

        res.json(savedCategory);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

// DELETE a category
const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        res.json(deletedCategory);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

// UPDATE a category
const updateCategory = async (req, res) => {
    const { name, img, parent } = req.body;
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, img, parent },
            { new: true }
        );
        res.json(updatedCategory);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

// Recursive function to build nested categories
async function getNestedCategories(parentId = null) {
    const categories = await Category.find({ parent: parentId })
    .select('_id name parent')
    return Promise.all(
      categories.map(async (category) => {
        const children = await getNestedCategories(category._id);
        return { ...category.toObject(), children }; // Add children to each category object
      })
    )
}

// Route to get all nested categories
const nestedCategories = async (req, res) => {
    
    try {
        const nestedCategories = await getNestedCategories()
        res.json(nestedCategories)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' })
    }
}

// Get a specific category by ID
const getCategoryByID = async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch category' });
      }
}

// Get a category with its nested structure by parent ID
const getCategoryNestedByParentID = async (req, res) => {
    const { parentId } = req.params
   
    try {
        const nestedCategories = await getNestedCategories(parentId)
        
        res.json(nestedCategories)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch nested categories' });
    }
}

module.exports = {
    // getCategories,
    getCategory,
    createCategory,
    deleteCategory,
    updateCategory,
    nestedCategories,
    getCategoryByID,
    getCategoryNestedByParentID,
    getAllCategories,
    // getCategoriesNoImages,
    getCategoriesNoParent,
    getCategoriesNoParentNoImages,
    getCategoriesChild,
    getCategoriesChildNoImages
}