const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, getCategoryById } = require('../controllers/paymentCategoryController');

router.post('/payment-categories', createCategory);
router.get('/payment-categories', getAllCategories);
router.get('/payment-categories/:id', getCategoryById);

module.exports = router;