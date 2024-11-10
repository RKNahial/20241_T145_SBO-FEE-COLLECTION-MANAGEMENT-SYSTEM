// controllers/paymentCategoryController.js
const PaymentCategory = require('../models/PaymentCategory');

exports.createCategory = async (req, res) => {
    try {
        const { categoryId, name, totalPrice } = req.body;

        if (!categoryId) {
            return res.status(400).json({ message: 'Category ID is required' });
        }

        const newCategory = new PaymentCategory({
            categoryId,
            name,
            totalPrice
        });

        const savedCategory = await newCategory.save();
        res.status(201).json({ 
            success: true,
            category: savedCategory,
            message: 'Category added successfully!'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: 'Category ID already exists' 
            });
        }
        console.error('Error adding payment category:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to add category'
        });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await PaymentCategory.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await PaymentCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, totalPrice } = req.body;
        const updatedCategory = await PaymentCategory.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                totalPrice,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ 
                success: false,
                message: 'Category not found' 
            });
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            category: updatedCategory
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error updating category', 
            error: error.message 
        });
    }
};

exports.toggleArchiveStatus = async (req, res) => {
    try {
        const category = await PaymentCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ 
                success: false,
                message: 'Category not found' 
            });
        }

        category.isArchived = !category.isArchived;
        await category.save();

        res.json({
            success: true,
            message: `Category ${category.isArchived ? 'archived' : 'unarchived'} successfully`,
            category
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error toggling archive status', 
            error: error.message 
        });
    }
};

exports.getActiveCategories = async (req, res) => {
    try {
        const activeCategories = await PaymentCategory.find({ isArchived: false })
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            categories: activeCategories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};