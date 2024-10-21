import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Zoom,
  Fade,
  Checkbox,
  Card,
  Select,
  MenuItem,
  FormControl,
  Stepper,
  Step,
  StepLabel,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Snackbar,
  Alert,
} from '@mui/material';
import { Assignment, People, CalendarToday, Category, PriorityHigh, Build, Checklist, Devices } from '@mui/icons-material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Calendar CSS
import EditIcon from '@mui/icons-material/Edit';
import TimerIcon from '@mui/icons-material/Timer'; 
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Slide from '@mui/material/Slide';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ConstructionIcon from '@mui/icons-material/Construction';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import EventIcon from '@mui/icons-material/Event';
import Countdown from 'react-countdown';
import './ReadTasks.css'; // Custom styles
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import DownloadIcon from '@mui/icons-material/Download'; // Download icon
import { jsPDF } from 'jspdf';

// Sample Roles
const Roles = [
  { name: 'Alice', role: 'Architect', imageUrl: '/images/architect.avif' },
  { name: 'Brian', role: 'Civil Engineer', imageUrl: '/images/civil-engineer.jpg' },
  { name: 'Claire', role: 'Site Inspector', imageUrl: '/images/site-inspector.jpg' },
  { name: 'Diana', role: 'Interior Designer', imageUrl: '/images/interior-designer.jpg' },
  { name: 'Ethan', role: 'Electrical Engineer', imageUrl: '/images/electrical-engineer.jpg' },
  { name: 'John', role: 'Environmental Consultant', imageUrl: '/images/environmental-consultant.jpg' },
];

// Resource Images
const resourceImages = {
  electricians: '/images/electrician.jpg',
  plumbers: '/images/plumber.avif',
  carpenters: '/images/carpenter.jpg',
  siteSupervisors: '/images/supervisor.avif',
  heavyMachinery: '/images/heavy-machinery.avif',
  safetyEquipment: '/images/safety-equipment.avif',
  powerTools: '/images/power-tools.avif',
};

const localizer = momentLocalizer(moment); // Localizer for the calendar
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

