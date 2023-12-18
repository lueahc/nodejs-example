const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostToHashtag = sequelize.define('post_to_hashtag', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }
}, {
    underscored: true 
})

module.exports = PostToHashtag;