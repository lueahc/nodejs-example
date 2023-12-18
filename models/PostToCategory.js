const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostToCategory = sequelize.define('post_to_category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }
}, {
    underscored: true 
})

module.exports = PostToCategory;