const express = require('express');
const router = express.Router();
const { Category } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');



// 카테고리 생성
router.post('/', asyncHandler(async (req, res) => {
    const categoryName = req.body.categoryName;

    sequelize.transaction(async () => {
        const [savedCategory, created] = await Category.findOrCreate({
            where: { name: categoryName },
            defaults: { name: categoryName }
        });

        return res.status(201).send(savedCategory);
    });
}))



// 전체 카테고리 조회
router.get('/', asyncHandler(async (req, res) => {
    const allCategories = await Category.findAll();

    return res.status(200).send(allCategories);
}))

module.exports = router;