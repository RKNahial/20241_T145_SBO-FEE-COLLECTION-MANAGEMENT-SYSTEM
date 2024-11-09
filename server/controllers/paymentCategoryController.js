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
            return res.status(404).json({
                success: false,
                message: 'Payment category not found'
            });
        }
        res.status(200).json({
            success: true,
            category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};