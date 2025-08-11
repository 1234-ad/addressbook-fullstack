const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all groups (admin view with statistics)
router.get('/groups', adminAuth, async (req, res) => {
  try {
    const groups = await executeQuery(
      `SELECT g.*, 
              COUNT(ag.address_id) as member_count,
              l.username as created_by_username
       FROM groups g
       LEFT JOIN address_groups ag ON g.group_id = ag.group_id
       LEFT JOIN login l ON g.created_by = l.login_id
       GROUP BY g.group_id
       ORDER BY g.created_at DESC`
    );

    res.json({ groups });
  } catch (error) {
    console.error('Admin get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create new group
router.post('/groups', [
  adminAuth,
  body('group_name').notEmpty().trim().escape(),
  body('description').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { group_name, description } = req.body;

    // Check if group name already exists
    const existing = await executeQuery(
      'SELECT * FROM groups WHERE group_name = ?',
      [group_name]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Group name already exists' });
    }

    const result = await executeQuery(
      'INSERT INTO groups (group_name, description, created_by) VALUES (?, ?, ?)',
      [group_name, description, req.user.userId]
    );

    res.status(201).json({
      message: 'Group created successfully',
      groupId: result.insertId
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group
router.put('/groups/:id', [
  adminAuth,
  body('group_name').notEmpty().trim().escape(),
  body('description').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { group_name, description } = req.body;

    // Check if group exists
    const existing = await executeQuery(
      'SELECT * FROM groups WHERE group_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Check if new name conflicts with existing group
    const nameConflict = await executeQuery(
      'SELECT * FROM groups WHERE group_name = ? AND group_id != ?',
      [group_name, req.params.id]
    );

    if (nameConflict.length > 0) {
      return res.status(400).json({ error: 'Group name already exists' });
    }

    await executeQuery(
      'UPDATE groups SET group_name = ?, description = ? WHERE group_id = ?',
      [group_name, description, req.params.id]
    );

    res.json({ message: 'Group updated successfully' });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/groups/:id', adminAuth, async (req, res) => {
  try {
    const result = await executeQuery(
      'DELETE FROM groups WHERE group_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Search addresses across all users
router.get('/addresses/search', adminAuth, async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!q.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q}%`;
    const addresses = await executeQuery(
      `SELECT a.*, l.username as owner_username,
              GROUP_CONCAT(g.group_name) as groups
       FROM addresses a
       JOIN login l ON a.user_id = l.login_id
       LEFT JOIN address_groups ag ON a.address_id = ag.address_id
       LEFT JOIN groups g ON ag.group_id = g.group_id
       WHERE a.full_name LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ? OR a.phone LIKE ?
       GROUP BY a.address_id
       ORDER BY a.full_name ASC
       LIMIT ? OFFSET ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [{ total }] = await executeQuery(
      `SELECT COUNT(*) as total FROM addresses a
       WHERE a.full_name LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ? OR a.phone LIKE ?`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );

    res.json({
      addresses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin search addresses error:', error);
    res.status(500).json({ error: 'Failed to search addresses' });
  }
});

// Assign address to groups (admin function)
router.post('/addresses/:addressId/groups', [
  adminAuth,
  body('group_ids').isArray().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { addressId } = req.params;
    const { group_ids } = req.body;

    // Check if address exists
    const address = await executeQuery(
      'SELECT * FROM addresses WHERE address_id = ?',
      [addressId]
    );

    if (address.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Remove existing group assignments for this address
    await executeQuery(
      'DELETE FROM address_groups WHERE address_id = ?',
      [addressId]
    );

    // Add new group assignments
    if (group_ids.length > 0) {
      const assignments = group_ids.map(groupId => [addressId, groupId, req.user.userId]);
      await executeQuery(
        'INSERT INTO address_groups (address_id, group_id, added_by) VALUES ?',
        [assignments]
      );
    }

    res.json({
      message: 'Address group assignments updated successfully',
      assignedGroups: group_ids.length
    });
  } catch (error) {
    console.error('Admin assign groups error:', error);
    res.status(500).json({ error: 'Failed to assign groups' });
  }
});

// Get dashboard statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [totalUsers] = await executeQuery(
      'SELECT COUNT(*) as count FROM login WHERE role = "user"'
    );
    
    const [totalAddresses] = await executeQuery(
      'SELECT COUNT(*) as count FROM addresses'
    );
    
    const [totalGroups] = await executeQuery(
      'SELECT COUNT(*) as count FROM groups'
    );
    
    const [totalAssignments] = await executeQuery(
      'SELECT COUNT(*) as count FROM address_groups'
    );

    // Recent activity
    const recentAddresses = await executeQuery(
      `SELECT a.full_name, a.created_at, l.username
       FROM addresses a
       JOIN login l ON a.user_id = l.login_id
       ORDER BY a.created_at DESC
       LIMIT 5`
    );

    res.json({
      statistics: {
        totalUsers: totalUsers.count,
        totalAddresses: totalAddresses.count,
        totalGroups: totalGroups.count,
        totalAssignments: totalAssignments.count
      },
      recentActivity: recentAddresses
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;