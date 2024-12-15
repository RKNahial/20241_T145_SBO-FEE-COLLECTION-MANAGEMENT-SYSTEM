// services/paymentCategoryService.js
const PaymentCategory = require('../models/PaymentCategory');

class PaymentCategoryService {
    async createCategory(categoryData) {
        const { categoryId, name, totalPrice } = categoryData;
        
        if (!categoryId) {
            throw new Error('Category ID is required');
        }

        const newCategory = new PaymentCategory({
            categoryId,
            name,
            totalPrice
        });

        return await newCategory.save();
    }

    async getAllCategories() {
        return await PaymentCategory.find().sort({ createdAt: -1 });
    }

    async getCategoryById(id) {
        const category = await PaymentCategory.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }

    async updateCategory(id, updateData) {
        const { name, totalPrice } = updateData;
        const updatedCategory = await PaymentCategory.findByIdAndUpdate(
            id,
            { 
                name, 
                totalPrice,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!updatedCategory) {
            throw new Error('Category not found');
        }
        return updatedCategory;
    }

    async toggleArchiveStatus(id) {
        const category = await PaymentCategory.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }

        category.isArchived = !category.isArchived;
        await category.save();
        return category;
    }

    async getActiveCategories() {
        return await PaymentCategory.find({ isArchived: false })
            .sort({ createdAt: -1 });
    }
}

module.exports = new PaymentCategoryService();