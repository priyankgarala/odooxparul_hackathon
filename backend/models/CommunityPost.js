const communityPostTable = {
  tableName: 'community_posts',
  columns: [
    'id',
    'user_id',
    'author_name',
    'author_photo',
    'title',
    'content',
    'type',
    'country',
    'region',
    'related_name',
    'rating',
    'created_at',
    'updated_at',
  ],
};

module.exports = communityPostTable;
