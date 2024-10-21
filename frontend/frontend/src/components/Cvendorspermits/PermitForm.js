import React from "react";
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

const projectData = {
  SITE_VGG: "Matale Project",
  SITE_Y8H: "Skyline Towers Residential Complex",
  SITE_MXC: "Harbor View Hub",
};

const PermitFormModal = ({
  open,
  onClose,
  selectedPermit,
  formData,
  handleInputChange,
  handleFileUpload,
  handleSideCodeChange,
  handleSubmit,
  isEditMode,
  handleDateChange,
  handleStatusChange,
  dateErrors,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent>
        <form>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <img src={selectedPermit?.img} alt={selectedPermit?.label} style={{ width: "100%" }} />
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Permit Number"
                    name="permitNumber"
                    value={formData.permitNumber}
                    onChange={handleInputChange}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Side Code</InputLabel>
                    <Select name="sideCode" value={formData.sideCode} onChange={handleSideCodeChange}>
                      {Object.keys(projectData).map((code) => (
                        <MenuItem key={code} value={code}>
                          {code}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Issue Date"
                    name="issueDate"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.issueDate}
                    onChange={(e) => handleDateChange(e, "issueDate")}
                    error={!!dateErrors.issueDate}
                    helperText={dateErrors.issueDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    name="expiryDate"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.expiryDate}
                    onChange={(e) => handleDateChange(e, "expiryDate")}
                    error={!!dateErrors.expiryDate}
                    helperText={dateErrors.expiryDate}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <RadioGroup value={formData.approvalStatus} onChange={handleStatusChange} row>
                      <FormControlLabel value="approved" control={<Radio sx={{ color: "green" }} />} label="Approved" />
                      <FormControlLabel value="pending" control={<Radio sx={{ color: "orange" }} />} label="Pending" />
                      <FormControlLabel value="rejected" control={<Radio sx={{ color: "red" }} />} label="Rejected" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" component="label"
            
            startIcon={<CloudUploadRoundedIcon/>}
            sx={{
              width: "50%", // Set the width of the button
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
              marginBottom: 3, // Maintain marginBottom for consistency
            }}>
              
              Upload Permit Document
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {isEditMode ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PermitFormModal;
