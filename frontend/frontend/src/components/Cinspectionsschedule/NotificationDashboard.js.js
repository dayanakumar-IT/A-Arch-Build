import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
    Button,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Container,
    Box,
    Paper,
    Tooltip,
    Grid,
    TextField,
    InputAdornment,
} from "@mui/material";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend,
    CategoryScale,
    LinearScale,
} from "chart.js";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { Pie } from "react-chartjs-2";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import ShareIcon from "@mui/icons-material/Share";
import EmailIcon from "@mui/icons-material/Email";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

import WalkIcon from "@mui/icons-material/DirectionsWalk";
import ChecklistIcon from "@mui/icons-material/PlaylistAddCheck";
import PunchListIcon from "@mui/icons-material/AssignmentLate";
import NotificationImportantIcon from "@mui/icons-material/NotificationImportant";
import { SaveAlt as PdfIcon } from "@mui/icons-material"; // Icon for Generate Report
import SearchIcon from "@mui/icons-material/Search"; // Search Icon
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EngineeringIcon from '@mui/icons-material/Engineering'; // Using for complexity example



// If "ComplexityIcon" is not a standard icon, use any related icon like EngineeringIcon or create a custom one.


// Register the required Chart.js elements
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale);

const libraries = ["places"];
const mapContainerStyle = {
    width: "100%",
    height: "400px",
};
const defaultCenter = {
    lat: 6.927079,
    lng: 79.861244,
};

