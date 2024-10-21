import React, { useState } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Box,
} from '@mui/material';
import { AddCircle, Mic, MicOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';

export default function ProgressForm({site_code, location_name, onSuccess_Progress, onSuccessProgress}) {
  const [activeStep, setActiveStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState('observations');
  const navigate = useNavigate();
  const locationHook = useLocation();
  const initialData = locationHook.state ? locationHook.state.progress : {};




  const [sitecode, setSitecode] = useState(initialData.sitecode || site_code || '');
  const [location, setLocation] = useState(initialData.location || location_name || '');


  const [basicInfo, setBasicInfo] = useState({
    date: initialData.date
      ? new Date(initialData.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    weather: initialData.weather
      ? Array.isArray(initialData.weather)
        ? typeof initialData.weather[0] === 'string' && initialData.weather[0].startsWith('[')
          ? JSON.parse(initialData.weather[0]) // Parse the stringified array inside the array
          : initialData.weather // Use it directly if already in array format
        : JSON.parse(initialData.weather) // Parse if it's a string
      : [], // Default to empty array if no weather data
  });
  
  

  const [workforceDetails, setWorkforceDetails] = useState(
    initialData.workforceDetails || [
      { teamName: '', workhrs: '', tasksdone: [''], taskstatus: '' }
    ]
  );

  const [equipmentDetails, setEquipmentDetails] = useState(
    initialData.equipmentDetails || [
      { equiptype: '', usedhrs: '' }
    ]
  );

  const [observationsAndComments, setObservationsAndComments] = useState({
  observations: initialData.observations || '',
  conditions: initialData.conditions || null, // Pre-fill with initialData.conditions if available
  comments: initialData.comments || '',
});


  const [entryId] = useState(initialData._id || null);
  const [error, setError] = useState('');

  const steps = ['Basic Information', 'Workforce Details', 'Equipment Details', 'Observations & Comments'];

  const weatherOptions = [
    'Sunny', 'Cloudy', 'Rainy', 'Windy', 'Thunderstorms', 'Humid', 'Showers',
    'Partly Cloudy', 'Misty', 'Hot and Dry', 'Intermittent Rain', 'Heavy Rain'
  ];

  const teamOptions = [
    'Masonry Team', 'Carpentry Team', 'Electrical Team', 'Plumbing Team',
    'HVAC Team', 'Roofing Team', 'Concrete Works Team', 'Steel/Metal Works Team'
  ];

  const taskOptions = [
    'All wall constructions for the assigned area today', 'Applying plaster to interior walls and columns',
    'Installing door and window frames in designated sections', 'Building temporary wooden structures for concrete pouring',
    'Electrical wiring installation in the targeted area', 'Installing circuit breakers and electrical panels',
    'Main water pipes installation for the allocated sections', 'Fixing and testing drainage pipes in the designated area',
    'The ductwork installation across the assigned area', 'Installing air conditioning units and testing ventilation systems',
    'All planned roof shingles for the day', 'Installing waterproof membranes under roofing tiles',
    'The concrete slab for the designated space', 'Pouring and leveling concrete for foundation footings',
    "The installation of steel structures as per today's plan", 'Welding and securing steel beams in the designated area'
  ];

  const equipmentOptions = [
    'Excavator', 'Bulldozer', 'Crane', 'Concrete Mixer',
    'Drilling Machine', 'Welding Machine', 'Forklift', 'Scaffolding', 'Generator', 'Ladder'
  ];

  const handleBasicInfoChange = (event) => {
    const { name, value } = event.target;
    setBasicInfo({ ...basicInfo, [name]: value });
  };

  const handleWeatherChange = (event) => {
    const { value } = event.target;
    const currentIndex = basicInfo.weather.indexOf(value);
    const newWeather = [...basicInfo.weather];
    if (currentIndex === -1) {
      newWeather.push(value);
    } else {
      newWeather.splice(currentIndex, 1);
    }
    setBasicInfo({ ...basicInfo, weather: newWeather });
  };

  const handleWorkforceChange = (index, field, value) => {
    const newWorkforceDetails = [...workforceDetails];
    newWorkforceDetails[index][field] = value;
    setWorkforceDetails(newWorkforceDetails);
  };

  const addTeam = () => {
    setWorkforceDetails([...workforceDetails, { teamName: '', workhrs: '', tasksdone: [''], taskstatus: '' }]);
  };

  const handleTeamTasksChange = (teamIndex, taskIndex, value) => {
    const newWorkforceDetails = [...workforceDetails];
    newWorkforceDetails[teamIndex].tasksdone[taskIndex] = value;
    setWorkforceDetails(newWorkforceDetails);
  };

  const addTeamTask = (teamIndex) => {
    const newWorkforceDetails = [...workforceDetails];
    newWorkforceDetails[teamIndex].tasksdone.push('');
    setWorkforceDetails(newWorkforceDetails);
  };

  const handleEquipmentChange = (index, field, value) => {
    const newEquipmentDetails = [...equipmentDetails];
    newEquipmentDetails[index][field] = value;
    setEquipmentDetails(newEquipmentDetails);
  };

  const addEquipment = () => {
    setEquipmentDetails([...equipmentDetails, { equiptype: '', usedhrs: '' }]);
  };

  const handleObservationsChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'conditions') {
      setObservationsAndComments({ ...observationsAndComments, [name]: files[0] });
    } else {
      setObservationsAndComments({ ...observationsAndComments, [name]: value });
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition. Please use Google Chrome.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setObservationsAndComments((prev) => ({
        ...prev,
        [activeField]: `${prev[activeField]} ${speechToText}`.trim(),
      }));
    };
    recognition.onerror = () => {
      alert('Error with speech recognition. Please try again.');
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!basicInfo.weather.length) {
          setError('Please select at least one weather condition.');
          return false;
        }
        return true;
      case 1:
        for (const team of workforceDetails) {
          if (!team.teamName || !team.workhrs || !team.tasksdone.every((task) => task.trim()) || !team.taskstatus) {
            setError('Please fill in all the fields for each team.');
            return false;
          }
        }
        return true;
      case 2:
        for (const equipment of equipmentDetails) {
          if (!equipment.equiptype || !equipment.usedhrs) {
            setError('Please fill in all the fields for each equipment.');
            return false;
          }
        }
        return true;
      case 3:
        if (
          !observationsAndComments.observations.trim() || 
          !observationsAndComments.comments.trim() || 
          (!observationsAndComments.conditions && !initialData.conditions)
        ) {
          setError('Please fill in all the fields and upload a site picture.');
          return false;
        }
        return true;
      default:
        return false;
    }
  };
  

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError('');
  };

  const handleSubmit = () => {
    if (validateStep(activeStep)) {
      const formData = new FormData();
      formData.append('sitecode', sitecode);
      formData.append('location', location);
      formData.append('date', basicInfo.date);
      formData.append('weather', JSON.stringify(basicInfo.weather));
      formData.append('workforceDetails', JSON.stringify(workforceDetails));
      formData.append('equipmentDetails', JSON.stringify(equipmentDetails));
      formData.append('observations', observationsAndComments.observations);
      formData.append('comments', observationsAndComments.comments);
      if (observationsAndComments.conditions) {
        formData.append('conditions', observationsAndComments.conditions);
      }
  
      const url = entryId
        ? `http://localhost:8000/daily/progress/${entryId}`
        : 'http://localhost:8000/daily/progress';
      const method = entryId ? 'PUT' : 'POST';
  
      fetch(url, { method, body: formData })
        .then((response) => {
          // Check if the response is OK
          if (!response.ok) {
            // Server responded, but with an error status (like 400, 500)
            throw new Error(`Error: ${response.statusText}`);
          }
          // Parse the response JSON if OK
          return response.json();
        })
        .then((data) => {
          console.log('Success:', data);  // Log the successful data for debugging
          onSuccessProgress();  // Navigate to ProgressList
        })
        .catch((error) => {
          console.error('Failed to save the entry:', error);  // Log the actual error
          setError('Failed to save the entry.');  // Set error message to display in UI
        });
    }
  };
  
  

  const handleViewProgress = () => {
    navigate('/quality-assurance');
    onSuccessProgress();

  };

  const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
    alternativeLabel: { top: 22 },
    active: { '& .MuiStepConnector-line': { backgroundColor: '#0f2557' } },
    completed: { '& .MuiStepConnector-line': { backgroundColor: '#0f2557' } },
    line: { height: 3, border: 0, backgroundColor: '#eaeaf0', borderRadius: 1 },
  }));

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ backgroundColor: 'white', color: 'black', width: '100%', mt: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Site Code"
                    name="sitecode"
                    value={sitecode}
                    fullWidth
                    margin="normal"
                    
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Location"
                    name="location"
                    value={location}
                    fullWidth
                    margin="normal"
                    
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    name="date"
                    type="date"
                    value={basicInfo.date}
                    onChange={handleBasicInfoChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">Weather Conditions</FormLabel>
                    <FormGroup row>
                      {weatherOptions.map((option) => (
                        <FormControlLabel
                          key={option}
                          control={<Checkbox checked={basicInfo.weather.includes(option)} onChange={handleWeatherChange} value={option} />}
                          label={option}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      case 1:
        return (
          <Card sx={{ backgroundColor: 'white', color: 'black', width: '100%', mt: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              {workforceDetails.map((team, teamIndex) => (
                <Box key={teamIndex} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Team {teamIndex + 1}
                  </Typography>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={11}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Team Name</InputLabel>
                        <Select value={team.teamName} onChange={(e) => handleWorkforceChange(teamIndex, 'teamName', e.target.value)}>
                          {teamOptions.map((teamOption) => (
                            <MenuItem key={teamOption} value={teamOption}>
                              {teamOption}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {teamIndex === workforceDetails.length - 1 && (
                      <Grid item xs={1}>
                        <IconButton onClick={addTeam}>
                          <AddCircle />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">Work Hours</FormLabel>
                    <RadioGroup
                      name="workhrs"
                      value={team.workhrs}
                      onChange={(e) => handleWorkforceChange(teamIndex, 'workhrs', e.target.value)}
                      row
                    >
                      {['0-2', '3-4', '5-6', '7-8', '9+'].map((hours) => (
                        <FormControlLabel key={hours} value={hours} control={<Radio />} label={`${hours} Hours`} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <Typography variant="h6" gutterBottom>
                    Completed Tasks
                  </Typography>
                  {team.tasksdone.map((task, taskIndex) => (
                    <Grid container spacing={1} key={taskIndex} alignItems="center">
                      <Grid item xs={11}>
                        <FormControl fullWidth margin="normal">
                          <InputLabel>Task</InputLabel>
                          <Select value={task} onChange={(e) => handleTeamTasksChange(teamIndex, taskIndex, e.target.value)}>
                            {taskOptions.map((taskOption) => (
                              <MenuItem key={taskOption} value={taskOption}>
                                {taskOption}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      {taskIndex === team.tasksdone.length - 1 && (
                        <Grid item xs={1}>
                          <IconButton onClick={() => addTeamTask(teamIndex)}>
                            <AddCircle />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  ))}
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Team Tasks Status</InputLabel>
                    <Select
                      name="taskstatus"
                      value={team.taskstatus}
                      onChange={(e) => handleWorkforceChange(teamIndex, 'taskstatus', e.target.value)}
                    >
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Not Started">Not Started</MenuItem>
                      <MenuItem value="On Hold">On Hold</MenuItem>
                      <MenuItem value="Delayed">Delayed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card sx={{ backgroundColor: 'white', color: 'black', width: '100%', mt: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              {equipmentDetails.map((equipment, index) => (
                <Box key={index} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Equipment {index + 1}
                  </Typography>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={11}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Equipment Type</InputLabel>
                        <Select
                          value={equipment.equiptype}
                          onChange={(e) => handleEquipmentChange(index, 'equiptype', e.target.value)}
                        >
                          {equipmentOptions.map((equipmentOption) => (
                            <MenuItem key={equipmentOption} value={equipmentOption}>
                              {equipmentOption}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {index === equipmentDetails.length - 1 && (
                      <Grid item xs={1}>
                        <IconButton onClick={addEquipment}>
                          <AddCircle />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                  <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">Used Hours</FormLabel>
                    <RadioGroup
                      name="usedhrs"
                      value={equipment.usedhrs}
                      onChange={(e) => handleEquipmentChange(index, 'usedhrs', e.target.value)}
                      row
                    >
                      {['0-2', '3-4', '5-6', '7-8', '9+'].map((hours) => (
                        <FormControlLabel key={hours} value={hours} control={<Radio />} label={`${hours} Hours`} />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Box>
              ))}
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card sx={{ backgroundColor: 'white', color: 'black', width: '100%', mt: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <TextField
                label="Daily Observations"
                name="observations"
                value={observationsAndComments.observations}
                onFocus={() => setActiveField('observations')}
                onChange={handleObservationsChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
              <TextField
                label="Additional Comments"
                name="comments"
                value={observationsAndComments.comments}
                onFocus={() => setActiveField('comments')}
                onChange={handleObservationsChange}
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
              <Button variant="contained" component="label" sx={{ mt: 2 }}>
                Upload Site Conditions Picture
                <input type="file" name="conditions" hidden onChange={handleObservationsChange} />
              </Button>
              {observationsAndComments.conditions && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  File Selected: {observationsAndComments.conditions.name}
                </Typography>
              )}
              {initialData.conditions && !observationsAndComments.conditions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Existing Condition Picture:</Typography>
                  <img
                    src={`http://localhost:8000/daily/uploads/${initialData.conditions}`}
                    alt="Site Conditions"
                    style={{ width: '200px', borderRadius: '5px', marginTop: '10px' }}
                  />
                </Box>
              )}
            </CardContent>
            <Box sx={{ textAlign: 'right', mr: 2 }}>
              <IconButton onClick={isListening ? stopListening : startListening}>
                {isListening ? <Mic color="primary" /> : <MicOff color="secondary" />}
              </IconButton>
            </Box>
          </Card>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: 4, backgroundColor: '#f0f2f5', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      <Stepper activeStep={activeStep} connector={<CustomStepConnector />} sx={{ mb: 2, backgroundColor: 'transparent', width: '100%', '& .MuiStepIcon-root.Mui-active': { color: '#0f2557' }, '& .MuiStepIcon-root.Mui-completed': { color: '#0f2557' }, '& .MuiStepLabel-label': { color: '#0f2557' } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <Typography color="#0f2557">{label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box
        sx={{
          width: '100%',
          mb: 3,
          background: 'linear-gradient(350deg, #211C6A, #4137D0)',
          height: 4,
        }}
      />
      {renderStepContent(activeStep)}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <CardActions sx={{ justifyContent: 'space-between', mt: 2, width: '100%' }}>
        <Box>
          {activeStep !== 0 && (
            <Button onClick={handleBack} variant="outlined" sx={{ mr: 1 }}>
              Back
            </Button>
          )}
        </Box>
        <Box>
          {activeStep < steps.length - 1 && (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </Box>
      </CardActions>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="outlined" onClick={handleViewProgress}>
          View Daily Progress
        </Button>
      </Box>
    </Box>
  );
}
