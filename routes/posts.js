const express = require('express');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { Post, Comment, Hashtag, PostToCategory, PostToHashtag, Category } = require('../models');
const sequelize = require('../config/database');
const HttpException = require('../HttpException');
const asyncHandler = require('../utils/asyncHandler');

const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();



// 이미지 등록
const s3 = new S3Client({
    credentials: {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,  //버킷명
        // metadata: function (req, file, cb) {
        //     cb(null, { fieldName: file.fieldname });
        // },
        key: function (req, file, cb) {
            cb(null, file.originalname);
        },
    }),
});

router.post('/upload', upload.array('photos', 3), (req, res) => {
    res.send(req.files);
});



// 게시글 작성
router.post('/',
    body('title')
        .exists()
        .withMessage('제목 필수')
        .bail()
        .isLength({ min: 1, max: 15 })
        .withMessage('제목 1자 이상 15자 이하')
        .bail(),
    body('content')
        .exists()
        .withMessage('내용 필수')
        .bail()
        .isLength({ min: 1, max: 1000 })
        .withMessage('내용 1자 이상 1000자 이하'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            throw new HttpException(400, 'Validation Error');
        }

        const { title, content, categories, hashtags } = req.body;

        let blankPattern = /^\s+|\s+$/g;
        if (title.replace(blankPattern, '') === "") {
            throw new HttpException(400, '제목은 공백으로만 이루어질 수 없습니다.');
        }

        sequelize.transaction(async () => {
            const savedPost = await Post.create(
                {
                    title,
                    content
                });

            for (element of categories) {
                const savedCategory = await Category.findOne({ where: { id } })
                await PostToCategory.create(
                    {
                        postId: savedPost.dataValues.id,
                        categoryId: savedCategory.dataValues.id
                    })
            }

            for (element of hashtags) {
                const [savedHashtag, created] = await Hashtag.findOrCreate({
                    where: { name: element },
                })
                await PostToHashtag.create({
                    postId: savedPost.dataValues.id,
                    hashtagId: savedHashtag.dataValues.id
                })
            }

            return res.status(201).send(savedPost);
        })
    }))



// 게시글 검색
router.get('/search', asyncHandler(async (req, res) => {
    const keyword = req.query.keyword;

    const trimStr = keyword.replaceAll(' ', '');
    if (trimStr.length === 0) throw new HttpException(400, '키워드는 공백을 제외한 1글자 이상이어야 합니다.');

    const searchPost = await Post.findAll({
        where: {
            [Op.or]: [
                { title: { [Op.like]: `%${keyword}%` } },
                { content: { [Op.like]: `%${keyword}%` } }
            ]
        }
    });

    return res.status(200).send(searchPost);
}))



// 게시글 전체 조회
router.get('/', asyncHandler(async (req, res) => {
    let allPosts;
    const categoryId = req.query.categoryId;

    if (!categoryId) {
        allPosts = await Post.findAll({ order: [['created_at', 'desc']] }); // 이중배열 필수

        return res.status(200).send(allPosts);
    }

    allPosts = await Post.findAll({
        include: [{
            model: PostToCategory,
            where: { categoryId }
        },],
    }, { order: [['created_at', 'desc']] });

    return res.status(200).send(allPosts);
}))



// 특정 해시태그를 가진 게시글 전체 조회
router.get('/hashtag', asyncHandler(async (req, res) => {
    const hashtagName = req.query.hashtagName;

    const hashtag = await Hashtag.findOne({ where: { name: hashtagName } });
    const hashtagId = hashtag.dataValues.id;

    const allPosts = await Post.findAll({
        include: [{
            model: PostToHashtag,
            where: { hashtagId }
        },],
    },);

    return res.status(200).send(allPosts);
}))



// 특정 게시글 조회
router.get('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;

    const foundPost = await Post.findOne({
        include: [{
            model: PostToCategory,
            include: [{
                model: Category,
                attributes: ['name']
            }],
        },
        {
            model: PostToHashtag,
            include: [{
                model: Hashtag,
                attributes: ['name']
            }],
        },
        {
            model: Comment
        }],
        where: { id },
        //attributes: ['id', 'title', 'content', 'createdAt']
    });

    if (!foundPost) throw new HttpException(404, '게시글이 없습니다.');

    return res.status(200).send(foundPost);
}))



// 특정 게시글 수정
router.patch('/:id',
    body('title')
        .exists()
        .withMessage('제목 필수')
        .bail()
        .isLength({ min: 1, max: 15 })
        .withMessage('제목 1자 이상 15자 이하')
        .bail(),
    body('content')
        .exists()
        .withMessage('내용 필수')
        .bail()
        .isLength({ min: 1, max: 1000 })
        .withMessage('내용 1자 이상 1000자 이하'),
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            throw new HttpException(400, 'Validation Error');
        }

        const id = req.params.id;
        const { title, content } = req.body;

        let blank_pattern = /^\s+|\s+$/g;
        if (title.replace(blank_pattern, '') == "") {
            throw new HttpException(400, '제목은 공백으로만 이루어질 수 없습니다.');
        }

        sequelize.transaction(async () => {
            const updatedPostId = await Post.update({
                title,
                content
            }, {
                where: { id }
            });

            const updatedPost = await Post.findByPk(updatedPostId);

            return res.status(200).send(updatedPost);
        });
    }))



// 특정 게시글 삭제
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;

    const foundPost = await Post.findByPk(id);
    if (!foundPost) throw new HttpException(404, '게시글이 없습니다.');

    sequelize.transaction(async () => {
        await Comment.destroy({
            where: { postId: id }
        })
        await PostToCategory.destroy({
            where: { postId: id }
        })
        await PostToHashtag.destroy({
            where: { postId: id }
        })
        await Post.destroy({
            where: { id }
        })

        return res.status(204).send();
    })
}))

module.exports = router;