const QualityAssuranceDashboard = () => {
    const [notifications, setNotifications] = useState([]);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
    const [address, setAddress] = useState("");
    const [coordinates, setCoordinates] = useState(defaultCenter);
    const [inspectionTypesData, setInspectionTypesData] = useState({ labels: [], datasets: [] });
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { isLoaded, loadError } = useLoadScript({
       
        libraries,
    });

      
    // Function to calculate inspection types from the notifications
    const calculateInspectionTypes = (notifications) => {
        const typeCount = {};
        notifications.forEach((notification) => {
            // Check if inspectionDetails is not null and has an itype property
            if (notification.inspectionDetails && notification.inspectionDetails.itype) {
                const inspectionType = notification.inspectionDetails.itype;
                typeCount[inspectionType] = (typeCount[inspectionType] || 0) + 1;
            }
        });

        const labels = Object.keys(typeCount);
        const data = Object.values(typeCount);

        setInspectionTypesData({
            labels: labels,
            datasets: [
                {
                    label: 'Inspection Types',
                    data: data,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                },
            ],
        });
    };


    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = notifications.filter((notification) =>
            notification.inspectionDetails?.ititle?.toLowerCase().includes(term)
        );
        setFilteredNotifications(filtered);
    };


    const handleGenerateReport = async () => {
        try {
            const response = await fetch('http://localhost:8000/inspection/generateReport');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'inspection-report.pdf');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            } else {
                console.error('Error generating report');
            }
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };


    useEffect(() => {
        const fetchNotifications = async () => {
            const response = await fetch("http://localhost:8000/inspection/notifications");
            const data = await response.json();
            setNotifications(data);
            calculateInspectionTypes(data);
            setFilteredNotifications(data);
        };
        fetchNotifications();
    }, []);

    const handleSearchInMap = () => {
        setMapVisible(true);
    };

    const handleViewDetails = (inspectionDetails) => {
        setSelectedInspection(inspectionDetails);
    };

    const handleHideDetails = () => {
        setSelectedInspection(null);
        setMapVisible(false);
    };

    const handleSelect = async (value) => {
        const results = await geocodeByAddress(value);
        const latLng = await getLatLng(results[0]);
        setCoordinates(latLng);
        setAddress(value);
        setMapVisible(true); // Show the map when a location is selected
    };

    const shareLocation = () => {
        const shareLink = `https://www.google.com/maps/?q=${coordinates.lat},${coordinates.lng}`;
        navigator.clipboard.writeText(shareLink);
        alert("Location link copied to clipboard!");
    };

    const sendEmail = () => {
        const emailSubject = "Location Link";
        const emailBody = `This is the link to be shared: https://www.google.com/maps/?q=${coordinates.lat},${coordinates.lng}`;
        const mailtoLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
    };

    const openDocument = (docUrl) => {
        window.open(docUrl, "_blank");
    };

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    // Dummy URLs for uploaded documents (replace with actual URLs)
    const inspectionDocuments = [
        { name: "Pre-Final Inspection", url: "https://docs.google.com/document/d/1bTdxA7D8dJEumvljrDutD0kbJgYynA5J/edit", icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, marginRight: 2 }} /> },
        { name: "Building Compliance Inspection", url: "https://docs.google.com/document/d/14wwvR8FioqcTsttaW7OdPdU2qtJBxqX7/edit", icon: <EngineeringIcon sx={{ fontSize: 40, marginRight: 2 }} /> },
        { name: "Client Walk-Through", url: "https://docs.google.com/document/d/1Xv1Uqu63ULpTTK5XgMl6eJoLFRX_YOhM/edit", icon: <WalkIcon sx={{ fontSize: 40, marginRight: 2 }} /> },
        { name: "Design and Quality Inspection", url: "https://docs.google.com/document/d/1smCdrn_wB9D9sX2YSAA-GGfYL5RYcPJ_/edit", icon: <ChecklistIcon sx={{ fontSize: 40, marginRight: 2 }} /> },
        { name: "Final Punch List", url: "https://docs.google.com/document/d/1LBy1YsFrDFD9-S80OibVJTSrQiDAMj90/edit", icon: <PunchListIcon sx={{ fontSize: 40, marginRight: 2 }} /> },
    ];

   

    

    return (
        <Container maxWidth="lg">
            <Box mt={4} display="flex" alignItems="center" justifyContent="space-between">
            <TextField
                label="Search by Inspection Title"
                variant="outlined"
                value={searchTerm}
                placeholder="Search Scehduled Inspections..."
                onChange={handleSearch}
                sx={{ width: "80%" }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateReport}
                    startIcon={<PdfIcon />}
                >
                    Generate Report
                </Button>
            </Box>

            <Box mt={4}>
                <Grid container spacing={2}>
                    {/* Left side: Notifications list */}
                    <Grid item xs={12} md={6}>
    <Typography variant="h5" gutterBottom>
        Notifications
    </Typography>
    <Paper 
        variant="outlined" 
        sx={{ 
            padding: 2, 
            marginBottom: 2, 
            backgroundColor: "#f4f6f8", 
            maxHeight: "400px", 
            overflowY: "auto", 
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' // Adding a nice shadow
        }}
    >
        <List>
            {filteredNotifications.map((notification, index) => (
                <ListItem
                    key={index}
                    divider
                    sx={{
                        transition: 'transform 0.3s ease-in-out', // Adding a smooth animation
                        '&:hover': { 
                            transform: 'scale(1.02)', // Slightly scale up on hover
                            backgroundColor: '#e3f2fd', // Highlighting the notification on hover
                        },
                        backgroundColor: notification.severity === 'high' ? '#ffebee' : '#f1f8e9', // Colors based on severity
                        borderRadius: '10px', // Rounded corners for a more modern look
                        marginBottom: '10px',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Use different icons based on notification type */}
                        {notification.severity === 'high' ? (
                            <NotificationImportantIcon color="error" sx={{ marginRight: 2, fontSize: 35 }} />
                        ) : (
                            <AssignmentTurnedInIcon color="success" sx={{ marginRight: 2, fontSize: 35 }} />
                        )}
                    </Box>
                    <ListItemText
                        primary={
                            <Typography 
                                variant="body1" 
                                sx={{ fontWeight: 'bold', color: '#37474f' }} // Stylish primary text
                            >
                                {notification.message}
                            </Typography>
                        }
                        secondary={
                            <Typography 
                                variant="body2" 
                                sx={{ color: '#78909c' }} // Subtle secondary text
                            >
                                {dayjs(notification.date).format("MM/DD/YYYY HH:mm")}
                            </Typography>
                        }
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginLeft: 2, backgroundColor: '#42a5f5' }}
                        onClick={() => handleViewDetails(notification.inspectionDetails)}
                    >
                        View
                    </Button>
                </ListItem>
            ))}
        </List>
    </Paper>
