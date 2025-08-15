import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    nickname: '',
    phone: '',
    email: '',
    company: '',
    job_title: '',
    department: '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    facebook_link: '',
    instagram_link: '',
    linkedin_link: '',
    groups: []
  });

  useEffect(() => {
    fetchAddresses();
    fetchGroups();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingAddress 
        ? `http://localhost:5000/api/addresses/${editingAddress.address_id}`
        : 'http://localhost:5000/api/addresses';
      
      const method = editingAddress ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchAddresses();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/addresses/${addressId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
      }
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      full_name: address.full_name || '',
      first_name: address.first_name || '',
      last_name: address.last_name || '',
      nickname: address.nickname || '',
      phone: address.phone || '',
      email: address.email || '',
      company: address.company || '',
      job_title: address.job_title || '',
      department: address.department || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zip_code: address.zip_code || '',
      country: address.country || '',
      facebook_link: address.facebook_link || '',
      instagram_link: address.instagram_link || '',
      linkedin_link: address.linkedin_link || '',
      groups: address.groups || []
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAddress(null);
    setFormData({
      full_name: '',
      first_name: '',
      last_name: '',
      nickname: '',
      phone: '',
      email: '',
      company: '',
      job_title: '',
      department: '',
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      facebook_link: '',
      instagram_link: '',
      linkedin_link: '',
      groups: []
    });
  };

  const filteredAddresses = addresses.filter(address => {
    const matchesSearch = address.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         address.phone?.includes(searchTerm);
    
    if (!selectedGroup) return matchesSearch;
    
    return matchesSearch && address.groups?.some(group => group.group_id === parseInt(selectedGroup));
  });

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
          My Address Book
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Contact
        </Button>
      </Box>

      <Box mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Filter by Group"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">All Groups</option>
              {groups.map((group) => (
                <option key={group.group_id} value={group.group_id}>
                  {group.group_name}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {filteredAddresses.map((address) => (
          <Grid item xs={12} md={6} lg={4} key={address.address_id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" component="h2">
                    {address.full_name}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEdit(address)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(address.address_id)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                {address.job_title && (
                  <Typography color="text.secondary" gutterBottom>
                    {address.job_title} {address.company && `at ${address.company}`}
                  </Typography>
                )}
                
                {address.phone && (
                  <Typography variant="body2">
                    📞 {address.phone}
                  </Typography>
                )}
                
                {address.email && (
                  <Typography variant="body2">
                    ✉️ {address.email}
                  </Typography>
                )}
                
                {address.city && (
                  <Typography variant="body2">
                    📍 {address.city}{address.state && `, ${address.state}`}
                  </Typography>
                )}
                
                {address.groups && address.groups.length > 0 && (
                  <Box mt={2}>
                    {address.groups.map((group) => (
                      <Chip
                        key={group.group_id}
                        label={group.group_name}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredAddresses.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No contacts found
          </Typography>
          <Typography color="text.secondary">
            {searchTerm || selectedGroup ? 'Try adjusting your search or filter' : 'Add your first contact to get started'}
          </Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingAddress ? 'Edit Contact' : 'Add New Contact'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name *"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingAddress ? 'Update' : 'Add'} Contact
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Dashboard;