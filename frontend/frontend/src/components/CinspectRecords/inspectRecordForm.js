import React, { useState, useRef } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  IconButton,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import * as PANOLENS from 'panolens'; // Import PANOLENS for 360 image rendering
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudIcon from '@mui/icons-material/Cloud';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const InspectRecordForm = ({iTitle, iType, iDate, iTime, navigt}) => {
  const [inspectionTitle, setInspectionTitle] = useState(iTitle || '');
  const [inspectionType, setInspectionType] = useState(iType || '');
  const [inspectionDate, setInspectionDate] = useState(iDate || '');
  const [inspectionTime, setInspectionTime] = useState(iTime || '');
  const [weatherConditions, setWeatherConditions] = useState('');
  const [overallComplianceStatus, setOverallComplianceStatus] = useState('');
  const [issues, setIssues] = useState([{ issue: '', severityLevel: '' }]);
  const [images, setImages] = useState([]); 
  const [imageNames, setImageNames] = useState([]); 
  const [followUpNeeded, setFollowUpNeeded] = useState('');
  const [generalRemarks, setGeneralRemarks] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const apiUrl = 'http://localhost:8000/record/addRecord';
 
  const viewerRefs = useRef([]); // Array of refs for the 360 viewer containers

  // Initialize Panolens viewer
  const load360Image = (imageUrl, viewerIndex) => {
    // Clear previous viewer content if any
    if (viewerRefs.current[viewerIndex]) {
      viewerRefs.current[viewerIndex].innerHTML = ''; // Clear the previous content in the viewer
    }
  
    const panorama = new PANOLENS.ImagePanorama(imageUrl);
    const viewer = new PANOLENS.Viewer({ container: viewerRefs.current[viewerIndex] });
  
    viewer.add(panorama);
  };
  
  const handleIssueChange = (index, event) => {
    const updatedIssues = [...issues];
    updatedIssues[index][event.target.name] = event.target.value;
    setIssues(updatedIssues);
  };

  const handleAddIssue = () => {
    setIssues([...issues, { issue: '', severityLevel: '' }]);
    setImages([...images, null]);
    setImageNames([...imageNames, '']);
  };

  const handleRemoveIssue = (index) => {
    const updatedIssues = issues.filter((_, i) => i !== index);
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedImageNames = imageNames.filter((_, i) => i !== index);

    setIssues(updatedIssues);
    setImages(updatedImages);
    setImageNames(updatedImageNames);
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0]; // Select the first file
    if (file) {
      // Replace the image at the given index with the new one
      const updatedImages = [...images];
      const updatedImageNames = [...imageNames];
      
      updatedImages[index] = file; // Replace image
      updatedImageNames[index] = file.name; // Replace image name
  
      setImages(updatedImages); // Update state
      setImageNames(updatedImageNames); // Update state
  
      // Create a 360 view for the new image and load it into the corresponding viewer
      const imageUrl = URL.createObjectURL(file);
      load360Image(imageUrl, index); // Load 360 image into the correct viewer container
    }
  };
  
  const handleSubmit = () => {
    console.log('Inspection Title:', inspectionTitle);
    console.log('Inspection Type:', inspectionType);
    console.log('Inspection Date:', inspectionDate);
    console.log('Inspection Time:', inspectionTime);
    console.log('Weather Conditions:', weatherConditions);
    console.log('Overall Compliance Status:', overallComplianceStatus);
    console.log('Follow Up Needed:', followUpNeeded);

    // Check if all required fields are filled
    const isFormValid = [
      inspectionTitle, 
      inspectionType, 
      inspectionDate, 
      inspectionTime, 
      weatherConditions, 
      overallComplianceStatus, 
      followUpNeeded
    ].every(field => field.trim() !== '');

    if (!isFormValid) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (!/^[a-zA-Z]/.test(inspectionTitle)) {
        setFormError('Inspection title must start with a letter.');
        return;
    }

    setFormError('');
    setConfirmationMessage('Inspection record created successfully!');

    // Prepare form data with images
    const formData = new FormData();
    formData.append('inspectionTitle', inspectionTitle);
    formData.append('inspectionType', inspectionType);
    formData.append('inspectionDate', inspectionDate);
    formData.append('inspectionTime', inspectionTime);
    formData.append('weatherConditions', weatherConditions);
    formData.append('overallComplianceStatus', overallComplianceStatus);
    formData.append('followUpNeeded', followUpNeeded);
    formData.append('generalRemarks', generalRemarks);
    formData.append('issues', JSON.stringify(issues));

    // Append images
    images.forEach((image, index) => {
      if (image) {
        formData.append(`issueImages`, image);
      }
    });

    fetch(apiUrl, {
      method: 'POST',
      body: formData, // Send formData directly, no need for 'Content-Type' header
    })
      .then((res) => {
        if (res.ok) {
          setConfirmationMessage('Inspection record created successfully!');
          navigt()
        } else {
          alert('Unable to create record');
        }
      })
      .catch((error) => {
        console.error('Error occurred during submission:', error);
        alert('An unexpected error occurred. Please try again.');
      });
  };

  return (
    <Box
      component="form"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '600px',
        margin: 'auto',
      }}
    >
      <Typography variant="h5">Create Inspection Record</Typography>

      {/* Inspection Title Field */}
      <TextField
        label="Inspection Title"
        value={inspectionTitle}
        onChange={(e) => setInspectionTitle(e.target.value)}
        required
        InputProps={{
          startAdornment: <ReportProblemIcon color="action" />
        }}
      />

      {/* Accordion for collapsible form sections */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            label="Inspection Type"
            value={inspectionType}
            onChange={(e) => setInspectionType(e.target.value)}
            required
          />
          <TextField
            label="Inspection Date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
            required
            InputProps={{
              startAdornment: <CalendarTodayIcon color="action" />
            }}
          />
          <TextField
            label="Inspection Time"
            value={inspectionTime}
            onChange={(e) => setInspectionTime(e.target.value)}
            required
            InputProps={{
              startAdornment: <AccessTimeIcon color="action" />
            }}
          />
        </AccordionDetails>
      </Accordion>

      {/* Weather Conditions Dropdown */}
      <TextField
        label="Weather Conditions"
        select
        value={weatherConditions}
        onChange={(e) => setWeatherConditions(e.target.value)}
        required
        InputProps={{
          startAdornment: <CloudIcon color="action" />
        }}
      >
        <MenuItem value="Sunny">Sunny</MenuItem>
        <MenuItem value="Cloudy">Cloudy</MenuItem>
        <MenuItem value="Rainy">Rainy</MenuItem>
        <MenuItem value="Stormy">Stormy</MenuItem>
      </TextField>

      {/* Accordion for issues */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Issues</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {issues.map((issue, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={`Issue ${index + 1}`}
                name="issue"
                value={issue.issue}
                onChange={(e) => handleIssueChange(index, e)}
                required
                InputProps={{
                  startAdornment: <ReportProblemIcon color="action" />
                }}
              />

              {/* Image Upload Field for each issue */}
              <Button variant="contained" component="label">
                Upload Image
                <input
                  type="file"
                  hidden
                  onChange={(e) => handleImageChange(index, e)}
                />
              </Button>

              {/* Severity Level Field */}
              <TextField
                label="Severity Level"
                name="severityLevel"
                value={issue.severityLevel}
                onChange={(e) => handleIssueChange(index, e)}
                required
              />

              {/* 360-degree viewer container for each issue */}
              <Box
                ref={el => (viewerRefs.current[index] = el)} // Assign ref dynamically
                sx={{ width: '100%', height: '400px', marginTop: 2, border: '1px solid #ccc' }}
              />

              {/* Delete icon for removing the issue */}
              <IconButton onClick={() => handleRemoveIssue(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Add another issue button */}
          <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleAddIssue}>
            Add Another Issue
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* overallComplianceStatus Radio Group */}
      <FormControl>
        <FormLabel>Overall Compliance Status</FormLabel>
        <RadioGroup
          row
          value={overallComplianceStatus}
          onChange={(e) => setOverallComplianceStatus(e.target.value)}
        >
          <FormControlLabel value="Compliant" control={<Radio />} label="Compliant" />
          <FormControlLabel value="Non-compliant" control={<Radio />} label="Non-compliant" />
        </RadioGroup>
      </FormControl>

      {/* Follow-Up Needed Radio Group */}
      <FormControl>
        <FormLabel>Follow-Up Needed</FormLabel>
        <RadioGroup
          row
          value={followUpNeeded}
          onChange={(e) => setFollowUpNeeded(e.target.value)}
        >
          <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="No" control={<Radio />} label="No" />
        </RadioGroup>
      </FormControl>

      {/* General Remarks */}
      <TextField
        label="General Remarks"
        value={generalRemarks}
        onChange={(e) => setGeneralRemarks(e.target.value)}
      />

      {/* Error message display */}
      {formError && <Typography color="error">{formError}</Typography>}

      {/* Submit button */}
      <Button variant="contained" onClick={handleSubmit}>
        Submit
      </Button>

      {/* Confirmation message */}
      {confirmationMessage && <Typography color="success">{confirmationMessage}</Typography>}
    </Box>
  );
};

export default InspectRecordForm;
