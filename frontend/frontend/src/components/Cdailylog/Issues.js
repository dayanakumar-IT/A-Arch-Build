import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  RadioGroup,
  Radio,
  Typography,
  Grid,
  Paper,
  Box,
  FormLabel,
  Card,
  CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search"; 
import './dailyissues.css';

export default function Issue({site_code, location_name}) {
  const [view, setView] = useState("form");
  const [sitecode, setSitecode] = useState(site_code || '');
  const [location, setLocation] = useState(location_name || '');
  const [date, setDate] = useState("");
  const [issuetitle, setIssuetitle] = useState("");
  const [issuedes, setIssuedes] = useState("");
  const [otherIssueTitle, setOtherIssueTitle] = useState("");
  const [assignedPersonOrTeam, setAssignedPersonOrTeam] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("");
  const [status, setStatus] = useState("");
  const [impactOnSchedule, setImpactOnSchedule] = useState("");
  const [issues, setIssues] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [showOtherTextbox, setShowOtherTextbox] = useState(false);
  const [notifyPM, setNotifyPM] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch("http://localhost:8000/problem/issues");
      if (response.ok) {
        const data = await response.json();
        const resolved = data.filter((issue) => issue.status === "Resolved");
        const unresolved = data.filter((issue) => issue.status !== "Resolved");
        setIssues(unresolved);
        setResolvedIssues(resolved);
      } else {
        setError("Failed to fetch issues.");
      }
    } catch (error) {
      setError("Failed to fetch issues.");
    }
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!date || !issuetitle || !issuedes || !assignedPersonOrTeam || !priorityLevel || !status || !impactOnSchedule || (issuetitle === "Other" && !otherIssueTitle)) {
      setError("All fields are required.");
      return;
    }

    const issueTitleToSubmit = issuetitle === "Other" ? otherIssueTitle : issuetitle;

    const newIssue = {
      sitecode,
      location,
      date,
      issuetitle: issueTitleToSubmit,
      issuedes,
      assignedPersonOrTeam,
      priorityLevel,
      status,
      impactOnSchedule,
      notifyPM,
    };

    try {
      if (editId === null) {
        const response = await fetch("http://localhost:8000/problem/issues", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newIssue),
        });
        if (response.ok) {
          const addedIssue = await response.json();
          setIssues([...issues, addedIssue]);
          setMessage("Issue added successfully");
          if (notifyPM) {
            alert("Notification sent to Project Manager!");
          }
        } else {
          setError("Unable to create issue");
        }
      } else {
        const response = await fetch(`http://localhost:8000/problem/issues/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newIssue),
        });
        if (response.ok) {
          const updatedIssue = await response.json();
          setIssues(issues.map((issue) => (issue._id === editId ? updatedIssue : issue)));
          setMessage("Issue updated successfully");
          setEditId(null);
        } else {
          setError("Unable to update issue");
        }
      }
      setTimeout(() => setMessage(""), 3000);
      setView("list");
    } catch (error) {
      setError("Unable to process request");
    }
    clearForm();
  };

  const clearForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setIssuetitle("");
    setIssuedes("");
    setOtherIssueTitle("");
    setAssignedPersonOrTeam("");
    setPriorityLevel("");
    setStatus("");
    setImpactOnSchedule("");
    setShowOtherTextbox(false);
    setNotifyPM(false);
  };

  const handleIssueTypeChange = (e) => {
    const selectedValue = e.target.value;
    setIssuetitle(selectedValue);
    setShowOtherTextbox(selectedValue === "Other");
    if (selectedValue !== "Other") {
      setOtherIssueTitle("");
    }
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleEdit = (issue) => {
    setEditId(issue._id);
    setSitecode(issue.sitecode);
    setLocation(issue.location);
    setDate(issue.date);
    setIssuetitle(issue.issuetitle);
    setIssuedes(issue.issuedes);
    setAssignedPersonOrTeam(issue.assignedPersonOrTeam);
    setPriorityLevel(issue.priorityLevel);
    setStatus(issue.status);
    setImpactOnSchedule(issue.impactOnSchedule);
    setNotifyPM(issue.notifyPM || false);
    setView("form");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      try {
        const response = await fetch(`http://localhost:8000/problem/issues/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setIssues(issues.filter((issue) => issue._id !== id));
          setResolvedIssues(resolvedIssues.filter((issue) => issue._id !== id)); // Remove from resolved if exists
          setMessage("Issue deleted successfully");
          setTimeout(() => setMessage(""), 3000);
        } else {
          setError("Unable to delete issue.");
        }
      } catch (error) {
        setError("Unable to delete issue.");
      }
    }
  };

  const handleResolve = async (issue) => {
    const updatedIssue = { ...issue, status: "Resolved" };

    try {
      const response = await fetch(`http://localhost:8000/problem/issues/${issue._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedIssue),
      });
      if (response.ok) {
        const resolvedIssue = await response.json();
        setIssues(issues.filter((i) => i._id !== issue._id));
        setResolvedIssues([...resolvedIssues, resolvedIssue]);
        setMessage("Issue resolved successfully");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Unable to resolve issue.");
      }
    } catch (error) {
      setError("Unable to resolve issue.");
    }
  };

  const handleViewDetails = (issue) => {
    setSelectedIssue(issue);
    setView("details");
  };



  const generatePDF = () => {
    if (!selectedIssue) return;
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // Title Background and Text
    doc.setFillColor(5, 16, 148); // Background color: #051094
    doc.rect(0, 0, pageWidth, 30, 'F'); // Fills the top section with the background color
  
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255); // White text color for title
    const title = "Project Issue Summary Report";
    const titleWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(title, titleX, 20);
  
    // Set the text color for the body
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black text color for the rest of the content
  
    // Display each section as a part of the summary
    const marginX = 20;
    let yPosition = 40;
  
    // Summary sections with titles in bold
    doc.setFont('helvetica', 'bold');
    doc.text("Site Code:", marginX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedIssue.sitecode, marginX + 40, yPosition);
    yPosition += 10;
  
    doc.setFont('helvetica', 'bold');
    doc.text("Location:", marginX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedIssue.location, marginX + 40, yPosition);
    yPosition += 10;
  
    doc.setFont('helvetica', 'bold');
    doc.text("Date:", marginX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedIssue.date, marginX + 40, yPosition);
    yPosition += 10;
  
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 0, 0); // Red for the issue title
    doc.text("Issue Title:", marginX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(selectedIssue.issuetitle, marginX + 40, yPosition);
    yPosition += 10;
  
    doc.setFont('helvetica', 'bold');
    doc.text("Issue Description:", marginX, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    const description = doc.splitTextToSize(selectedIssue.issuedes, pageWidth - marginX * 2);
    doc.text(description, marginX, yPosition);
    yPosition += description.length * 5 + 5;
  
    doc.setFont('helvetica', 'bold');
    doc.text("Assigned Person/Team:", marginX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedIssue.assignedPersonOrTeam, marginX + 60, yPosition);
    yPosition += 10;
  
    doc.setFont('helvetica', 'bold');
    doc.text("Priority Level:", marginX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedIssue.priorityLevel, marginX + 40, yPosition);
    yPosition += 10;
  
    doc.setFont('helvetica', 'bold');
    doc.text("Status:", marginX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedIssue.status, marginX + 40, yPosition);
    yPosition += 10;
  
    doc.setFont('helvetica', 'bold');
    doc.text("Impact on Schedule:", marginX, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedIssue.impactOnSchedule, marginX + 60, yPosition);
  
    // Save the PDF with a descriptive name
    doc.save(`Issue_Report_${selectedIssue._id}.pdf`);
  };
  
  
  

  const filteredIssues = issues.filter(issue => 
    issue.date.includes(searchTerm) || issue.issuetitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResolvedIssues = resolvedIssues.filter(issue => 
    issue.date.includes(searchTerm) || issue.issuetitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = () => (
    <>
      

      <Container
        maxWidth="lg"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
        }}
      >
        {message && (
          <Typography color="success" style={{ textAlign: "center" }}>
            {message}
          </Typography>
        )}
        {error && (
          <Typography color="error" style={{ textAlign: "center" }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={3} style={{ alignItems: "stretch" }}>
          {/* Basic Info Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              className="paper-section"
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Typography
                variant="h6"
                gutterBottom
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#A0D683",
                  color: "white",
                  padding: "10px",
                }}
              >
                Basic Info
              </Typography>
              <TextField
                label="Site Code"
                value={sitecode}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Location"
                value={location}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Paper>
          </Grid>

          {/* Issue Details Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              className="paper-section"
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Typography
                variant="h6"
                gutterBottom
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#051094",
                  color: "white",
                  padding: "10px",
                }}
              >
                Issue Details
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Issue Type</InputLabel>
                <Select value={issuetitle} onChange={handleIssueTypeChange}>
                  <MenuItem value="">Select Issue Type</MenuItem>
                  <MenuItem value="Safety Hazard">Safety Hazard</MenuItem>
                  <MenuItem value="Material Shortage">Material Shortage</MenuItem>
                  <MenuItem value="Labor Shortage">Labor Shortage</MenuItem>
                  <MenuItem value="Weather Delay">Weather Delay</MenuItem>
                  <MenuItem value="SID">Subcontractor/Vendor Delay</MenuItem>
                  <MenuItem value="USD">Utility Service Disruption</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>

              {showOtherTextbox && (
                <TextField
                  label="Other Issue Title"
                  value={otherIssueTitle}
                  onChange={(e) => setOtherIssueTitle(e.target.value)}
                  fullWidth
                  margin="normal"
                />
              )}

              <TextField
                label="Issue Description"
                value={issuedes}
                onChange={(e) => setIssuedes(e.target.value)}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select value={status} onChange={handleStatusChange}>
                  <MenuItem value="">Select Status</MenuItem>
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Delayed">Delayed</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Management Section */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              className="paper-section"
              style={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Typography
                variant="h6"
                gutterBottom
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  backgroundColor: "#FCCD2A",
                  color: "white",
                  padding: "10px",
                }}
              >
                Management
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Assigned Person/Team</InputLabel>
                <Select
                  value={assignedPersonOrTeam}
                  onChange={(e) => setAssignedPersonOrTeam(e.target.value)}
                >
                  <MenuItem value="">Select a Project Manager</MenuItem>
                  <MenuItem value="Kawshaliya">Kawshaliya</MenuItem>
                  <MenuItem value="Ragul">Ragul</MenuItem>
                </Select>
              </FormControl>

              <FormControl component="fieldset" fullWidth margin="normal">
                  <FormLabel 
                    component="legend" 
                    sx={{ textAlign: 'center', width: '100%' }}
                  >
                    Priority Level
                  </FormLabel>
                  <RadioGroup
                    row
                    value={priorityLevel}
                    onChange={(e) => setPriorityLevel(e.target.value)}
                    sx={{ justifyContent: 'center' }}
                  >
                    <FormControlLabel value="High" control={<Radio />} label="High" />
                    <FormControlLabel value="Medium" control={<Radio />} label="Medium" />
                    <FormControlLabel value="Low" control={<Radio />} label="Low" />
                  </RadioGroup>
                </FormControl>


              <TextField
                label="Impact on Schedule"
                value={impactOnSchedule}
                onChange={(e) => setImpactOnSchedule(e.target.value)}
                multiline
                rows={2}
                fullWidth
                margin="normal"
              />

              <FormGroup style={{ display: "flex", alignItems: "center" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={notifyPM}
                      onChange={() => setNotifyPM(!notifyPM)}
                    />
                  }
                  label="Notify Project Manager"
                  labelPlacement="end"
                />
              </FormGroup>
            </Paper>
          </Grid>
        </Grid>

        <div className="button-container my-3" style={{ textAlign: "center" }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant="outlined" onClick={() => setView("list")} style={{ marginLeft: "10px" }}>
            Back to List
          </Button>
        </div>
      </Container>
    </>
  );

  const renderList = () => (
    <Container maxWidth="lg" style={{ marginTop: "20px" }}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} style={{ marginTop: "10px" }}>
        <TextField
          variant="outlined"
          placeholder="Search by date or issue title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon />,
          }}
          fullWidth
          style={{ marginBottom: "20px", marginRight: "10px" }} 
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setView("form")}
          style={{ flexShrink: 0 }} 
        >
          Add New Issue
        </Button>
      </Box>
  
      <Grid container spacing={3}>
        {/* Unresolved Issues Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" style={{ color: '#051094' }}>Unresolved Issues ({filteredIssues.length})</Typography>
          <Grid container spacing={2} style={{ marginTop: "10px" }}>
            {filteredIssues.map((issue) => (
              <Grid item xs={12} key={issue._id}>
                <Paper elevation={3} style={{ padding: "16px", marginBottom: "16px", backgroundColor: "#EFF396", color: "#051094" }}>
                  <Typography variant="h6">{issue.issuetitle}</Typography>
                  <Typography variant="body2">{issue.issuedes}</Typography>
                  <Typography variant="caption" color="textSecondary">{issue.date}</Typography>
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button style={{ backgroundColor: '#075e86', color: 'white', marginRight: '5px' }} onClick={() => handleEdit(issue)}>Edit</Button>
                    <Button style={{ backgroundColor: 'red', color: 'white', marginRight: '5px' }} onClick={() => handleDelete(issue._id)}>Delete</Button>
                    <Button style={{ backgroundColor: '#138808', color: 'white', marginRight: '5px' }} onClick={() => handleResolve(issue)}>Resolve</Button>
                    <Button style={{ backgroundColor: '#C8C8C8', color: 'black', marginRight: '5px' }} onClick={() => handleViewDetails(issue)}>View Details</Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
  
        {/* Resolved Issues Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" style={{ color: '#051094' }}>Resolved Issues ({filteredResolvedIssues.length})</Typography>
          <Grid container spacing={2} style={{ marginTop: "10px" }}>
            {filteredResolvedIssues.map((issue) => (
              <Grid item xs={12} key={issue._id}>
                <Paper elevation={3} style={{ padding: "16px", marginBottom: "16px", backgroundColor: "#A0D683", color: "#051094" }}>
                  <Typography variant="h6">{issue.issuetitle}</Typography>
                  <Typography variant="body2">{issue.issuedes}</Typography>
                  <Typography variant="caption" color="textSecondary">{issue.date}</Typography>
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button style={{ backgroundColor: '#C8C8C8', color: 'black', marginRight: '5px' }} onClick={() => handleViewDetails(issue)}>View Details</Button>
                    <Button style={{ backgroundColor: 'red', color: 'white', marginRight: '5px' }} onClick={() => handleDelete(issue._id)}>Delete</Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );

  
        {/* Issues viewing UI */}
  const renderDetails = () => (
        
        
    <div className="mycontainer1">
        <h1 class="card-title1">Issue Details</h1>
        <div className="card1">
        {selectedIssue && (
             <div className="card-body1">
                 <div className="card-row">
                <p><strong>Site Code:</strong> {selectedIssue.sitecode}</p>
                <p><strong>Location:</strong> {selectedIssue.location}</p>
                <p><strong>Date:</strong> {selectedIssue.date}</p>
                </div>
                <div className="card-description">
                <p><strong>Issue Title:</strong> {selectedIssue.issuetitle}</p>
                <p><strong>Issue Description:</strong> {selectedIssue.issuedes}</p>
                </div>
                <div className="card-row">
                <p><strong>Assigned Person/Team:</strong> {selectedIssue.assignedPersonOrTeam}</p>
                <p><strong>Priority Level:</strong> {selectedIssue.priorityLevel}</p>
                <p><strong>Status:</strong> {selectedIssue.status}</p>
                </div>
                <div className="card-priority">
                <p><strong>Impact on Schedule:</strong> {selectedIssue.impactOnSchedule}</p>
                </div>

                <div className="card-nofi">
                <p><strong>Notify Project Manager:</strong> {selectedIssue.notifyPM ? "Yes" : "No"}</p>
                </div>
                <div className="card-buttons">
                <button onClick={generatePDF} className="btn btn-gen">Generate PDF</button>
                <button onClick={() => setView("list")} className="btn btn-secondary mt-2 mx-2">Back to List</button>
                </div>
                
            </div>
            
        )}
    </div>
    </div>
);

  
  
  
  return (
    <>
      {view === "list" && renderList()}
      {view === "form" && renderForm()}
      {view === "details" && renderDetails()}
    </>
  );
}
