const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, categories });
});

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, image, description, icon } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const category = await Category.create({
    name,
    slug,
    image,
    description: description || '',
    icon: icon || 'ShoppingBag',
  });

  res.status(201).json({ success: true, category });
});

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    if (req.body.name) {
      category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    category.image = req.body.image || category.image;
    category.description = req.body.description !== undefined ? req.body.description : category.description;
    category.icon = req.body.icon || category.icon;
    category.isActive = req.body.isActive !== undefined ? req.body.isActive : category.isActive;

    const updatedCategory = await category.save();
    res.json({ success: true, category: updatedCategory });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted successfully' });
  } else {
    res.status(404);
    throw new Error('Category not found');
  }
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
