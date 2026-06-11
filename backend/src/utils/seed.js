/**
 * utils/seed.js
 * --------------
 * Populates the database with demo data for testing.
 * Run with: npm run seed
 *
 * WARNING: This clears all existing data first!
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose     = require('mongoose')
const User         = require('../models/User')
const Post         = require('../models/Post')
const Society      = require('../models/Society')
const Business     = require('../models/Business')
const Notification = require('../models/Notification')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ Connected to MongoDB')

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Society.deleteMany({}),
    Business.deleteMany({}),
    Notification.deleteMany({}),
  ])
  console.log('🗑️  Cleared existing data')

  // Create demo users
  const [admin, ravi, priya, amit] = await User.create([
    { name: 'Admin User',    email: 'admin@demo.com',  password: 'password123', role: 'rwa',      city: 'Mumbai', area: 'Andheri West' },
    { name: 'Ravi Kumar',    email: 'ravi@demo.com',   password: 'password123', role: 'resident', city: 'Mumbai', area: 'Andheri West' },
    { name: 'Priya Sharma',  email: 'priya@demo.com',  password: 'password123', role: 'resident', city: 'Mumbai', area: 'Andheri West' },
    { name: 'Amit Nair',     email: 'amit@demo.com',   password: 'password123', role: 'business', city: 'Mumbai', area: 'Andheri West' },
  ])
  console.log('👥 Created users')

  // Create a society
  const society = await Society.create({
    name:    'Sunrise Apartments',
    area:    'Andheri West',
    city:    'Mumbai',
    admin:   admin._id,
    members: [admin._id, ravi._id, priya._id, amit._id],
  })

  // Assign society to users
  await User.updateMany({ _id: { $in: [admin._id, ravi._id, priya._id, amit._id] } }, { society: society._id })
  console.log('🏢 Created society')

  // Create demo posts
  await Post.create([
    { author: ravi._id,  content: 'Water pipe burst on 3rd floor! Please avoid the area.',                    level: 'society', category: 'emergency', isEmergency: true,  society: society._id, area: 'Andheri West', city: 'Mumbai' },
    { author: priya._id, content: 'Society meeting this Sunday at 6 PM. Agenda: parking & garden renovation.', level: 'society', category: 'event',     isEmergency: false, society: society._id, area: 'Andheri West', city: 'Mumbai' },
    { author: amit._id,  content: 'Selling LG 7kg washing machine for ₹8,000. DM if interested!',              level: 'society', category: 'general',   isEmergency: false, society: society._id, area: 'Andheri West', city: 'Mumbai' },
    { author: ravi._id,  content: 'Lost black Labrador near B-wing. Please call if you see Milo!',             level: 'society', category: 'help',      isEmergency: false, society: society._id, area: 'Andheri West', city: 'Mumbai' },
    { author: amit._id,  content: 'New cutting chai flavors this week — masala and ginger lemon!',              level: 'area',    category: 'business',  isEmergency: false, area: 'Andheri West', city: 'Mumbai' },
    { author: priya._id, content: 'Free yoga session at Versova Beach this Saturday 6:30 AM!',                  level: 'area',    category: 'event',     isEmergency: false, area: 'Andheri West', city: 'Mumbai' },
    { author: admin._id, content: 'Heavy rain forecast tonight. BMC yellow alert issued. Stay safe.',           level: 'public',  category: 'emergency', isEmergency: true,  city: 'Mumbai' },
  ])
  console.log('📝 Created posts')

  // Create a business
  await Business.create({
    owner:     amit._id,
    name:      'Chai Tapri',
    category:  'food',
    phone:     '9800000001',
    promoText: 'New masala chai flavors this week!',
    area:      'Andheri West',
    city:      'Mumbai',
    isVerified: true,
  })
  console.log('🏪 Created business')

  console.log('\n✅ Seed complete!')
  console.log('   Login with any of these:')
  console.log('   admin@demo.com / password123  (RWA Admin)')
  console.log('   ravi@demo.com  / password123  (Resident)')
  console.log('   amit@demo.com  / password123  (Business owner)')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
