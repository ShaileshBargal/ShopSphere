import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Helper to generate URL-safe slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  
  // Attach product counts to each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id });
      return {
        ...cat.toObject(),
        productCount: count,
      };
    })
  );

  res.json(categoriesWithCount);
};

// @desc    Fetch single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name, description, image, icon } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  const slug = slugify(name);

  const category = new Category({
    name,
    slug,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80',
    icon: icon || 'tag',
  });

  const createdCategory = await category.save();
  res.status(201).json(createdCategory);
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  const { name, description, image, icon } = req.body;

  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name || category.name;
    if (name) category.slug = slugify(name);
    category.description = description !== undefined ? description : category.description;
    category.image = image !== undefined ? image : category.image;
    category.icon = icon !== undefined ? icon : category.icon;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    // Check if products still use this category
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category: ${productCount} product(s) are currently assigned to it. Reassign or delete them first.`,
      });
    }

    await Category.deleteOne({ _id: category._id });
    res.json({ message: 'Category deleted successfully' });
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
};
