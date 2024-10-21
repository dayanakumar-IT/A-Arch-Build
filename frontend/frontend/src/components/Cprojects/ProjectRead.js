import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import 'font-awesome/css/font-awesome.min.css';
import './ProjectRead.css';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'; // Importing TextField from MUI
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Tooltip } from "@mui/material";
import deleteIcon from '../assets/delete.png';



export default function ProjectRead({ setActiveSection, setInspection }) {
    const [projects, setProjects] = useState({ planned: [], inProgress: [], inspection: [], completed: [] });
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [notifications, setNotifications] = useState(0);
    const [totalClients, setTotalClients] = useState(0);
    const [selectedProject, setSelectedProject] = useState(null);
const [modalOpen, setModalOpen] = useState(false);
    
    // Fields for project editing
    const [projectname, setProjectName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [duration, setDuration] = useState(1);
    const [startdate, setStartDate] = useState("");
    const [projectstatus, setProjectStatus] = useState("Planned");
    const [projecttype, setProjectType] = useState("");
    const [clientname, setClientname] = useState("");
    const [sitecode, setSiteCode] = useState("");
    const [teammembers, setTeammembers] = useState(0);
    const [projectId, setProjectId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);

    const apiUrl = "http://localhost:8000/project";
    const navigate = useNavigate();

    const fetchProjects = async (page = 1, limit = 6, search = "") => {
        try {
            const response = await fetch(`${apiUrl}/projects?page=${page}&limit=${limit}&search=${search}`);
            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data = await response.json();
            const categorizedProjects = {
                planned: data.data.filter(project => project.projectstatus === 'Planned'),
                inProgress: data.data.filter(project => project.projectstatus === 'In Progress'),
                inspection: data.data.filter(project => project.projectstatus === 'Inspection'),
                completed: data.data.filter(project => project.projectstatus === 'Completed')
            };
            setProjects(categorizedProjects);
            setTotalClients(data.totalClients);
            setNotifications(data.notifications);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchProjects(1, 6, value); // Call fetchProjects on every input change
    };

    const handleEdit = (project) => {
        setProjectId(project._id);
        setProjectName(project.projectname);
        setDescription(project.description);
        setLocation(project.location);
        setDuration(project.duration);
        setStartDate(project.startdate.split('T')[0]);
        setProjectStatus(project.projectstatus);
        setProjectType(project.projecttype);
        setClientname(project.clientname);
        setSiteCode(project.sitecode);
        setTeammembers(project.teammembers);
        setOpenDialog(true);// Open the dialog
    };

    const resetFields = () => {
        setProjectName('');
        setDescription('');
        setLocation('');
        setDuration(1);
        setStartDate('');
        setProjectStatus('Planned');
        setProjectType('');
        setClientname('');
        setSiteCode('');
        setTeammembers(0);
    };
    
    const handleOpenDeleteDialog = (projectId) => {
        setSelectedProjectId(projectId);
        setOpenDeleteDialog(true);
    };
    
    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedProjectId(null);
    };
    
    const handleConfirmDelete = () => {
        handleDelete(selectedProjectId); // Call the actual delete function
        setOpenDeleteDialog(false); // Close the delete dialog
    };
          
    const handleCloseDialog = () => {
        setOpenDialog(false); // Close the dialog
        resetFields(); // Reset selected project
    };

    const handleDialogSubmit = async () => {
        const updatedProject = {
            projectname,
            description,
            location,
            duration,
            startdate,
            projectstatus,
            projecttype,
            clientname,
            sitecode,
            teammembers
        };
        try {
            const response = await fetch(`${apiUrl}/projects/${projectId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProject)
            });
            if (!response.ok) {
                throw new Error("Failed to update project");
            }
            setOpenDialog(false); // Close the dialog on success
            fetchProjects(); // Refresh the projects after update
        } catch (error) {
            setError(error.message);
        }
    };

  

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${apiUrl}/projects/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete project");
            }
            setProjects(prevState => ({
                ...prevState,
                planned: prevState.planned.filter(project => project._id !== id),
                inProgress: prevState.inProgress.filter(project => project._id !== id),
                inspection: prevState.inspection.filter(project => project._id !== id),
                completed: prevState.completed.filter(project => project._id !== id)
            }));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleViewDetails = (project) => {
        setSelectedProject(project);
        setModalOpen(true);
    };
  
    


    const onDragEnd = (result) => {
        const { source, destination } = result;

        if (!destination) return;

        const sourceColumn = source.droppableId;
        const destColumn = destination.droppableId;

        const sourceItems = [...projects[sourceColumn]];
        const [movedItem] = sourceItems.splice(source.index, 1);

        const destItems = [...projects[destColumn]];
        destItems.splice(destination.index, 0, movedItem);

        movedItem.projectstatus = destColumn.charAt(0).toUpperCase() + destColumn.slice(1);

        setProjects(prevState => ({
            ...prevState,
            [sourceColumn]: sourceItems,
            [destColumn]: destItems
        }));
        // Optionally, update project status in the backend.
    };

    const renderProject = (project, index) => (
        <Draggable key={project._id} draggableId={project._id} index={index}>
            {(provided) => (
                <div
                    className="card"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                        border: '2px solid #0f2557', // Custom card outline
                        borderRadius: '8px',
                        marginBottom: '16px',
                        padding: '16px',
                        backgroundColor: '#fff', // Ensure the card has a white background for a clean look
                    }}
                >
                    <div className="card-body">
                        <span
                            className={`status-badge ${project.projectstatus.replace(/\s+/g, '').toLowerCase()}`}
                            style={{
                                backgroundColor: '#90caf9',
                                color: '#0f2557',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                display: 'inline-block',
                                marginBottom: '8px',
                            }}
                        >
                            {project.projectstatus}
                        </span>
    
                        {project.projectstatus === "Inspection" && (
                            <div className="center-button">
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                         // Pass project details when navigating to CreateInspection
                                    setInspection({
                                        section: 'CreateInspection', 
                                        projectName: project.projectname,
                                        siteCode: project.sitecode,
                                        locationState: project.location
                                    });
                                    }}
                                    sx={{
                                        backgroundColor: '#90caf9',
                                        '&:hover': {
                                            backgroundColor: '#64b5f6',
                                        },
                                        marginBottom: '8px',
                                    }}
                                >
                                    Add Inspection
                                </Button>
                            </div>
                        )}
    
                        <h5 className="project-name">{project.projectname}</h5>
                        <p className="card-text">
                            <strong>Description:</strong> {project.description}
                        </p>
    
                        <div className="button-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Tooltip title="View Details">
                                <IconButton
                                    onClick={() => handleViewDetails(project)}
                                    sx={{
                                        color: '#0f2557',
                                    }}
                                >
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
    
                            <Stack direction="row" spacing={1}>
                                <Tooltip title="Edit Project">
                                    <IconButton
                                        onClick={() => handleEdit(project)}
                                        sx={{
                                            color: '#075e86', // Custom blue shade for Edit
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
    
                                <Tooltip title="Delete Project">
                                    <IconButton
                                        onClick={() => handleOpenDeleteDialog(project._id)}
                                        sx={{
                                            color: '#f44336', // Red for Delete
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );


    return (
        <>
       
<Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
    <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#0f2557', color: '#fff', padding: '8px 12px', borderRadius: '50%' }}>
                <i className="fa fa-info-circle"></i>
            </span>
            <span style={{ color: '#0f2557', fontWeight: 'bold', fontSize: '1.5rem' }}>Project Details</span>
        </div>
    </DialogTitle>
    <DialogContent>
        {selectedProject && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f4f4f9', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ backgroundColor: '#0f2557', color: '#fff', padding: '4px 8px', borderRadius: '50%' }}>
                        <i className="fa fa-building"></i>
                    </span>
                    <h5 style={{ fontWeight: 'bold', color: '#0f2557', margin: 0 }}>{selectedProject.projectname}</h5>
                </div>
                <p style={{ fontStyle: 'italic', color: '#333', margin: '0 0 16px 0' }}>
                    {selectedProject.description}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#80cbc4', color: '#fff', padding: '4px 8px', borderRadius: '50%' }}>
                            <i className="fa fa-map-marker"></i>
                        </span>
                        <span><strong>Location:</strong> {selectedProject.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#5DBB63', color: '#fff', padding: '4px 8px', borderRadius: '50%' }}>
                            <i className="fa fa-clock"></i>
                        </span>
                        <span><strong>Duration:</strong> {selectedProject.duration} months</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#f9d342', color: '#333', padding: '4px 8px', borderRadius: '50%' }}>
                            <i className="fa fa-user"></i>
                        </span>
                        <span><strong>Client Name:</strong> {selectedProject.clientname}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#211C6A', color: '#fff', padding: '4px 8px', borderRadius: '50%' }}>
                            <i className="fa fa-code"></i>
                        </span>
                        <span><strong>Site Code:</strong> {selectedProject.sitecode}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#90caf9', color: '#0f2557', padding: '4px 8px', borderRadius: '50%' }}>
                            <i className="fa fa-calendar"></i>
                        </span>
                        <span><strong>Start Date:</strong> {new Date(selectedProject.startdate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#c2c234', color: '#0f2557', padding: '4px 8px', borderRadius: '50%' }}>
                            <i className="fa fa-tasks"></i>
                        </span>
                        <span><strong>Project Status:</strong> {selectedProject.projectstatus}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#7b7bed', color: '#fff', padding: '4px 8px', borderRadius: '50%' }}>
                            <i className="fa fa-industry"></i>
                        </span>
                        <span><strong>Project Type:</strong> {selectedProject.projecttype}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ backgroundColor: '#e07f7e', color: '#fff', padding: '4px 8px', borderRadius: '50%' }}>
                            <i className="fa fa-users"></i>
                        </span>
                        <span><strong>Team Members:</strong> {selectedProject.teammembers}</span>
                    </div>
                </div>
            </div>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setModalOpen(false)} color="primary" variant="contained" style={{ backgroundColor: '#0f2557', color: '#fff' }}>
            Close
        </Button>
    </DialogActions>
</Dialog>


        <div className="container">
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
    <DialogTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ backgroundColor: '#0f2557', color: '#fff', padding: '8px 12px', borderRadius: '50%' }}>
                <i className="fa fa-edit"></i>
            </span>
            <span style={{ color: '#0f2557', fontWeight: 'bold', fontSize: '1.5rem' }}>Edit Project</span>
        </div>
    </DialogTitle>
    <DialogContent  sx={{ 
        backgroundColor: '#e3f2fd', // Light blue background for the form
        paddingBottom: '16px', 
        borderRadius: '8px' // Rounded corners for a softer look
    }}>
        <TextField
            margin="dense"
            label="Project Name"
            name="projectname"
            value={projectname}
            onChange={(e) => setProjectName(e.target.value)}
            fullWidth
            sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: '8px',
                marginBottom: '16px', // Added margin bottom for spacing
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#0f2557',
                    },
                    '&:hover fieldset': {
                        borderColor: '#051094',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        />
        <TextField
            margin="dense"
            label="Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: '8px',
                marginBottom: '16px', // Added margin bottom for spacing
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#0f2557',
                    },
                    '&:hover fieldset': {
                        borderColor: '#051094',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        />
        <TextField
            margin="dense"
            label="Location"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: '8px',
                marginBottom: '16px', // Added margin bottom for spacing
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#0f2557',
                    },
                    '&:hover fieldset': {
                        borderColor: '#051094',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        />
        <TextField
            margin="dense"
            label="Duration (months)"
            name="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            fullWidth
            sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: '8px',
                marginBottom: '16px', // Added margin bottom for spacing
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#0f2557',
                    },
                    '&:hover fieldset': {
                        borderColor: '#051094',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        />
        <TextField
            margin="dense"
            label="Start Date"
            type="date"
            value={startdate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: '8px',
                marginBottom: '16px', // Added margin bottom for spacing
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#0f2557',
                    },
                    '&:hover fieldset': {
                        borderColor: '#051094',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        />
        <Select
            label="Project Status"
            value={projectstatus}
            onChange={(e) => setProjectStatus(e.target.value)}
            fullWidth
            margin="dense"
            sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: '8px',
                marginBottom: '16px', // Added margin bottom for spacing
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#0f2557',
                    },
                    '&:hover fieldset': {
                        borderColor: '#051094',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        >
            <MenuItem value="Planned" style={{ backgroundColor: '#ffeb3b', color: '#333' }}>Planned</MenuItem>
            <MenuItem value="In Progress" style={{ backgroundColor: '#1976d2', color: '#fff' }}>In Progress</MenuItem>
            <MenuItem value="Inspection" style={{ backgroundColor: '#64b5f6', color: '#fff' }}>Inspection</MenuItem>
            <MenuItem value="Completed" style={{ backgroundColor: '#43a047', color: '#fff' }}>Completed</MenuItem>
        </Select>
        <Select
            value={projecttype}
            onChange={(e) => setProjectType(e.target.value)}
            fullWidth
            margin="dense"
            sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: '8px',
                marginBottom: '16px', // Added margin bottom for spacing
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#0f2557',
                    },
                    '&:hover fieldset': {
                        borderColor: '#051094',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        >
            <MenuItem value="Commercial" style={{ backgroundColor: '#ffeb3b', color: '#333' }}>Commercial</MenuItem>
            <MenuItem value="Residential" style={{ backgroundColor: '#1976d2', color: '#fff' }}>Residential</MenuItem>
            <MenuItem value="Infrastructure" style={{ backgroundColor: '#64b5f6', color: '#fff' }}>Infrastructure</MenuItem>
            <MenuItem value="Renovation" style={{ backgroundColor: '#43a047', color: '#fff' }}>Renovation</MenuItem>
            <MenuItem value="Industrial" style={{ backgroundColor: '#ff7043', color: '#fff' }}>Industrial</MenuItem>
        </Select>
        <TextField
            margin="dense"
            label="Client Name"
            name="clientname"
            value={clientname}
            onChange={(e) => setClientname(e.target.value)}
            fullWidth
            sx={{
                backgroundColor: '#f9f9fb',
                borderRadius: '8px',
                marginBottom: '16px', // Added margin bottom for spacing
                '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                        borderColor: '#0f2557',
                    },
                    '&:hover fieldset': {
                        borderColor: '#051094',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                    },
                },
            }}
        />
    </DialogContent>
    <DialogActions sx={{ padding: '16px' }}>
        <Button onClick={handleCloseDialog} variant="outlined" style={{ color: '#0f2557', borderColor: '#0f2557' }}>
            Cancel
        </Button>
        <Button
            onClick={handleDialogSubmit}
            variant="contained"
            style={{ backgroundColor: '#0f2557', color: '#fff' }}
        >
            Update
        </Button>
    </DialogActions>
</Dialog>

            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card large-card" style={{ backgroundColor: '#f9d342', color: '#333' }}>
                        <i className="fa fa-bell icon"></i>
                        <div className="card-body">
                            <h5 className="card-title">Notifications</h5>
                            <p className="card-text">{notifications} new notifications</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card large-card" style={{ backgroundColor: '#211C6A', color: '#fff' }}>
                        <i className="fa fa-users icon"></i>
                        <div className="card-body">
                            <h5 className="card-title">Total Clients</h5>
                            <p className="card-text">{totalClients} clients</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card large-card" style={{ backgroundColor: '#5DBB63', color: '#fff' }}>
                        <i className="fa fa-folder-open icon"></i>
                        <div className="card-body">
                            <h5 className="card-title">Total Projects</h5>
                            <p className="card-text">{projects.planned.length + projects.inProgress.length + projects.inspection.length + projects.completed.length} projects</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card large-card" style={{ backgroundColor: '#80cbc4', color: '#fff' }}>
                        <i className="fa fa-plus icon"></i>
                        <div className="card-body">
                            <h5 className="card-title">New Project</h5>
                           <div className="center-button">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    navigate('/project-manager');
                                    setActiveSection('CreateProject');
                                }}
                                style={{ backgroundColor: '#1976d2', color: '#fff' }} /* Default MUI blue for Add */
                                >
                                Create Project
                            </Button>
                        </div>
                    </div>
                </div>
                </div>

                {error && <p className="text-danger">{error}</p>}
                <div className="search-container my-3 d-flex">
                    {/* MUI TextField for search */}
                    <TextField
                        label="Search projects by name, location, or client"
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearch}
                        sx={{ backgroundColor: '#fff' }} // Optional: add custom styling if needed
                    />
                </div>

                {/* Kanban Board */}
<DragDropContext onDragEnd={onDragEnd}>
    <div className="row">
        <div className="col-md-3">
            <h2 className="project-heading planned">Planned</h2>
            <Droppable droppableId="planned">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="droppable-area"
                    >
                        {projects.planned.map((project, index) => renderProject(project, index))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>

        <div className="col-md-3">
            <h2 className="project-heading inProgress">In Progress</h2>
            <Droppable droppableId="inProgress">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="droppable-area"
                    >
                        {projects.inProgress.map((project, index) => renderProject(project, index))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>

        <div className="col-md-3">
            <h2 className="project-heading inspection">Inspection</h2>
            <Droppable droppableId="inspection">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="droppable-area"
                    >
                        {projects.inspection.map((project, index) => renderProject(project, index))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>

        <div className="col-md-3">
            <h2 className="project-heading completed">Completed</h2>
            <Droppable droppableId="completed">
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="droppable-area"
                    >
                        {projects.completed.map((project, index) => renderProject(project, index))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    </div>
</DragDropContext>

<Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this project?
          </DialogContentText>
          <img 
    src={deleteIcon} // Ensure the path is correct
    alt="Delete Confirmation" 
    style={{ width: '60px', height: 'auto', marginBottom: '10px' }} 
/>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

            </div>
        </div>
        </>

    );
}
