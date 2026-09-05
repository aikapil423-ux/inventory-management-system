const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const District = require('../models/District');
const PoliceStation = require('../models/PoliceStation');
const Store = require('../models/Store');
const Category = require('../models/Category');
const Item = require('../models/Item');

const seedDatabase = async () => {
  try {
    let uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('xxxxx')) {
      console.log('Starting in-memory MongoDB for seeding...');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }
    await mongoose.connect(uri);
    console.log('MongoDB Connected for seeding...');

    await User.deleteMany({});
    await District.deleteMany({});
    await PoliceStation.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await Item.deleteMany({});

    console.log('Cleared existing data');

    const superAdmin = await User.create({
      username: 'admin', email: 'admin@haryanapolice.gov.in', password: 'admin123',
      fullName: 'Super Admin', role: 'super_admin', phone: '9999999999'
    });
    console.log('Super Admin created');

    const districts = await District.insertMany([
      { name: 'Gurugram', code: 'GRG', admin: superAdmin._id },
      { name: 'Faridabad', code: 'FRD', admin: superAdmin._id },
      { name: 'Panchkula', code: 'PCH', admin: superAdmin._id },
      { name: 'Sonipat', code: 'SNP', admin: superAdmin._id },
      { name: 'Hisar', code: 'HSR', admin: superAdmin._id }
    ]);
    console.log('Districts created');

    const gurugramDistrict = districts[0];

    const districtAdmin = await User.create({
      username: 'districtadmin', email: 'district@gurugram.gov.in', password: 'admin123',
      fullName: 'Gurugram District Admin', role: 'district_admin', district: gurugramDistrict._id, phone: '8888888888'
    });
    await District.findByIdAndUpdate(gurugramDistrict._id, { admin: districtAdmin._id });

    const policeStations = await PoliceStation.insertMany([
      { name: 'Civil Lines PS', code: 'GRG-CL-01', district: gurugramDistrict._id, type: 'PS', address: 'Civil Lines, Gurugram' },
      { name: 'Sadar PS', code: 'GRG-SD-02', district: gurugramDistrict._id, type: 'PS', address: 'Sadar, Gurugram' },
      { name: 'Dlf PS', code: 'GRG-DL-03', district: gurugramDistrict._id, type: 'PS', address: 'DLF Phase 1, Gurugram' },
      { name: 'Sector 14 PS', code: 'GRG-14-04', district: gurugramDistrict._id, type: 'PS', address: 'Sector 14, Gurugram' },
      { name: 'Manesar Unit', code: 'GRG-MN-05', district: gurugramDistrict._id, type: 'unit', address: 'Manesar, Gurugram' }
    ]);
    console.log('Police Stations created');

    const civilLinesPS = policeStations[0];

    const tsi = await User.create({
      username: 'tsi', email: 'tsi@civillines.gov.in', password: 'tsi123',
      fullName: 'Inspector Rajesh Kumar', role: 'tsi', district: gurugramDistrict._id,
      policeStation: civilLinesPS._id, phone: '7777777777'
    });
    await PoliceStation.findByIdAndUpdate(civilLinesPS._id, { inCharge: tsi._id });

    const stores = await Store.insertMany([
      { name: 'Civil Lines Malkhana', code: 'GRG-CL-MH01', policeStation: civilLinesPS._id, location: 'Building No. 5, Civil Lines' },
      { name: 'Sadar Malkhana', code: 'GRG-SD-MH01', policeStation: policeStations[1]._id, location: 'Sadar PS Campus' },
      { name: 'DLF Malkhana', code: 'GRG-DL-MH01', policeStation: policeStations[2]._id, location: 'DLF Phase 1 Complex' }
    ]);
    console.log('Stores created');

    const civilLinesStore = stores[0];

    const storeKeeper = await User.create({
      username: 'storekeeper', email: 'mhc@civillines.gov.in', password: 'mhc123',
      fullName: 'Mohinder Singh', role: 'mhc_storekeeper', district: gurugramDistrict._id,
      policeStation: civilLinesPS._id, store: civilLinesStore._id, phone: '6666666666'
    });
    await Store.findByIdAndUpdate(civilLinesStore._id, { storeKeeper: storeKeeper._id });

    const inspector = await User.create({
      username: 'inspector', email: 'inspection@haryanapolice.gov.in', password: 'insp123',
      fullName: 'Inspection Officer Vikram', role: 'inspection_officer', phone: '5555555555'
    });

    const categories = await Category.insertMany([
      { name: 'Riot Gear', code: 'RG', description: 'Equipment used during riots and crowd control', icon: 'shield', createdBy: superAdmin._id },
      { name: 'Laathi / Danda', code: 'RG-LD', description: 'Baton and lathi for crowd control', icon: 'stick', parentCategory: null, createdBy: superAdmin._id },
      { name: 'Helmet', code: 'RG-HL', description: 'Protective helmets for riot duty', icon: 'helmet', createdBy: superAdmin._id },
      { name: 'Body Protector', code: 'RG-BP', description: 'Body armor and protective gear', icon: 'vest', createdBy: superAdmin._id },
      { name: 'Reflector Jacket', code: 'RG-RJ', description: 'High visibility reflector jackets', icon: 'jacket', createdBy: superAdmin._id },
      { name: 'Shield', code: 'RG-SH', description: 'Riot shields', icon: 'shield', createdBy: superAdmin._id },
      { name: 'Cleaning Materials', code: 'CM', description: 'Cleaning and hygiene supplies', icon: 'broom', createdBy: superAdmin._id },
      { name: 'Uniforms', code: 'UN', description: 'Police uniforms and accessories', icon: 'uniform', createdBy: superAdmin._id },
      { name: 'Medical Supplies', code: 'MS', description: 'First aid and medical equipment', icon: 'medical', createdBy: superAdmin._id },
      { name: 'Communication Equipment', code: 'CE', description: 'Radios and communication devices', icon: 'radio', createdBy: superAdmin._id },
      { name: 'Office Supplies', code: 'OS', description: 'Stationery and office items', icon: 'office', createdBy: superAdmin._id }
    ]);
    console.log('Categories created');

    const rgCategory = categories[0];
    const cmCategory = categories[6];
    const unCategory = categories[7];
    const msCategory = categories[8];
    const ceCategory = categories[9];
    const osCategory = categories[10];

    const items = await Item.insertMany([
      { name: 'Lathi (Standard)', code: 'RG-LATHI-001', category: rgCategory._id, description: 'Standard police lathi 36 inch', unit: 'piece', minimumStock: 50, maximumStock: 200, reorderLevel: 60, unitPrice: 150, createdBy: superAdmin._id },
      { name: 'Danda (Short)', code: 'RG-DANDA-001', category: rgCategory._id, description: 'Short danda 24 inch', unit: 'piece', minimumStock: 30, maximumStock: 100, reorderLevel: 40, unitPrice: 120, createdBy: superAdmin._id },
      { name: 'Riot Helmet', code: 'RG-HELMET-001', category: rgCategory._id, description: 'ISI certified riot helmet with visor', unit: 'piece', minimumStock: 40, maximumStock: 150, reorderLevel: 50, unitPrice: 800, specifications: { size: 'M/L', color: 'White' }, createdBy: superAdmin._id },
      { name: 'Body Protector Vest', code: 'RG-VEST-001', category: rgCategory._id, description: 'Protective body armor vest', unit: 'piece', minimumStock: 20, maximumStock: 80, reorderLevel: 30, unitPrice: 2500, specifications: { size: 'L', level: 'III' }, createdBy: superAdmin._id },
      { name: 'Reflector Jacket', code: 'RG-JACKET-001', category: rgCategory._id, description: 'High visibility reflector jacket', unit: 'piece', minimumStock: 40, maximumStock: 150, reorderLevel: 50, unitPrice: 350, specifications: { size: 'M/L/XL' }, createdBy: superAdmin._id },
      { name: 'Riot Shield', code: 'RG-SHIELD-001', category: rgCategory._id, description: 'Polycarbonate riot shield', unit: 'piece', minimumStock: 15, maximumStock: 60, reorderLevel: 20, unitPrice: 3000, createdBy: superAdmin._id },
      { name: 'Floor Cleaner (5L)', code: 'CM-CLN-001', category: cmCategory._id, description: 'Industrial floor cleaner 5 liters', unit: 'liter', minimumStock: 20, maximumStock: 100, reorderLevel: 30, unitPrice: 250, createdBy: superAdmin._id },
      { name: 'Disinfectant Spray', code: 'CM-DSP-001', category: cmCategory._id, description: 'Disinfectant spray for sanitization', unit: 'piece', minimumStock: 30, maximumStock: 100, reorderLevel: 40, unitPrice: 180, createdBy: superAdmin._id },
      { name: 'Broom (Standard)', code: 'CM-BRM-001', category: cmCategory._id, description: 'Standard cleaning broom', unit: 'piece', minimumStock: 15, maximumStock: 50, reorderLevel: 20, unitPrice: 80, createdBy: superAdmin._id },
      { name: 'Khaki Uniform Set', code: 'UN-KHAKI-001', category: unCategory._id, description: 'Complete khaki uniform set', unit: 'set', minimumStock: 20, maximumStock: 100, reorderLevel: 30, unitPrice: 2800, specifications: { sizes: 'S/M/L/XL/XXL' }, createdBy: superAdmin._id },
      { name: 'Police Boots', code: 'UN-BOOT-001', category: unCategory._id, description: 'Standard issue police boots', unit: 'pair', minimumStock: 25, maximumStock: 80, reorderLevel: 30, unitPrice: 1200, specifications: { sizes: '6/7/8/9/10/11' }, createdBy: superAdmin._id },
      { name: 'Belt (Leather)', code: 'UN-BELT-001', category: unCategory._id, description: 'Standard leather police belt', unit: 'piece', minimumStock: 30, maximumStock: 100, reorderLevel: 40, unitPrice: 450, createdBy: superAdmin._id },
      { name: 'First Aid Kit', code: 'MS-FAK-001', category: msCategory._id, description: 'Standard first aid kit', unit: 'set', minimumStock: 10, maximumStock: 50, reorderLevel: 15, unitPrice: 500, createdBy: superAdmin._id },
      { name: 'Bandage Roll', code: 'MS-BND-001', category: msCategory._id, description: 'Sterile bandage roll', unit: 'piece', minimumStock: 50, maximumStock: 200, reorderLevel: 60, unitPrice: 25, createdBy: superAdmin._id },
      { name: 'Walkie Talkie', code: 'CE-WT-001', category: ceCategory._id, description: 'Motorola walkie talkie', unit: 'piece', minimumStock: 15, maximumStock: 60, reorderLevel: 20, unitPrice: 8500, createdBy: superAdmin._id },
      { name: 'Battery (Walkie Talkie)', code: 'CE-BAT-001', category: ceCategory._id, description: 'Rechargeable battery for walkie talkie', unit: 'piece', minimumStock: 30, maximumStock: 100, reorderLevel: 40, unitPrice: 800, createdBy: superAdmin._id },
      { name: 'A4 Paper (Ream)', code: 'OS-PPR-001', category: osCategory._id, description: 'Standard A4 size paper ream', unit: 'box', minimumStock: 20, maximumStock: 80, reorderLevel: 25, unitPrice: 300, createdBy: superAdmin._id },
      { name: 'Pen (Box of 10)', code: 'OS-PEN-001', category: osCategory._id, description: 'Blue ballpoint pen box', unit: 'box', minimumStock: 15, maximumStock: 50, reorderLevel: 20, unitPrice: 100, createdBy: superAdmin._id }
    ]);
    console.log('Items created');

    console.log('\n--- Seed Complete ---');
    console.log('Login Credentials:');
    console.log('Super Admin: admin / admin123');
    console.log('District Admin: districtadmin / admin123');
    console.log('TSI: tsi / tsi123');
    console.log('Store Keeper: storekeeper / mhc123');
    console.log('Inspector: inspector / insp123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
