import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrag, useDrop } from 'react-dnd';
import { Devices } from '@mui/icons-material';
import {
  Avatar,
  Button,
  Card,
  Select,
  MenuItem,
  Stack,
  FormControl,
  TextField,
  Stepper,
  Step,
  StepLabel,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Assignment,
  CalendarToday,
  Category,
  PriorityHigh,
  Build,
  People,
  Checklist,
} from '@mui/icons-material';
import './CreateTask.css';

// Define resources and roles
const Roles = [
  { name: 'Alice', role: 'Architect', imageUrl: '/images/architect.avif' },
  { name: 'Brian', role: 'Civil Engineer', imageUrl: '/images/civil-engineer.jpg' },
  { name: 'Claire', role: 'Site Inspector', imageUrl: '/images/site-inspector.jpg' },
  { name: 'Diana', role: 'Interior Designer', imageUrl: '/images/interior-designer.jpg' },
  { name: 'Ethan', role: 'Electrical Engineer', imageUrl: '/images/electrical-engineer.jpg' },
  { name: 'John', role: 'Environmental Consultant', imageUrl: '/images/environmental-consultant.jpg' },
];

const resourceImages = {
  electricians: '/images/electrician.jpg',
  plumbers: '/images/plumber.avif',
  carpenters: '/images/carpenter.jpg',
  siteSupervisors: '/images/supervisor.avif',
  heavyMachinery: '/images/heavy-machinery.avif',
  safetyEquipment: '/images/safety-equipment.avif',
  powerTools: '/images/power-tools.avif',
  drones: '/images/drone.avif',
  environmentalSensors: '/images/sensors.avif',
};

const ITEM_TYPE = 'TEAM_MEMBER';

