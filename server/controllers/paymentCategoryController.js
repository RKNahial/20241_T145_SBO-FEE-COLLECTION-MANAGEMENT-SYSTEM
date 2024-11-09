const PaymentCategoryService = require('../services/paymentCategoryService');

class PaymentCategoryController {
    async create(req, res) {
        try {
            const result = await PaymentCategoryService.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAll(req, res) {
        try {
            const categories = await PaymentCategoryService.getAll();
            res.status(200).json(categories);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const category = await PaymentCategoryService.getById(req.params.id);
            res.status(200).json(category);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const updated = await PaymentCategoryService.update(req.params.id, req.body);
            res.status(200).json(updated);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    
}

module.exports = new PaymentCategoryController(); 