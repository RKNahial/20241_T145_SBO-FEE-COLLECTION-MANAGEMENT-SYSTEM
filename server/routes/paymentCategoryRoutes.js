const express = require('express');
const router = express.Router();
const { 
    createCategory, 
    getAllCategories, 
    getActiveCategories,
    getCategoryById,
    updateCategory,
    toggleArchiveStatus 
} = require('../controllers/paymentCategoryController');


// Status-specific Routes
router.get('/payment-categories/active', getActiveCategories);

// General Category Routes
router.get('/payment-categories', getAllCategories);
router.get('/payment-categories/:id', getCategoryById);
router.post('/payment-categories', createCategory);
router.put('/payment-categories/:id', updateCategory);
router.put('/payment-categories/:id/toggle-archive', toggleArchiveStatus);

// Payment Fee Routes

module.exports = router;