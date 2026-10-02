import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Clearing old data...');
    await Order.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log('[Seeder] Creating Users...');
    // Demo Admin & Demo Customer
    const adminUser = await User.create({
      name: 'ShopSphere Admin',
      email: 'admin@shopsphere.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: {
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
    });

    const customerUser = await User.create({
      name: 'Jane Doe',
      email: 'customer@shopsphere.com',
      password: 'customer123',
      role: 'customer',
      phone: '+1 (555) 349-8812',
      address: {
        street: '456 Market Street, Apt 3B',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
      },
    });

    console.log('[Seeder] Creating Categories...');
    const categoriesData = [
      {
        name: 'Electronics & Audio',
        slug: 'electronics',
        description: 'Next-generation smart gadgets, wireless audio, displays and computing gear.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        icon: 'Headphones',
      },
      {
        name: 'Fashion & Apparel',
        slug: 'fashion',
        description: 'Curated modern fashion, premium jackets, sneakers and designer accessories.',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=80',
        icon: 'Shirt',
      },
      {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Minimalist furniture, smart kitchenware, and ambient interior decor.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
        icon: 'Home',
      },
      {
        name: 'Beauty & Wellness',
        slug: 'beauty-wellness',
        description: 'Clean skincare, organic aromatherapy, and daily rejuvenation essentials.',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
        icon: 'Sparkles',
      },
      {
        name: 'Watches & Jewelry',
        slug: 'watches-jewelry',
        description: 'Luxury mechanical timepieces, chronograph watches, and artisan jewelry.',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
        icon: 'Watch',
      },
    ];

    const createdCategories = await Category.insertMany(categoriesData);

    const catElectronics = createdCategories[0]._id;
    const catFashion = createdCategories[1]._id;
    const catHome = createdCategories[2]._id;
    const catBeauty = createdCategories[3]._id;
    const catWatches = createdCategories[4]._id;

    console.log('[Seeder] Creating Multi-Vendor Products...');
    const productsData = [
      {
        name: 'AuraWave Pro ANC Headphones',
        slug: 'aurawave-pro-anc-headphones',
        description: 'Industry-leading active noise cancellation with 40mm beryllium drivers, 38-hour battery life, multipoint Bluetooth 5.3, and plush memory foam earcups.',
        price: 249.99,
        compareAtPrice: 299.99,
        category: catElectronics,
        brand: 'SoundCraft',
        countInStock: 24,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'TechSphere Official',
          storeName: 'TechSphere Global Store',
          rating: 4.9,
          contactEmail: 'contact@techsphere.io',
        },
        featured: true,
        rating: 4.9,
        numReviews: 86,
      },
      {
        name: 'Apex Mechanical Gaming Keyboard',
        slug: 'apex-mechanical-gaming-keyboard',
        description: 'Hot-swappable linear optical switches, aircraft-grade aluminum chassis, customizable per-key RGB backlighting, and sound-dampening silicone foam.',
        price: 139.99,
        compareAtPrice: 169.99,
        category: catElectronics,
        brand: 'ApexGear',
        countInStock: 18,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'Nexus Gaming Labs',
          storeName: 'Nexus Pro Hardware',
          rating: 4.7,
          contactEmail: 'sales@nexusgaming.com',
        },
        featured: true,
        rating: 4.8,
        numReviews: 42,
      },
      {
        name: 'UltraWide Curved 34-inch Studio Monitor',
        slug: 'ultrawide-curved-34-inch-studio-monitor',
        description: 'WQHD 3440x1440 resolution, 165Hz refresh rate, 99% sRGB color accuracy, USB-C 90W Power Delivery hub, and HDR 400 support for creatives and developers.',
        price: 549.99,
        compareAtPrice: 620.00,
        category: catElectronics,
        brand: 'VisionTech',
        countInStock: 8,
        images: [
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'TechSphere Official',
          storeName: 'TechSphere Global Store',
          rating: 4.9,
          contactEmail: 'contact@techsphere.io',
        },
        featured: false,
        rating: 4.7,
        numReviews: 31,
      },
      {
        name: 'Minimalist Merino Wool Overcoat',
        slug: 'minimalist-merino-wool-overcoat',
        description: 'Tailored from 100% sustainably sourced Italian merino wool. Weather-resistant lining, internal passport pocket, and a clean contemporary silhouette.',
        price: 219.00,
        compareAtPrice: 280.00,
        category: catFashion,
        brand: 'Atelier North',
        countInStock: 14,
        images: [
          'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'UrbanStyle Collective',
          storeName: 'UrbanStyle NYC',
          rating: 4.8,
          contactEmail: 'support@urbanstyle.com',
        },
        featured: true,
        rating: 4.9,
        numReviews: 54,
      },
      {
        name: 'AirFlow Athletic Runner Sneakers',
        slug: 'airflow-athletic-runner-sneakers',
        description: 'Engineered mesh upper with responsive carbon-infused foam midsole. Ultra-lightweight energy return designed for 10k runs and all-day street style.',
        price: 129.50,
        compareAtPrice: 155.00,
        category: catFashion,
        brand: 'StridePro',
        countInStock: 25,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'UrbanStyle Collective',
          storeName: 'UrbanStyle NYC',
          rating: 4.8,
          contactEmail: 'support@urbanstyle.com',
        },
        featured: true,
        rating: 4.7,
        numReviews: 98,
      },
      {
        name: 'Artisan Ceramic Pour-Over Coffee Set',
        slug: 'artisan-ceramic-pour-over-coffee-set',
        description: 'Handcrafted stoneware dripper with double-walled heat-retention glass carafe and a precision matte black stainless steel gooseneck kettle.',
        price: 78.00,
        compareAtPrice: 95.00,
        category: catHome,
        brand: 'Komorebi Crafts',
        countInStock: 30,
        images: [
          'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'NordicLiving Studio',
          storeName: 'NordicLiving Scandinavian Designs',
          rating: 4.9,
          contactEmail: 'hello@nordicliving.se',
        },
        featured: false,
        rating: 4.8,
        numReviews: 39,
      },
      {
        name: 'Nordic Oak & Linen Lounge Armchair',
        slug: 'nordic-oak-and-linen-lounge-armchair',
        description: 'Solid European white oak frame with hand-woven Belgian linen upholstery. Ergonomic back support designed for cozy reading corners and modern studios.',
        price: 389.00,
        compareAtPrice: 460.00,
        category: catHome,
        brand: 'ScandiForm',
        countInStock: 6,
        images: [
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'NordicLiving Studio',
          storeName: 'NordicLiving Scandinavian Designs',
          rating: 4.9,
          contactEmail: 'hello@nordicliving.se',
        },
        featured: true,
        rating: 5.0,
        numReviews: 19,
      },
      {
        name: 'Botanical Radiant Glow Facial Serum',
        slug: 'botanical-radiant-glow-facial-serum',
        description: 'Cold-pressed rosehip seed oil infused with 15% stable Vitamin C, plant squalane, and hyaluronic acid. Deeply hydrates and evens skin tone.',
        price: 46.00,
        compareAtPrice: 58.00,
        category: catBeauty,
        brand: 'AuraGlow Naturals',
        countInStock: 45,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'PureBotanicals Co.',
          storeName: 'PureBotanicals Wellness',
          rating: 4.9,
          contactEmail: 'care@purebotanicals.com',
        },
        featured: true,
        rating: 4.8,
        numReviews: 112,
      },
      {
        name: 'Aromatherapy Ultrasonic Stone Diffuser',
        slug: 'aromatherapy-ultrasonic-stone-diffuser',
        description: 'Hand-milled matte ceramic stone cover with whisper-quiet ultrasonic technology, ambient warm LED glow, and 8-hour continuous misting modes.',
        price: 64.90,
        compareAtPrice: 80.00,
        category: catBeauty,
        brand: 'Zenith Living',
        countInStock: 20,
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'PureBotanicals Co.',
          storeName: 'PureBotanicals Wellness',
          rating: 4.9,
          contactEmail: 'care@purebotanicals.com',
        },
        featured: false,
        rating: 4.6,
        numReviews: 27,
      },
      {
        name: 'Heritage Chronograph Automatic Watch',
        slug: 'heritage-chronograph-automatic-watch',
        description: 'Swiss-movement self-winding chronograph with scratch-resistant sapphire crystal, 316L stainless steel case, and vegetable-tanned genuine leather strap.',
        price: 345.00,
        compareAtPrice: 420.00,
        category: catWatches,
        brand: 'Horology Works',
        countInStock: 12,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'GrandTime Horology',
          storeName: 'GrandTime Official Boutique',
          rating: 5.0,
          contactEmail: 'concierge@grandtime.com',
        },
        featured: true,
        rating: 4.9,
        numReviews: 63,
      },
      {
        name: 'Midnight Edition Matte Titanium Watch',
        slug: 'midnight-edition-matte-titanium-watch',
        description: 'Ultra-lightweight grade 5 aerospace titanium case with stealth DLC matte black finish, Super-LumiNova indices, and 100-meter water resistance.',
        price: 289.00,
        compareAtPrice: 340.00,
        category: catWatches,
        brand: 'Horology Works',
        countInStock: 15,
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'GrandTime Horology',
          storeName: 'GrandTime Official Boutique',
          rating: 5.0,
          contactEmail: 'concierge@grandtime.com',
        },
        featured: false,
        rating: 4.7,
        numReviews: 38,
      },
      {
        name: 'Smart 4K Laser Cinema Projector',
        slug: 'smart-4k-laser-cinema-projector',
        description: 'True 4K UHD projection up to 150 inches with 2400 ANSI lumens, Harman Kardon integrated Dolby Atmos soundbar, and built-in Android TV streaming.',
        price: 899.00,
        compareAtPrice: 1050.00,
        category: catElectronics,
        brand: 'CineLuxe',
        countInStock: 5,
        images: [
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        ],
        vendor: {
          name: 'TechSphere Official',
          storeName: 'TechSphere Global Store',
          rating: 4.9,
          contactEmail: 'contact@techsphere.io',
        },
        featured: true,
        rating: 4.9,
        numReviews: 24,
      },
    ];

    const createdProducts = await Product.insertMany(productsData);

    console.log('[Seeder] Creating Initial Sample Orders...');
    await Order.create({
      user: customerUser._id,
      orderItems: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          qty: 1,
          image: createdProducts[0].images[0],
          price: createdProducts[0].price,
          vendor: createdProducts[0].vendor.storeName,
        },
        {
          product: createdProducts[7]._id,
          name: createdProducts[7].name,
          qty: 2,
          image: createdProducts[7].images[0],
          price: createdProducts[7].price,
          vendor: createdProducts[7].vendor.storeName,
        },
      ],
      shippingAddress: {
        fullName: 'Jane Doe',
        address: '456 Market Street, Apt 3B',
        city: 'San Francisco',
        postalCode: '94105',
        country: 'United States',
        phone: '+1 (555) 349-8812',
      },
      paymentMethod: 'Credit Card',
      itemsPrice: 341.99,
      taxPrice: 27.35,
      shippingPrice: 0.0,
      totalPrice: 369.34,
      isPaid: true,
      paidAt: new Date(Date.now() - 86400000 * 3),
      orderStatus: 'Shipped',
    });

    await Order.create({
      user: customerUser._id,
      orderItems: [
        {
          product: createdProducts[3]._id,
          name: createdProducts[3].name,
          qty: 1,
          image: createdProducts[3].images[0],
          price: createdProducts[3].price,
          vendor: createdProducts[3].vendor.storeName,
        },
      ],
      shippingAddress: {
        fullName: 'Jane Doe',
        address: '456 Market Street, Apt 3B',
        city: 'San Francisco',
        postalCode: '94105',
        country: 'United States',
        phone: '+1 (555) 349-8812',
      },
      paymentMethod: 'Cash on Delivery',
      itemsPrice: 219.00,
      taxPrice: 17.52,
      shippingPrice: 15.00,
      totalPrice: 251.52,
      isPaid: false,
      orderStatus: 'Processing',
    });

    console.log('----------------------------------------------------');
    console.log('✓ Database seeded successfully!');
    console.log(`Created: ${createdCategories.length} categories, ${createdProducts.length} products`);
    console.log('----------------------------------------------------');

    return true;
  } catch (error) {
    console.error('[Seeder Error]:', error);
    throw error;
  }
};

// If run directly from terminal:
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  })();
}
