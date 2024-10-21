import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextareaAutosize,
    Box,
    Typography,
    Paper,
    Snackbar,
    Alert
} from '@mui/material';
import { styled } from '@mui/system';
import backgroundVideo from '../assets/ProcurementCreate.mp4'; // Update with your actual video path

// Styled Video Container
const VideoContainer = styled(Box)(({ theme }) => ({
    height: '200px', // Adjust height as needed
    position: 'relative',
    borderRadius: '8px 8px 0 0', // Rounded top corners
    overflow: 'hidden', // Ensure rounded corners
}));

const CreateProcurement = ({getprolist}) => {
    const [formData, setFormData] = useState({
        procurementId: generateProcurementId(), // Auto-generate a unique Procurement ID
        proposalId: '', // Dropdown for Proposal ID
        vendorId: '', // Dropdown for Vendor ID
        paymentStatus: 'Pending',
        invoiceNumber: generateInvoiceNumber(), // Auto-generate a 7-character Invoice Number
        paymentTerms: '', // Payment terms to be selected
        notes: '',
    });

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Function to generate a random unique Procurement ID
    function generateProcurementId() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Only alphanumeric characters
        let result = 'PCID'; // Start with 'PCID'
        for (let i = 0; i < 4; i++) { // Adjust length as needed (4 characters after 'PCID')
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    function generateInvoiceNumber() {
        const year = new Date().getFullYear(); // Get current year
        const sequentialNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Generate a random number between 000 and 999
        return `INV-${year}-${sequentialNumber}`; // Format: INV-YYYY-XXX
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/pr/procurements', formData);
            setSnackbarOpen(true);
            setTimeout(() => {
                getprolist()
            }, 2000);
        } catch (err) {
            console.error(err);
            setError('An error occurred while creating the procurement.');
        }
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 600, margin: 'auto', padding: 3, borderRadius: 4, mt: 4 }}>
            <VideoContainer>
                <video
                    src={backgroundVideo} // Path to your video file
                    autoPlay
                    loop
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Adjust the video to cover the container
                />
            </VideoContainer>
            <Typography variant="h4" gutterBottom align="center" color="primary" fontWeight="bold">
                Create Procurement
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" paragraph>
                Fill out the details below to add a new procurement.
            </Typography>

            {error && (
                <Typography variant="body2" color="error" paragraph>
                    {error}
                </Typography>
            )}

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Procurement ID"
                    name="procurementId"
                    value={formData.procurementId} // Auto-generated
                    InputProps={{
                        readOnly: true, // Prevent manual editing
                    }}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Proposal ID</InputLabel>
                    <Select
                        name="proposalId"
                        value={formData.proposalId}
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
                <FormControl fullWidth margin="normal">
                    <InputLabel>Vendor ID</InputLabel>
                    <Select
                        name="vendorId"
                        value={formData.vendorId}
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
                <FormControl fullWidth margin="normal">
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleChange}
                        required
                    >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Overdue">Overdue</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Invoice Number"
                    name="invoiceNumber"
                    value={formData.invoiceNumber} // Auto-generated
                    InputProps={{
                        readOnly: true, // Prevent manual editing
                    }}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Payment Terms</InputLabel>
                    <Select
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleChange}
                        required
                    >
                        <MenuItem value="Net payment in 30 days">Net payment in 30 days</MenuItem>
                        <MenuItem value="Net payment in 60 days">Net payment in 60 days</MenuItem>
                        <MenuItem value="Net payment in 90 days">Net payment in 90 days</MenuItem>
                        <MenuItem value="Due on receipt">Due on receipt</MenuItem>
                        <MenuItem value="Cash in advance">Cash in advance</MenuItem>
                    </Select>
                </FormControl>
                <TextareaAutosize
                    aria-label="Notes"
                    placeholder="Add any additional notes (optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    minRows={4}
                    style={{ width: '100%', padding: '8px', marginTop: '16px', borderRadius: '4px', borderColor: 'lightgray' }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 3 }}
                    fullWidth
                >
                    Create Procurement
                </Button>
            </form>

            {/* Snackbar for success notification */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    Procurement created successfully!
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default CreateProcurement;
