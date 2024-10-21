import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Button, TextField, Box, InputAdornment, Modal, Fade, FormControl, Select, MenuItem, InputLabel, Snackbar } from '@mui/material';
import RescheduleIcon from '@mui/icons-material/Update'; // Icon for Reschedule
import CancelIcon from '@mui/icons-material/Cancel'; // Icon for Cancel
import SearchIcon from '@mui/icons-material/Search'; // Icon for Search
import MuiAlert from '@mui/material/Alert';
import cancel from '../assets/cancel.png';
import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // Import the PDF icon

const apiUrl = "http://localhost:8000/inspection"; // Make sure this matches your API
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const getInspectionTypeColor = (itype) => {
    switch (itype) {
        case 'Pre-Final Inspection':
            return '#43a047'; // Green for Safety inspections
        case 'Design and Quality Assurance Inspection':
            return '#1e88e5'; // Blue for Quality inspections
        case 'Building Code Compliance Inspection':
            return '#f4511e'; // Orange for Environmental inspections
        case 'Client Walkthrough':
            return '#8e24aa'; // Purple for Structural inspections
        case 'Final Punch List Inspection':
            return '#964B00'; 
        default:
            return '#607d8b'; // Default gray for other types
    }
};

const InspectionsDisplay = ({onAddInspectionClick}) => {
    const [inspections, setInspections] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchFilters, setSearchFilters] = useState({ assignee: '', type: '', complexity: '' });
    const [recentActivities, setRecentActivities] = useState([]);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [updatedData, setUpdatedData] = useState({ ititle: '', idate: '', itime: '', assignee: '' });
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [highlightedDays, setHighlightedDays] = useState([]); // State for storing booked dates
    const initialValue = dayjs(); // Set the initial value to the current date

    const assignees = ["Akashwaran", "Alex", "Riley", "Morgan"];
    const types = ["Pre-Final Inspection", "Design and Quality Assurance Inspection", "Building Code Compliance Inspection", "Client Walkthrough", "Final Punch List Inspection"];
    const complexities = ["Low", "Medium", "High"];

    useEffect(() => {
        const fetchInspections = async () => {
            try {
                const response = await fetch(`${apiUrl}/inspection/createinspection`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                console.log(data);
                setInspections(data);
            } catch (error) {
                console.error("Error fetching inspections:", error);
            }
        };

        const fetchRecentActivities = async () => {
            try {
                const response = await fetch(`${apiUrl}/recent-activities`);
                if (!response.ok) throw new Error('Network response was not ok');
                const activitiesData = await response.json();
                setRecentActivities(activitiesData);
            } catch (error) {
                console.error("Error fetching recent activities:", error);
            }
        };

        const fetchHighlightedDays = async () => {
            try {
                const response = await fetch(`${apiUrl}/getHighlightedDays`);
                const data = await response.json();
                setHighlightedDays(data.days); // Store booked dates
            } catch (error) {
                console.error("Error fetching highlighted days:", error);
            }
        };

        fetchInspections();
        fetchRecentActivities();
        fetchHighlightedDays(); // Fetch booked dates
    }, []);

    const filteredInspections = inspections.filter(inspection =>
        (inspection.projectname.toLowerCase().includes(searchTerm.toLowerCase()) || // Search by project name
        inspection.location.includes(searchTerm)) && 
        (!searchFilters.assignee || inspection.assignee === searchFilters.assignee) &&
        (!searchFilters.type || inspection.itype === searchFilters.type) &&
        (!searchFilters.projectcomplexity || inspection.projectcomplexity.toLowerCase() === searchFilters.projectcomplexity.toLowerCase())
    );
    
    

    const handleOpenModal = (inspection) => {
        setSelectedInspection(inspection);
        setUpdatedData({
            ititle: inspection.ititle,
            idate: inspection.idate.split('T')[0], // Format for date input
            itime: inspection.itime,
            assignee: inspection.assignee
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData({
            ...updatedData,
            [name]: value
        });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setSearchFilters({
            ...searchFilters,
            [name]: value
        });
    };

    const handleConfirm = async () => {
        try {
            const response = await fetch(`${apiUrl}/createinspection/${selectedInspection._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to update inspection');
            }

            const updatedInspection = await response.json();
            setInspections(inspections.map(ins => ins._id === updatedInspection._id ? updatedInspection : ins));
            handleCloseModal();

            setSnackbarMessage("Inspection updated successfully!");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error updating inspection:", error);
        }
    };

    const handleOpenConfirmModal = (inspection) => {
        setSelectedInspection(inspection);
        setOpenConfirmModal(true);
    };

    const handleCloseConfirmModal = () => {
        setOpenConfirmModal(false);
    };

    const handleDateChange = (newDate) => {
        const formattedDate = newDate.format('YYYY-MM-DD');
        if (highlightedDays.includes(formattedDate)) {
            alert("This date is already booked for an inspection and cannot be selected.");
            return;
        }
        setUpdatedData(prevData => ({
            ...prevData,
            idate: formattedDate
        }));
    };

    //handles delete
    const handleDelete = async () => {
        try {
            const response = await fetch(`${apiUrl}/createinspection/${selectedInspection._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete inspection');
            }

            setInspections(inspections.filter(ins => ins._id !== selectedInspection._id));
            setSnackbarMessage("Inspection deleted successfully!");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error deleting inspection:", error);
        } finally {
            handleCloseConfirmModal();
        }
    };


    const handleGeneratePdf = async (filteredInspections) => {
        try {
          // Send the filtered data to the backend
          const response = await fetch(`${apiUrl}/generateReport`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(filteredInspections), // Pass the filtered inspections as payload
          });
      
          if (!response.ok) {
            throw new Error('Failed to generate PDF');
          }
      
          // Get the file blob from the response
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          // Trigger the download
          const link = document.createElement('a');
          link.href = url;
          link.download = 'Filtered_Inspection_Report.pdf';
          link.click();
          
          window.URL.revokeObjectURL(url); // Clean up the URL
        } catch (error) {
          console.error('Error generating PDF:', error);
        }
      };
      

    // Custom day component to show badges on booked dates
    function ServerDay(props) {
        const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
        const isBooked = highlightedDays.includes(day.format('YYYY-MM-DD'));
        const today = dayjs().startOf('day');
        const isPast = day.isBefore(today);

        return (
            <Badge
                key={day.toString()}
                overlap="circular"
                badgeContent={isBooked ? '🔒' : null} // Show a lock emoji for booked dates
                color={isBooked ? 'error' : 'default'} // Highlight booked dates with a different color
            >
                <PickersDay
                    {...other}
                    outsideCurrentMonth={outsideCurrentMonth}
                    day={day}
                    disabled={isPast || isBooked} // Disable past and booked dates
                />
            </Badge>
        );
    }

    return (
        <div>
             <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} position="relative" width="100%" gap={2}>
      {/* Search bar */}
      <TextField
        variant="outlined"
        placeholder="Search Inspections..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ flex: 1 }} // Make the search bar take up available space
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Filters */}
      <Box display="flex" gap={2}>
        <FormControl variant="outlined" size="medium" sx={{ minWidth: 180 }}>
          <InputLabel>Assignee</InputLabel>
          <Select
            name="assignee"
            value={searchFilters.assignee}
            onChange={handleFilterChange}
            label="Assignee"
          >
            <MenuItem value="">All</MenuItem>
            {assignees.map((assignee) => (
              <MenuItem key={assignee} value={assignee}>
                {assignee}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="medium" sx={{ minWidth: 180 }}>
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={searchFilters.type}
            onChange={handleFilterChange}
            label="Type"
          >
            <MenuItem value="">All</MenuItem>
            {types.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl variant="outlined" size="medium" sx={{ minWidth: 180 }}>
          <InputLabel>Complexity</InputLabel>
          <Select
            name="projectcomplexity"
            value={searchFilters.projectcomplexity}
            onChange={handleFilterChange}
            label="Complexity"
          >
            <MenuItem value="">All</MenuItem>
            {complexities.map((complexity) => (
              <MenuItem key={complexity} value={complexity}>
                {complexity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Add Inspection Button */}
      <button
        onClick={onAddInspectionClick}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(250deg, #211C6A, #4137D0)',
          borderRadius: '30px',
          color: 'white',
          border: 'none',
          boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)',
          transition: 'box-shadow 0.3s ease-in-out',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => {
          e.target.style.boxShadow = '0 0 20px rgba(76, 175, 80, 1)';
        }}
        onMouseOut={(e) => {
          e.target.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.5)';
        }}
      >
        Add Inspection
      </button>
      {/* Add the PDF Icon */}
  <Button
    onClick={() => handleGeneratePdf(filteredInspections)} // Function to generate the PDF based on filtered data
    sx={{
      padding: '10px',
      backgroundColor: '#4137D0',
      color: '#fff',
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: '#211C6A',
      },
    }}
  >
    <PictureAsPdfIcon />
  </Button>
    </Box>
            <Grid container spacing={3}>
  {filteredInspections.map((inspection) => (
    <Grid item xs={12} sm={6} md={4} key={inspection._id}>
      <Card
        sx={{
          background: '#e3f2fd', // Bluish professional background color
          borderRadius: '20px',
          border: '0.3px solid #051094',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          padding: '16px',
          height: 380, // Fixed height for consistent card size
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          position: 'relative', // For positioning the complexity label
        }}
      >
        {/* Complexity label */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'linear-gradient(250deg, #211C6A, #4137D0)', // Gradient background
            color: '#fff',
            width: '100%', // Span the full width of the card
            height: '30px', // Fixed height for the label
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            textAlign: 'center',
            textTransform: 'uppercase', // Ensure the complexity text is uppercase
            letterSpacing: '2px', // Space out letters for better readability
          }}
        >
          {inspection.projectcomplexity || 'N/A'}
        </Box>

       


      


                                                    
                            <CardContent
                                sx={{
                                    textAlign: 'center',
                                    overflow: 'hidden', // Hide overflow content
                                    textOverflow: 'ellipsis', // Add ellipsis if text overflows
                                    whiteSpace: 'nowrap', // Prevent text from wrapping
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    height: '100%', // Ensure content fills the available space
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    title={inspection.ititle} // Show full title on hover
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        color: "#051094", 
                                        mb: 2, 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        width: '100%' 
                                    }}
                                >
                                    {inspection.ititle}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        backgroundColor: getInspectionTypeColor(inspection.itype),
                                        color: '#fff',
                                        borderRadius: '8px',
                                        padding: '2px 6px',
                                        fontSize: '0.8rem',
                                        display: 'inline-block',
                                        mb: 2,
                                    }}
                                >
                                    {inspection.itype}
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 1.5,
                                        overflow: 'hidden', // Ensure no content spills outside the box
                                        flexGrow: 1, // Allow this section to grow and fill available space
                                        maxHeight: '150px', // Limit the maximum height of the content section
                                        textAlign: 'left', // Align text to the left for readability
                                    }}
                                >
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Typography variant="caption" color="#051094">Project:</Typography>
                                        <Typography variant="body2" noWrap title={inspection.projectname}>{inspection.projectname}</Typography>
                                    </Box>
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Typography variant="caption" color="#051094">Site Code:</Typography>
                                        <Typography variant="body2" noWrap title={inspection.sitecode}>{inspection.sitecode}</Typography>
                                    </Box>
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Typography variant="caption" color="#051094">Date:</Typography>
                                        <Typography variant="body2" noWrap title={inspection.idate}>{inspection.idate}</Typography>
                                    </Box>
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Typography variant="caption" color="#051094">Time:</Typography>
                                        <Typography variant="body2" noWrap title={inspection.itime}>{inspection.itime}</Typography>
                                    </Box>
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Typography variant="caption" color="#051094">Assignee:</Typography>
                                        <Typography variant="body2" noWrap title={inspection.assignee}>{inspection.assignee}</Typography>
                                    </Box>
                                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Typography variant="caption" color="#051094">Location:</Typography>
                                        <Typography variant="body2" noWrap title={inspection.location}>{inspection.location}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>

                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="contained"
                                sx={{
                                    flex: '0 0 48%',
                                    background: 'linear-gradient(250deg, #211C6A, #4137D0)', // Use 'background' instead of 'backgroundColor'
                                    color: '#fff', // Ensure the text color is set for better readability
                                    '&:hover': {
                                    background: 'linear-gradient(250deg, #4137D0, #211C6A)', // Optional: Adjust gradient on hover
                                    },
                                }}
                                startIcon={<RescheduleIcon />}
                                onClick={() => handleOpenModal(inspection)}
                                >
                                Reschedule
                            </Button>

                                <Button
                                    variant="contained"
                                    sx={{
                                        flex: '0 0 48%',
                                        backgroundColor: 'red',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#c62828',
                                        },
                                    }}
                                    startIcon={<CancelIcon />}
                                    onClick={() => handleOpenConfirmModal(inspection)}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal
                open={openConfirmModal}
                onClose={handleCloseConfirmModal}
                closeAfterTransition
                aria-labelledby="confirmation-modal-title"
                aria-describedby="confirmation-modal-description"
            >
                <Fade in={openConfirmModal}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 300,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '20px',
                        textAlign: 'center'
                    }}>
                        <Typography id="confirmation-modal-title" variant="h6" component="h2">
                            Are you sure you want to cancel the schedule?
                        </Typography>
                        <img src={cancel} alt="Confirmation" style={{ width: '100px', margin: '20px 0' }} />
                        <div>
                            <Button variant="contained" color="error" onClick={handleDelete} sx={{ mr: 2 }}>
                                Yes
                            </Button>
                            <Button variant="outlined" onClick={handleCloseConfirmModal}>
                                No
                            </Button>
                        </div>
                    </Box>
                </Fade>
            </Modal>

            {/* Modal for Rescheduling */}
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                closeAfterTransition
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
            >
                <Fade in={openModal}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 500,
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            bgcolor: '#f0f4fa', // Light background for a modern feel
                            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)', // Softer shadow for depth
                            p: 4,
                            borderRadius: '12px', // Softer radius for a smooth appearance
                        }}
                    >
                        <Typography
                            id="transition-modal-title"
                            variant="h6"
                            component="h2"
                            sx={{ mb: 3, color: '#051094', fontWeight: 'bold' }} // Vibrant blue with bold text for better emphasis
                        >
                            Reschedule Inspection
                        </Typography>
                        <TextField
                            label="Inspection Title"
                            name="ititle"
                            value={updatedData.ititle}
                            onChange={handleInputChange}
                            fullWidth
                            sx={{ mb: 2 }}
                            InputProps={{
                                sx: {
                                    borderRadius: '8px',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for input field
                                    '&:hover': {
                                        backgroundColor: '#e3f2fd', // Light blue background on hover for interactivity
                                    },
                                }
                            }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <StaticDatePicker
                                orientation="portrait"
                                value={dayjs(updatedData.idate)}
                                onChange={handleDateChange}
                                renderLoading={() => <DayCalendarSkeleton />}
                                slots={{ day: ServerDay }}
                                slotProps={{ day: { highlightedDays } }}
                                shouldDisableDate={(date) => {
                                    const today = dayjs().startOf('day');
                                    return date.isBefore(today) || highlightedDays.includes(date.format('YYYY-MM-DD'));
                                }}
                                sx={{
                                    mb: 3, // Added bottom margin for spacing
                                    background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.5) 0%, rgba(255, 255, 224, 0.5) 100%)', // Light gradient with blue and yellow
                                    borderRadius: '8px', // Rounded corners for the calendar background
                                    p: 1, // Padding for better spacing inside the calendar
                                }}
                            />
                        </LocalizationProvider>
                        <TextField
                            label="Inspection Time"
                            name="itime"
                            type="time"
                            value={updatedData.itime}
                            onChange={handleInputChange}
                            fullWidth
                            sx={{ mb: 2 }}
                            InputProps={{
                                sx: {
                                    borderRadius: '8px',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for input field
                                    '&:hover': {
                                        backgroundColor: '#e3f2fd', // Light blue background on hover
                                    },
                                }
                            }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="assignee-label" sx={{ color: '#4a90e2' }}>Assignee</InputLabel>
                            <Select
                                labelId="assignee-label"
                                name="assignee"
                                value={updatedData.assignee}
                                onChange={handleInputChange}
                                sx={{
                                    borderRadius: '8px',
                                    backgroundColor: '#ffffff',
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow for dropdown
                                    '&:hover': {
                                        backgroundColor: '#e3f2fd', // Light blue background on hover
                                    },
                                    '& .MuiSelect-select': {
                                        padding: '10px 14px', 
                                    },
                                }}
                            >
                                {assignees.map((assignee) => (
                                    <MenuItem
                                        key={assignee}
                                        value={assignee}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: '#4a90e2', // Highlighted background for menu items
                                                color: '#fff', // White text for contrast on hover
                                            },
                                        }}
                                    >
                                        {assignee}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <Button
                                variant="contained"
                                onClick={handleConfirm}
                                sx={{
                                    backgroundColor: '#4a90e2',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)', // Subtle shadow for better depth
                                    '&:hover': {
                                        backgroundColor: '#357abd', // Darker blue on hover for contrast
                                    },
                                    mr: 2,
                                }}
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCloseModal}
                                sx={{
                                    borderColor: '#4a90e2',
                                    color: '#4a90e2',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#e3f2fd', // Light blue on hover for a cohesive look
                                    },
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Box>
                </Fade>
            </Modal>

            {/* Snackbar for confirmation */}
            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default InspectionsDisplay;