// Half-Circular Menu Component
const CircularMenu = ({ resources, selectedResources, toggleResourceSelection }) => {
  const radius = 120; // Circle radius
  const resourceCount = resources.length; // Number of resources

  return (
    <div className="circular-menu-container">
      {resources.map((resource, index) => {
        const angle = (index / (resourceCount - 1)) * Math.PI; // Half-circle calculation
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const isSelected = selectedResources.includes(resource.name);

        return (
          <div
            key={resource.name}
            className={`circular-menu-item ${isSelected ? 'selected-resource' : ''}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onClick={() => toggleResourceSelection(resource.name)}
          >
            <img src={resource.imageUrl} alt={resource.name} />
            <span className="resource-label">{resource.name.replace(/([A-Z])/g, ' $1')}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function CreateTask({onSuccessTaskAssigned}) {
  const [step, setStep] = useState(0);
  const [taskname, setTaskName] = useState('');
  const [assignedto, setAssignedto] = useState('');
  const [assignedtoImageUrl, setAssignedtoImageUrl] = useState('');
  const [taskcategory, setTaskCategory] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [progress, setProgress] = useState(''); 
  const [sitecode] = useState('SITE-' + Math.random().toString(36).substr(2, 3).toUpperCase());
  const [error, setError] = useState('');
  const [selectedResources, setSelectedResources] = useState([]);
  const [showResources, setShowResources] = useState({
    humanResources: false,
    materials: false,
    other: false,
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false); // To manage success snackbar

  const navigate = useNavigate();

  const isFormValid = () => {
    const selectedDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Deadline cannot be in the past.');
      return false;
    }

    return (
      taskname.trim() !== '' &&
      assignedto.trim() !== '' &&
      taskcategory.trim() !== '' &&
      deadline.trim() !== ''
    );
  };

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item) => {
      setAssignedto(item.name);
      setAssignedtoImageUrl(item.imageUrl);
      updateTaskCategoryBasedOnRole(item.role); // Call to update categories based on role
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const TeamMember = ({ member }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ITEM_TYPE,
      item: member,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <Card
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          marginBottom: '10px',
          padding: '10px',
          cursor: 'move',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar src={member.imageUrl} alt={member.name} />
          <span>{member.name} - {member.role}</span>
        </Stack>
      </Card>
    );
  };

  const updateTaskCategoryBasedOnRole = (role) => {
    let options = [];
    if (role === 'Architect') {
      options = ['Planning and Design'];
      setTaskCategory('Planning and Design'); // Auto-select the first option
    } else if (role === 'Civil Engineer' || role === 'Electrical Engineer') {
      options = ['Site and Foundation Preparation', 'Plumbing'];
      setTaskCategory('Site and Foundation Preparation'); // Auto-select the first option
    } else if (role === 'Site Inspector' || role === 'Environmental Consultant') {
      options = ['Inspection and Approvals'];
      setTaskCategory('Inspection and Approvals'); // Auto-select the first option
    } else if (role === 'Interior Designer') {
      options = ['Interior/Exterior Work'];
      setTaskCategory('Interior/Exterior Work'); // Auto-select the first option
    }
    setCategoryOptions(options); // Update the available options in the dropdown
  };

  // Define resources based on the type
  const humanResources = [
    { name: 'electricians', imageUrl: resourceImages.electricians },
    { name: 'plumbers', imageUrl: resourceImages.plumbers },
    { name: 'carpenters', imageUrl: resourceImages.carpenters },
    { name: 'siteSupervisors', imageUrl: resourceImages.siteSupervisors },
  ];

  const materials = [
    { name: 'heavyMachinery', imageUrl: resourceImages.heavyMachinery },
    { name: 'safetyEquipment', imageUrl: resourceImages.safetyEquipment },
    { name: 'powerTools', imageUrl: resourceImages.powerTools },
  ];

  const otherResources = [
    { name: 'drones', imageUrl: resourceImages.drones },
    { name: 'environmentalSensors', imageUrl: resourceImages.environmentalSensors },
  ];

 // Handle form submission
 const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid()) {
      return;
    }

    const taskData = {
      taskname,
      assignedto,
      assignedtoImageUrl,
      taskcategory,
      deadline,
      priority,
      progress, // Changed to "notes"
      sitecode,
      resources: {
        humanResources: selectedResources.filter((r) => humanResources.some((hr) => hr.name === r)),
        materials: selectedResources.filter((r) => materials.some((m) => m.name === r)),
        monitoringEquipment: selectedResources.filter((r) => otherResources.some((or) => or.name === r)),
      },
    };

    try {
      const response = await fetch('http://localhost:8000/pt/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (response.ok) {
        setSnackbarOpen(true); // Show success message
        setTimeout(() => {
          navigate('/project-manager');
          onSuccessTaskAssigned()
        }, 1500); // Navigate to tasks after 1.5 seconds
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create task.');
      }
    } catch (error) {
      setError('An error occurred while creating the task. Please try again later.');
    }
  };

  const handleNextStep = () => setStep((prevStep) => Math.min(prevStep + 1, 2));
  const handlePrevStep = () => setStep((prevStep) => Math.max(prevStep - 1, 0));

  const toggleResourceSelection = (resourceName) => {
    setSelectedResources((prevSelected) =>
      prevSelected.includes(resourceName)
        ? prevSelected.filter((name) => name !== resourceName)
        : [...prevSelected, resourceName]
    );
  };

  const handleResourceCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setShowResources((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  return (
    <div className="container1">
      {step === 0 && (
        <div className="team-members-container">
          <h3>Team Members</h3>
          {Roles.map((role) => (
            <TeamMember key={role.name} member={role} />
          ))}
        </div>
      )}

      <div className="task-form">
        <Card
          className="form-section"
          sx={{
            backgroundColor: '#e3f2fd', // Setting background color to #e3f2fd
            borderRadius: '20px',
            padding: '25px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <Stepper activeStep={step} alternativeLabel>
            <Step>
              <StepLabel icon={<Assignment sx={{ color: step >= 0 ? '#0f2557' : 'gray' }} />}>Basic Info</StepLabel>
            </Step>
            <Step>
              <StepLabel icon={<Checklist sx={{ color: step >= 1 ? '#0f2557' : 'gray' }} />}>Details</StepLabel>
            </Step>
            <Step>
              <StepLabel icon={<Devices sx={{ color: step >= 2 ? '#0f2557' : 'gray' }} />}>Resources</StepLabel>
            </Step>
          </Stepper>

          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handleSubmit}>
            {step === 0 && (
              <>
                <div className="form-group mb-3">
                  <label htmlFor="taskname">
                    <Assignment sx={{ verticalAlign: 'middle', color: '#0f2557' }} /> Task Name
                  </label>
                  <TextField
                    id="taskname"
                    placeholder="Enter task name"
                    onChange={(e) => setTaskName(e.target.value)}
                    value={taskname}
                    fullWidth
                    required
                  />
                </div>

                <div
                  className="form-group mb-3"
                  ref={drop}
                  style={{
                    border: isOver ? '2px dashed #0f2557' : '2px solid transparent',
                    padding: '10px',
                  }}
                >
                  <label htmlFor="assignedto">
                    <People sx={{ verticalAlign: 'middle', color: '#0f2557' }} /> Assigned To
                  </label>
                  {assignedto ? (
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar src={assignedtoImageUrl} alt={assignedto} />
                      <span>{assignedto}</span>
                    </Stack>
                  ) : (
                    <p>Drag a team member here</p>
                  )}
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="taskcategory">
                    <Category sx={{ verticalAlign: 'middle', color: '#0f2557' }} /> Task Category
                  </label>
                  <FormControl fullWidth required>
                    <Select
                      id="taskcategory"
                      value={taskcategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                    >
                      {categoryOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="deadline">
                    <CalendarToday sx={{ verticalAlign: 'middle', color: '#0f2557' }} /> Deadline
                  </label>
                  <TextField
                    id="deadline"
                    type="date"
                    onChange={(e) => setDeadline(e.target.value)}
                    value={deadline}
                    fullWidth
                    required
                    // Disable past dates by setting min value
                    InputProps={{
                      inputProps: { min: new Date().toISOString().split('T')[0] },
                    }}
                  />
                </div>

                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#0f2557', color: '#ffffff' }}
                  onClick={handleNextStep}
                >
                  Next
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <FormLabel component="legend">
                  <PriorityHigh sx={{ verticalAlign: 'middle', color: '#0f2557' }} /> Priority
                </FormLabel>
                <RadioGroup
                  row
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <FormControlLabel value="low" control={<Radio />} label="Low" />
                  <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                  <FormControlLabel value="high" control={<Radio />} label="High" />
                </RadioGroup>

                <div className="form-group mb-3">
                  <label htmlFor="progres">
                    <Checklist sx={{ verticalAlign: 'middle', color: '#0f2557' }} /> Notes
                  </label>
                  <TextField
                    id="progress" 
                    placeholder="Enter comments or task notes"
                    onChange={(e) => setProgress(e.target.value)} // Updated state variable
                    value={progress}
                    fullWidth
                    required
                  />
                </div>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: '#0f2557', color: '#0f2557' }}
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#0f2557', color: '#ffffff' }}
                    onClick={handleNextStep}
                  >
                    Next
                  </Button>
                </Stack>
              </>
            )}

            {step === 2 && (
              <>
                <FormLabel component="legend">
                  <Build sx={{ verticalAlign: 'middle', color: '#0f2557' }} /> Resources Needed
                </FormLabel>

                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="humanResources"
                        checked={showResources.humanResources}
                        onChange={handleResourceCheckboxChange}
                      />
                    }
                    label="Human Resources"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="materials"
                        checked={showResources.materials}
                        onChange={handleResourceCheckboxChange}
                      />
                    }
                    label="Materials"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="other"
                        checked={showResources.other}
                        onChange={handleResourceCheckboxChange}
                      />
                    }
                    label="Other Resources"
                  />
                </FormGroup>

                {showResources.humanResources && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularMenu
                      resources={humanResources}
                      selectedResources={selectedResources}
                      toggleResourceSelection={toggleResourceSelection}
                    />
                  </div>
                )}

                {showResources.materials && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularMenu
                      resources={materials}
                      selectedResources={selectedResources}
                      toggleResourceSelection={toggleResourceSelection}
                    />
                  </div>
                )}

                {showResources.other && (
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularMenu
                      resources={otherResources}
                      selectedResources={selectedResources}
                      toggleResourceSelection={toggleResourceSelection}
                    />
                  </div>
                )}

                <div className="selected-resources-list">
                  <h4>Selected Resources:</h4>
                  <ul>
                    {selectedResources.map((resourceName) => (
                      <li key={resourceName}>
                        {resourceName.replace(/([A-Z])/g, ' $1')}
                      </li>
                    ))}
                  </ul>
                </div>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    sx={{ borderColor: '#0f2557', color: '#0f2557' }}
                    onClick={handlePrevStep}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    sx={{ backgroundColor: '#0f2557', color: '#ffffff' }}
                    type="submit"
                  >
                    Create Task
                  </Button>
                </Stack>
              </>
            )}
          </form>
        </Card>
      </div>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Task added successfully!
        </Alert>
      </Snackbar>
    </div>
  );
}
