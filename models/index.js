const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Category = require('./Category');
const Hashtag = require('./Hashtag');
const PostToCategory = require('./PostToCategory');
const PostToHashtag = require('./PostToHashtag');

Post.hasMany(Comment, {
    foreignKey: 'postId',
    allowNull: false,
    // constraints: true, onDelete: 'cascade',
});
Comment.belongsTo(Post, { foreignKey: 'postId' });

Post.hasMany(PostToCategory, { foreignKey: 'postId' });
PostToCategory.belongsTo(Post, { foreignKey: 'postId' });
Category.hasMany(PostToCategory, { foreignKey: 'categoryId' });
PostToCategory.belongsTo(Category, { foreignKey: 'categoryId' });

Post.hasMany(PostToHashtag, { foreignKey: 'postId' });
PostToHashtag.belongsTo(Post, { foreignKey: 'postId' });
Hashtag.hasMany(PostToHashtag, { foreignKey: 'hashtagId' });
PostToHashtag.belongsTo(Hashtag, { foreignKey: 'hashtagId' });

module.exports = {
    User,
    Post,
    Comment,
    Category,
    Hashtag,
    PostToCategory,
    PostToHashtag
}