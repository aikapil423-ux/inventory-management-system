const express = require('express');
const router = express.Router();
const User = require('../models/User');
const District = require('../models/District');
const PoliceStation = require('../models/PoliceStation');
const Store = require('../models/Store');
const Category = require('../models/Category');
const Item = require('../models/Item');

router.post('/', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.SEED_KEY && req.query.key !== process.env.SEED_KEY) {
      return res.status(403).json({ success: false, message: 'Seed is disabled in production without the correct key' });
    }
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      await User.updateMany({ isActive: { $ne: true } }, { $set: { isActive: true } });
      return res.json({ success: true, message: 'Database already seeded. Fixed isActive flags.' });
    }

    const superAdmin = await User.create({
      username: 'admin', email: 'admin@haryanapolice.gov.in', password: 'admin123',
      fullName: 'Super Admin', role: 'super_admin', phone: '9999999999'
    });

    const districts = await District.insertMany([
      { name: 'Gurugram', code: 'GRG', admin: superAdmin._id },
      { name: 'Faridabad', code: 'FRD', admin: superAdmin._id },
      { name: 'Panchkula', code: 'PCH', admin: superAdmin._id },
      { name: 'Sonipat', code: 'SNP', admin: superAdmin._id },
      { name: 'Hisar', code: 'HSR', admin: superAdmin._id }
    ]);

    const gurugram = districts[0];
    const districtAdmin = await User.create({
      username: 'districtadmin', email: 'district@gurugram.gov.in', password: 'admin123',
      fullName: 'Gurugram District Admin', role: 'district_admin', district: gurugram._id, phone: '8888888888'
    });
    await District.findByIdAndUpdate(gurugram._id, { admin: districtAdmin._id });

    const policeStations = await PoliceStation.insertMany([
      { name: 'Civil Lines PS', code: 'GRG-CL-01', district: gurugram._id, type: 'PS', address: 'Civil Lines, Gurugram' },
      { name: 'Sadar PS', code: 'GRG-SD-02', district: gurugram._id, type: 'PS', address: 'Sadar, Gurugram' },
      { name: 'Dlf PS', code: 'GRG-DL-03', district: gurugram._id, type: 'PS', address: 'DLF Phase 1, Gurugram' },
      { name: 'Sector 14 PS', code: 'GRG-14-04', district: gurugram._id, type: 'PS', address: 'Sector 14, Gurugram' },
      { name: 'Manesar Unit', code: 'GRG-MN-05', district: gurugram._id, type: 'unit', address: 'Manesar, Gurugram' }
    ]);

    const civilLinesPS = policeStations[0];
    const tsi = await User.create({
      username: 'tsi', email: 'tsi@civillines.gov.in', password: 'tsi123',
      fullName: 'Inspector Rajesh Kumar', role: 'tsi', district: gurugram._id,
      policeStation: civilLinesPS._id, phone: '7777777777'
    });
    await PoliceStation.findByIdAndUpdate(civilLinesPS._id, { inCharge: tsi._id });

    const stores = await Store.insertMany([
      { name: 'Civil Lines Malkhana', code: 'GRG-CL-MH01', policeStation: civilLinesPS._id, location: 'Building No. 5, Civil Lines' },
      { name: 'Sadar Malkhana', code: 'GRG-SD-MH01', policeStation: policeStations[1]._id, location: 'Sadar PS Campus' },
      { name: 'DLF Malkhana', code: 'GRG-DL-MH01', policeStation: policeStations[2]._id, location: 'DLF Phase 1 Complex' }
    ]);

    const civilLinesStore = stores[0];
    const storeKeeper = await User.create({
      username: 'storekeeper', email: 'mhc@civillines.gov.in', password: 'mhc123',
      fullName: 'Mohinder Singh', role: 'mhc_storekeeper', district: gurugram._id,
      policeStation: civilLinesPS._id, store: civilLinesStore._id, phone: '6666666666'
    });
    await Store.findByIdAndUpdate(civilLinesStore._id, { storeKeeper: storeKeeper._id });

    const inspector = await User.create({
      username: 'inspector', email: 'inspection@haryanapolice.gov.in', password: 'insp123',
      fullName: 'Inspection Officer Vikram', role: 'inspection_officer', phone: '5555555555'
    });

    const categories = await Category.insertMany([
      { name: 'Riot Gear', code: 'RG', description: 'Equipment used during riots and crowd control', icon: 'shield', createdBy: superAdmin._id },
      { name: 'Cleaning Materials', code: 'CM', description: 'Cleaning and hygiene supplies', icon: 'broom', createdBy: superAdmin._id },
      { name: 'Uniforms', code: 'UN', description: 'Police uniforms and accessories', icon: 'uniform', createdBy: superAdmin._id },
      { name: 'Medical Supplies', code: 'MS', description: 'First aid and medical equipment', icon: 'medical', createdBy: superAdmin._id },
      { name: 'Communication Equipment', code: 'CE', description: 'Radios and communication devices', icon: 'radio', createdBy: superAdmin._id },
      { name: 'Office Supplies', code: 'OS', description: 'Stationery and office items', icon: 'office', createdBy: superAdmin._id }
    ]);

    const rg = categories[0], cm = categories[1], un = categories[2], ms = categories[3], ce = categories[4], os = categories[5];

    await Item.insertMany([
      { name: 'Lathi (Standard)', code: 'RG-LATHI-001', category: rg._id, description: 'Standard police lathi 36 inch', unit: 'piece', minimumStock: 50, maximumStock: 200, reorderLevel: 60, unitPrice: 150, createdBy: superAdmin._id },
      { name: 'Danda (Short)', code: 'RG-DANDA-001', category: rg._id, description: 'Short danda 24 inch', unit: 'piece', minimumStock: 30, maximumStock: 100, reorderLevel: 40, unitPrice: 120, createdBy: superAdmin._id },
      { name: 'Riot Helmet', code: 'RG-HELMET-001', category: rg._id, description: 'ISI certified riot helmet with visor', unit: 'piece', minimumStock: 40, maximumStock: 150, reorderLevel: 50, unitPrice: 800, createdBy: superAdmin._id },
      { name: 'Body Protector Vest', code: 'RG-VEST-001', category: rg._id, description: 'Protective body armor vest', unit: 'piece', minimumStock: 20, maximumStock: 80, reorderLevel: 30, unitPrice: 2500, createdBy: superAdmin._id },
      { name: 'Reflector Jacket', code: 'RG-JACKET-001', category: rg._id, description: 'High visibility reflector jacket', unit: 'piece', minimumStock: 40, maximumStock: 150, reorderLevel: 50, unitPrice: 350, createdBy: superAdmin._id },
      { name: 'Riot Shield', code: 'RG-SHIELD-001', category: rg._id, description: 'Polycarbonate riot shield', unit: 'piece', minimumStock: 15, maximumStock: 60, reorderLevel: 20, unitPrice: 3000, createdBy: superAdmin._id },
      { name: 'Floor Cleaner (5L)', code: 'CM-CLN-001', category: cm._id, description: 'Industrial floor cleaner 5 liters', unit: 'liter', minimumStock: 20, maximumStock: 100, reorderLevel: 30, unitPrice: 250, createdBy: superAdmin._id },
      { name: 'Disinfectant Spray', code: 'CM-DSP-001', category: cm._id, description: 'Disinfectant spray for sanitization', unit: 'piece', minimumStock: 30, maximumStock: 100, reorderLevel: 40, unitPrice: 180, createdBy: superAdmin._id },
      { name: 'Broom (Standard)', code: 'CM-BRM-001', category: cm._id, description: 'Standard cleaning broom', unit: 'piece', minimumStock: 15, maximumStock: 50, reorderLevel: 20, unitPrice: 80, createdBy: superAdmin._id },
      { name: 'Khaki Uniform Set', code: 'UN-KHAKI-001', category: un._id, description: 'Complete khaki uniform set', unit: 'set', minimumStock: 20, maximumStock: 100, reorderLevel: 30, unitPrice: 2800, createdBy: superAdmin._id },
      { name: 'Police Boots', code: 'UN-BOOT-001', category: un._id, description: 'Standard issue police boots', unit: 'pair', minimumStock: 25, maximumStock: 80, reorderLevel: 30, unitPrice: 1200, createdBy: superAdmin._id },
      { name: 'Belt (Leather)', code: 'UN-BELT-001', category: un._id, description: 'Standard leather police belt', unit: 'piece', minimumStock: 30, maximumStock: 100, reorderLevel: 40, unitPrice: 450, createdBy: superAdmin._id },
      { name: 'First Aid Kit', code: 'MS-FAK-001', category: ms._id, description: 'Standard first aid kit', unit: 'set', minimumStock: 10, maximumStock: 50, reorderLevel: 15, unitPrice: 500, createdBy: superAdmin._id },
      { name: 'Bandage Roll', code: 'MS-BND-001', category: ms._id, description: 'Sterile bandage roll', unit: 'piece', minimumStock: 50, maximumStock: 200, reorderLevel: 60, unitPrice: 25, createdBy: superAdmin._id },
      { name: 'Walkie Talkie', code: 'CE-WT-001', category: ce._id, description: 'Motorola walkie talkie', unit: 'piece', minimumStock: 15, maximumStock: 60, reorderLevel: 20, unitPrice: 8500, createdBy: superAdmin._id },
      { name: 'Battery (Walkie Talkie)', code: 'CE-BAT-001', category: ce._id, description: 'Rechargeable battery for walkie talkie', unit: 'piece', minimumStock: 30, maximumStock: 100, reorderLevel: 40, unitPrice: 800, createdBy: superAdmin._id },
      { name: 'A4 Paper (Ream)', code: 'OS-PPR-001', category: os._id, description: 'Standard A4 size paper ream', unit: 'box', minimumStock: 20, maximumStock: 80, reorderLevel: 25, unitPrice: 300, createdBy: superAdmin._id },
      { name: 'Pen (Box of 10)', code: 'OS-PEN-001', category: os._id, description: 'Blue ballpoint pen box', unit: 'box', minimumStock: 15, maximumStock: 50, reorderLevel: 20, unitPrice: 100, createdBy: superAdmin._id }
    ]);

    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
