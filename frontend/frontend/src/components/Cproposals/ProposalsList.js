import React, { useState, useEffect } from 'react';
import {
  Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Grid, Typography, Dialog,
  DialogActions, DialogContent, DialogTitle, TextField, IconButton, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { grey, red, blue, green } from '@mui/material/colors';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import ProposalForm from './ProposalForm';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { orange } from '@mui/material/colors';
import AddIcon from '@mui/icons-material/Add';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import WorkIcon from '@mui/icons-material/Work'; // For default type of work icon
import ConstructionIcon from '@mui/icons-material/Construction'; // For material supply
import PeopleIcon from '@mui/icons-material/People'; // For labor


const ProposalsList = () => {
  const [proposals, setProposals] = useState([]);
  const [editingProposal, setEditingProposal] = useState(null);
  const [showReadPage, setShowReadPage] = useState(true);
  const [openSendDialog, setOpenSendDialog] = useState(false);
  const [vendorDetails, setVendorDetails] = useState({ name: '', email: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // State for the filter option
  const [openProposalDialog, setOpenProposalDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const proposalsPerPage = 6;

  // Static vendors list to simulate selecting vendor names and emails
  const vendors = [
    { name: 'ELS Lanka ', email: 'els@elslanka.com' },
    { name: 'Zemilam Holdings', email: 'info@zemilam.lk' },
    { name: 'Senarath Group Company', email: 'info@senarathgroup.lk' },
    { name: 'Bnsha Hardware', email: 'info@bnshardware.lk' },
    { name: 'Sathuta Builders', email: 'sathuta@gmail.com' },
    { name: 'Free Lanka Granite', email: 'freelankagr@gmail.com' },
    { name: 'Tudawe Brothers', email: 'tudawebrothers.g@gmail.com' },
  ];

  // Fetch proposals from backend API when component mounts
  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await axios.get('http://localhost:8000/vp/proposals');
      setProposals(response.data);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const createProposal = async (proposal) => {
    try {
      await axios.post('http://localhost:8000/vp/proposals', proposal);
      fetchProposals();
      setShowReadPage(true);
      setOpenProposalDialog(false);
    } catch (error) {
      console.error('Error creating proposal:', error);
    }
  };

  const updateProposal = async (proposal) => {
    try {
      await axios.put(`http://localhost:8000/vp/proposals/${proposal._id}`, proposal);
      fetchProposals();
      setEditingProposal(null);
      setShowReadPage(true);
      setOpenProposalDialog(false);
    } catch (error) {
      console.error('Error updating proposal:', error);
    }
  };

  const deleteProposal = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/vp/proposals/${id}`);
      fetchProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const handleCreateClick = () => {
    setEditingProposal(null);
    setOpenProposalDialog(true); // Open the dialog for creating a proposal
  };

  const handleEditClick = (proposal) => {
    setEditingProposal(proposal);
    setOpenProposalDialog(true); // Open the dialog for editing a proposal
  };

  const handleCloseProposalDialog = () => {
    setOpenProposalDialog(false); // Close the dialog when cancelled
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return green[700];
      case 'Closed':
        return red[700];
      case 'Awarded':
        return blue[700];
      default:
        return grey[700];
    }
  };

  const downloadProposalPDF = (proposal) => {
    const doc = new jsPDF();
    const img = new Image();
    img.src = '/logofill.jpeg';

    img.onload = () => {
      doc.addImage(img, 'JPEG', 10, 10, 50, 30);
      doc.setLineWidth(1.5);
      doc.line(10, 50, 200, 50);

      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text('Proposal Details', 70, 60);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Proposal ID: ${proposal.proposalID}`, 20, 80);
      doc.text(`Site Code: ${proposal.sidecode}`, 20, 90);
      doc.text(`Submission Deadline: ${new Date(proposal.submissionDeadline).toLocaleDateString()}`, 20, 100);
      doc.text(`Evaluation Criteria: ${proposal.evaluationCriteria}`, 20, 110);
      doc.text(`Status: ${proposal.status}`, 20, 120);

      const workRows = proposal.works.map((work, index) => [
        index + 1,
        work.typeOfWork,
        `${work.quantity} ${work.unitOfMeasurement}`,
        work.description,
      ]);

      doc.autoTable({
        startY: 140,
        head: [['No.', 'Type of Work', 'Quantity', 'Description']],
        body: workRows,
      });

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by A-Arch Build Proposal System', 10, 290);

      doc.save(`Proposal_${proposal.proposalID}.pdf`);
    };

    img.onerror = () => {
      doc.setLineWidth(1.5);
      doc.line(10, 20, 200, 20);

      doc.setFontSize(20);
      doc.setTextColor(0, 0, 128);
      doc.text('Proposal Details', 70, 30);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Proposal ID: ${proposal.proposalID}`, 20, 50);
      doc.text(`Site Code: ${proposal.sidecode}`, 20, 60);
      doc.text(`Submission Deadline: ${new Date(proposal.submissionDeadline).toLocaleDateString()}`, 20, 70);
      doc.text(`Evaluation Criteria: ${proposal.evaluationCriteria}`, 20, 80);
      doc.text(`Status: ${proposal.status}`, 20, 90);

      const workRows = proposal.works.map((work, index) => [
        index + 1,
        work.typeOfWork,
        `${work.quantity} ${work.unitOfMeasurement}`,
        work.description,
      ]);

      doc.autoTable({
        startY: 110,
        head: [['No.', 'Type of Work', 'Quantity', 'Description']],
        body: workRows,
      });

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by A-Arch Build Proposal System', 10, 290);

      doc.save(`Proposal_${proposal.proposalID}.pdf`);
    };
  };

  const downloadFilteredProposalsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 128);
    doc.text('Filtered Proposals List', 20, 20);

    const proposalRows = filteredProposals.map((proposal, index) => [
      index + 1,
      proposal.proposalID,
      proposal.sidecode,
      new Date(proposal.submissionDeadline).toLocaleDateString(),
      proposal.evaluationCriteria,
      proposal.status,
    ]);

    doc.autoTable({
      startY: 40,
      head: [['No.', 'Proposal ID', 'Site Code', 'Submission Deadline', 'Evaluation Criteria', 'Status']],
      body: proposalRows,
    });

    doc.save('Filtered_Proposals_List.pdf');
  };

  const renderWorks = (works) => {
    return works.map((work, index) => (
      <Box key={index} sx={{ mb: 2, pl: 1, pr: 1, borderBottom: '1px solid #eee' }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {work.typeOfWork}
        </Typography>
        <Typography variant="body2">
          Quantity: {work.quantity} {work.unitOfMeasurement}
        </Typography>
        <Typography variant="body2">
          Description: {work.description}
        </Typography>
      </Box>
    ));
  };

  const handleSendClick = () => {
    setOpenSendDialog(true);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("access_key", "f0ca3991-e285-403e-95b0-827caf4349bf");
    formData.append("name", vendorDetails.name);
    formData.append("email", vendorDetails.email);
    formData.append("message", vendorDetails.message);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      }).then(res => res.json());

      if (res.success) {
        alert("Message sent successfully!");
        setOpenSendDialog(false);
      } else {
        console.error("Form submission failed:", res);
      }
    } catch (error) {
      console.error("Error during form submission:", error);
    }
  };

  const handleVendorNameChange = (event) => {
    const selectedVendor = vendors.find(vendor => vendor.name === event.target.value);
    setVendorDetails({
      ...vendorDetails,
      name: selectedVendor.name,
      email: selectedVendor.email
    });
  };

  // Filter proposals based on search term and filter status
  const filteredProposals = proposals.filter(proposal =>
    (proposal.proposalID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.sidecode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.evaluationCriteria.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === '' || proposal.status === filterStatus)
  );

  const indexOfLastProposal = currentPage * proposalsPerPage;
  const indexOfFirstProposal = indexOfLastProposal - proposalsPerPage;
  const currentProposals = filteredProposals.slice(indexOfFirstProposal, indexOfLastProposal);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const getWorkTypeIcon = (typeOfWork) => {
    switch (typeOfWork) {
      case 'Material Supply':
        return <ConstructionIcon sx={{ color: '#fffff' }} />; // Icon for material supply
      case 'Labour':
        return <PeopleIcon sx={{ color: '#fffff' }} />; // Icon for labor
      default:
        return <WorkIcon sx={{ color: '#fffff' }} />; // Default icon for other work types
    }
  };

  const renderProposals = (status) => {
    return (
      <Grid container spacing={3}>
        {currentProposals
          .filter((proposal) => proposal.status === status)
          .map((proposal) => (
            <Grid item xs={12} key={proposal._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': { boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)' },
                  transition: 'box-shadow 0.3s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  maxHeight: '420px'
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: '#211C4A', fontWeight: 900 }}>
                      {getWorkTypeIcon(proposal.works[0].typeOfWork)} {/* Assuming the first work type to show */}
                    </Avatar>
                  }
                  title={
                    <Box sx={{ fontSize: 18, fontWeight: 600 }}>
                      {proposal.sidecode || 'Unknown Site Code'}
                      <span
                        style={{
                          float: 'right',
                          fontSize: 15,
                          paddingTop: 4,
                          fontWeight: 900,
                          color: getStatusColor(proposal.status),
                        }}
                      >
                        {proposal.status || 'Unknown Status'}
                      </span>
                    </Box>
                  }
                />
                <CardContent
                  sx={{
                    padding: '16px',
                    textAlign: 'center',
                    borderTop: `2px solid ${getStatusColor(proposal.status)}`,
                    backgroundColor: grey[50],
                    height: 'auto',
                  }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    Proposal ID: {proposal.proposalID}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    Submission Deadline: {new Date(proposal.submissionDeadline).toLocaleDateString()}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    Evaluation Criteria: {proposal.evaluationCriteria}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                      Works
                    </Typography>
                    {renderWorks(proposal.works)}
                  </Box>
                </CardContent>
                <CardActions disableSpacing sx={{ padding: '8px 16px', justifyContent: 'space-between' }}>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"

                      onClick={() => handleEditClick(proposal)}
                      sx={{ color: 'white', minWidth: 'auto', padding: '4px 8px' }}
                    >
                      <EditIcon />
                    </Button>

                    {/* Delete Button with Start Icon */}
                    <Button
                      variant="contained"
                      color="error"

                      onClick={() => deleteProposal(proposal._id)}
                      sx={{ color: 'white', ml: 1, minWidth: 'auto', padding: '4px 8px' }}  // Adding margin to separate buttons
                    >
                      <DeleteIcon />
                    </Button>

                    {/* Download PDF Button with Start Icon */}
                    <Button
                      variant="contained"

                      onClick={() => downloadProposalPDF(proposal)}
                      sx={{ backgroundColor: orange[500], color: 'white', ml: 1, minWidth: 'auto', padding: '4px 8px' }}
                    >
                      <PictureAsPdfIcon />
                    </Button>

                  </Box>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SendIcon />}
                    onClick={handleSendClick}
                    sx={{ color: 'white' }}
                  >
                    Send
                  </Button>

                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>
    );
  };

  return (
    <div>
      {showReadPage ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Search Bar */}
            <TextField
              label="Search Proposals"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, mr: 2 }} // Full width with margin-right
            />

            {/* Status Filter */}
            <FormControl sx={{ minWidth: 200, mr: 2 }}>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status Filter"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
                <MenuItem value="Awarded">Awarded</MenuItem>
              </Select>
            </FormControl>

            {/* Create Proposal Button with start icon */}
            <Button
              variant="contained"
              startIcon={<AddIcon />} // Add icon for button
              onClick={handleCreateClick}
              sx={{
                minWidth: '200px',  // Adjust button width as needed
                backgroundColor: '#211C4A',  // Set background color
                '&:hover': {
                  backgroundColor: '#1A1736',  // Optional: Darker shade on hover
                },
                color: 'white'  // Set text color to white
              }}
            >
              Create 
            </Button>

          </Box>


          {/* Grid layout for Open, Closed, and Awarded sections in vertical format */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom sx={{ color: green[700] }}>
                Open Proposals
              </Typography>
              {renderProposals('Open')}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom sx={{ color: red[700] }}>
                Closed Proposals
              </Typography>
              {renderProposals('Closed')}
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom sx={{ color: blue[700] }}>
                Awarded Proposals
              </Typography>
              {renderProposals('Awarded')}
            </Grid>
          </Grid>

          {/* Download button for filtered proposals */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={downloadFilteredProposalsPDF}
            >
              Download
            </Button>
          </Box>
        </>
      ) : (
        <ProposalForm onSubmit={editingProposal ? updateProposal : createProposal} initialData={editingProposal} />
      )}

      <Dialog open={openSendDialog} onClose={() => setOpenSendDialog(false)}>
        <DialogTitle>Send Message to Vendor</DialogTitle>
        <form onSubmit={handleSendMessage}>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Vendor Name</InputLabel>
              <Select
                value={vendorDetails.name}
                onChange={handleVendorNameChange}
              >
                {vendors.map((vendor) => (
                  <MenuItem key={vendor.name} value={vendor.name}>
                    {vendor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Vendor Email"
              value={vendorDetails.email}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={vendorDetails.message}
              onChange={(e) => setVendorDetails({ ...vendorDetails, message: e.target.value })}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button type="submit" variant="contained" color="primary">
              Send Message
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openProposalDialog} onClose={handleCloseProposalDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingProposal ? 'Edit Proposal' : 'Create Proposal'}</DialogTitle>
        <DialogContent>
          <ProposalForm
            onSubmit={editingProposal ? updateProposal : createProposal}
            initialData={editingProposal}
            onCancel={handleCloseProposalDialog}
          />
        </DialogContent>
      </Dialog>


      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={Math.ceil(filteredProposals.length / proposalsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </div>
  );
};

export default ProposalsList;
