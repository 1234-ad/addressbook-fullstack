const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all addresses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, GROUP_CONCAT(g.group_name) as groups
      FROM addresses a
      LEFT JOIN address_groups ag ON a.address_id = ag.address_id
      LEFT JOIN groups g ON ag.group_id = g.group_id
      WHERE a.user_id = ?
    `;
    
    const params = [req.user.userId];

    if (search) {
      query += ` AND (a.full_name LIKE ? OR a.phone LIKE ? OR a.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` GROUP BY a.address_id ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const addresses = await executeQuery(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM addresses WHERE user_id = ?';
    const countParams = [req.user.userId];

    if (search) {
      countQuery += ` AND (full_name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [{ total }] = await executeQuery(countQuery, countParams);

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
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Get single address by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const addresses = await executeQuery(
      `SELECT a.*, GROUP_CONCAT(g.group_id) as group_ids, GROUP_CONCAT(g.group_name) as groups
       FROM addresses a
       LEFT JOIN address_groups ag ON a.address_id = ag.address_id
       LEFT JOIN groups g ON ag.group_id = g.group_id
       WHERE a.address_id = ? AND a.user_id = ?
       GROUP BY a.address_id`,
      [req.params.id, req.user.userId]
    );

    if (addresses.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ address: addresses[0] });
  } catch (error) {
    console.error('Get address error:', error);
    res.status(500).json({ error: 'Failed to fetch address' });
  }
});

// Create new address
router.post('/', [
  auth,
  body('full_name').notEmpty().trim().escape(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      full_name, first_name, last_name, nickname, phone, email,
      company, job_title, department, street, city, state,
      zip_code, country, facebook_link, instagram_link, linkedin_link,
      group_ids = []
    } = req.body;

    // Insert address
    const result = await executeQuery(
      `INSERT INTO addresses (
        user_id, full_name, first_name, last_name, nickname, phone, email,
        company, job_title, department, street, city, state, zip_code, country,
        facebook_link, instagram_link, linkedin_link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId, full_name, first_name, last_name, nickname, phone, email,
        company, job_title, department, street, city, state, zip_code, country,
        facebook_link, instagram_link, linkedin_link
      ]
    );

    const addressId = result.insertId;

    // Assign to groups if provided
    if (group_ids.length > 0) {
      const groupAssignments = group_ids.map(groupId => [addressId, groupId, req.user.userId]);
      await executeQuery(
        'INSERT INTO address_groups (address_id, group_id, added_by) VALUES ?',
        [groupAssignments]
      );
    }

    res.status(201).json({
      message: 'Address created successfully',
      addressId,
      assignedGroups: group_ids.length
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

// Update address
router.put('/:id', [
  auth,
  body('full_name').notEmpty().trim().escape(),
  body('phone').optional().trim(),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      full_name, first_name, last_name, nickname, phone, email,
      company, job_title, department, street, city, state,
      zip_code, country, facebook_link, instagram_link, linkedin_link,
      group_ids = []
    } = req.body;

    // Check if address belongs to user
    const existing = await executeQuery(
      'SELECT * FROM addresses WHERE address_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Update address
    await executeQuery(
      `UPDATE addresses SET
        full_name = ?, first_name = ?, last_name = ?, nickname = ?, phone = ?, email = ?,
        company = ?, job_title = ?, department = ?, street = ?, city = ?, state = ?,
        zip_code = ?, country = ?, facebook_link = ?, instagram_link = ?, linkedin_link = ?,
        updated_at = NOW()
       WHERE address_id = ? AND user_id = ?`,
      [
        full_name, first_name, last_name, nickname, phone, email,
        company, job_title, department, street, city, state,
        zip_code, country, facebook_link, instagram_link, linkedin_link,
        req.params.id, req.user.userId
      ]
    );

    // Update group assignments
    await executeQuery('DELETE FROM address_groups WHERE address_id = ?', [req.params.id]);
    
    if (group_ids.length > 0) {
      const groupAssignments = group_ids.map(groupId => [req.params.id, groupId, req.user.userId]);
      await executeQuery(
        'INSERT INTO address_groups (address_id, group_id, added_by) VALUES ?',
        [groupAssignments]
      );
    }

    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await executeQuery(
      'DELETE FROM addresses WHERE address_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;