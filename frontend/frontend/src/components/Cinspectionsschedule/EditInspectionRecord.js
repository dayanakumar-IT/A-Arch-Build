import React, { useState, useRef, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton,
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudIcon from '@mui/icons-material/Cloud'; // Icon for weather
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Icon for compliance
import FeedbackIcon from '@mui/icons-material/Feedback'; // Icon for follow-up
import NoteIcon from '@mui/icons-material/Note'; // Icon for general remarks
import * as PANOLENS from 'panolens'; // Import PANOLENS for 360 image rendering

const EditInspectionRecord = ({ open, handleClose, inspectionTitle }) => {
  const [inspectionType, setInspectionType] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionTime, setInspectionTime] = useState('');
  const [weatherConditions, setWeatherConditions] = useState('');
  const [overallComplianceStatus, setOverallComplianceStatus] = useState('');
  const [issues, setIssues] = useState([{ issue: '', severityLevel: '', imagePath: '' }]);
  const [images, setImages] = useState([]);
  const [imageNames, setImageNames] = useState([]);
  const [followUpNeeded, setFollowUpNeeded] = useState('');
  const [generalRemarks, setGeneralRemarks] = useState('');
  const viewerRefs = useRef([]);
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    if (inspectionTitle) {
      const fetchRecordByTitle = async () => {
        try {
          const response = await fetch(`http://localhost:8000/record/records/title/${inspectionTitle}`);
          if (!response.ok) throw new Error(`Error fetching record: ${response.statusText}`);
          const data = await response.json();
          if (data.length > 0) {
            const record = data[0];
            setRecordId(record._id);
            setInspectionType(record.inspectionType);
            setInspectionDate(record.inspectionDate);
            setInspectionTime(record.inspectionTime);
            setWeatherConditions(record.weatherConditions);
            setOverallComplianceStatus(record.overallComplianceStatus);
            setIssues(record.issues || []);
            setFollowUpNeeded(record.followUpNeeded);
            setGeneralRemarks(record.generalRemarks);
            const baseUrl = 'http://localhost:8000/record/uploads';
            setImages(record.issues.map(issue => `${baseUrl}${issue.imagePath}`));
          } else {
            throw new Error('No records found for this title');
          }
        } catch (error) {
          console.error('Error fetching record:', error);
        }
      };

      fetchRecordByTitle();
    }
  }, [inspectionTitle]);

  useEffect(() => {
    issues.forEach((issue, index) => {
      if (issue.imagePath) {
        const imageUrl = `http://localhost:8000/record/${issue.imagePath}`;
        load360Image(imageUrl, index);
      }
    });
  }, [issues]);

  const load360Image = (imageUrl, viewerIndex) => {
    if (viewerRefs.current[viewerIndex]) {
      viewerRefs.current[viewerIndex].innerHTML = ''; 
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

  const handleImageChange = (index, e) => {
    const file = e.target.files[0]; 
    if (file) {
      const updatedImages = [...images];
      const updatedImageNames = [...imageNames];
      updatedImages[index] = file;
      updatedImageNames[index] = file.name;
      setImages(updatedImages);
      setImageNames(updatedImageNames);
      const imageUrl = URL.createObjectURL(file);
      load360Image(imageUrl, index);
    }
  };

  const handleSaveChanges = async () => {
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

    images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append(`issueImages`, image);
      }
    });

    if (inspectionTitle) {
      try {
        const response = await fetch(`http://localhost:8000/record/records/title/${inspectionTitle}`, {
          method: 'PUT',
          body: formData,
        });

        if (response.ok) {
          alert('Record updated successfully');
          handleClose();
        } else {
          alert('Failed to update record');
        }
      } catch (error) {
        console.error('Error updating record:', error);
      }
    } else {
      console.error("No inspection title found for updating");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Inspection Record</DialogTitle>
      <DialogContent sx={{ backgroundColor: '#F5F5F5', padding: '20px' }}>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Inspection Title"
            value={inspectionTitle}
            disabled
            required
            sx={{ marginBottom: '16px' }}
          />

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ marginBottom: '16px' }}>
              <Typography variant="h6">Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="Inspection Type"
                value={inspectionType}
                onChange={(e) => setInspectionType(e.target.value)}
                required
                sx={{ marginBottom: '16px' }}
              />
              <TextField
                label="Inspection Date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ marginBottom: '16px' }}
              />
              <TextField
                label="Inspection Time"
                type="time"
                value={inspectionTime}
                onChange={(e) => setInspectionTime(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                sx={{ marginBottom: '16px' }}
              />
              <FormControl fullWidth sx={{ marginBottom: '16px' }}>
                <TextField
                  select
                  label="Weather Conditions"
                  value={weatherConditions}
                  onChange={(e) => setWeatherConditions(e.target.value)}
                  required
                >
                  <MenuItem value="Sunny">Sunny</MenuItem>
                  <MenuItem value="Cloudy">Cloudy</MenuItem>
                  <MenuItem value="Rainy">Rainy</MenuItem>
                  <MenuItem value="Stormy">Stormy</MenuItem>
                </TextField>
              </FormControl>
            </AccordionDetails>
          </Accordion>

          <FormControl sx={{ marginBottom: '16px' }}>
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

          <FormControl sx={{ marginBottom: '16px' }}>
            <FormLabel>Follow-up Needed</FormLabel>
            <RadioGroup
              row
              value={followUpNeeded}
              onChange={(e) => setFollowUpNeeded(e.target.value)}
            >
              <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="No" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>

          <TextField
            label="General Remarks"
            value={generalRemarks}
            onChange={(e) => setGeneralRemarks(e.target.value)}
            sx={{ marginBottom: '16px' }}
          />

          {issues.map((issue, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={`Issue ${index + 1}`}
                name="issue"
                value={issue.issue}
                onChange={(e) => handleIssueChange(index, e)}
                required
              />
              <Button variant="contained" component="label" sx={{ marginBottom: '16px' }}>
                Upload Image
                <input type="file" hidden onChange={(e) => handleImageChange(index, e)} />
              </Button>
              <TextField
                label="Severity Level"
                name="severityLevel"
                value={issue.severityLevel}
                onChange={(e) => handleIssueChange(index, e)}
                required
              />
              <Box
                ref={el => (viewerRefs.current[index] = el)}
                sx={{ width: '100%', height: '400px', marginTop: '16px', border: '1px solid #ccc' }}
              />
              <IconButton onClick={() => console.log('Delete Issue')} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ backgroundColor: '#D32F2F', color: '#FFF' }}>Cancel</Button>
        <Button onClick={handleSaveChanges} sx={{ backgroundColor: '#00796B', color: '#FFF' }}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInspectionRecord;
