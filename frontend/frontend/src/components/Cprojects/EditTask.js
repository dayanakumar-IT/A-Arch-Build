import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Snackbar,
  Alert,
  IconButton,
  FormControlLabel,
  Switch, 
  Collapse,
} from '@mui/material';
import Slide from '@mui/material/Slide';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CategoryIcon from '@mui/icons-material/Category';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

const Roles = [
  { name: 'Alice', role: 'Architect', imageUrl: '/images/architect.avif' },
  { name: 'Brian', role: 'Civil Engineer', imageUrl: '/images/civil-engineer.jpg' },
  { name: 'Claire', role: 'Site Inspector', imageUrl: '/images/site-inspector.jpg' },
  { name: 'Diana', role: 'Interior Designer', imageUrl: '/images/interior-designer.jpg' },
  { name: 'Ethan', role: 'Electrical Engineer', imageUrl: '/images/electrical-engineer.jpg' },
  { name: 'John', role: 'Environmental Consultant', imageUrl: '/images/environmental-consultant.jpg' },
];

// Options for human resources, materials, and monitoring equipment
const humanResourcesOptions = ['Electricians', 'Plumbers', 'Carpenters', 'Site Supervisors'];
const materialsOptions = ['Heavy Machinery', 'Safety Equipment', 'Power Tools'];
const monitoringOptions = ['Drones', 'Environmental Sensors'];