const TaskCategoryChart = ({ tasks }) => {
  // Count tasks per category
  const categoryCounts = tasks.reduce((acc, task) => {
    acc[task.taskcategory] = (acc[task.taskcategory] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categoryCounts), // X-axis: task categories
    datasets: [
      {
        label: 'Tasks per Category',
        data: Object.values(categoryCounts), // Y-axis: number of tasks
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Line data={data} width={180} height={50} /> {/* Adjusted size */}
    </Box>
  );
};



// Function to get the role information based on the name
const getRoleInfo = (assignedTo) => {
  return Roles.find((role) => role.name === assignedTo);
};

const NotifyDialog = ({ open, onClose, daysLeft, deadlineDate }) => {
  const renderer = ({ days, hours, minutes, seconds }) => {
    return (
      <span>{days}d {hours}h {minutes}m {seconds}s</span>
    );
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Task Reminder</DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <img src="/images/exampleImage.jpg" alt="Reminder" style={{ width: '150px', height: '110px', marginBottom: '20px' }} />
        <Typography variant="body1" sx={{ mb: 2 }}>
          You have {daysLeft} days remaining for this task.
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#d32f2f' }}>
          Time left: <Countdown date={deadlineDate} renderer={renderer} />
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Custom Toolbar for Calendar
const CustomToolbar = (props) => {
  const goToBack = () => {
    props.onNavigate('PREV');
  };

  const goToNext = () => {
    props.onNavigate('NEXT');
  };

  const goToMonthView = () => {
    props.onView('month');
  };

  const goToAgendaView = () => {
    props.onView('agenda');
  };
 
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <IconButton onClick={goToBack} sx={{ color: '#0f2557' }}>
        <NavigateBeforeIcon />
      </IconButton>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f2557' }}>
        {props.label}
      </Typography>
      <IconButton onClick={goToNext} sx={{ color: '#0f2557' }}>
        <NavigateNextIcon />
      </IconButton>

      <Box>
        <IconButton onClick={goToMonthView} sx={{ color: '#0f2557' }}>
          <ViewModuleIcon />
        </IconButton>
        <IconButton onClick={goToAgendaView} sx={{ color: '#0f2557' }}>
          <EventIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

const TaskDetailsDialog = ({ task, open, onClose }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="md"
    fullWidth
    sx={{
      '& .MuiPaper-root': {
        borderRadius: 3,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.4s ease-in-out',
        backgroundColor: '#e3f2fd',
      },
    }}
    TransitionComponent={Slide}
    TransitionProps={{ direction: 'up', timeout: 400 }}
  >
    <DialogTitle
      sx={{
        textAlign: 'center',
        color: '#051094',
        fontWeight: 'bold',
        mb: 2,
        fontSize: '1.5rem',
      }}
    >
      {task.taskname}
    </DialogTitle>

    <DialogContent sx={{ padding: '20px', backgroundColor: '#e3f2fd' }}>
      <Typography
        variant="body1"
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          color: '#051094',
          fontSize: '1.25rem',
        }}
      >
        <AssignmentIcon sx={{ mr: 1 }} />
        Notes:
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mb: 4,
          ml: 4,
          fontSize: '1rem',
          lineHeight: 1.6,
          color: '#333',
        }}
      >
        {task.progress || 'No notes available.'}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontWeight: 'bold',
          color: '#051094',
          mb: 2,
          fontSize: '1.25rem',
        }}
      >
        <ConstructionIcon sx={{ mr: 1 }} />
        Resources:
      </Typography>
      {task.resources ? (
        <Box sx={{ ml: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {task.resources.humanResources && task.resources.humanResources.length > 0 && (
            <Box
              sx={{
                backgroundColor: '#ffffff',
                border: '2px solid #051094',
                borderRadius: 2,
                padding: 2,
                minWidth: '150px',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Human Resources:
              </Typography>
              <Typography variant="body2">{task.resources.humanResources.join(', ')}</Typography>
            </Box>
          )}
          {task.resources.materials && task.resources.materials.length > 0 && (
            <Box
              sx={{
                backgroundColor: '#ffffff',
                border: '2px solid #051094',
                borderRadius: 2,
                padding: 2,
                minWidth: '150px',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Materials:
              </Typography>
              <Typography variant="body2">{task.resources.materials.join(', ')}</Typography>
            </Box>
          )}
          {task.resources.monitoringEquipment && task.resources.monitoringEquipment.length > 0 && (
            <Box
              sx={{
                backgroundColor: '#ffffff',
                border: '2px solid #051094',
                borderRadius: 2,
                padding: 2,
                minWidth: '150px',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Monitoring Equipment:
              </Typography>
              <Typography variant="body2">{task.resources.monitoringEquipment.join(', ')}</Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ ml: 4 }}>
          No resources added.
        </Typography>
      )}
    </DialogContent>

    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          backgroundColor: '#051094',
          color: '#ffffff',
        }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default function ReadTasks({ onSuccessTask }) {
  const [tasks, setTasks] = useState([]);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null); // For sliding effect
  const [searchQuery, setSearchQuery] = useState('');
  const [showGraph, setShowGraph] = useState(false); // State to control graph visibility
  const navigate = useNavigate();
  const [openEditModal, setOpenEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [formValues, setFormValues] = useState({
    taskname: '',
    assignedto: '',
    taskcategory: '',
    deadline: '',
    priority: '',
    progress: '',
    subtasks: '',
    sitecode: '',
    resources: {
      humanResources: [],
      materials: [],
      monitoringEquipment: [],
    },
  });
  const [step, setStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedResources, setSelectedResources] = useState([]);
  const apiUrl = 'http://localhost:8000/pt';

   // Helper function to convert an image URL to Base64
const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const handleDownloadPdfByCategory = async (taskCategory) => {
  const filteredTasks = tasks.filter((task) => task.taskcategory === taskCategory);
  const doc = new jsPDF('p', 'mm', 'a4');

  const logoBase64 = await getBase64FromUrl(`${process.env.PUBLIC_URL}/images/logo.jpg`);
  doc.setFillColor(230, 240, 255);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  doc.addImage(logoBase64, 'JPEG', 10, 5, 30, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(`${taskCategory} Task Report`, 50, 20);
  doc.setFontSize(14);
  doc.setTextColor(60);
  doc.text('Construction Project Management', 50, 30);
  doc.line(10, 35, 200, 35);

  // Table Headers
  doc.setFillColor(240, 240, 240);
  doc.rect(10, 40, 190, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Task Name", 12, 46);
  doc.text("Deadline", 80, 46);
  doc.text("Priority", 130, 46);
  doc.text("Assigned To", 170, 46);

  let y = 55;
  doc.setFontSize(10);

  filteredTasks.forEach((task) => {
    const taskDeadline = new Date(task.deadline);
    
    // Task Details
    doc.setTextColor(0); // Set text color to black for the task name, deadline, etc.
    doc.text(task.taskname, 12, y);
    doc.text(task.assignedto, 170, y);
    doc.text(new Date(task.deadline).toISOString().split("T")[0], 80, y);

    // Highlight priority if it's "high"
    if (task.priority === 'high') {
      doc.setTextColor(255, 0, 0); // Set text color to red for high-priority
    } else {
      doc.setTextColor(0); // Set text color back to black for medium/low priority
    }
    doc.text(task.priority, 130, y); // Priority in red only if high

    // Reset color for resources and other details
    doc.setTextColor(0);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text("Resources:", 12, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`Human Resources: ${task.resources?.humanResources?.join(', ') || 'None'}`, 12, y + 5);
    doc.text(`Materials: ${task.resources?.materials?.join(', ') || 'None'}`, 12, y + 10);

    y += 20;
    doc.line(10, y, 200, y);
    y += 10;
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Generated by A-ArchBuild Construction Management System", 10, pageHeight - 10);

  doc.save(`${taskCategory}-tasks-construction.pdf`);
};



const handleDownloadFilteredPdf = async () => {
  const doc = new jsPDF('p', 'mm', 'a4');

  const logoBase64 = await getBase64FromUrl(`${process.env.PUBLIC_URL}/images/logo.jpg`);
  doc.setFillColor(230, 240, 255);
  doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');
  doc.addImage(logoBase64, 'JPEG', 10, 5, 30, 20);

  // Title and Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Filtered Tasks Report', 50, 20);
  doc.setFontSize(14);
  doc.setTextColor(60);
  doc.text('Construction Project Management', 50, 30);
  doc.line(10, 35, 200, 35);

  // Table Headers
  doc.setFillColor(240, 240, 240);
  doc.rect(10, 40, 190, 10, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0); // Black for headers
  doc.text("Task Name", 12, 46);
  doc.text("Deadline", 80, 46);
  doc.text("Priority", 130, 46);
  doc.text("Assigned To", 170, 46);

  let y = 55;
  doc.setFontSize(10);

  // Loop through filtered tasks
  filteredTasks.forEach((task) => {
    const taskDeadline = new Date(task.deadline);
    
    // Task details (in black)
    doc.setTextColor(0); // Black for task details
    doc.text(task.taskname, 12, y);
    doc.text(new Date(task.deadline).toISOString().split("T")[0], 80, y);
    doc.text(task.assignedto, 170, y);

    // Highlight priority in red if high
    if (task.priority === 'high') {
      doc.setTextColor(255, 0, 0); // Red for high priority
    } else {
      doc.setTextColor(0); // Black for medium/low priority
    }
    doc.text(task.priority, 130, y); // Priority

    // Resources and Notes
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text("Resources:", 12, y);
    doc.setFont('helvetica', 'normal');
    const humanResources = task.resources?.humanResources?.join(', ') || 'None';
    const materials = task.resources?.materials?.join(', ') || 'None';
    doc.text(`Human Resources: ${humanResources}`, 12, y + 5);
    doc.text(`Materials: ${materials}`, 12, y + 10);

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text("Notes:", 12, y);
    doc.setFont('helvetica', 'normal');
    const notes = task.notes || 'No notes available.';
    doc.text(notes, 12, y + 5);

    // Separator line between tasks
    y += 15;
    doc.line(10, y, 200, y);
    y += 10;
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Generated by A-ArchBuild Construction Management System", 10, pageHeight - 10);

  doc.save('filtered-tasks.pdf');
};

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setFilteredTasks(
      tasks
        .slice() // Copy the array to avoid mutating state
        .sort((a, b) => (a.priority === 'high' ? -1 : 1)) // Sort high-priority tasks at the top
    );
  }, [tasks]);

  const handleCreateTask = () => {
    navigate('/project-manager');
    onSuccessTask();
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${apiUrl}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data);
      } else {
        setError('Failed to load tasks.');
      }
    } catch (error) {
      setError('Failed to load tasks.');
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleEdit = (task) => {
    setTaskToEdit(task);
    setFormValues({ ...task });
    setSelectedResources(task.resources.humanResources.concat(task.resources.materials));
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setTaskToEdit(null);
  };

  const handleNextStep = () => setStep((prevStep) => Math.min(prevStep + 1, 2));
  const handlePrevStep = () => setStep((prevStep) => Math.max(prevStep - 1, 0));


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleResourceChange = (type, value) => {
    setFormValues({
      ...formValues,
      resources: {
        ...formValues.resources,
        [type]: value.split(','),
      },
    });
  };

  const handleSaveTask = async () => {
    try {
      const response = await fetch(`${apiUrl}/tasks/${taskToEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });
      setSnackbarOpen(true);
      setOpenEditModal(false);

      if (response.ok) {
        fetchTasks(); // Refresh task list after saving
        handleCloseEditModal(); // Close modal
      } else {
        setError('Failed to update task.');
      }
    } catch (error) {
      setError('Failed to update task.');
    }
  };

  const toggleResourceSelection = (resourceName) => {
    setSelectedResources((prevSelected) =>
      prevSelected.includes(resourceName)
        ? prevSelected.filter((name) => name !== resourceName)
        : [...prevSelected, resourceName]
    );
  };


  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      setTaskToDeleteId(taskToDelete._id); // Trigger the slide-out effect
      setTimeout(async () => {
        try {
          const response = await fetch(`${apiUrl}/tasks/${taskToDelete._id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            setTasks(tasks.filter((task) => task._id !== taskToDelete._id));
            setFilteredTasks(filteredTasks.filter((task) => task._id !== taskToDelete._id));
          } else {
            setError('Failed to delete the task.');
          }
        } catch (error) {
          setError('Failed to delete the task.');
        } finally {
          setTaskToDeleteId(null); // Reset after deletion
          setDeleteDialog(false);
          setTaskToDelete(null);
        }
      }, 500); // Delay to allow slide animation to complete
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog(false);
    setTaskToDelete(null);
  };

  const handleNotify = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (task) {
      const deadlineDate = new Date(task.deadline);
      const currentDate = new Date();
      
      // Calculate the number of days remaining until the deadline
      const timeDifference = deadlineDate.getTime() - currentDate.getTime();
      const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convert milliseconds to days
  
      setDaysLeft(daysRemaining);
      setDeadlineDate(deadlineDate); // Set the deadline for countdown
      setSelectedTask(task); // Store selected task
      setNotifyDialogOpen(true); // Open the notification dialog
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (query) {
      setFilteredTasks(tasks.filter((task) =>
        task.taskname.toLowerCase().includes(query) ||
        task.assignedto.toLowerCase().includes(query) ||
        task.taskcategory.toLowerCase().includes(query)
      ));
    } else {
      setFilteredTasks(tasks);
    }
  };

  // Convert tasks to events for the calendar
  const taskEvents = tasks.map(task => ({
    title: task.taskname,
    start: new Date(task.deadline),
    end: new Date(task.deadline),
    allDay: true,
    priority: task.priority, // Add priority field to event
  }));

  const closeNotifyDialog = () => {
    setNotifyDialogOpen(false);
    setSelectedTask(null);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <NotifyDialog open={notifyDialogOpen} onClose={closeNotifyDialog} daysLeft={daysLeft} deadlineDate={deadlineDate} />

      <Card sx={{ mb: 4, padding: 2, border: '2px solid #42a5f5', borderRadius: '10px' }}>
        <Typography variant="h5" sx={{
          mb: 2,
          color: '#ffffff',
          backgroundColor: '#051094',
          padding: '10px',
          borderRadius: '8px',
          textAlign: 'center',
          fontWeight: 'bold',
          border: '1px solid #5ab1d7',
        }}>
          Task Deadlines Calendar
        </Typography>
        <Calendar
          localizer={localizer}
          events={taskEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 350, backgroundColor: '#e3f2fd', borderRadius: '10px' }}
          views={['month', 'agenda']}
          components={{
            toolbar: CustomToolbar, // Custom toolbar implementation
          }}
          toolbar={true}
          tooltipAccessor="title"
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.priority === 'high' ? '#FF2E2E' : '#81c784',
              borderRadius: '10px',
              border: '2px solid #42a5f5',
              color: '#fff',
              fontSize: '16px',
              padding: '3px',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            },
            onMouseOver: (e) => {
              e.target.style.transform = 'scale(1.2)';
              e.target.style.boxShadow = '0px 6px 12px rgba(0, 0, 0, 0.4)';
            },
            onMouseOut: (e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            },
          })}
        />
      </Card>

      {error && (
        <Typography variant="body1" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search by task name, assigned to, or category"
          value={searchQuery}
          onChange={handleSearch}
          fullWidth
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: '#0f2557' }} />
            ),
          }}
        />
         <Tooltip title="Download Filtered Tasks PDF">
              <IconButton onClick={handleDownloadFilteredPdf} color="success">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
        <Button variant="contained" color="primary" onClick={handleCreateTask}>
          Create New Task
        </Button>
        <Button variant="outlined" onClick={() => setShowGraph((prev) => !prev)}>
          {showGraph ? 'Hide Graph' : 'Show Graph'}
        </Button>
      </Box>

      <Fade in={true} timeout={800}>
        <TableContainer component={Paper} elevation={4} sx={{ maxHeight: 500, borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderStyles}>Select</TableCell>
                <TableCell sx={tableHeaderStyles}>Task Name</TableCell>
                <TableCell sx={tableHeaderStyles}>Assigned To</TableCell>
                <TableCell sx={tableHeaderStyles}>Deadline</TableCell>
                <TableCell sx={tableHeaderStyles}>Priority</TableCell>
                <TableCell sx={tableHeaderStyles}>Category</TableCell>
                <TableCell sx={tableHeaderStyles}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => (
                <Zoom in={true} timeout={400} key={task._id}>
                  <TableRow
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'transform 0.3s ease-in-out',
                      transform: taskToDeleteId === task._id ? 'translateX(-100%)' : 'none',
                      opacity: taskToDeleteId === task._id ? 0 : 1,
                      transitionDuration: '0.5s',
                      backgroundColor: task.priority === 'high' ? '#ffebee' : 'inherit', // Light red background for high priority
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        sx={{
                          '& .MuiSvgIcon-root': { fontSize: 28, color: '#d32f2f' },
                        }}
                        onChange={() => handleDeleteClick(task)}
                      />
                    </TableCell>

                    {/* Task Name */}
                    <TableCell>{task.taskname}</TableCell>

                    {/* Assigned To */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getRoleInfo(task.assignedto) ? (
                          <>
                            <Avatar
                              alt={getRoleInfo(task.assignedto).name}
                              src={getRoleInfo(task.assignedto).imageUrl}
                            />
                            <Typography>{getRoleInfo(task.assignedto).name}</Typography>
                          </>
                        ) : (
                          <Typography>{task.assignedto}</Typography>
                        )}
                      </Stack>
                    </TableCell>

                    {/* Task Deadline */}
                    <TableCell>{new Date(task.deadline).toISOString().split('T')[0]}</TableCell>

                    {/* Task Priority */}
                    <TableCell
                      sx={{
                        color: task.priority === 'high' ? '#f28b82' : '#1976d2',
                        fontWeight: task.priority === 'high' ? 'bold' : 'normal',
                        borderRadius: '8px',
                        padding: '8px',
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      {task.priority}
                    </TableCell>

                    {/* Task Category */}
                    <TableCell>{task.taskcategory}</TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Tooltip
                        title={
                          <Box sx={{ color: '#1976d2', fontSize: '14px', fontWeight: 'bold' }}>
                            Click to View Details
                          </Box>
                        }
                        arrow
                        TransitionComponent={Fade}
                        TransitionProps={{ timeout: 600 }}
                      >
                        <IconButton
                          onClick={() => handleViewDetails(task)}
                          sx={{
                            backgroundColor: '#5ab1d7',
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: '#82c8e6',
                            },
                            transition: 'background-color 0.3s ease',
                          }}
                        >
                          <VisibilityOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Task">
                        <IconButton onClick={() => handleEdit(task)} sx={{ color: '#0f2557' }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Notify">
                        <IconButton onClick={() => handleNotify(task._id)} color="info">
                          <TimerIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Task Report">
                          <IconButton onClick={() => handleDownloadPdfByCategory(task.taskcategory)} color="success">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                    </TableCell>
                  </TableRow>
                </Zoom>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>
      {/* Edit Modal */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="md" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Stepper activeStep={step} alternativeLabel>
            <Step>
              <StepLabel icon={<Assignment />}>Basic Info</StepLabel>
            </Step>
            <Step>
              <StepLabel icon={<Checklist />}>Details</StepLabel>
            </Step>
            <Step>
              <StepLabel icon={<Devices />}>Resources</StepLabel>
            </Step>
          </Stepper>

          {step === 0 && (
            <>
              <div className="form-group mb-3">
                <label htmlFor="taskname">
                  <Assignment /> Task Name
                </label>
                <TextField
                  id="taskname"
                  placeholder="Enter task name"
                  onChange={handleChange}
                  name="taskname"
                  value={formValues.taskname}
                  fullWidth
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="assignedto">
                  <People /> Assigned To
                </label>
                <FormControl fullWidth required>
                  <Select
                    id="assignedto"
                    name="assignedto"
                    value={formValues.assignedto}
                    onChange={handleChange}
                  >
                    {Roles.map((role) => (
                      <MenuItem key={role.name} value={role.name}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar src={role.imageUrl} alt={role.name} />
                          <span>{role.name} - {role.role}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="form-group mb-3">
                <label htmlFor="taskcategory">
                  <Category /> Task Category
                </label>
                <TextField
                  id="taskcategory"
                  placeholder="Enter task category"
                  onChange={handleChange}
                  name="taskcategory"
                  value={formValues.taskcategory}
                  fullWidth
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="deadline">
                  <CalendarToday /> Deadline
                </label>
                <TextField
                  id="deadline"
                  type="date"
                  onChange={handleChange}
                  name="deadline"
                  value={formValues.deadline.split('T')[0]}
                  fullWidth
                  required
                  InputProps={{
                    inputProps: { min: new Date().toISOString().split('T')[0] },
                  }}
                />
              </div>

              <Button
                variant="contained"
                onClick={handleNextStep}
                sx={{ backgroundColor: '#0f2557', color: '#ffffff' }}
              >
                Next
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <FormLabel component="legend">
                <PriorityHigh /> Priority
              </FormLabel>
              <RadioGroup row value={formValues.priority} onChange={handleChange} name="priority">
                <FormControlLabel value="low" control={<Radio />} label="Low" />
                <FormControlLabel value="medium" control={<Radio />} label="Medium" />
                <FormControlLabel value="high" control={<Radio />} label="High" />
              </RadioGroup>

              <div className="form-group mb-3">
                <label htmlFor="progress">
                  <Checklist /> Notes
                </label>
                <TextField
                  id="progress"
                  placeholder="Enter task notes"
                  onChange={handleChange}
                  name="progress"
                  value={formValues.progress}
                  fullWidth
                  required
                />
              </div>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={handlePrevStep}>
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
                <Build /> Resources Needed
              </FormLabel>

              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedResources.includes('electricians')}
                      onChange={() => toggleResourceSelection('electricians')}
                    />
                  }
                  label="Electricians"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedResources.includes('plumbers')}
                      onChange={() => toggleResourceSelection('plumbers')}
                    />
                  }
                  label="Plumbers"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedResources.includes('carpenters')}
                      onChange={() => toggleResourceSelection('carpenters')}
                    />
                  }
                  label="Carpenters"
                />
              </FormGroup>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={handlePrevStep}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#0f2557', color: '#ffffff' }}
                  onClick={handleSaveTask}
                >
                  Save Task
                </Button>
              </Stack>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for success message */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          Task updated successfully!
        </Alert>
      </Snackbar>
      {showGraph && <TaskCategoryChart tasks={tasks} />} {/* Show graph based on the toggle state */}

      {/* Task details dialog displaying separate Notes and Progress fields */}
      {selectedTask && (
        <TaskDetailsDialog task={selectedTask} open={openDialog} onClose={handleCloseDialog} />
      )}

      {/* Dialog for deleting tasks */}
      {taskToDelete && (
        <Dialog open={deleteDialog} onClose={handleCancelDelete}>
          <DialogTitle>Are you sure you want to delete?</DialogTitle>
          <DialogContent>
            <Box textAlign="center" sx={{ mb: 2 }}>
              <img
                src="/images/delete.avif"
                alt="Delete illustration"
                style={{ width: '150px', marginBottom: '10px' }}
              />
              <Typography>Deleting this task cannot be undone!</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDelete} variant="outlined" sx={{ color: '#0f2557' }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" sx={{ backgroundColor: '#d32f2f', color: '#ffffff' }}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

const tableHeaderStyles = {
  fontWeight: 'bold',
  background: '#42a5f5',
  color: '#ffffff',
  textAlign: 'center',
};
