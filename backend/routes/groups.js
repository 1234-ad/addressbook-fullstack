const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all groups (for users to select when creating/editing addresses)
router.get('/', auth, async (req, res) => {
  try {
    const { search = '' } = req.query;
    
    let query = 'SELECT * FROM groups WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (group_name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY group_name ASC';

    const groups = await executeQuery(query, params);
    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get group details with member count
router.get('/:id', auth, async (req, res) => {
  try {
    const groups = await executeQuery(
      `SELECT g.*, COUNT(ag.address_id) as member_count
       FROM groups g
       LEFT JOIN address_groups ag ON g.group_id = ag.group_id
       WHERE g.group_id = ?
       GROUP BY g.group_id`,
      [req.params.id]
    );

    if (groups.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ group: groups[0] });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Get addresses in a specific group (for the current user)
router.get('/:id/addresses', auth, async (req, res) => {
  try {
    const addresses = await executeQuery(
      `SELECT a.* FROM addresses a
       JOIN address_groups ag ON a.address_id = ag.address_id
       WHERE ag.group_id = ? AND a.user_id = ?
       ORDER BY a.full_name ASC`,
      [req.params.id, req.user.userId]
    );

    res.json({ addresses });
  } catch (error) {
    console.error('Get group addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch group addresses' });
  }
});

module.exports = router;