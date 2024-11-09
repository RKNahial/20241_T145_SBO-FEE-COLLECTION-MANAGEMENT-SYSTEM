// services/paymentCategoryService.js
const PaymentCategory = require('../models/PaymentCategory');

class PaymentCategoryService {
    async createCategory(categoryData) {
        try {
            // Check if category with same ID already exists
            const existingCategory = await PaymentCategory.findOne({ 
                categoryId: categoryData.categoryId 
            });
            
            if (existingCategory) {
                throw new Error('Category ID already exists');
            }

            const category = new PaymentCategory(categoryData);
            await category.save();
            return category;
        } catch (error) {
            throw error;
        }
    }

    async getAllCategories() {
        try {
            return await PaymentCategory.find({}).sort({ createdAt: -1 });
        } catch (error) {
            throw error;
        }
    }

    async getCategoryById(id) {
        try {
            return await PaymentCategory.findById(id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PaymentCategoryService();