</Grid>


                    {/* Right side: Pie chart with default labels */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Inspection Types
                    </Typography>
                    <Paper variant="outlined" sx={{ padding: 2, height: "400px" }}>
                        <Pie 
                            data={inspectionTypesData} 
                            options={{
                                plugins: {
                                    legend: {
                                        position: 'right', // Position the legend to the right of the pie chart
                                    },
                                },
                                maintainAspectRatio: false, // Ensure the chart scales properly with the container
                            }} 
                        />
                    </Paper>
                </Grid>


                </Grid>
            </Box>

            {selectedInspection && (
    <Card
        sx={{
            marginTop: 2,
            padding: 3,
            background: "linear-gradient(135deg, #e3f2fd 30%, #ffffff 90%)", // Subtle gradient
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)', // Slightly stronger shadow for depth
            borderRadius: '20px', // Smoother and more rounded corners
            transition: 'all 0.4s ease-in-out', // Smooth transition on hover
            '&:hover': {
                boxShadow: '0 16px 32px rgba(0, 0, 0, 0.25)', // More prominent shadow on hover
                transform: 'scale(1.01)', // Slight scaling effect for focus
            },
        }}
    >
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1e88e5' }}>
                    <EngineeringIcon sx={{ fontSize: 60, marginRight: 2, color: "#1e88e5", animation: "rotate 2s infinite" }} />
                    Inspection Details
                </Typography>
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleHideDetails}
                    sx={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        '&:hover': {
                            backgroundColor: '#ffcdd2',
                            color: '#000',
                        },
                    }}
                >
                    Hide
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <ChecklistIcon sx={{ fontSize: 50, marginRight: 2, color: "#66bb6a", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Site Code:</strong> {selectedInspection.sitecode}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <AssignmentTurnedInIcon sx={{ fontSize: 50, marginRight: 2, color: "#ffa726", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Project Name:</strong> {selectedInspection.projectname}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <WalkIcon sx={{ fontSize: 50, marginRight: 2, color: "#26c6da", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Title:</strong> {selectedInspection.ititle}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <PunchListIcon sx={{ fontSize: 50, marginRight: 2, color: "#ef5350", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Type:</strong> {selectedInspection.itype}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <CalendarTodayIcon sx={{ fontSize: 50, marginRight: 2, color: "#ab47bc", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Date:</strong> {selectedInspection.idate}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <AccessTimeIcon sx={{ fontSize: 50, marginRight: 2, color: "#5c6bc0", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Time:</strong> {selectedInspection.itime}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <PersonIcon sx={{ fontSize: 50, marginRight: 2, color: "#8d6e63", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Assignee:</strong> {selectedInspection.assignee}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <EngineeringIcon sx={{ fontSize: 50, marginRight: 2, color: "#f57c00", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Complexity:</strong> {selectedInspection.projectcomplexity}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12}>
                    <Box display="flex" alignItems="center" mb={3}>
                        <LocationOnIcon sx={{ fontSize: 50, marginRight: 2, color: "#d32f2f", animation: 'bounce 2s infinite' }} />
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#424242' }}>
                            <strong>Location:</strong> {selectedInspection.location}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Box mt={4} display="flex" justifyContent="center" gap={3}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearchInMap}
                    sx={{
                        padding: '10px 20px',
                        borderRadius: '30px',
                        transition: 'all 0.3s ease-in-out',
                        background: "linear-gradient(45deg, #42a5f5 30%, #478ed0 90%)", // Gradient button background
                        '&:hover': {
                            background: "linear-gradient(45deg, #478ed0 30%, #42a5f5 90%)",
                            transform: 'scale(1.1)', // Scaling effect on hover
                        },
                    }}
                >
                    Search in Map
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleHideDetails}
                    sx={{
                        padding: '10px 20px',
                        borderRadius: '30px',
                        transition: 'all 0.3s ease-in-out',
                        background: "linear-gradient(45deg, #ff7043 30%, #f4511e 90%)", // Gradient button background
                        '&:hover': {
                            background: "linear-gradient(45deg, #f4511e 30%, #ff7043 90%)",
                            transform: 'scale(1.1)', // Scaling effect on hover
                        },
                    }}
                >
                    Close
                </Button>
            </Box>
        </CardContent>
    </Card>
)}


            {mapVisible && (
                <Box mt={4}>
                    <Box mb={2}>
                        {/* Search bar inside the map container */}
                        <PlacesAutocomplete value={address} onChange={setAddress} onSelect={handleSelect}>
                            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                <div>
                                    <input
                                        {...getInputProps({ placeholder: "Enter a location..." })}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '20px',
                                            marginBottom: '10px',
                                        }}
                                    />
                                    <div>
                                        {loading ? <div>Loading...</div> : null}
                                        {suggestions.map((suggestion) => {
                                            const style = {
                                                backgroundColor: suggestion.active ? "#fafafa" : "#ffffff",
                                                padding: "10px",
                                                cursor: "pointer",
                                            };
                                            return (
                                                <div {...getSuggestionItemProps(suggestion, { style })} key={suggestion.placeId}>
                                                    {suggestion.description}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </PlacesAutocomplete>
                    </Box>

                    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={15} center={coordinates}>
                        <Marker position={coordinates} />
                    </GoogleMap>

                    <Box mt={2} display="flex" gap={2}>
    <Tooltip title="Copy location link to clipboard">
        <Button
            variant="contained"
            color="primary"
            onClick={shareLocation}
            startIcon={<ShareIcon />}
            sx={{
                padding: '12px 25px',
                borderRadius: '35px',
                transition: 'all 0.3s ease-in-out',
                background: "linear-gradient(45deg, #64b5f6 30%, #42a5f5 90%)", // Gradient background similar to above
                '&:hover': {
                    background: "linear-gradient(45deg, #42a5f5 30%, #64b5f6 90%)",
                    transform: 'scale(1.1)', // Scaling effect on hover
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)', // Hover shadow effect
                },
            }}
        >
            Share Location
        </Button>
    </Tooltip>
    <Tooltip title="Send location link via email">
        <Button
            variant="contained"
            color="secondary"
            onClick={sendEmail}
            startIcon={<EmailIcon />}
            sx={{
                padding: '12px 25px',
                borderRadius: '35px',
                transition: 'all 0.3s ease-in-out',
                background: "linear-gradient(45deg, #ff7043 30%, #f4511e 90%)", // Gradient background similar to above
                '&:hover': {
                    background: "linear-gradient(45deg, #f4511e 30%, #ff7043 90%)",
                    transform: 'scale(1.1)', // Scaling effect on hover
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)', // Hover shadow effect
                },
            }}
        >
            Send Email
        </Button>
    </Tooltip>
</Box>

                </Box>
            )}

            <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                    Inspection Documents
                </Typography>
                <Grid container spacing={2}>
                    {inspectionDocuments.map((doc, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card sx={{ display: "flex", alignItems: "center", padding: 2, backgroundColor: "#ffffff" }}>
                                {doc.icon}
                                <Box>
                                    <Typography variant="body1">{doc.name}</Typography>
                                    <Button variant="contained" onClick={() => openDocument(doc.url)} sx={{ mt: 1 }}>
                                        Open Document
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default QualityAssuranceDashboard;
