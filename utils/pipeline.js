// utils/pipeline.js

const pipeline = [
    {
        $match: { product_discount: { $ne: 0 } }
    },
    {
        $lookup: {
            from: 'categories',
            localField: 'product_cat',
            foreignField: '_id',
            as: 'category'
        }
    },
    {
        $unwind: '$category'
    },
    {
        $project: {
            _id: 1,
            product_name: 1,
            product_name_ar: 1,
            product_desc: 1,
            product_desc_ar: 1,
            image: 1,
            product_count: 1,
            product_active: 1,
            product_price: 1,
            product_discount: 1,
            product_date: 1,
            category_name: '$category.category_name',
            category_name_ar: '$category.category_name_ar',
            category_image: '$category.image',
            category_datetime: '$category.category_datetime'
        }
    }
];

module.exports = pipeline;
