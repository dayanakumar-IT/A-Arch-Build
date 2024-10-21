import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Paper,
  IconButton,
  Box,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineContent,
  TimelineConnector,
} from '@mui/lab';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SearchIcon from '@mui/icons-material/Search';
import DisplayRecordsWith360View from './DisplayRecordsWith360View';  // Assuming this is your 360-degree viewer component
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import deleteImage from '../assets/recordDelete.png'; // Make sure to replace with your image path
import EditInspectionRecord from './EditInspectionRecord';

const apiUrl = 'http://localhost:8000/inspection';


const MorganInspectionsDashboard = ({setInsRecord}) => {
  const [inspections, setInspections] = useState([]);
  const [filteredInspections, setFilteredInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const response = await fetch(`${apiUrl}/inspection/createinspection`);
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        console.log(data);

        // Filter inspections where the assignee is 'Morgan'
        const morganInspections = data.filter(
          (inspection) => inspection.assignee.toLowerCase() === 'morgan'
        );

        setInspections(morganInspections);
        setFilteredInspections(morganInspections); // Initialize with all inspections
      } catch (error) {
        console.error('Error fetching inspections:', error);
      }
    };

    fetchInspections();
  }, []);


  const handleViewClick = async (inspectionTitle) => {
    try {
        // Make an API call to fetch records where the title matches the inspection title
        const response = await fetch(`http://localhost:8000/record/records/title/${inspectionTitle}`);
        if (!response.ok) throw new Error('Error fetching the records');

        const records = await response.json();
        console.log(records); // Log the matched records for debugging

        // Set the matched records and open the modal
        setSelectedRecords(records);
        setOpenModal(true);  // Open the modal
        
        } catch (error) {
            console.error('Error fetching the inspection records:', error);
        }
  };


  const handlePdfClick = (id) => {
    window.location.href = `/download-report/${id}`;
  };

  const handleSearchChange = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);

    const filtered = inspections.filter(
      (inspection) =>
        inspection.ititle.toLowerCase().includes(searchValue) ||
        inspection.itype.toLowerCase().includes(searchValue) ||
        inspection.location.toLowerCase().includes(searchValue)
    );

    setFilteredInspections(filtered);
  };

  const handleEditClick = (inspectionTitle) => {
    setSelectedRecordId(inspectionTitle); // Set the selected inspection title
    setIsEditModalOpen(true); // Open the edit modal
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false); // Close the modal
    setSelectedRecordId(null); // Clear the selected inspection title
  };
  
   // Handle delete button click to open the confirmation dialog
   const handleOpenDeleteDialog = (recordId) => {
    setRecordIdToDelete(recordId); // Set the recordId to be deleted
    setOpenDeleteDialog(true); // Open the dialog
  };
  
    // Handle Yes click to delete the record
    const handleDeleteClick = async () => {
      try {
          const response = await fetch(`http://localhost:8000/record/records/${recordIdToDelete}`, {
              method: 'DELETE',
          });

          if (!response.ok) {
              throw new Error('Failed to delete record');
          }

          // Update the UI by removing the deleted record
          setSelectedRecords((prevRecords) =>
              prevRecords ? prevRecords.filter((record) => record._id !== recordIdToDelete) : []
          );

          setFilteredInspections((prevInspections) =>
              prevInspections.map((inspection) => ({
                  ...inspection,
                  records: inspection.records
                      ? inspection.records.filter((record) => record._id !== recordIdToDelete)
                      : [], // Safeguard against undefined records
              }))
          );

          console.log('Record deleted successfully');
          setOpenDeleteDialog(false); // Close dialog after deletion
      } catch (error) {
          console.error('Error deleting record:', error);
      }
  };

  // Handle Cancel click to close the dialog
  const handleCloseDeleteDialog = () => {
      setOpenDeleteDialog(false); // Close the dialog without deleting
  };


  

  const totalInspections = inspections.length;
  const completedInspections = inspections.filter((i) => i.status === 'completed').length;
  const pendingInspections = totalInspections - completedInspections;

  return (
    <Container>
      {/* Statistics Overview */}
      <Box sx={{ my: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: '#E3F2FD' }}>
              <Typography variant="h6">Total Inspections</Typography>
              <Typography variant="h4">{totalInspections}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: '#C8E6C9' }}>
              <Typography variant="h6">Completed Inspections</Typography>
              <Typography variant="h4">{completedInspections}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: '#FFCDD2' }}>
              <Typography variant="h6">Pending Inspections</Typography>
              <Typography variant="h4">{pendingInspections}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Search Field */}
      <Box sx={{ mb: 4 }}>
        <TextField
          label="Search by Name, Type, or Location"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Timeline with Google Maps Thumbnails */}
      <Timeline style={{ transition: 'all 0.3s ease-in-out' }}>
        {filteredInspections.map((inspection) => (
          <TimelineItem key={inspection._id} style={{ transition: 'transform 0.2s ease-in-out', transform: `scale(${searchTerm ? 1.05 : 1})` }}>
            <TimelineOppositeContent>
              <Typography variant="body2" color="textSecondary">
                {inspection.idate} - {inspection.itime}
              </Typography>
              {/* Map Thumbnail */}
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
                  inspection.location
                )}&zoom=14&size=200x100&maptype=roadmap&markers=color:red%7C${encodeURIComponent(
                  inspection.location
                )}&key=${googleMapsApiKey}`}
                alt="Site location"
                style={{ width: '100%', height: 'auto', borderRadius: '8px', marginTop: '8px' }}
              />
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary" />
              <TimelineConnector style={{ backgroundColor: '#FFD700' }} />
            </TimelineSeparator>
            <TimelineContent>
              <Paper elevation={3} style={{ padding: '16px', backgroundColor: '#E3F2FD' }}>
                <Typography variant="h6" color="primary">{inspection.ititle}</Typography>
                <Typography variant="body2">{inspection.projectname}</Typography>
                <Typography variant="body2">Type: {inspection.itype}</Typography>
                <Typography variant="body2">Location: {inspection.location}</Typography>
                <Typography variant="body2">Complexity: {inspection.projectcomplexity}</Typography>

                {/* Action Icons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <IconButton 
                    color="primary" 
                    onClick={() => {
                      setInsRecord({
                        section: 'CreateRecord',
                        iTitle: inspection.ititle,
                        iType: inspection.itype,
                        iDate: inspection.idate,
                        iTime: inspection.itime
                      });
                    }}>
                    <AddCircleIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleViewClick(inspection.ititle)}>
                    <VisibilityIcon />
                  </IconButton>

                  <IconButton style={{ color: '#FF5722' }} onClick={() => handlePdfClick(inspection._id)}>
                    <PictureAsPdfIcon />
                  </IconButton>
                </div>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

              {/* Modal to display matched records */}
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          maxWidth="lg"
          fullWidth={true}
          PaperProps={{
            style: { width: '90vw', maxWidth: '900px' },
          }}
        >
          <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  Inspection Records for {selectedRecords.length > 0 ? selectedRecords[0].inspectionTitle : ''}

  {/* Edit and Delete Icons in the top-right corner */}
  <Box style={{ display: 'flex', gap: '10px' }}> {/* Added gap for spacing */}
    {/* Edit Button */}
    <IconButton
       onClick={() => handleEditClick(selectedRecords[0]?.inspectionTitle)}  // Use selectedRecords to get the record ID
      style={{
        backgroundColor: '#e0f7fa', // Light blue background
        borderRadius: '50%',        // Circular shape
        padding: '10px',            // Padding inside the circle
      }}
    >
      <EditIcon style={{ color: '#00796b' }} /> {/* Icon color */}
    </IconButton>

    {/* Delete Button */}
    <IconButton
      onClick={() => handleOpenDeleteDialog(selectedRecords[0]?._id)} // Ensure that record ID is passed correctly
      style={{
        backgroundColor: '#ffebee', // Light red background
        borderRadius: '50%',        // Circular shape
        padding: '10px',            // Padding inside the circle
      }}
    >
      <DeleteIcon style={{ color: '#d32f2f' }} /> {/* Icon color */}
    </IconButton>
  </Box>
</DialogTitle>


           {/* Delete Confirmation Dialog */}
           <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog} // Close dialog when clicked outside
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Delete Record</DialogTitle>
                <DialogContent>
                    {/* Centered image */}
                    <Box display="flex" justifyContent="center" mb={2}>
                        <img src={deleteImage} alt="Delete confirmation" style={{ maxWidth: '150px' }} />
                    </Box>
                    <Typography variant="body1" id="delete-dialog-description" align="center">
                        Do you really want to delete this record?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    {/* Cancel button */}
                    <Button
                        onClick={handleCloseDeleteDialog}
                        variant="outlined"
                        startIcon={<CancelIcon />}
                    >
                        Cancel
                    </Button>

                    {/* Yes (Confirm) button */}
                    <Button
                        onClick={handleDeleteClick}
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

             {/* Edit Inspection Record Modal */}
            <EditInspectionRecord
              open={isEditModalOpen}
              handleClose={handleCloseEditModal}
              inspectionTitle={selectedRecordId} // Pass the selected record ID to the modal
            />

          <DialogContent>
            {selectedRecords.length > 0 ? (
              <DisplayRecordsWith360View records={selectedRecords} /> // Render records and 360 view here
            ) : (
              <Typography>No records found for this inspection</Typography>
            )}
          </DialogContent>
          
        </Dialog>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          © 2024 Morgan's Inspection Dashboard. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
};

export default MorganInspectionsDashboard;
