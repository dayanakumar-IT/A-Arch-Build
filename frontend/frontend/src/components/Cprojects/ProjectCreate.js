import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCreate.css';
import { Button, Radio, RadioGroup, FormControlLabel, FormLabel, Stack } from '@mui/material';

const generateSiteCode = () => {
  return 'SITE-' + Math.random().toString(36).substr(2, 3).toUpperCase(); // 3 characters after 'SITE'
};

export default function ProjectCreate({onSuccessProject}) {
  const [projectname, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [projecttype, setProjectType] = useState('');
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState(1);
  const [maxDuration, setMaxDuration] = useState(36);
  const [startdate, setStartdate] = useState("");
  const [projectstatus, setProjectStatus] = useState('');
  const [clientname, setClientname] = useState("");
  const [sitecode, setSiteCode] = useState('');
  const [teammembers, setTeammembers] = useState(0);
  const [error, setError] = useState("");
  const [dateError, setDateError] = useState(""); // New state for date error
  const [message, setMessage] = useState("");
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();
  const apiUrl = "http://localhost:8000/project";

  const isFormValid = () => {
    // Validate form fields
    return projectname.trim() !== '' &&
      description.trim() !== '' &&
      projecttype !== '' &&
      location.trim() !== '' &&
      duration >= 1 && duration <= maxDuration &&
      startdate.trim() !== '' &&
      projectstatus !== '' &&
      clientname.trim() !== '' &&
      teammembers > 0;
  };

  const handleSubmit = () => {
    setError("");
    setDateError(""); // Clear the date error before validation
    if (!isFormValid()) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate date for "Completed" and "In Progress" project types
    const selectedStartDate = new Date(startdate);
    const currentDate = new Date();

    if ((projectstatus === 'Completed' || projectstatus === 'In Progress') && selectedStartDate > currentDate) {
      setDateError("Start date cannot be in the future for completed or in-progress projects.");
      return;
    }

    const projectData = {
      projectname,
      description,
      projecttype,
      location,
      duration,
      startdate,
      projectstatus,
      clientname,
      sitecode,
      teammembers,
    };

    fetch(apiUrl + '/projects', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    })
      .then((res) => {
        if (res.ok) {
          setProjects([...projects, projectData]);
          setMessage("Project added successfully!");
          navigate('/project-manager');
          onSuccessProject();
          setTimeout(() => {
            setMessage("");
          }, 2000);
        } else {
          setError("Unable to create project.");
        }
      })
      .catch(() => setError("Unable to create project"));
  };

  useEffect(() => {
    setSiteCode(generateSiteCode());
  }, []);

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
  };

  const handleProjectTypeChange = (e) => {
    const selectedType = e.target.value;
    setProjectType(selectedType);

    switch (selectedType) {
      case 'Commercial':
        setMaxDuration(18);
        break;
      case 'Residential':
        setMaxDuration(12);
        break;
      case 'Infrastructure':
        setMaxDuration(36);
        break;
      case 'Renovation':
        setMaxDuration(12);
        break;
      case 'Industrial':
        setMaxDuration(36);
        break;
      default:
        setMaxDuration(36);
        break;
    }

    if (duration > maxDuration) {
      setDuration(maxDuration);
    }
  };

  const handleProjectStatusChange = (e) => {
    setProjectStatus(e.target.value);
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow-sm" style={{ backgroundColor: '#f9f9f9', border: '2px solid #007bff' }}>
        <h3>Add Project</h3>
        {message && <p className="text-success">{message}</p>}
        {error && <p className="text-danger">{error}</p>}
        <form>
          <div className="form-group mb-3">
            <label htmlFor="projectname">Project Name</label>
            <input
              id="projectname"
              placeholder="Enter project name"
              onChange={(e) => setProjectName(e.target.value)}
              value={projectname}
              className="form-control"
              type="text"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              placeholder="Enter project description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              className="form-control"
              type="text"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="projecttype">Project Type</label>
            <select
              id="projecttype"
              className="form-control styled-select"
              onChange={handleProjectTypeChange}
              value={projecttype}
            >
              <option value="">Select Project Type</option>
              <option value="Commercial" style={{ backgroundColor: '#e3f2fd' }}>Commercial</option>
              <option value="Residential" style={{ backgroundColor: '#ffe0b2' }}>Residential</option>
              <option value="Infrastructure" style={{ backgroundColor: '#e8f5e9' }}>Infrastructure</option>
              <option value="Renovation" style={{ backgroundColor: '#f3e5f5' }}>Renovation</option>
              <option value="Industrial" style={{ backgroundColor: '#ffebee' }}>Industrial</option>
            </select>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              placeholder="Enter project location"
              onChange={(e) => setLocation(e.target.value)}
              value={location}
              className="form-control"
              type="text"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="duration">Duration (months)</label>
            <input
              id="duration"
              type="range"
              min="1"
              max={maxDuration}
              value={duration}
              onChange={handleDurationChange}
              className="form-control-range"
              disabled={!projecttype}  // Disable input if no project type is selected
            />
            {!projecttype && <p className="text-danger">Please select a project type first.</p>}
            {projecttype && (
              <p style={{ color: '#00726b', fontWeight: 'bold' }}> {/* Change color to green and bold */}
                Max duration for {projecttype}: {maxDuration} months
              </p>
            )}
            <div className="mt-2">Selected Duration: {duration} months</div>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="startdate">Start Date</label>
            <input
              id="startdate"
              placeholder="Select start date"
              onChange={(e) => setStartdate(e.target.value)}
              value={startdate}
              className="form-control"
              type="date"
            />
            {dateError && <p className="text-danger">{dateError}</p>} {/* Display date error here */}
          </div>

          {/* Project Status with MUI Radio Buttons */}
          <FormLabel component="legend">Project Status</FormLabel>
          <RadioGroup
            name="projectstatus"
            value={projectstatus}
            onChange={handleProjectStatusChange}
          >
            <FormControlLabel value="Planned" control={<Radio />} label="Planned" />
            <FormControlLabel value="In Progress" control={<Radio />} label="In Progress" />
            <FormControlLabel value="Completed" control={<Radio />} label="Completed" />
          </RadioGroup>

          <div className="form-group mb-3">
            <label htmlFor="clientname">Client Name</label>
            <input
              id="clientname"
              placeholder="Enter client name"
              onChange={(e) => setClientname(e.target.value)}
              value={clientname}
              className="form-control"
              type="text"
            />
          </div>

          <div className="form-group mb-3">
            <label>Site Code</label>
            <input
              disabled
              value={sitecode}
              className="form-control"
              type="text"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="teammembers">Number of Team Members</label>
            <input
              id="teammembers"
              type="number"
              min="1"
              value={teammembers}
              onChange={(e) => setTeammembers(parseInt(e.target.value))}
              className="form-control"
            />
          </div>

          {/* Buttons with MUI */}
          <Stack direction="row" justifyContent="space-between" mt={4}>
            <Button variant="contained" color="error" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Add Project
            </Button>
          </Stack>
        </form>
      </div>
    </div>
  );
}
