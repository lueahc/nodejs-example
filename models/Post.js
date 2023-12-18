const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('posts', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    underscored: true // snake_case로 컬럼 생성
})

module.exports = Post;