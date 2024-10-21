import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, FormControl, Select, InputLabel, Container, Typography, FormLabel, FormControlLabel, RadioGroup, Radio, Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { red } from '@mui/material/colors';

// Function to generate a random Proposal ID
const generateProposalID = () => {
  return `PROP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Function to calculate the date 10 days ahead
const getDefaultSubmissionDeadline = () => {
    const today = new Date();
    today.setDate(today.getDate() + 10);
    return today.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
};

const ProposalForm = ({ onSubmit, initialData, onCancel }) => {
    const [formData, setFormData] = useState({
        sidecode: '',
        proposalID: generateProposalID(), // Automatically generated Proposal ID
        works: [
            {
                typeOfWork: '',
                quantity: '',
                unitOfMeasurement: '',
                description: ''
            }
        ],
        submissionDeadline: getDefaultSubmissionDeadline(),
        evaluationCriteria: '',
        status: 'Open',
        ...initialData // Load initial data if provided (for editing)
    });

    const sideCodes = ['SITE-VGG', 'SITE-Y8H', 'SITE-MXC']; // Sample side codes
    const evaluationCriteriaOptions = ['Cost', 'Time', 'Quality', 'Experience'];

    useEffect(() => {
        if (initialData) {
            setFormData({ ...formData, ...initialData });
        }
    }, [initialData]);

    const handleChange = (e, index) => {
        const { name, value } = e.target;
        const updatedWorks = [...formData.works];
        
        if (name === 'quantity' && value < 0) {
            // Prevent negative values
            updatedWorks[index] = { ...updatedWorks[index], [name]: 0 };
        } else {
            updatedWorks[index] = { ...updatedWorks[index], [name]: value };
        }

        setFormData({ ...formData, works: updatedWorks });
    };

    const handleAddWork = () => {
        setFormData({
            ...formData,
            works: [...formData.works, { typeOfWork: '', quantity: '', unitOfMeasurement: '', description: '' }]
        });
    };

    const handleEvaluationCriteriaChange = (event) => {
        const { value } = event.target;
        setFormData({
            ...formData,
            evaluationCriteria: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handleRemoveWork = (index) => {
        const updatedWorks = formData.works.filter((_, i) => i !== index);
        setFormData({ ...formData, works: updatedWorks });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        setFormData({
            sidecode: '',
            proposalID: generateProposalID(),
            works: [{ typeOfWork: '', quantity: '', unitOfMeasurement: '', description: '' }],
            submissionDeadline: getDefaultSubmissionDeadline(),
            evaluationCriteria: '',
            status: 'Open',
        });
    };

    return (
        <Container>
            <Typography variant="h4">Proposal Form</Typography>
            <form onSubmit={handleSubmit}>
             <FormControl fullWidth margin="normal">
                    <InputLabel>Side Code</InputLabel>
                    <Select
                        name="sidecode"
                        value={formData.sidecode}
                        onChange={(e) => setFormData({ ...formData, sidecode: e.target.value })}
                        required
                    >
                        {sideCodes.map((code) => (
                            <MenuItem key={code} value={code}>
                                {code}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    name="proposalID"
                    label="Proposal ID"
                    value={formData.proposalID}
                    fullWidth
                    margin="normal"
                    disabled
                />

                {formData.works.map((work, index) => (
                    <Box key={index} sx={{ border: '1px solid #ddd', padding: 2, borderRadius: 2, mb: 2 }}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Type of Work</InputLabel>
                            <Select
                                name="typeOfWork"
                                value={work.typeOfWork}
                                onChange={(e) => handleChange(e, index)}
                            >
                                <MenuItem value="Material Supply">Material Supply</MenuItem>
                                <MenuItem value="Labor">Labor</MenuItem>
                                <MenuItem value="Equipment Rental">Equipment Rental</MenuItem>
                                <MenuItem value="Subcontracting">Subcontracting</MenuItem>
                                <MenuItem value="Other">Other (Specify)</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            name="quantity"
                            label="Quantity"
                            type="number"
                            value={work.quantity}
                            onChange={(e) => handleChange(e, index)}
                            fullWidth
                            margin="normal"
                            required
                            inputProps={{ min: 0 }} // Prevent negative values in input
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Unit of Measurement</InputLabel>
                            <Select
                                name="unitOfMeasurement"
                                value={work.unitOfMeasurement}
                                onChange={(e) => handleChange(e, index)}
                            >
                                <MenuItem value="Lots">Lots</MenuItem>
                                <MenuItem value="Tons">Tons</MenuItem>
                                <MenuItem value="Units">Units</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            name="description"
                            label="Description"
                            value={work.description}
                            onChange={(e) => handleChange(e, index)}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={3}
                            required
                        />
                        {index > 0 && (
                            <IconButton onClick={() => handleRemoveWork(index)} sx={{ color: red[500] }}>
                                <DeleteIcon />
                            </IconButton>
                        )}
                        
                    </Box>
                ))}

                <Button startIcon={<AddIcon />} variant="outlined" color="primary" onClick={handleAddWork} sx={{ mb: 2 }}>
                    Add Another Work
                </Button>

                <TextField
                    name="submissionDeadline"
                    label="Submission Deadline"
                    type="date"
                    value={formData.submissionDeadline}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    disabled
                />
                <TextField
                    name="evaluationCriteria"
                    label="Evaluation Criteria"
                    value={formData.evaluationCriteria}
                    onChange={(e) => setFormData({ ...formData, evaluationCriteria: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                />
                <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">Status</FormLabel>
                    <RadioGroup
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        row
                    >
                        <FormControlLabel value="Open" control={<Radio style={{ color: '#4CAF50' }} />} label="Open" />
                        <FormControlLabel value="Closed" control={<Radio style={{ color: '#F44336' }} />} label="Closed" />
                        <FormControlLabel value="Awarded" control={<Radio style={{ color: '#2196F3' }} />} label="Awarded" />
                    </RadioGroup>
                </FormControl>

                <Box sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
                        {initialData ? 'Update' : 'Create'}
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                </Box>
            </form>
        </Container>
    );
};

export default ProposalForm;