export default function EditTask() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]); // Task category options
  const apiUrl = 'http://localhost:8000/pt';
  const navigate = useNavigate();

  const [resources, setResources] = useState({
    humanResources: [],
    materials: [],
    monitoringEquipment: [],
  });

  const SlideTransition = (props) => {
    return <Slide {...props} direction="up" />;
  };
  
  useEffect(() => {
    fetchTask();
  }, [taskId]);
  
  const fetchTask = async () => {
    try {
      const response = await fetch(`${apiUrl}/tasks`);
      if (response.ok) {
        const data = await response.json();
        const foundTask = data.find((task) => task._id === taskId);
        if (foundTask) {
          setTask(foundTask);
          setCategoryOptions(getCategoryOptionsBasedOnRole(foundTask.assignedto));
          setResources({
            humanResources: foundTask.resources?.humanResources || [],
            materials: foundTask.resources?.materials || [],
            monitoringEquipment: foundTask.resources?.monitoringEquipment || [],
          });
        } else {
          setError('Task not found.');
        }
      } else {
        setError('Failed to load task details.');
      }
    } catch (error) {
      setError('Failed to load task details.');
    } finally {
      setLoading(false);
    }
  };

  // Update task category options based on the assigned role
  const getCategoryOptionsBasedOnRole = (role) => {
    let options = [];
    if (role === 'Architect') {
      options = ['Planning and Design'];
    } else if (role === 'Civil Engineer' || role === 'Electrical Engineer') {
      options = ['Site and Foundation Preparation', 'Plumbing'];
    } else if (role === 'Site Inspector' || role === 'Environmental Consultant') {
      options = ['Inspection and Approvals'];
    } else if (role === 'Interior Designer') {
      options = ['Interior/Exterior Work'];
    }
    return options;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const updatedTask = {
      ...task,
      resources: {
        humanResources: resources.humanResources,
        materials: resources.materials,
        monitoringEquipment: resources.monitoringEquipment,
      },
    };
  
    try {
      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (response.ok) {
        setSuccessMessage(true);
        setTimeout(() => {
          navigate('/tasks');
        }, 2000); 
      } else {
        setError('Failed to update the task.');
      }
    } catch (error) {
      setError('Failed to update the task.');
    }
  };
  
  const handleAssignedToChange = (event) => {
    const selectedName = event.target.value;
    const selectedUser = Roles.find((user) => user.name === selectedName);
    const newCategoryOptions = getCategoryOptionsBasedOnRole(selectedUser?.role);
    setCategoryOptions(newCategoryOptions); // Update task category options
    setTask({ ...task, assignedto: selectedName, assignedtoImageUrl: selectedUser?.imageUrl || '', taskcategory: newCategoryOptions[0] || '' });
  };

  const handleResourcesChange = (event) => {
    const { name, value } = event.target;
    setResources((prevState) => ({
      ...prevState,
      [name]: value,
    }));  
  };

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) return <CircularProgress />;
  if (!task) return <Typography variant="h6">Task not found.</Typography>;

  const todayDate = new Date().toISOString().split('T')[0];
  const formattedDeadline = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '';

  return (
    <Box sx={{ padding: 4, maxWidth: 700, margin: '0 auto', backgroundColor: '#e3f2fd', borderRadius: '10px' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}>
        Edit Task
      </Typography>
      {error && (
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <form onSubmit={handleSubmit}>
        <Card elevation={3} sx={{ mb: 3, backgroundColor: '#ffffff' }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <AssignmentIcon color="primary" />
              <Typography variant="h6">Task Details</Typography>
            </Stack>
            <TextField
              label="Task Name"
              name="taskname"
              value={task.taskname || ''}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel id="assignedto-label">Assigned To</InputLabel>
              <Select
                labelId="assignedto-label"
                name="assignedto"
                value={task.assignedto || ''}
                onChange={handleAssignedToChange}
                label="Assigned To"
              >
                <MenuItem value="">Select a person</MenuItem>
                {Roles.map((user) => (
                  <MenuItem key={user.name} value={user.name}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar src={user.imageUrl} alt={user.name} />
                      <span>{user.name} - {user.role}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Task Category */}
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel id="taskcategory-label">Task Category</InputLabel>
              <Select
                labelId="taskcategory-label"
                name="taskcategory"
                value={task.taskcategory || ''}
                onChange={handleChange}
                label="Task Category"
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Deadline"
              name="deadline"
              type="date"
              value={formattedDeadline}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{ min: todayDate }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PriorityHighIcon color="action" sx={{ mr: 1 }} />
              <Typography>Priority:</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={task.priority === 'high'}
                    onChange={(e) => handleChange({ target: { name: 'priority', value: e.target.checked ? 'high' : 'medium' } })}
                  />
                }
                label={task.priority === 'high' ? 'High' : 'Medium'}
              />
            </Box>
            <TextField
              label="Notes"
              name="progress"
              value={task.progress || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              placeholder="Add any progress updates or notes here..."
              sx={{ mb: 2 }}
            />
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ mb: 3, backgroundColor: '#ffffff' }}>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <CategoryIcon color="primary" />
              <Typography variant="h6">Resources Needed</Typography>
              <IconButton onClick={() => setResourcesExpanded(!resourcesExpanded)} color="primary">
                {resourcesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={resourcesExpanded}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="humanResources-label">Human Resources</InputLabel>
              <Select
                labelId="humanResources-label"
                name="humanResources"
                value={resources.humanResources} 
                onChange={handleResourcesChange}
                multiple 
              >
                {humanResourcesOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="materials-label">Materials</InputLabel>
              <Select
                labelId="materials-label"
                name="materials"
                value={resources.materials} 
                onChange={handleResourcesChange}
                multiple
              >
                {materialsOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="monitoringEquipment-label">Monitoring Equipment</InputLabel>
              <Select
                labelId="monitoringEquipment-label"
                name="monitoringEquipment"
                value={resources.monitoringEquipment} 
                onChange={handleResourcesChange}
                multiple
              >
                {monitoringOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            </Collapse>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" type="submit">
            Save Changes
          </Button>
          <Button variant="outlined" onClick={() => navigate('/tasks')}>
            Cancel
          </Button>
        </Stack>
      </form>

      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(false)}
        TransitionComponent={SlideTransition} 
      >
        <Alert onClose={() => setSuccessMessage(false)} severity="success" sx={{ width: '100%' }}>
          Task edited successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
