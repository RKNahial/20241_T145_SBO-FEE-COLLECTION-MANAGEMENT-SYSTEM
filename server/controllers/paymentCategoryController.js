// controllers/paymentCategoryController.js
const paymentCategoryService = require('../services/paymentCategoryService');

exports.createCategory = async (req, res) => {
    try {
        const savedCategory = await paymentCategoryService.createCategory(req.body);
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
        const categories = await paymentCategoryService.getAllCategories();
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
        const category = await paymentCategoryService.getCategoryById(req.params.id);
        res.json(category);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching category', 
            error: error.message 
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const updatedCategory = await paymentCategoryService.updateCategory(
            req.params.id,
            req.body
        );
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
        const category = await paymentCategoryService.toggleArchiveStatus(req.params.id);
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
        const activeCategories = await paymentCategoryService.getActiveCategories();
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