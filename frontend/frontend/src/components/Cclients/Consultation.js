import { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Slider,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Radio,
  RadioGroup,
  Card, 
  CardContent, 
  CardActions
} from '@mui/material';
import { CheckCircleOutline as CheckCircleIcon } from '@mui/icons-material';


export default function Consultation({project_name, client_name, consul_date}) {
  const [view, setView] = useState("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState(project_name || '');
  const [clientName, setClientName] = useState(client_name || '');
  const [dateOfConsultation, setDateOfConsultation] = useState(consul_date || '');
  const [conductedBy, setConductedBy] = useState("");
  const [projectGoals, setProjectGoals] = useState("");
  const [budgetConstraints, setBudgetConstraints] = useState(10000);
  const [clientFeedback, setClientFeedback] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [aestheticPreferences, setAestheticPreferences] = useState({
    typeOfBuilding: "",
    approvedType: "",
    designStyle: "",
    roofType: "",
    wallMaterial: "",
    roofMaterial: "",
    customDesignStyle: "",
    customRoofType: "",
    customWallMaterial: "",
    customRoofMaterial: "",
  });
  const [functionalRequirements, setFunctionalRequirements] = useState({
    masterBedroom: false,
    attachedBathroom: false,
    kitchen: false,
    pantry: false,
    terrace: false,
    bedroom: false, // added for bedroom selection
  });
  const [subOptions, setSubOptions] = useState({
    kitchen: {
      withPantry: false,
      withoutPantry: false,
      lShape: false,
      cabinetWithChimney: false,
      other: "",
    },
    bedroom: {
      guestRoom: "",
      kidsRoom: "",
      prayerRoom: "",
    },
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [numberOfBedrooms, setNumberOfBedrooms] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [requirementsList, setRequirementsList] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [generatedTimeline, setGeneratedTimeline] = useState("");

  const apiUrl = "http://localhost:8000/rq";

  const calculateTimeline = (goals, budget) => {
    let baseDays = 30;
    if (goals.length > 50) baseDays += 20;
    if (budget > 200000) baseDays += 15;
    else if (budget > 100000) baseDays += 10;
    return `${baseDays} days to complete the design process.`;
  };

  const handleSubmit = () => {
    setError("");
  
    const {
      typeOfBuilding,
      approvedType,
      designStyle,
      roofType,
      wallMaterial,
      roofMaterial,
      customDesignStyle,
      customRoofType,
      customWallMaterial,
      customRoofMaterial,
    } = aestheticPreferences;
  
    if (
      projectName.trim() &&
      clientName.trim() &&
      dateOfConsultation.trim() &&
      conductedBy.trim() &&
      projectGoals.trim() &&
      budgetConstraints &&
      typeOfBuilding.trim() &&
      approvedType.trim() &&
      (designStyle !== "Other" || customDesignStyle.trim()) &&
      (roofType !== "Other" || customRoofType.trim()) &&
      (wallMaterial !== "Other" || customWallMaterial.trim()) &&
      (roofMaterial !== "Other" || customRoofMaterial.trim())
    ) {
      const timeline = calculateTimeline(projectGoals, budgetConstraints);
  
      const dataToSubmit = {
        projectName,
        clientName,
        dateOfConsultation,
        conductedBy,
        projectGoals,
        budgetConstraints,
        aestheticPreferences: {
          ...aestheticPreferences,
          designStyle: designStyle === "Other" ? customDesignStyle : designStyle,
          roofType: roofType === "Other" ? customRoofType : roofType,
          wallMaterial: wallMaterial === "Other" ? customWallMaterial : wallMaterial,
          roofMaterial: roofMaterial === "Other" ? customRoofMaterial : roofMaterial,
        },
        functionalRequirements,
        numberOfBedrooms: selectedFloor === "firstFloor" ? numberOfBedrooms : "",
        clientFeedback,
        additionalNotes,
        selectedFloor,
        timeline,
      };
  
      if (editIndex !== null) {
        // Edit mode - update the existing requirement
        const updatedList = requirementsList.map((req, index) =>
          index === editIndex ? dataToSubmit : req
        );
        setRequirementsList(updatedList);
        setEditIndex(null); // Reset after editing
      } else {
        // Create a new requirement
        setRequirementsList((prev) => [...prev, dataToSubmit]);
      }
  
      setMessage("Requirement saved successfully");
      setGeneratedTimeline(timeline);
      setAlertOpen(true);
      setConfirmationDialogOpen(true);
      setView("list");
    } else {
      setError("Please fill all required fields.");
    }
  };
  

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    const updatedList = requirementsList.filter((_, i) => i !== deleteIndex);
    setRequirementsList(updatedList);
    setDeleteDialogOpen(false);
    setMessage("Requirement deleted successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteIndex(null);
  };

  const handleNextStep = () => {
    if (currentStep < 2) setCurrentStep((prev) => prev + 1);
    else handleSubmit();
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleAestheticChange = (e) => {
    const { name, value } = e.target;
    setAestheticPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleFunctionalChange = (e, name) => {
    const { checked } = e.target;
    setFunctionalRequirements((prev) => ({ ...prev, [name]: checked }));
    if (name === 'kitchen') {
      setSubOptions({ ...subOptions, kitchen: "" });
      setSelectedImage(null);
    }
  };

  const handleSubOptionChange = (category, option) => {
    setSubOptions((prev) => ({
      ...prev,
      [category]: option,
    }));

    // Update image based on selected option for kitchen and bedroom
    if (category === 'kitchen') {
      switch (option) {
        case 'withPantry':
          setSelectedImage('/images/kitchen.jpg');
          break;
        case 'withoutPantry':
          setSelectedImage('/images/without pantry.png');
          break;
        case 'lShape':
          setSelectedImage('/images/Lshape.jpg');
          break;
        case 'cabinetWithChimney':
          setSelectedImage('/images/cabinet with chimney.jpg');
          break;
        default:
          setSelectedImage(null);
      }
    }

    if (category === 'bedroom') {
      switch (option) {
        case 'guestRoom':
          setSelectedImage('/images/guestroom.jpeg');
          break;
        case 'kidsRoom':
          setSelectedImage('/images/kids room.jpg');
          break;
        case 'prayerRoom':
          setSelectedImage('/images/prayer room.jpg');
          break;
        default:
          setSelectedImage(null);
      }
    }
  };

  const handleCustomInput = (e) => {
    const { value } = e.target;
    setSubOptions((prev) => ({
      ...prev,
      kitchen: {
        ...prev.kitchen,
        other: value,
      }
    }));
  };

  const renderSubOptions = () => {
    if (functionalRequirements.kitchen) {
      return (
        <Grid item xs={12}>
          <Typography variant="h6">Kitchen Options</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="kitchen-options"
              name="kitchen-options"
              value={subOptions.kitchen}
              onChange={(e) => handleSubOptionChange('kitchen', e.target.value)}
            >
              <FormControlLabel value="withPantry" control={<Radio />} label="With Pantry" />
              <FormControlLabel value="withoutPantry" control={<Radio />} label="Without Pantry" />
              <FormControlLabel value="lShape" control={<Radio />} label="L Shape" />
              <FormControlLabel value="cabinetWithChimney" control={<Radio />} label="Cabinet with Chimney" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
          {subOptions.kitchen === "other" && (
            <TextField
              label="Custom Kitchen Option"
              fullWidth
              value={subOptions.kitchen.other}
              onChange={handleCustomInput}
              sx={{ mt: 2 }}
              placeholder="Please specify"
            />
          )}
        </Grid>
      );
    }

    if (functionalRequirements.bedroom) {
      return (
        <Grid item xs={12}>
          <Typography variant="h6">Bedroom Options</Typography>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="bedroom-options"
              name="bedroom-options"
              value={subOptions.bedroom}
              onChange={(e) => handleSubOptionChange('bedroom', e.target.value)}
            >
              <FormControlLabel value="guestRoom" control={<Radio />} label="Guest Room" />
              <FormControlLabel value="kidsRoom" control={<Radio />} label="Kids Room" />
              <FormControlLabel value="prayerRoom" control={<Radio />} label="Prayer Room" />
            </RadioGroup>
          </FormControl>
        </Grid>
      );
    }
    return null;
  };

  const renderSelectedImage = () => {
    if (selectedImage) {
      return (
        <Box mt={3} display="flex" justifyContent="center">
          <img src={selectedImage} alt="Selected Option" style={{ width: '100%', maxWidth: '500px' }} />
        </Box>
      );
    }
    return null;
  };

  const handleFloorSelection = (e) => {
    setSelectedFloor(e.target.value);
  };

  const renderWallSketch = () => {
    switch (aestheticPreferences.wallMaterial) {
      case "Brick":
        return <img src="/images/brickhome.jpeg" alt="Brick Sketch" style={{ width: '45%', marginRight: '10px' }} />;
      case "Concrete":
        return <img src="/images/concretehome.jpeg" alt="Concrete Sketch" style={{ width: '45%', marginRight: '10px' }} />;
      case "Wood":
        return <img src="/images/woodhome2.jpeg" alt="Wood Sketch" style={{ width: '45%', marginRight: '10px' }} />;
      default:
        return null;
    }
  };

  const renderRoofSketch = () => {
    switch (aestheticPreferences.roofMaterial) {
      case 'Shingles':
        return <img src="/images/shingles2.png" alt="Shingles Sketch" style={{ width: '35%', marginRight: '10px' }} />;
      case 'Tiles':
        return <img src="/images/tiles.png" alt="Tiles Sketch" style={{ width: '45%', marginRight: '10px' }} />;
      case 'Metal':
        return <img src="/images/metal.png" alt="Metal Sketch" style={{ width: '45%', marginRight: '10px' }} />;
      default:
        return null;
    }
  };

  const handleEdit = (index) => {
    const req = requirementsList[index];
    setProjectName(req.projectName);
    setClientName(req.clientName);
    setDateOfConsultation(req.dateOfConsultation);
    setConductedBy(req.conductedBy);
    setProjectGoals(req.projectGoals);
    setBudgetConstraints(req.budgetConstraints);
    setAestheticPreferences(req.aestheticPreferences);
    setFunctionalRequirements(req.functionalRequirements);
    setNumberOfBedrooms(req.numberOfBedrooms);
    setSelectedFloor(req.selectedFloor);
    setClientFeedback(req.clientFeedback);
    setAdditionalNotes(req.additionalNotes);
    setEditIndex(index);
    setView("form");
    setCurrentStep(0);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h4" gutterBottom>Requirement Collection Page</Typography>
      {view === "form" ? (
        <>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" noValidate autoComplete="off">
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                {currentStep === 0 ? "Project Details" : currentStep === 1 ? "Aesthetic Preferences" : "Functional Requirements"}
              </Typography>
              <Typography variant="h6">Step {currentStep + 1} of 3</Typography>
            </Box>

            {/* Step 1: Project Details */}
            {currentStep === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Project Name"
                    fullWidth
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Client Name"
                    fullWidth
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date of Consultation"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={dateOfConsultation}
                    onChange={(e) => setDateOfConsultation(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Conducted By</InputLabel>
                    <Select value={conductedBy} onChange={(e) => setConductedBy(e.target.value)}>
                      <MenuItem value="Menon">Menon</MenuItem>
                      <MenuItem value="Suji Wikramshingha">Suji Wikramshingha</MenuItem>
                      <MenuItem value="Ranil Suriya">Ranil Suriya</MenuItem>
                      <MenuItem value="Harshath">Harshath</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Project Goals"
                    fullWidth
                    multiline
                    rows={3}
                    value={projectGoals}
                    onChange={(e) => setProjectGoals(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom>Budget Constraints (Rs): {budgetConstraints}</Typography>
                  <Slider value={budgetConstraints} onChange={(e, val) => setBudgetConstraints(val)} min={10000} max={500000} step={1000} valueLabelDisplay="auto" />
                </Grid>
              </Grid>
            )}

            {/* Step 2: Aesthetic Preferences */}
            {currentStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Type of Building</InputLabel>
                    <Select name="typeOfBuilding" value={aestheticPreferences.typeOfBuilding} onChange={handleAestheticChange}>
                      <MenuItem value="Residential">Residential</MenuItem>
                      <MenuItem value="Commercial">Commercial</MenuItem>
                      <MenuItem value="Industrial">Industrial</MenuItem>
                      <MenuItem value="Mixed-Use">Mixed Use</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Approved Type</InputLabel>
                    <Select name="approvedType" value={aestheticPreferences.approvedType} onChange={handleAestheticChange}>
                      <MenuItem value="" disabled>Select Approved Type</MenuItem>
                      <MenuItem value="Residential">Residential</MenuItem>
                      <MenuItem value="Commercial">Commercial</MenuItem>
                      <MenuItem value="Industrial">Industrial</MenuItem>
                      <MenuItem value="Mixed-Use">Mixed Use</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Design Style</InputLabel>
                    <Select name="designStyle" value={aestheticPreferences.designStyle} onChange={handleAestheticChange}>
                      <MenuItem value="" disabled>Select a Design Style</MenuItem>
                      <MenuItem value="Minimalist">Minimalist</MenuItem>
                      <MenuItem value="Modern">Modern</MenuItem>
                      <MenuItem value="Classic">Classic</MenuItem>
                      <MenuItem value="Rustic">Rustic</MenuItem>
                      <MenuItem value="Industrial">Industrial</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {aestheticPreferences.designStyle === "Other" && (
                    <TextField
                      label="Custom Design Style"
                      fullWidth
                      value={aestheticPreferences.customDesignStyle}
                      onChange={(e) => setAestheticPreferences((prev) => ({ ...prev, customDesignStyle: e.target.value }))}
                      sx={{ mt: 1 }}
                      required
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Roof Type</InputLabel>
                    <Select name="roofType" value={aestheticPreferences.roofType} onChange={handleAestheticChange}>
                      <MenuItem value="" disabled>Select Roof Type</MenuItem>
                      <MenuItem value="Flat">Flat</MenuItem>
                      <MenuItem value="Gable">Gable</MenuItem>
                      <MenuItem value="Hip">Hip</MenuItem>
                      <MenuItem value="Mansard">Mansard</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {aestheticPreferences.roofType === "Other" && (
                    <TextField
                      label="Custom Roof Type"
                      fullWidth
                      value={aestheticPreferences.customRoofType}
                      onChange={(e) => setAestheticPreferences((prev) => ({ ...prev, customRoofType: e.target.value }))}
                      sx={{ mt: 1 }}
                      required
                    />
                  )}
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Wall Material</InputLabel>
                    <Select name="wallMaterial" value={aestheticPreferences.wallMaterial} onChange={handleAestheticChange}>
                      <MenuItem value="Brick">Brick</MenuItem>
                      <MenuItem value="Concrete">Concrete</MenuItem>
                      <MenuItem value="Wood">Wood</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {aestheticPreferences.wallMaterial === "Other" && (
                    <TextField
                      label="Custom Wall Material"
                      fullWidth
                      value={aestheticPreferences.customWallMaterial}
                      onChange={(e) => setAestheticPreferences((prev) => ({ ...prev, customWallMaterial: e.target.value }))}
                      sx={{ mt: 1 }}
                      required
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Roof Material</InputLabel>
                    <Select name="roofMaterial" value={aestheticPreferences.roofMaterial} onChange={handleAestheticChange}>
                      <MenuItem value="Shingles">Shingles</MenuItem>
                      <MenuItem value="Tiles">Tiles</MenuItem>
                      <MenuItem value="Metal">Metal</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  {aestheticPreferences.roofMaterial === "Other" && (
                    <TextField
                      label="Custom Roof Material"
                      fullWidth
                      value={aestheticPreferences.customRoofMaterial}
                      onChange={(e) => setAestheticPreferences((prev) => ({ ...prev, customRoofMaterial: e.target.value }))}
                      sx={{ mt: 1 }}
                      required
                    />
                  )}
                </Grid>
                {(aestheticPreferences.wallMaterial || aestheticPreferences.roofMaterial) && (
                  <Box mt={3} display="flex" justifyContent="center" flexWrap="wrap">
                    {renderWallSketch()}
                    {renderRoofSketch()}
                  </Box>
                )}
              </Grid>
            )}

            {/* Step 3: Floor and Functional Requirements */}
            {currentStep === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Selected Floor</InputLabel>
                    <Select value={selectedFloor} onChange={handleFloorSelection}>
                      <MenuItem value="GroundFloor">Ground Floor</MenuItem>
                      <MenuItem value="FirstFloor">First Floor</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {selectedFloor === "firstFloor" && (
                  <Grid item xs={12}>
                    <TextField
                      label="Number of Bedrooms (First Floor)"
                      fullWidth
                      value={numberOfBedrooms}
                      onChange={(e) => setNumberOfBedrooms(e.target.value)}
                      required
                    />
                  </Grid>
                )}

              <Grid item xs={12}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={functionalRequirements.kitchen}
                          onChange={(e) => handleFunctionalChange(e, 'kitchen')}
                        />
                      }
                      label="Kitchen"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={functionalRequirements.bedroom}
                          onChange={(e) => handleFunctionalChange(e, 'bedroom')}
                        />
                      }
                      label="Bedroom"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={functionalRequirements.bathroom}
                          onChange={(e) => handleFunctionalChange(e, 'bathroom')}
                        />
                      }
                      label="Bathroom"
                    />
                  </FormGroup>
                </Grid>

                {renderSubOptions()}
                {renderSelectedImage()}

                <Grid item xs={12}>
                  <TextField label="Client Feedback" fullWidth multiline rows={3} value={clientFeedback} onChange={(e) => setClientFeedback(e.target.value)} sx={{ mt: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Additional Notes" fullWidth multiline rows={3} value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} sx={{ mt: 2 }} />
                </Grid>
              </Grid>
            )}
          </Box>

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={handlePreviousStep} disabled={currentStep === 0}>Previous</Button>
            <Button variant="contained" onClick={handleNextStep}>{currentStep === 2 ? "Submit" : "Next"}</Button>
          </Box>
        </>
      ) : (
        <div className="container mt-4">
  <h3>Requirements List</h3>
  <Grid container spacing={2}>
    {requirementsList.map((req, index) => (
      <Grid item xs={12} md={6} key={index}>
        <Card sx={{ backgroundColor: '#f5f5f5', boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              {req.projectName} - {req.clientName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date of Consultation:</strong> {req.dateOfConsultation}
            </Typography>
            <Typography variant="body1">
              <strong>Budget Constraints:</strong> Rs. {req.budgetConstraints}
            </Typography>
            <Typography variant="body1">
              <strong>Conducted By:</strong> {req.conductedBy}
            </Typography>
            <Typography variant="body2">
              <strong>Building Type:</strong> {req.aestheticPreferences.typeOfBuilding}
            </Typography>
            <Typography variant="body2">
              <strong>Aesthetic Preferences:</strong>
              <br />
              <strong>Approved Type:</strong> {req.aestheticPreferences.approvedType}
              <br />
              <strong>Design Style:</strong> {req.aestheticPreferences.designStyle}
              <br />
              <strong>Roof Type:</strong> {req.aestheticPreferences.roofType}
              <br />
              <strong>Wall Material:</strong> {req.aestheticPreferences.wallMaterial}
              <br />
              <strong>Roof Material:</strong> {req.aestheticPreferences.roofMaterial}
              <br />
              <strong>Floor Type:</strong> {req.selectedFloor}
              <br />
              <strong>Functional Requirements:</strong> {Object.keys(req.functionalRequirements).filter((key) => req.functionalRequirements[key]).join(', ')}
            </Typography>
            <Typography variant="caption">
              <strong>Timeline for Completion:</strong> {req.timeline}
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" color="primary" onClick={() => handleEdit(index)}>
              Edit
            </Button>
            <Button variant="contained" color="error" onClick={() => handleDelete(index)}>
              Delete
            </Button>
          </CardActions>
        </Card>
      </Grid>
    ))}
  </Grid>
</div>
      )}

      {/* Confirmation dialog for requirement submission */}
      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Confirmation
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Your requirement has been submitted successfully. The client will receive a notification, and the design process will now commence.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Estimated timeline: {generatedTimeline}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationDialogOpen(false)} color="primary">OK</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar alert for timeline */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        message={`Estimated timeline: ${generatedTimeline}`}
        action={
          <Button color="inherit" size="small" onClick={() => setAlertOpen(false)}>
            Close
          </Button>
        }
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this requirement?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
