const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Banner = require('./models/Banner');
const Address = require('./models/Address');
const Review = require('./models/Review');
const Order = require('./models/Order');

const {
  categoriesData,
  productsData,
  couponsData,
  bannersData,
} = require('./utils/seedData');

const importData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();
    await Address.deleteMany();
    await Review.deleteMany();
    await Order.deleteMany();

    console.log('Creating Admin & User accounts...');
    const adminUser = await User.create({
      name: 'NexCart Admin',
      email: 'admin@nexcart.com',
      password: 'admin123',
      mobile: '9876543210',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    const normalUser = await User.create({
      name: 'Mohit Kumar',
      email: 'user@nexcart.com',
      password: 'user123',
      mobile: '9123456789',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    });

    console.log('Inserting Categories...');
    const insertedCategories = await Category.insertMany(categoriesData);

    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.name] = cat;
    });

    console.log('Inserting Products...');
    const productsToInsert = productsData.map((p) => {
      const categoryObj = categoryMap[p.categoryName] || insertedCategories[0];
      return {
        ...p,
        category: categoryObj._id,
      };
    });

    const insertedProducts = await Product.insertMany(productsToInsert);

    console.log('Inserting Coupons & Banners...');
    await Coupon.insertMany(couponsData);
    await Banner.insertMany(bannersData);

    console.log('Creating default user address...');
    await Address.create({
      user: normalUser._id,
      fullName: 'Mohit Kumar',
      mobileNumber: '9123456789',
      houseFlat: 'Flat 402, Block B',
      street: 'MG Road, Koramangala',
      area: 'Koramangala 5th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560095',
      landmark: 'Near Sony World Signal',
      addressType: 'Home',
      isDefault: true,
    });

    console.log('Adding initial reviews...');
    if (insertedProducts.length > 0) {
      await Review.create({
        product: insertedProducts[0]._id,
        user: normalUser._id,
        userName: normalUser.name,
        userAvatar: normalUser.avatar,
        rating: 5,
        title: 'Outstanding camera and performance!',
        comment: 'The Snapdragon 8 Elite is buttery smooth and the 200MP camera produces stunning night photos. Worth every rupee!',
        isVerifiedPurchase: true,
      });
    }

    console.log('-------------------------------------------');
    console.log('✅ NexCart Database Seeded Successfully!');
    console.log('📌 Admin Credentials: admin@nexcart.com / admin123');
    console.log('📌 User Credentials:  user@nexcart.com  / user123');
    console.log('-------------------------------------------');
    process.exit();
  } catch (error) {
    console.error(`Error during seed: ${error.message}`);
    process.exit(1);
  }
};

importData();
