const tripTable = {
  tableName: 'trips',
  jsonColumns: ['sections', 'cities', 'packing_checklist', 'notes'],
  columns: [
    'id',
    'user_id',
    'title',
    'description',
    'country',
    'start_date',
    'end_date',
    'cover_image',
    'is_public',
    'share_id',
    'sections',
    'cities',
    'packing_checklist',
    'notes',
    'created_at',
    'updated_at',
  ],
};

module.exports = tripTable;
