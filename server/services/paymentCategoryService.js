const PaymentCategory = require('../models/PayementCategory');

class PaymentCategoryService {
    async create(data) {
        return await PaymentCategory.create(data);
    }

    async getAll() {
        return await PaymentCategory.find({ status: 'notArchive' });
    }

    async getById(id) {
        return await PaymentCategory.findById(id);
    }

    async update(id, data) {
        return await PaymentCategory.findByIdAndUpdate(id, data, { new: true });
    }

   
}

module.exports = new PaymentCategoryService(); 