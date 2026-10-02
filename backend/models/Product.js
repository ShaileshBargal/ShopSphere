import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive'],
    },
    compareAtPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    vendor: {
      name: { type: String, default: 'ShopSphere Verified Seller' },
      storeName: { type: String, default: 'Global Official Store' },
      rating: { type: Number, default: 4.8 },
      contactEmail: { type: String, default: 'vendor@shopsphere.com' },
    },
    brand: {
      type: String,
      default: 'Generic',
    },
    countInStock: {
      type: Number,
      required: [true, 'Count in stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 10,
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      default: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 12,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search efficiency
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
