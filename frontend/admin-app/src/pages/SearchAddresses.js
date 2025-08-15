import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { Search, Group, Person } from '@mui/icons-material';
import axios from 'axios';

const SearchAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);

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
    }
  };

  const searchAddresses = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:5000/api/admin/addresses/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignGroups = (address) => {
    setSelectedAddress(address);
    setSelectedGroups(address.groups ? address.groups.map(g => g.group_id) : []);
    setOpenGroupDialog(true);
  };

  const handleSaveGroupAssignment = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`http://localhost:5000/api/admin/addresses/${selectedAddress.address_id}/groups`, {
        group_ids: selectedGroups
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the address in the local state
      setAddresses(addresses.map(addr => 
        addr.address_id === selectedAddress.address_id 
          ? { 
              ...addr, 
              groups: groups.filter(g => selectedGroups.includes(g.group_id))
            }
          : addr
      ));
      
      setOpenGroupDialog(false);
      setSelectedAddress(null);
    } catch (error) {
      console.error('Error assigning groups:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchAddresses();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Addresses
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Search across all user addresses and assign them to groups
      </Typography>

      <Box mb={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by name, email, phone, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={searchAddresses}
              disabled={!searchTerm.trim() || loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {addresses.map((address) => (
          <Grid item xs={12} md={6} lg={4} key={address.address_id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2">
                    {address.full_name}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Group />}
                    onClick={() => handleAssignGroups(address)}
                  >
                    Assign
                  </Button>
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
                
                <Box display="flex" alignItems="center" mt={2} mb={1}>
                  <Person fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Owner: {address.username}
                  </Typography>
                </Box>
                
                {address.groups && address.groups.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Groups:
                    </Typography>
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

      {addresses.length === 0 && searchTerm && !loading && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            No addresses found
          </Typography>
          <Typography color="text.secondary">
            Try different search terms
          </Typography>
        </Box>
      )}

      {!searchTerm && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            Enter search terms to find addresses
          </Typography>
          <Typography color="text.secondary">
            Search by name, email, phone, or company
          </Typography>
        </Box>
      )}

      <Dialog open={openGroupDialog} onClose={() => setOpenGroupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Groups to {selectedAddress?.full_name}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Groups</InputLabel>
            <Select
              multiple
              value={selectedGroups}
              onChange={(e) => setSelectedGroups(e.target.value)}
              input={<OutlinedInput label="Groups" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const group = groups.find(g => g.group_id === value);
                    return (
                      <Chip key={value} label={group?.group_name} size="small" />
                    );
                  })}
                </Box>
              )}
            >
              {groups.map((group) => (
                <MenuItem key={group.group_id} value={group.group_id}>
                  <Checkbox checked={selectedGroups.indexOf(group.group_id) > -1} />
                  <ListItemText primary={group.group_name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveGroupAssignment} variant="contained">
            Save Assignment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SearchAddresses;