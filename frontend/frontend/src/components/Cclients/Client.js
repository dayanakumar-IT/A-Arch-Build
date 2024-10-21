import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Tooltip , Container, Grid, Box, TextField, MenuItem, Select, InputLabel, FormControl, Paper, ButtonGroup, List, ListItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputAdornment, IconButton, Fab  } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Transition } from 'react-transition-group';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import autoTable plugin for table generation in jsPDF
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // Import the PDF icon


const colors = ["#FFCDD2", "#E1BEE7", "#BBDEFB", "#C8E6C9", "#FFF9C4", "#FFECB3", "#D1C4E9", "#FFAB91"];

export default function Client({setClients, onSucess}) {
  const [view, setView] = useState("list");
  const [clientName, setClientName] = useState("");
  const [clientLocation, setClientLocation] = useState("");
  const [clientContactNo, setClientContactNo] = useState("");
  const [dateOfConsultation, setDateOfConsultation] = useState("");
  const [projectName, setProjectName] = useState("");
  const [clientdetailsList, setClientdetailsList] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [error, setError] = useState("");
  const [clientNameError, setClientNameError] = useState("");
  const [contactNoError, setContactNoError] = useState("");
  const [countryCode, setCountryCode] = useState("+94");
  const [message, setMessage] = useState("");
  const [activeLevel, setActiveLevel] = useState("all");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageClientName, setMessageClientName] = useState("");
  const [messageClientEmail, setMessageClientEmail] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageEmailError, setMessageEmailError] = useState("");
  const [editClientId, setEditClientId] = useState(null);
  const [totalClients, setTotalClients] = useState(0);
  const [clientsInSriLanka, setClientsInSriLanka] = useState(0);
  const [clientsOutOfSriLanka, setClientsOutOfSriLanka] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState({}); // Store expanded state per card


  

  const apiUrl = "http://localhost:8000/cl";

  // Function to generate PDF based on filtered clients
  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    // Define the table headers
    const headers = [
      ['Client Name', 'Project Name', 'Location', 'Contact No', 'Date of Consultation'],
    ];

    // Prepare the data rows for the table
    const data = filteredClients.map(client => [
      client.clientName,
      client.projectName,
      client.clientLocation,
      client.clientContactNo,
      new Date(client.dateOfConsultation).toLocaleDateString(),
    ]);

    // Add title
    doc.text('Client Report', 14, 20);

    // Generate the table using autoTable
    doc.autoTable({
      head: headers,
      body: data,
      startY: 30,
    });

    // Save the PDF
    doc.save('client_report.pdf');
  };


  const fetchClients = useCallback(() => {
    fetch(apiUrl + "/clients")
      .then((res) => res.json())
      .then((data) => {
        setClientdetailsList(data);
        setFilteredClients(data);
        calculateStatistics(data);
      })
      .catch((error) => console.error('Fetch error:', error));
  }, [apiUrl]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleExpandClick = (clientId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [clientId]: !prev[clientId], // Toggle expansion state based on clientId
    }));
  };
  

  const renderCardActions = (client) => (
    <Box
      sx={{
        display: expandedCards[client._id] ? 'flex' : 'none',
        flexDirection: 'column',
        position: 'absolute',
        bottom: '60px',
        right: '16px',
        transition: 'opacity 300ms, transform 300ms',
       
      }}
    >
      <Tooltip title="Edit Client">
        <IconButton color="primary" onClick={() => handleEdit(client)} sx={{ backgroundColor: '#fff', marginBottom: '5px' }}>
          <EditIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Delete Client">
        <IconButton color="secondary" onClick={() => handleDelete(client)} sx={{ backgroundColor: '#fff', marginBottom: '5px' }}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Add Requirments">
        <IconButton
          color="primary"
          sx={{ backgroundColor: '#fff', marginBottom: '5px' }}
          onClick={() => {
            setClients({
              section: 'Clientreq',
              project_name: client.projectName,
              client_name: client.clientName,
              consul_date: new Date(client.dateOfConsultation).toISOString().split('T')[0],  // Ensure correct date format
            });
          }}
        >
          <ListAltIcon />
        </IconButton>
      </Tooltip>
      
      {/* New Add Report Icon */}
      <Tooltip title="Add Reports">
        <IconButton
          color="primary"
          sx={{ backgroundColor: '#fff' , marginBottom: '5px'}}
          onClick={() => handleAddReport()}
        >
          <UploadFileRoundedIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const handleAddReport = () => {
    //console.log(`Adding report for ${client.clientName}`);
    onSucess()
    // Add logic to handle adding a report, like opening a form to upload a report or generate a PDF
  };
  

  const calculateStatistics = (clients) => {
    const total = clients.length;
    const inSriLanka = clients.filter(client => client.clientLocation.toLowerCase().includes('sri lanka')).length;
    const outOfSriLanka = total - inSriLanka;

    setTotalClients(total);
    setClientsInSriLanka(inSriLanka);
    setClientsOutOfSriLanka(outOfSriLanka);
  };

  const handleLocationChange = async (e) => {
    const query = e.target.value;
    setClientLocation(query);

    if (query.length > 2) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        setLocationSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = (address) => {
    setClientLocation(address);
    setLocationSuggestions([]);
  };

  const handleLevelClick = (level) => {
    setActiveLevel(level);  // Set the active level to highlight the selected button
    let filteredByLevel;
  
    const currentDate = new Date();  // Current date
    const currentMonth = currentDate.getMonth();  // Get current month (0-indexed)
    const currentYear = currentDate.getFullYear();  // Get current year
  
    const nextMonth = (currentMonth + 1) % 12;  // Next month (handle December to January)
    const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;  // Handle year change for next month
  
    // Filtering clients based on consultation dates
    if (level === "Level 1") {
      // Level 1: Clients with consultation dates in the current month
      filteredByLevel = clientdetailsList.filter(client => {
        const consultationDate = new Date(client.dateOfConsultation);
        return consultationDate.getMonth() === currentMonth && consultationDate.getFullYear() === currentYear;
      });
    } else if (level === "Level 2") {
      // Level 2: Clients with consultation dates in the next month
      filteredByLevel = clientdetailsList.filter(client => {
        const consultationDate = new Date(client.dateOfConsultation);
        return consultationDate.getMonth() === nextMonth && consultationDate.getFullYear() === nextMonthYear;
      });
    } else if (level === "Level 3") {
      // Level 3: Clients with consultation dates in any other month (past or future beyond next month)
      filteredByLevel = clientdetailsList.filter(client => {
        const consultationDate = new Date(client.dateOfConsultation);
        return !(
          (consultationDate.getMonth() === currentMonth && consultationDate.getFullYear() === currentYear) ||
          (consultationDate.getMonth() === nextMonth && consultationDate.getFullYear() === nextMonthYear)
        );
      });
    } else {
      // No filtering, show all clients
      filteredByLevel = clientdetailsList;
    }
  
    setFilteredClients(filteredByLevel);  // Update the state with the filtered clients
  };
  

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredClients(clientdetailsList);
    } else {
      const filtered = clientdetailsList.filter(client =>
        client.clientName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  };

  const handleSubmit = () => {
    setError("");
    setClientNameError("");
    setContactNoError("");
  
    if (clientName.trim() === '' || clientLocation.trim() === '' || clientContactNo.trim() === '' || dateOfConsultation.trim() === '' || projectName.trim() === '') {
      setError("Please fill all required fields.");
      return;
    }
  
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(clientName)) {
      setClientNameError("Client Name must only contain letters and spaces.");
      return;
    }
  
    const contactPattern = /^\d{9}$/;
    if (!contactPattern.test(clientContactNo)) {
      setContactNoError("Contact No must be exactly 9 digits.");
      return;
    }
  
    const fullContactNo = `${countryCode}${clientContactNo}`;
  
    const dataToSubmit = {
      clientName,
      clientLocation,
      clientContactNo: fullContactNo,
      dateOfConsultation,
      projectName,
    };
  
    if (editClientId) {
      fetch(`${apiUrl}/clients/${editClientId}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Network response was not ok.');
          }
        })
        .then(() => {
          setMessage("Client updated successfully");
          // Instead of updating the local state directly, fetch the updated client list
          fetchClients();
          setView("list");
          setEditClientId(null);
          setTimeout(() => {
            setMessage("");
          }, 3000);
        })
        .catch((error) => {
          console.error('Update error:', error);
          setError("Unable to update client");
        });
    } else {
      fetch(apiUrl + "/clients", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Network response was not ok.');
          }
        })
        .then((data) => {
          setMessage("Client added successfully");
          // Fetch the updated list after adding a new client
          fetchClients();
          setView("list");
          setTimeout(() => {
            setMessage("");
          }, 3000);
        })
        .catch((error) => {
          console.error('Create error:', error);
          setError("Unable to create client");
        });
    }
  };
  

  const handleEdit = (client) => {
    setClientName(client.clientName);
    setProjectName(client.projectName);
    setClientLocation(client.clientLocation);
    setClientContactNo(client.clientContactNo.replace(countryCode, ""));
      // Convert the date to YYYY-MM-DD format for the date input field
      const formattedDate = new Date(client.dateOfConsultation).toISOString().split('T')[0];
      setDateOfConsultation(formattedDate);  // This ensures the date is set correctly in the input
    setEditClientId(client._id);
    setView("form");
  };
  

  const handleDelete = async (client) => {
    const clientId = client._id;
  
    try {
      const response = await fetch(`${apiUrl}/clients/${clientId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        const updatedClientList = clientdetailsList.filter((c) => c._id !== clientId);
        setClientdetailsList(updatedClientList);
        setFilteredClients(updatedClientList);
        calculateStatistics(updatedClientList);
        setMessage("Client deleted successfully");
        setTimeout(() => setMessage(""), 3000);
      } else {
        console.error('Delete failed: ', response.statusText);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };
  

  const handleCreateMeeting = () => {
    const googleMeetUrl = "https://meet.google.com/new";
    window.open(googleMeetUrl, '_blank');
  };

  const handleOpenMessageDialog = () => {
    setMessageDialogOpen(true);
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setMessageClientName("");
    setMessageClientEmail("");
    setMessageContent("");
    setMessageEmailError("");
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!validateEmail(messageClientEmail)) {
      setMessageEmailError("Please enter a valid email address.");
      return;
    }

    const formData = new FormData();
    formData.append("access_key", "ef0d454e-ccd2-4764-b90b-be6f817306b2");
    formData.append("name", messageClientName);
    formData.append("email", messageClientEmail);
    formData.append("message", messageContent);

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: json
    }).then((res) => res.json());

    if (res.success) {
      console.log("Message sent successfully:", res);
      setMessage("Message sent successfully");
      setTimeout(() => {
        setMessage("");
      }, 3000);
      handleCloseMessageDialog();
    } else {
      console.error("Error sending message:", res);
    }
  };

  const handleCreateClient = () => {
    // Reset form fields to clear previous client details
    setClientName("");
    setClientLocation("");
    setClientContactNo("");
    setDateOfConsultation("");
    setProjectName("");
    setError("");
    setClientNameError("");
    setContactNoError("");
    
    // Switch to form view
    setView("form");
  };
  

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" p={3} sx={{ backgroundColor: 'white' }}>
       
        <Box display="flex" alignItems="center">
          <Button
             onClick={handleCreateClient} 
            variant="contained"
            sx={{ backgroundColor: '#3f51b5', color: 'white', marginRight: '15px' }}
          >
            + Create Client
          </Button>
          <Button
            onClick={handleCreateMeeting}
            variant="contained"
            sx={{ backgroundColor: '#3f51b5', color: 'white', marginRight: '15px' }}
          >
            + Create Meeting
          </Button>
          <Button
            onClick={handleOpenMessageDialog}
            variant="contained"
            sx={{ backgroundColor: '#3f51b5', color: 'white', marginRight: '400px' }}
          >
            + Contact Client
          </Button>
          <Button
            onClick={handleGeneratePDF} // Trigger PDF generation
            variant="contained"
            sx={{ backgroundColor: '#3f51b5', color: 'white', minWidth: '50px' }} // Adjust the button size
          >
            <PictureAsPdfIcon /> {/* Use the PDF icon */}
          </Button>
          <TextField
            label="Search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '5px 0 0 5px',
              width: '300px',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {view === "list" && (
        <>
          <Box display="flex" justifyContent="center" p={3} sx={{ backgroundColor: '#f0f0f0', marginBottom: 2 }}>
            <ButtonGroup variant="outlined">
              <Button
                onClick={() => handleLevelClick("Level 1")}
                sx={{ backgroundColor: activeLevel === "Level 1" ? "#ccc" : "#fff" }}
              >
                Level 1
              </Button>
              <Button
                onClick={() => handleLevelClick("Level 2")}
                sx={{ backgroundColor: activeLevel === "Level 2" ? "#ccc" : "#fff" }}
              >
                Level 2
              </Button>
              <Button
                onClick={() => handleLevelClick("Level 3")}
                sx={{ backgroundColor: activeLevel === "Level 3" ? "#ccc" : "#fff" }}
              >
                Level 3
              </Button>
            </ButtonGroup>
          </Box>

          <Container sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: '#FFCDD2', padding: 2 }}>
                  <CardContent>
                    <Typography variant="h6">Total Clients</Typography>
                    <Typography variant="h4">{totalClients}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: '#C8E6C9', padding: 2 }}>
                  <CardContent>
                    <Typography variant="h6">Clients in Sri Lanka</Typography>
                    <Typography variant="h4">{clientsInSriLanka}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ backgroundColor: '#FFECB3', padding: 2 }}>
                  <CardContent>
                    <Typography variant="h6">Clients Out of Sri Lanka</Typography>
                    <Typography variant="h4">{clientsOutOfSriLanka}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>

        
        </>
      )}

      {view === "form" && (
        <Container>
          <Paper elevation={3} sx={{ p: 3, boxShadow: 5 }}>
            <div className="row text-start">
              <div className="col-12 mb-3">
                <h3>Add Client Details</h3>
                {message && <p className="text-success">{message}</p>}
                {error && <p className="text-danger">{error}</p>}
              </div>
              <div className="col-12">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Client Name"
                      fullWidth
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      error={!!clientNameError}
                      helperText={clientNameError}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Project Name"
                      fullWidth
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Client Location"
                      fullWidth
                      value={clientLocation}
                      onChange={handleLocationChange}
                    />
                    {locationSuggestions.length > 0 && (
                      <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', marginTop: 1 }}>
                        {locationSuggestions.map((suggestion, index) => (
                          <ListItem
                            key={index}
                            button
                            onClick={() => handleLocationSelect(suggestion.display_name)}
                          >
                            {suggestion.display_name}
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth>
                      <InputLabel id="country-code-label">Country Code</InputLabel>
                      <Select
                        labelId="country-code-label"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        label="Country Code"
                        sx={{ minWidth: 150 }}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              maxHeight: 200,
                            },
                          },
                        }}
                      >
                        <MenuItem value="+1">
                          <img src="/images/united-states.png" width="20" style={{ marginRight: '8px' }} alt="United States" />
                          US +1
                        </MenuItem>
                        <MenuItem value="+91">
                          <img src="/images/india.png" width="20" style={{ marginRight: '8px' }} alt="India" />
                          IN +91
                        </MenuItem>
                        <MenuItem value="+94">
                          <img src="/images/srilanka.png" width="20" style={{ marginRight: '8px' }} alt="Sri Lanka" />
                          LK +94
                        </MenuItem>
                        <MenuItem value="+61">
                          <img src="/images/aus.png" width="20" style={{ marginRight: '8px' }} alt="Australia" />
                          AU +61
                        </MenuItem>
                        <MenuItem value="+81">
                          <img src="/images/japan.png" width="20" style={{ marginRight: '8px' }} alt="Japan" />
                          JP +81
                        </MenuItem>
                        <MenuItem value="+33">
                          <img src="/images/france.png" width="20" style={{ marginRight: '8px' }} alt="France" />
                          FR +33
                        </MenuItem>
                        <MenuItem value="+44">
                          <img src="/images/united-kingdom.png" width="20" style={{ marginRight: '8px' }} alt="United Kingdom" />
                          UK +44
                        </MenuItem>
                        <MenuItem value="+7">
                          <img src="/images/russia.png" width="20" style={{ marginRight: '8px' }} alt="Russia" />
                          RU +7
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Client Contact No"
                      fullWidth
                      value={clientContactNo}
                      onChange={(e) => setClientContactNo(e.target.value)}
                      error={!!contactNoError}
                      helperText={contactNoError}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Date Of Consultation"
                      type="date"
                      fullWidth
                      value={dateOfConsultation}
                      onChange={(e) => setDateOfConsultation(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button onClick={handleSubmit} variant="contained" color="primary" fullWidth>
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </div>
          </Paper>
        </Container>
      )}

<Container sx={{ mt: 3 }}>
<Grid container spacing={3}>
  {filteredClients.map((client, index) => (
    <Grid item xs={12} md={4} key={client._id}>
      <Card sx={{ maxWidth: 345, width: '400px', height: '250px', boxShadow: 3, backgroundColor: colors[index % colors.length], position: 'relative' }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {client.clientName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Project Name:</strong> {client.projectName} <br />
            <strong>Location:</strong> {client.clientLocation} <br />
            <strong>Contact No:</strong> {client.clientContactNo} <br />
            <strong>Date Of Consultation:</strong> {new Date(client.dateOfConsultation).toLocaleDateString()}
          </Typography>
        </CardContent>

        {/* Expandable action buttons */}
        {renderCardActions(client)}

        {/* Floating action button */}
        <Fab
          color="primary"
          aria-label="add"
          size="small"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          onClick={() => handleExpandClick(client._id)}
        >
          <AddIcon />
        </Fab>
      </Card>
    </Grid>
  ))}
</Grid>



    </Container>

      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog}>
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the details to contact the client.
          </DialogContentText>
          <form onSubmit={handleSendMessage}>
            <TextField
              autoFocus
              margin="dense"
              label="Client Name"
              fullWidth
              value={messageClientName}
              onChange={(e) => setMessageClientName(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Client Email"
              type="email"
              fullWidth
              value={messageClientEmail}
              onChange={(e) => setMessageClientEmail(e.target.value)}
              error={!!messageEmailError}
              helperText={messageEmailError}
              required
            />
            <TextField
              margin="dense"
              label="Your Message"
              multiline
              fullWidth
              rows={3}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              required
            />
            <DialogActions>
              <Button onClick={handleCloseMessageDialog} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Send Message
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
