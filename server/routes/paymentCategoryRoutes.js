const express = require('express');
const router = express.Router();
const paymentCategoryController = require('../controllers/paymentCategoryController');

router.post('/', paymentCategoryController.create);
router.get('/', paymentCategoryController.getAll);
router.get('/:id', paymentCategoryController.getById);
router.put('/:id', paymentCategoryController.update);

module.exports = router; 