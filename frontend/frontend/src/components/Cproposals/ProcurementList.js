import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, Grid, IconButton, TextField, Pagination, Modal, FormControl, Select, MenuItem, InputLabel, TextareaAutosize, Chip, ButtonBase, Snackbar, Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import pendingIcon from '../assets/pending-icon.jpg';
import completedIcon from '../assets/completed-icon.avif';
import overdueIcon from '../assets/overdue-icon.avif';

const ProcurementList = ({createformprocu}) => {
  const [procurements, setProcurements] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [currentProcurement, setCurrentProcurement] = useState(null);
  const location = useLocation();
  const [paymentStatus, setPaymentStatus] = useState('');

  // Snackbar state for alerts
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Default to success

  useEffect(() => {
    fetchProcurements();
  }, [page, search, paymentStatus, location.key]);

  const fetchProcurements = async () => {
    try {
      const res = await axios.get('http://localhost:8000/pr/procurements', {
        params: { page, search, paymentStatus },
      });
      setProcurements(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusClick = (status) => {
    setPaymentStatus(status);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this procurement?");
    if (!confirmed) return; // Exit if the user cancels the deletion

    try {
      await axios.delete(`http://localhost:8000/pr/procurements/${id}`);
      setSnackbarMessage('Procurement deleted successfully!');
      setSnackbarSeverity('error'); // Set severity to error for deletion
      setSnackbarOpen(true);
      fetchProcurements();
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Failed to delete procurement!');
      setSnackbarSeverity('error'); // Indicate an error
      setSnackbarOpen(true);
    }
  };

  const handleEdit = (procurement) => {
    setCurrentProcurement(procurement);
    setOpenModal(true);
  };

  const handleChange = (e) => {
    setCurrentProcurement({
      ...currentProcurement,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/pr/procurements/${currentProcurement._id}`, currentProcurement);
      setSnackbarMessage('Procurement updated successfully!');
      setSnackbarOpen(true);
      setOpenModal(false);
      fetchProcurements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary" fontWeight="bold" sx={{ color: '#051094' }}>
        Procurement List
      </Typography>

      {/* Payment Status Filter Circles */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
        <ButtonBase
          sx={{
            backgroundColor: '#FFA726',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 1,
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
          }}
          onClick={() => handleStatusClick('Pending')}
        >
          <img src={pendingIcon} alt="Pending" style={{ width: 24, marginBottom: 5 }} />
          Pending
        </ButtonBase>

        <ButtonBase
          sx={{
            backgroundColor: '#66BB6A',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 1,
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
          }}
          onClick={() => handleStatusClick('Completed')}
        >
          <img src={completedIcon} alt="Completed" style={{ width: 24, marginBottom: 5 }} />
          Completed
        </ButtonBase>

        <ButtonBase
          sx={{
            backgroundColor: '#EF5350',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 1,
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
          }}
          onClick={() => handleStatusClick('Overdue')}
        >
          <img src={overdueIcon} alt="Overdue" style={{ width: 24, marginBottom: 5 }} />
          Overdue
        </ButtonBase>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search by Procurement ID, Vendor ID, etc."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ marginRight: 1 }} />,
          }}
          sx={{ width: '60%' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={createformprocu}
        >
          Create New Procurement
        </Button>

      </Box>

      {/* Procurement Cards */}
      <Grid container spacing={3}>
        {procurements.map((procurement) => (
          <Grid item xs={12} md={6} lg={4} key={procurement._id}>
            <Card elevation={3} sx={{ padding: 3, borderRadius: 3, borderColor: '#0f2557', border: '1px solid' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#051094' }}>
                  Procurement ID: {procurement.procurementId}
                </Typography>
                <Typography variant="body1">Vendor ID: {procurement.vendorId}</Typography>
                <Typography variant="body1">Invoice Number: {procurement.invoiceNumber}</Typography>
                <Typography variant="body1">Payment Terms: {procurement.paymentTerms}</Typography>
                <Chip
                  label={procurement.paymentStatus}
                  color={procurement.paymentStatus === 'Completed' ? 'success' : procurement.paymentStatus === 'Overdue' ? 'error' : 'warning'}
                  sx={{ mt: 1 }}
                />
              </CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <Button
                  variant="outlined"
                  sx={{ color: '#075e86', borderColor: '#075e86' }}
                  onClick={() => handleEdit(procurement)}
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
                <IconButton
                  color="secondary"
                  onClick={() => handleDelete(procurement._id)}
                  aria-label="delete"
                  sx={{ color: 'red' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Modal for Editing Procurement */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ ...modalStyle, width: 800 }}>
          <Box sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
            padding: '20px',
            borderRadius: '8px 8px 0 0',
            color: 'white',
            textAlign: 'center'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Edit Procurement
            </Typography>
          </Box>
          {currentProcurement && (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ padding: 2 }}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Procurement ID"
                    name="procurementId"
                    value={currentProcurement.procurementId}
                    onChange={handleChange}
                    required
                    InputProps={{ readOnly: true }} // Disable editing
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Proposal ID</InputLabel>
                    <Select
                      name="proposalId"
                      value={currentProcurement.proposalId}
                      onChange={handleChange}
                      required
                    >
                     <MenuItem value="Proposal 1">PROP-1729378329846-2135</MenuItem>
                        <MenuItem value="Proposal 2">PROP-1729379117190-1282</MenuItem>
                        <MenuItem value="Proposal 3">PROP-1729378953058-3371</MenuItem>
                        <MenuItem value="Proposal 4">PROP-1729379167800-5224</MenuItem>
                        <MenuItem value="Proposal 5">PROP-1729378791216-2325</MenuItem>
                        <MenuItem value="Proposal 6">PROP-1729379203217-6943</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Vendor ID</InputLabel>
                    <Select
                      name="vendorId"
                      value={currentProcurement.vendorId}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="ELS Lanka">ELS Lanka</MenuItem>
                        <MenuItem value="Zemilam Holdings">Zemilam Holdings</MenuItem>
                        <MenuItem value="Bnsha Hardware">Bnsha Hardware</MenuItem>
                        <MenuItem value="Sathuta Builders">Sathuta Builders</MenuItem>
                        <MenuItem value="Free Lanka Granite">Free Lanka Granite</MenuItem>
                        <MenuItem value="Tudawe Brothers">Tudawe Brothers</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Invoice Number"
                    name="invoiceNumber"
                    value={currentProcurement.invoiceNumber}
                    onChange={handleChange}
                    required
                    InputProps={{ readOnly: true }} // Disable editing
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      name="paymentStatus"
                      value={currentProcurement.paymentStatus}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Overdue">Overdue</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Payment Terms"
                    name="paymentTerms"
                    value={currentProcurement.paymentTerms}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={8}> {/* Larger text area spanning two columns */}
                  <TextareaAutosize
                    aria-label="Notes"
                    placeholder="Notes (optional)"
                    name="notes"
                    value={currentProcurement.notes}
                    onChange={handleChange}
                    minRows={4}
                    style={{ width: '100%', padding: '8px', marginTop: '8px', borderRadius: '4px', borderColor: 'lightgray' }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <Button type="submit" variant="contained" color="primary" sx={{ marginRight: 2 }}>
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={() => setOpenModal(false)}>
                  Cancel
                </Button>
              </Box>
            </form>
          )}
        </Box>
      </Modal>

      {/* Snackbar for Edit/Delete Alerts */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default ProcurementList;
