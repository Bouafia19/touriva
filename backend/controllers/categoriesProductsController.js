const Category = require('../models/Category')
const Product = require('../models/Product')

// Recursive helper to fetch all child category IDs
async function getChildrenIds(parentId, visited = new Set()) {
  if (visited.has(parentId.toString())) return []
  visited.add(parentId.toString())

  const children = await Category.find({ parent: parentId }).select('_id')
  let ids = children.map(c => c._id.toString())

  for (const child of children) {
    const subIds = await getChildrenIds(child._id, visited)
    ids = ids.concat(subIds)
  }

  return ids
}

// Main function
async function getProductsByCategory(rootCategoryId) {
  const childCategoryIds = await getChildrenIds(rootCategoryId)
  const allCategoryIds = [rootCategoryId, ...childCategoryIds]

  console.log("Looking for products in categories:", allCategoryIds)

  // Query products using categoryId
  return await Product.find({ categoryId: { $in: allCategoryIds } }).select('_id name price description categoryId brandId features thumbnails published')
}

// Controller
const getProductsByCategoryChilds = async (req, res) => {
  try {
    const { categoryId } = req.params
    const products = await getProductsByCategory(categoryId)
    res.status(200).json(products)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch products by category' })
  }
}

module.exports = {
  getProductsByCategoryChilds
}
