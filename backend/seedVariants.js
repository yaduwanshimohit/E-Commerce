const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const seedVariantProducts = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for variant seeding...');

    // 1. Fashion Category & T-Shirt with Color & Size variants
    let fashionCat = await Category.findOne({ name: 'Fashion' });
    if (!fashionCat) {
      fashionCat = await Category.create({
        name: 'Fashion',
        slug: 'fashion',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
      });
    }

    const tshirtData = {
      name: 'NexStyle Premium Cotton Crewneck T-Shirt',
      slug: 'nexstyle-premium-cotton-crewneck-tshirt',
      brand: 'NexStyle',
      category: fashionCat._id,
      categoryName: 'Fashion',
      description: 'Ultra-soft 100% combed cotton t-shirt with bio-wash finish. Perfect fit for daily wear and casual outings.',
      price: 1499,
      discountPrice: 799,
      discountPercent: 47,
      stock: 120,
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
      ],
      specifications: [
        { key: 'Material', value: '100% Combed Bio-washed Cotton' },
        { key: 'Fit Type', value: 'Regular Fit' },
        { key: 'Neck Style', value: 'Crew Neck' },
        { key: 'Sleeve Length', value: 'Short Sleeve' },
      ],
      features: [
        'Pre-shrunk fabric prevents shrinkage after washing',
        'Reinforced double-stitched collar and hem',
        'Breathable and lightweight 180 GSM fabric',
      ],
      warranty: '6 Months Stitching Warranty',
      returnPolicy: '10 Days Easy Return & Exchange',
      isFeatured: true,
      isFlashSale: true,
      hasVariants: true,
      attributes: [
        { name: 'Color', options: ['Black', 'White', 'Navy Blue'] },
        { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      ],
      variants: [
        // Black variants
        {
          sku: 'TSH-BLK-S',
          attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: 'S' }],
          price: 1499, discountPrice: 799, stock: 15,
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
          isDefault: true,
        },
        {
          sku: 'TSH-BLK-M',
          attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: 'M' }],
          price: 1499, discountPrice: 799, stock: 20,
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
        },
        {
          sku: 'TSH-BLK-L',
          attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: 'L' }],
          price: 1499, discountPrice: 849, stock: 10,
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
        },
        {
          sku: 'TSH-BLK-XL',
          attributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: 'XL' }],
          price: 1599, discountPrice: 899, stock: 8,
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
        },
        // White variants
        {
          sku: 'TSH-WHT-S',
          attributes: [{ name: 'Color', value: 'White' }, { name: 'Size', value: 'S' }],
          price: 1499, discountPrice: 749, stock: 12,
          images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
        },
        {
          sku: 'TSH-WHT-M',
          attributes: [{ name: 'Color', value: 'White' }, { name: 'Size', value: 'M' }],
          price: 1499, discountPrice: 749, stock: 18,
          images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
        },
        {
          sku: 'TSH-WHT-L',
          attributes: [{ name: 'Color', value: 'White' }, { name: 'Size', value: 'L' }],
          price: 1499, discountPrice: 799, stock: 14,
          images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
        },
        {
          sku: 'TSH-WHT-XL',
          attributes: [{ name: 'Color', value: 'White' }, { name: 'Size', value: 'XL' }],
          price: 1599, discountPrice: 849, stock: 6,
          images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800'],
        },
        // Navy Blue variants
        {
          sku: 'TSH-NVY-S',
          attributes: [{ name: 'Color', value: 'Navy Blue' }, { name: 'Size', value: 'S' }],
          price: 1499, discountPrice: 799, stock: 10,
          images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'],
        },
        {
          sku: 'TSH-NVY-M',
          attributes: [{ name: 'Color', value: 'Navy Blue' }, { name: 'Size', value: 'M' }],
          price: 1499, discountPrice: 799, stock: 15,
          images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'],
        },
        {
          sku: 'TSH-NVY-L',
          attributes: [{ name: 'Color', value: 'Navy Blue' }, { name: 'Size', value: 'L' }],
          price: 1499, discountPrice: 849, stock: 11,
          images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'],
        },
        {
          sku: 'TSH-NVY-XL',
          attributes: [{ name: 'Color', value: 'Navy Blue' }, { name: 'Size', value: 'XL' }],
          price: 1599, discountPrice: 899, stock: 5,
          images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'],
        },
      ],
    };

    await Product.findOneAndUpdate({ slug: tshirtData.slug }, tshirtData, { upsert: true, new: true });
    console.log('Successfully seeded T-Shirt with Color & Size variants!');

    // 2. Mobile Category & Smartphone with Storage & Color variants
    let mobileCat = await Category.findOne({ name: 'Mobiles' });
    if (!mobileCat) {
      mobileCat = await Category.create({
        name: 'Mobiles',
        slug: 'mobiles',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      });
    }

    const phoneData = {
      name: 'NexPro Ultra 5G Smartphone',
      slug: 'nexpro-ultra-5g-smartphone',
      brand: 'NexPro',
      category: mobileCat._id,
      categoryName: 'Mobiles',
      description: 'Flagship 5G smartphone with 120Hz AMOLED ProMotion Display, Snapdragon 8 Gen 3 chipset, and 200MP OIS Triple Camera.',
      price: 79999,
      discountPrice: 69999,
      discountPercent: 12,
      stock: 55,
      images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800',
      ],
      specifications: [
        { key: 'Processor', value: 'Snapdragon 8 Gen 3' },
        { key: 'Display', value: '6.7" QHD+ 120Hz AMOLED' },
        { key: 'Camera', value: '200MP + 50MP + 12MP OIS' },
        { key: 'Battery', value: '5000 mAh with 100W Fast Charge' },
      ],
      features: [
        'IP68 Dust and Water Resistance',
        'In-display Ultrasonic Fingerprint Scanner',
        'Stereo Speakers tuned by Dolby Atmos',
      ],
      warranty: '1 Year Brand Warranty',
      returnPolicy: '7 Days Replacement Policy',
      isFeatured: true,
      isFlashSale: false,
      hasVariants: true,
      attributes: [
        { name: 'Color', options: ['Titanium Black', 'Pearl White'] },
        { name: 'Storage', options: ['128GB', '256GB', '512GB'] },
      ],
      variants: [
        {
          sku: 'PHONE-BLK-128',
          attributes: [{ name: 'Color', value: 'Titanium Black' }, { name: 'Storage', value: '128GB' }],
          price: 79999, discountPrice: 69999, stock: 15,
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
          isDefault: true,
        },
        {
          sku: 'PHONE-BLK-256',
          attributes: [{ name: 'Color', value: 'Titanium Black' }, { name: 'Storage', value: '256GB' }],
          price: 84999, discountPrice: 74999, stock: 12,
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
        },
        {
          sku: 'PHONE-BLK-512',
          attributes: [{ name: 'Color', value: 'Titanium Black' }, { name: 'Storage', value: '512GB' }],
          price: 94999, discountPrice: 84999, stock: 8,
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
        },
        {
          sku: 'PHONE-WHT-128',
          attributes: [{ name: 'Color', value: 'Pearl White' }, { name: 'Storage', value: '128GB' }],
          price: 79999, discountPrice: 69999, stock: 10,
          images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800'],
        },
        {
          sku: 'PHONE-WHT-256',
          attributes: [{ name: 'Color', value: 'Pearl White' }, { name: 'Storage', value: '256GB' }],
          price: 84999, discountPrice: 74999, stock: 7,
          images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800'],
        },
        {
          sku: 'PHONE-WHT-512',
          attributes: [{ name: 'Color', value: 'Pearl White' }, { name: 'Storage', value: '512GB' }],
          price: 94999, discountPrice: 84999, stock: 3,
          images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800'],
        },
      ],
    };

    await Product.findOneAndUpdate({ slug: phoneData.slug }, phoneData, { upsert: true, new: true });
    console.log('Successfully seeded Smartphone with Storage & Color variants!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedVariantProducts();
