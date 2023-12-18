const express = require('express');
const router = express.Router();
const { Comment } = require('../models');
const sequelize = require('../config/database');
const asyncHandler = require('../utils/asyncHandler');



// 댓글 작성
router.post('/', asyncHandler(async (req, res) => {
    const { content, postId } = req.body;

    sequelize.transaction(async () => {
        const savedComment = await Comment.create({
            content,
            postId
        });

        return res.status(201).send(savedComment);
    })
}))



// 특정 댓글 삭제
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;

    sequelize.transaction(async () => {
        await Comment.destroy({
            where: { id }
        })

        return res.status(204).send();
    })
}))

module.exports = router;