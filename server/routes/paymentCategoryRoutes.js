const express = require('express');
const router = express.Router();
const { 
    createCategory, 
    getAllCategories, 
    getCategoryById,
    updateCategory,
    toggleArchiveStatus 
} = require('../controllers/paymentCategoryController');

// Payment Category Routes
router.post('/payment-categories', createCategory);
router.get('/payment-categories', getAllCategories);
router.get('/payment-categories/:id', getCategoryById);
router.put('/payment-categories/:id', updateCategory);
router.put('/payment-categories/:id/toggle-archive', toggleArchiveStatus);

module.exports = router;