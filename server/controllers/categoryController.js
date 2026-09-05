const Category = require('../models/Category');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).populate('parentCategory', 'name code').sort('name');
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) { next(err); }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('parentCategory', 'name code');
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
};

exports.createCategory = async (req, res, next) => {
  try {
    req.body.createdBy = req.user._id;
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
