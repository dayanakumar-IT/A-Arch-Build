import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  Badge,
} from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import HomeIcon from "@mui/icons-material/Home";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // For table support in jsPDF
import axios from "axios";
import PermitFormModal from "./PermitForm";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import InfoIcon from "@mui/icons-material/Info"; // Import InfoIcon
import Divider from "@mui/material/Divider"; // Import Divider
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import { ListItemIcon } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WarningIcon from "@mui/icons-material/Warning";
import FullscreenIcon from "@mui/icons-material/Fullscreen"; // Import fullscreen icon
import CloseIcon from "@mui/icons-material/Close"; // Icon to close full screen
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

const permitTypes = [
  {
    label: "Building",
    color: "#d8b6ff",
    typeCode: "PT_B",
    image: "/images/building.png",
    img: "/images/build.jpg",
  },
  {
    label: "Fire-Safety",
    color: "#ffb3b3",
    typeCode: "PT_F",
    image: "/images/fire-safety.png",
    img: "/images/fire.png",
  },
  {
    label: "Plumbing",
    color: "#ffdf91",
    typeCode: "PT_P",
    image: "/images/plumbing.png",
    img: "/images/plumb.png",
  },
  {
    label: "Electrical",
    color: "#b3ffb3",
    typeCode: "PT_E",
    image: "/images/electrical.png",
    img: "/images/elect.jpg",
  },
];

// Define the project data for the side codes
const projectData = {
  SC001: "Project Alpha",
  SC002: "Project Beta",
  SC003: "Project Gamma",
};

const PDFViewer = ({ pdfFile }) => {
  const [openFullScreen, setOpenFullScreen] = useState(false);

  // Create plugins for zoom, page navigation, and toolbar
  const zoomPluginInstance = zoomPlugin();
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { CurrentPageLabel, GoToNextPage, GoToPreviousPage } =
    pageNavigationPluginInstance;

  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;

  const handleOpenFullScreen = () => {
    setOpenFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setOpenFullScreen(false);
  };

  return (
    <div>
      {pdfFile ? (
        <div>
          {/* Display the small view with an expand button */}
          <Box position="relative" width="100%" height="350px">
            <Worker workerUrl="/pdf.worker.min.mjs">
              <Viewer
                fileUrl={pdfFile}
                plugins={[
                  zoomPluginInstance,
                  pageNavigationPluginInstance,
                  toolbarPluginInstance,
                ]}
              />
            </Worker>

            {/* Add a button to open full screen */}
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <IconButton
                sx={{
                  backgroundColor: "white",
                  zIndex: 10,
                }}
                onClick={handleOpenFullScreen}
              >
                <FullscreenIcon />
              </IconButton>

              {/* PDF Viewer Controls (zoom, download, print, page nav) */}
              <ZoomInButton />
              <ZoomOutButton />
            </Box>
          </Box>

          {/* Fullscreen PDF viewer in a Dialog */}
          <Dialog
            fullScreen
            open={openFullScreen}
            onClose={handleCloseFullScreen}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                backgroundColor: "#211C6A",
                color: "white",
              }}
            >
              <Typography variant="h6">PDF Full View</Typography>
              <IconButton
                sx={{ color: "white" }}
                onClick={handleCloseFullScreen}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {/* PDF Viewer with toolbar controls in Fullscreen */}
            <Box>
              <Worker workerUrl="/pdf.worker.min.mjs">
                <Viewer
                  fileUrl={pdfFile}
                  plugins={[
                    zoomPluginInstance,
                    pageNavigationPluginInstance,
                    toolbarPluginInstance,
                  ]}
                />
              </Worker>

              <Toolbar />
            </Box>
          </Dialog>
        </div>
      ) : (
        <Typography variant="body2" color="textSecondary">
          No PDF Uploaded
        </Typography>
      )}
    </div>
  );
};

