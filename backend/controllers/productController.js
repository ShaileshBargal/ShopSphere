import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Helper to slugify
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Fetch products with search, filtering, sorting and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  // Build query filter
  const query = { isAvailable: true };

  // Search keyword (name, description, brand, or vendor store name)
  if (req.query.search) {
    const searchRegex = { $regex: req.query.search, $options: 'i' };
    query.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { brand: searchRegex },
      { 'vendor.name': searchRegex },
      { 'vendor.storeName': searchRegex },
    ];
  }

  // Filter by category (by Category ID or Slug)
  if (req.query.category && req.query.category !== 'all') {
    if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = req.query.category;
    } else {
      const foundCat = await Category.findOne({ slug: req.query.category });
      if (foundCat) {
        query.category = foundCat._id;
      }
    }
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) {
      query.price.$gte = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      query.price.$lte = Number(req.query.maxPrice);
    }
  }

  // Filter by inStock
  if (req.query.inStock === 'true') {
    query.countInStock = { $gt: 0 };
  }

  // Filter by minimum rating
  if (req.query.minRating) {
    query.rating = { $gte: Number(req.query.minRating) };
  }

  // Sorting
  let sortOption = { createdAt: -1 }; // default newest
  switch (req.query.sort) {
    case 'price-asc':
      sortOption = { price: 1 };
      break;
    case 'price-desc':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1, numReviews: -1 };
      break;
    case 'popular':
      sortOption = { numReviews: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    totalProducts: count,
  });
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const {
    name,
    price,
    compareAtPrice,
    description,
    images,
    category,
    brand,
    countInStock,
    vendorName,
    vendorStore,
    featured,
  } = req.body;

  if (!name || !price || !description || !category) {
    return res.status(400).json({ message: 'Please provide all required product fields' });
  }

  const product = new Product({
    name,
    slug: slugify(name) + '-' + Date.now().toString().slice(-4),
    price: Number(price),
    compareAtPrice: compareAtPrice ? Number(compareAtPrice) : 0,
    description,
    images: images && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
    category,
    brand: brand || 'Generic',
    countInStock: Number(countInStock) || 0,
    vendor: {
      name: vendorName || 'ShopSphere Verified Seller',
      storeName: vendorStore || 'Global Official Store',
      rating: 4.8,
      contactEmail: 'vendor@shopsphere.com',
    },
    featured: Boolean(featured),
    rating: 5.0,
    numReviews: 1,
  });

  const createdProduct = await product.save();
  const populatedProduct = await Product.findById(createdProduct._id).populate('category', 'name slug');
  res.status(201).json(populatedProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const {
    name,
    price,
    compareAtPrice,
    description,
    images,
    category,
    brand,
    countInStock,
    vendorName,
    vendorStore,
    featured,
    isAvailable,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    if (name) {
      product.name = name;
      product.slug = slugify(name);
    }
    if (price !== undefined) product.price = Number(price);
    if (compareAtPrice !== undefined) product.compareAtPrice = Number(compareAtPrice);
    if (description) product.description = description;
    if (images && images.length) product.images = images;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (countInStock !== undefined) product.countInStock = Number(countInStock);
    if (featured !== undefined) product.featured = Boolean(featured);
    if (isAvailable !== undefined) product.isAvailable = Boolean(isAvailable);

    if (vendorName || vendorStore) {
      product.vendor.name = vendorName || product.vendor.name;
      product.vendor.storeName = vendorStore || product.vendor.storeName;
    }

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate('category', 'name slug');
    res.json(populated);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed successfully' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Get top featured products
// @route   GET /api/products/top/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ featured: true, isAvailable: true })
    .populate('category', 'name slug')
    .limit(8);
  res.json(products);
};
