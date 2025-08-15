import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  IconButton,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, People } from '@mui/icons-material';
import axios from 'axios';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    group_name: '',
    description: ''
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/admin/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingGroup 
        ? `http://localhost:5000/api/admin/groups/${editingGroup.group_id}`
        : 'http://localhost:5000/api/admin/groups';
      
      const method = editingGroup ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchGroups();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleDelete = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This will remove all address associations.')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`http://localhost:5000/api/admin/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      group_name: group.group_name,
      description: group.description || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGroup(null);
    setFormData({
      group_name: '',
      description: ''
    });
  };

  const fetchGroupAddresses = async (groupId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.length;
    } catch (error) {
      console.error('Error fetching group addresses:', error);
      return 0;
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Group Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Create Group
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create and manage groups to organize addresses
      </Typography>

      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} md={6} lg={4} key={group.group_id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2">
                    {group.group_name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(group)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(group.group_id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                {group.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {group.description}
                  </Typography>
                )}
                
                <Box display="flex" alignItems="center" gap={1}>
                  <People fontSize="small" />
                  <Typography variant="body2">
                    {group.address_count || 0} addresses
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Created: {new Date(group.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {groups.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No groups found
          </Typography>
          <Typography color="text.secondary">
            Create your first group to start organizing addresses
          </Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingGroup ? 'Edit Group' : 'Create New Group'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              fullWidth
              variant="outlined"
              value={formData.group_name}
              onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingGroup ? 'Update' : 'Create'} Group
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Groups;