const PermitDisplay = () => {
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPermitToDelete, setSelectedPermitToDelete] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [permitCounters, setPermitCounters] = useState({
    Building: 1,
    "Fire-Safety": 1,
    Plumbing: 1,
    Electrical: 1,
  });
  const [formData, setFormData] = useState({
    permitNumber: "",
    issueDate: "",
    expiryDate: "",
    projectName: "",
    sideCode: "",
    approvalStatus: "",
  });
  const [dateErrors, setDateErrors] = useState({
    issueDate: "",
    expiryDate: "",
  });
  const [pdfFile, setPdfFile] = useState(null); // For PDF Viewer
  const [sideCodeTabs, setSideCodeTabs] = useState({});
  const [currentTab, setCurrentTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [filterStatus, setFilterStatus] = useState(""); // For filter functionality

  useEffect(() => {
    // Fetch data from DB on load and refresh
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/pm/api/permits");
        const data = response.data;
        const groupedData = data.reduce((acc, permit) => {
          acc[permit.sideCode] = acc[permit.sideCode] || [];
          acc[permit.sideCode].push(permit);
          return acc;
        }, {});
        setSideCodeTabs(groupedData);
        setCurrentTab(Object.keys(groupedData)[0]); // Select first tab by default
      } catch (error) {
        toast.error("Failed to fetch permits from the database");
      }
    };

    fetchData();
  }, []);

  // Poll for notifications every 10 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/pm/api/notifications"
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchNotifications(); // Poll every 10 seconds
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Function to open the notifications dialog
  const handleOpenNotifications = () => {
    setOpenNotifications(true);
  };

  // Function to close the notifications dialog
  const handleCloseNotifications = () => {
    setOpenNotifications(false);
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Filtered data based on search term and filter status
  const filteredData = () => {
    if (!sideCodeTabs[currentTab]) return [];
    return sideCodeTabs[currentTab]
      .filter(
        (permit) =>
          permit.permitNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          permit.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permit.sideCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((permit) =>
        filterStatus ? permit.approvalStatus === filterStatus : true
      );
  };

  const handleSubmit = async () => {
    if (
      !formData.issueDate ||
      !formData.expiryDate ||
      !formData.approvalStatus
    ) {
      toast.error("Please fill out all fields correctly");
      return;
    }

    const formDataToSubmit = new FormData(); // Use FormData to handle file uploads
    formDataToSubmit.append("permitNumber", formData.permitNumber);
    formDataToSubmit.append("issueDate", formData.issueDate);
    formDataToSubmit.append("expiryDate", formData.expiryDate);
    formDataToSubmit.append("projectName", formData.projectName);
    formDataToSubmit.append("sideCode", formData.sideCode);
    formDataToSubmit.append("approvalStatus", formData.approvalStatus);

    if (formData.permitDocument) {
      formDataToSubmit.append("permitDocument", formData.permitDocument); // Append file if it's there
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8000/pm/api/permits/${formData._id}`,
          formDataToSubmit,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Permit successfully updated");
      } else {
        await axios.post(
          "http://localhost:8000/pm/api/permits",
          formDataToSubmit,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Permit successfully submitted");
      }
      // Reset form and fetch updated data
      setFormData({
        permitNumber: "",
        issueDate: "",
        expiryDate: "",
        projectName: "",
        sideCode: "",
        approvalStatus: "",
      });
      setPdfFile(null);
      setOpen(false);
      fetchData(); // Call fetch function to refresh permit list
    } catch (error) {
      toast.error("Failed to submit permit");
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Add a logo image (ensure it's in the right path or update the path)
    const img = "/images/logo.jpg"; // Assuming the image is placed here in your public folder
    doc.addImage(img, "JPEG", 160, 10, 30, 30); // Adding logo in the top-right corner

    // Add title with sideCode and project name
    const sideCode = currentTab; // Assuming currentTab holds the selected sideCode
    const projectName = projectData[sideCode]; // Assuming projectData holds the project names

    doc.setFontSize(22);
    doc.setTextColor("#4A4A4A");
    doc.text("Permit Report", 20, 20); // Title

    doc.setFontSize(16);
    doc.setTextColor("#007BFF");
    doc.text(`Project Name: ${projectName}`, 20, 35); // Project name

    doc.setFontSize(14);
    doc.setTextColor("#333333");
    doc.text(`Side Code: ${sideCode}`, 20, 45); // Side code

    // Horizontal line after the header section for visual separation
    doc.setDrawColor(150);
    doc.line(20, 50, 190, 50);

    // Add autoTable for filtered data (without side code and project name)
    autoTable(doc, {
      startY: 55, // Adjust starting position after header
      head: [["Permit Number", "Issue Date", "Expiry Date", "Approval Status"]],
      body: filteredData().map((permit) => [
        permit.permitNumber,
        new Date(permit.issueDate).toLocaleDateString(),
        new Date(permit.expiryDate).toLocaleDateString(),
        permit.approvalStatus,
      ]),
      styles: {
        fontSize: 12,
        cellPadding: 6,
        valign: "middle",
        halign: "center", // Center-align the table data
      },
      headStyles: {
        fillColor: "#211C6A", // Blue header background
        textColor: "#FFFFFF", // White header text
        fontSize: 14, // Larger font size for header
      },
      alternateRowStyles: {
        fillColor: "#F2F2F2", // Light gray for alternate row background
      },
    });

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, 180, 290); // Positioned at the bottom-right
    }

    // Save the PDF
    doc.save(`Permit_Report_${sideCode}.pdf`);
  };

  const handlePermitSelection = (permit, editMode = false) => {
    setSelectedPermit(permit);
    setIsEditMode(editMode);

    if (editMode) {
      // Find the correct permit type based on the permitNumber for the image in edit mode
      const permitType = permitTypes.find(
        (type) => type.typeCode === permit.permitNumber.substring(0, 4)
      );
      // Pre-fill form with selected permit data and format the date fields
      setFormData({
        ...permit,
        issueDate: formatDateForInput(permit.issueDate),
        expiryDate: formatDateForInput(permit.expiryDate),
      });
      setSelectedPermit(permitType); // This ensures the correct image is shown
    } else {
      // Clear the form when creating a new permit and generate new permit number
      setFormData({
        permitNumber: `${permit.typeCode}${String(
          permitCounters[permit.label]
        ).padStart(3, "0")}`,
        issueDate: "",
        expiryDate: "",
        projectName: "",
        sideCode: "",
        approvalStatus: "",
      });
    }
    setOpen(true);
  };

  const handleDeleteConfirm = (permit) => {
    setSelectedPermitToDelete(permit); // Set the selected permit for deletion
    setDeleteConfirmOpen(true); // Open the confirmation dialog
  };

  const handleDelete = async () => {
    try {
      if (!selectedPermitToDelete || !selectedPermitToDelete._id) {
        toast.error("Permit to delete is not selected properly.");
        return;
      }
  
      // Close the confirmation dialog first
      setDeleteConfirmOpen(false);
      setSelectedPermitToDelete(null);
  
      // Remove the deleted permit from state immediately
      setSideCodeTabs((prevTabs) => {
        const updatedTabs = { ...prevTabs };
        updatedTabs[currentTab] = updatedTabs[currentTab].filter(
          (permit) => permit._id !== selectedPermitToDelete._id
        );
        return updatedTabs;
      });
  
      // Call the delete API with the selected permit ID
      await axios.delete(
        `http://localhost:8000/pm/api/permits/${selectedPermitToDelete._id}`
      );
  
      // Show success message
      toast.success("Permit successfully deleted");
  
      // Refresh the permit list by fetching data
      fetchData();
    } catch (error) {
      toast.error("Failed to delete permit");
    }
  };
  
  
  
  

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/pm/api/permits");
      const data = response.data;
      const groupedData = data.reduce((acc, permit) => {
        acc[permit.sideCode] = acc[permit.sideCode] || [];
        acc[permit.sideCode].push(permit);
        return acc;
      }, {});
      setSideCodeTabs(groupedData);
      setCurrentTab(Object.keys(groupedData)[0]); // Select first tab by default
    } catch (error) {
      toast.error("Failed to fetch permits from the database");
    }
  };

  return (
    <Box sx={{ display: "flex", marginTop: 5, flexDirection: "column" }}>
      <Card
        sx={{
          padding: 2,
          borderRadius: "10px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Search Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              border: "2px solid #211C6A",
              borderRadius: "8px",
              padding: "0 10px",
              marginRight: 2,
              position: "relative",
            }}
          >
            <SearchIcon sx={{ color: "#211C6A", mr: 1 }} />
            <TextField
              label="Search Permits"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                input: { color: "#211C6A" },
                label: { color: "#211C6A" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "transparent",
                  },
                  "&:hover fieldset": {
                    borderColor: "transparent",
                  },
                },
              }}
            />
          </Box>

          {/* Filter Options */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "2px solid #211C6A",
              borderRadius: "8px",
              padding: "0 10px",
              marginRight: 2,
            }}
          >
            <FilterAltIcon sx={{ color: "#211C6A", mr: 1 }} />
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel sx={{ color: "#211C6A" }}>
                Filter by Status
              </InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Approval Status"
                renderValue={(value) => {
                  switch (value) {
                    case "approved":
                      return (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CheckCircleIcon sx={{ color: "green", mr: 1 }} />
                          Approved
                        </Box>
                      );
                    case "pending":
                      return (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <HourglassTopIcon sx={{ color: "orange", mr: 1 }} />
                          Pending
                        </Box>
                      );
                    case "rejected":
                      return (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CancelIcon sx={{ color: "red", mr: 1 }} />
                          Rejected
                        </Box>
                      );
                    case "":
                      return (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <ListAltIcon sx={{ color: "#211C6A", mr: 1 }} />
                          All
                        </Box>
                      );
                    default:
                      return "Select Status"; // Fallback value in case something goes wrong
                  }
                }}
                sx={{
                  color: "#211C6A",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                }}
              >
                <MenuItem value="">
                  <ListItemText primary="All" />
                  <ListItemIcon>
                    <ListAltIcon sx={{ color: "#211C6A" }} />
                  </ListItemIcon>
                </MenuItem>

                <MenuItem value="approved">
                  <ListItemText primary="Approved" />
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: "green" }} />
                  </ListItemIcon>
                </MenuItem>

                <MenuItem value="pending">
                  <ListItemText primary="Pending" />
                  <ListItemIcon>
                    <HourglassTopIcon sx={{ color: "orange" }} />
                  </ListItemIcon>
                </MenuItem>

                <MenuItem value="rejected">
                  <ListItemText primary="Rejected" />
                  <ListItemIcon>
                    <CancelIcon sx={{ color: "red" }} />
                  </ListItemIcon>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Notification Badge */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#211C6A",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <Tooltip title="Notifications">
              <IconButton
                onClick={handleOpenNotifications}
                sx={{ color: "white" }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Notifications Dialog */}
        <Dialog
          open={openNotifications}
          onClose={handleCloseNotifications}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ backgroundColor: "#211C6A", color: "white" }}>
            <Box display="flex" alignItems="center">
              <NotificationsIcon sx={{ marginRight: 1 }} />
              Upcoming Permit Expirations
            </Box>
          </DialogTitle>

          <DialogContent sx={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
            {notifications.length > 0 ? (
              <List>
                {notifications.map((permit, index) => (
                  <Box key={permit._id}>
                    <ListItem alignItems="flex-start" sx={{ paddingY: 2 }}>
                      {/* Icon and message */}
                      <InfoIcon sx={{ color: "#4CAF50", marginRight: 2 }} />
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: "bold",
                              color: "#211C6A",
                            }}
                          >
                            {permit.message}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="body2"
                            sx={{ color: "gray", marginTop: "4px" }}
                          >
                            Expiry Date:{" "}
                            {new Date(permit.expiryDate).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {/* Divider between notifications */}
                    {index < notifications.length - 1 && (
                      <Divider sx={{ backgroundColor: "#ddd" }} />
                    )}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography sx={{ color: "gray", textAlign: "center" }}>
                No upcoming expirations
              </Typography>
            )}
          </DialogContent>
        </Dialog>

        <Box sx={{ display: "flex", marginTop: 6 }}>
          <Box sx={{ width: "70%", marginRight: 2 }}>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              TabIndicatorProps={{
                sx: { display: "none" }, // Hide default indicator
              }}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none", // Prevents uppercase text
                  padding: "12px 24px", // Increased padding for better spacing
                  fontWeight: "bold", // Bold text for better visibility
                  borderRadius: "8px", // Rounded corners for tabs
                  marginRight: 2, // Space between tabs
                },
                "& .Mui-selected": {
                  backgroundColor: "#211C6A", // Blue background for selected tab
                  color: "white", // White text for selected tab
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow for selected tab
                },
                "& .MuiTab-root:not(.Mui-selected)": {
                  backgroundColor: "white", // White background for unselected tabs
                  color: "#211C6A", // Blue text for unselected tabs
                  border: "2px solid #211C6A", // Blue border for unselected tabs
                  "&:hover": {
                    backgroundColor: "#211C6A",
                    color: "white",
                  },
                },
              }}
            >
              {Object.keys(sideCodeTabs).map((sideCode) => (
                <Tab key={sideCode} label={sideCode} value={sideCode} />
              ))}
            </Tabs>

            <Grid container spacing={27}>
              {filteredData().map((permit, index) => {
                const permitType = permitTypes.find(
                  (type) =>
                    type.typeCode === permit.permitNumber.substring(0, 4)
                );
                return (
                  <Grid item xs={6} key={index}>
                    <Card
                      sx={{
                        margin: 4, // Reduced margin for better spacing between cards
                        marginRight: 100,
                        marginBottom: 0,
                        padding: 3, // Added padding for content
                        position: "relative",
                        borderRadius: "16px", // Smooth rounded corners
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Slight shadow for better depth
                        width: "500px",
                        height: "450px",
                      }}
                    >
                      {permitType && (
                        <img
                          src={permitType.image}
                          alt={permit.permitNumber}
                          style={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            width: 60,
                            height: 60,
                          }}
                        />
                      )}
                      <Grid container>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              width: "100%",
                              height: "350px",
                              overflow: "auto",
                            }}
                          >
                            <PDFViewer
                              pdfFile={`http://localhost:8000/pm/${permit.permitDocument}`}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <CardContent sx={{ paddingBottom: 2 }}>
                            <Typography
                              variant="h6"
                              style={{
                                position: "absolute",
                                top: 25,
                                right: 90,
                                width: 60,
                                height: 60,
                              }}
                              sx={{
                                fontWeight: "bold",
                                color: "#3A3A3A",
                                mb: 4,
                              }}
                            >
                              {permit.permitNumber}
                            </Typography>
                            <br />
                            <br />
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: "bold",
                                fontSize: "1.5rem", // Increased font size
                                color: "#007BFF", // Blue color for project name
                                display: "flex",
                                alignItems: "center",
                                mb: 2, // Space after project name
                              }}
                            >
                              <HomeIcon
                                sx={{
                                  verticalAlign: "middle",
                                  color: "#007BFF",
                                  mr: 1,
                                }}
                              />{" "}
                              {permit.projectName}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#555",
                                display: "flex",
                                alignItems: "center",
                                mb: 2, // Space after issue date
                              }}
                            >
                              <EventAvailableIcon
                                sx={{
                                  verticalAlign: "middle",
                                  color: "green",
                                  mr: 1,
                                }}
                              />{" "}
                              Issue Date:{" "}
                              {new Date(permit.issueDate).toLocaleDateString()}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#555",
                                display: "flex",
                                alignItems: "center",
                                mb: 2, // Space after expiry date
                              }}
                            >
                              <EventBusyIcon
                                sx={{
                                  verticalAlign: "middle",
                                  color: "#E53935",
                                  mr: 1,
                                }}
                              />{" "}
                              Expiry Date:{" "}
                              {new Date(permit.expiryDate).toLocaleDateString()}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 4,
                              }}
                            >
                              <Tooltip title={permit.approvalStatus} arrow>
                                <Chip
                                  icon={
                                    permit.approvalStatus === "approved" ? (
                                      <CheckCircleIcon
                                        sx={{ color: "green" }}
                                      />
                                    ) : permit.approvalStatus === "pending" ? (
                                      <HourglassTopIcon
                                        sx={{ color: "orange" }}
                                      />
                                    ) : (
                                      <CancelIcon sx={{ color: "red" }} />
                                    )
                                  }
                                  label={
                                    permit.approvalStatus
                                      .charAt(0)
                                      .toUpperCase() +
                                    permit.approvalStatus.slice(1)
                                  }
                                  sx={{
                                    backgroundColor:
                                      permit.approvalStatus === "approved"
                                        ? "lightgreen"
                                        : permit.approvalStatus === "pending"
                                        ? "lightgoldenrodyellow"
                                        : "lightsalmon",
                                    color:
                                      permit.approvalStatus === "approved"
                                        ? "green"
                                        : permit.approvalStatus === "pending"
                                        ? "orange"
                                        : "black",
                                    fontWeight: "bold",
                                    borderRadius: "20px",
                                    padding: "5px 15px",
                                  }}
                                />
                              </Tooltip>
                            </Box>
                          </CardContent>
                          <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<EditIcon />}
                              onClick={() =>
                                handlePermitSelection(permit, true)
                              }
                              sx={{ marginRight: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteConfirm(permit)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <Box
            sx={{
              width: "30%",
              textAlign: "right",
              padding: "10px",
              mr: "5px",
            }}
          >
            <Grid container spacing={0}>
              {permitTypes.map((type) => (
                <Grid item xs={12} key={type.label}>
                  <Tooltip title={type.label} arrow placement="right">
                    <img
                      src={type.image}
                      alt={type.label}
                      style={{
                        width: "30%",
                        cursor: "pointer",
                        padding: "0px",
                      }}
                      onClick={() => handlePermitSelection(type)}
                    />
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          endIcon={<CloudDownloadRoundedIcon />}
          onClick={handleGeneratePDF}
          sx={{
            width: "20%", // Set the width of the button
            marginTop: "20px",
            height: "50px",
            backgroundColor: "#FF5722", // Custom color for the button
            color: "white",
            padding: "10px 20px", // Adjust padding for better spacing
            borderRadius: "8px", // Rounded corners
            fontWeight: "bold", // Bold text
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Add a subtle shadow
            "&:hover": {
              backgroundColor: "#E64A19", // Slightly darker color on hover
            },
            marginBottom: 4, // Maintain marginBottom for consistency
          }}
        >
          Generate PDF
        </Button>
        {selectedPermit && (
          <PermitFormModal
            open={open}
            onClose={() => setOpen(false)}
            selectedPermit={selectedPermit}
            formData={formData}
            handleInputChange={(e) => {
              const { name, value } = e.target;
              setFormData({
                ...formData,
                [name]: value,
              });
            }}
            handleFileUpload={(e) => {
              const file = e.target.files[0];
              if (file) {
                setPdfFile(URL.createObjectURL(file));
                setFormData({
                  ...formData,
                  permitDocument: file,
                });
              }
            }}
            handleSideCodeChange={(e) => {
              const sideCode = e.target.value;
              setFormData({
                ...formData,
                sideCode,
                projectName: projectData[sideCode] || "",
              });
            }}
            handleSubmit={handleSubmit}
            isEditMode={isEditMode}
            handleDateChange={(e, field) => {
              const value = e.target.value;
              if (field === "issueDate" && new Date(value) > new Date()) {
                setDateErrors((prev) => ({
                  ...prev,
                  issueDate: "Issue date must be in the past",
                }));
              } else if (
                field === "expiryDate" &&
                new Date(value) <= new Date()
              ) {
                setDateErrors((prev) => ({
                  ...prev,
                  expiryDate: "Expiry date must be in the future",
                }));
              } else {
                setDateErrors((prev) => ({ ...prev, [field]: "" }));
                setFormData((prevData) => ({ ...prevData, [field]: value }));
              }
            }}
            handleStatusChange={(e) => {
              setFormData({
                ...formData,
                approvalStatus: e.target.value,
              });
            }}
            dateErrors={dateErrors}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          sx={{ borderRadius: "12px" }}
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <WarningIcon sx={{ color: "orange", fontSize: 36 }} />
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            Are you sure you want to delete this permit?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  );
};

export default PermitDisplay;
