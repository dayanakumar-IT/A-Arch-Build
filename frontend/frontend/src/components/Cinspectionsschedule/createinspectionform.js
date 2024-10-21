import React from 'react';
import dayjs from 'dayjs';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import BookmarkAddedTwoToneIcon from '@mui/icons-material/BookmarkAddedTwoTone';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import InputAdornment from '@mui/material/InputAdornment';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Example icon for location
import HomeWorkTwoToneIcon from '@mui/icons-material/HomeWorkTwoTone'; // Example icon for project name
import EmojiObjectsTwoToneIcon from '@mui/icons-material/EmojiObjectsTwoTone'; // Example icon for site code
import AssistantTwoToneIcon from '@mui/icons-material/AssistantTwoTone'; //icon for inspection title
import DeblurTwoToneIcon from '@mui/icons-material/DeblurTwoTone'; //icon for inspection type
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import errorIcon from '../assets/erroricon.png'; // Adjust the path to where your image is located



import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import { useNavigate } from 'react-router-dom';


import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './createinspection.css';

// Import images from assets folder
import akashwaranImg from '../assets/akashwaran.png';
import alexImg from '../assets/alex.png';
import rileyImg from '../assets/riley.png';
import morganImg from '../assets/morgan.png';

const initialValue = dayjs(); // Set the initial value to the current date

const inspectionTypes = [
  { label: 'Pre-Final Inspection', background: '#6256CA' }, // Example colors
  { label: 'Building Code Compliance Inspection', background: '#227B94' },
  { label: 'Design and Quality Assurance Inspection', background: '#125B9A' },
  { label: 'Client Walkthrough', background: '#179BAE' },
  { label: 'Final Punch List Inspection', background: '#1E2A5E' },
];

const assignees = [
  { name: 'Akashwaran', img: akashwaranImg },
  { name: 'Alex', img: alexImg },
  { name: 'Riley', img: rileyImg },
  { name: 'Morgan', img: morganImg },
];
const complexityOptions = [
  { label: 'High', value: 'high', icon: <StarIcon /> },
  { label: 'Medium', value: 'medium', icon: <StarHalfIcon /> },
  { label: 'Simple', value: 'simple', icon: <StarBorderIcon /> },
];

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
      badgeContent={isBooked ? '🔒' : null} // Show a lock emoji for booked days
      color={isBooked ? 'error' : 'default'} // Highlight booked days with a different color
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
        disabled={isPast || isBooked} // Disable past and booked days
      />
    </Badge>
  );
}

export default function CreateInspectionForm({ projectName, siteCode, locationState, onSuccess  }) {

  console.log("Project Name:", projectName);
  console.log("Site Code:", siteCode);
  console.log("Location:", locationState);
  

  const requestAbortController = React.useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [highlightedDays, setHighlightedDays] = React.useState([]);
  const [selectedDate, setSelectedDate] = React.useState(initialValue);
  const [selectedTime, setSelectedTime] = React.useState(dayjs());
  const navigate = useNavigate();
  const [sitecode, setSiteCode] = React.useState(siteCode || ''); // Use passed siteCode, fallback to empty string
  const [projectname, setProjectName] = React.useState(projectName || ''); // Use passed projectName
  const [location, setLocation] = React.useState(locationState || ''); // Use passed location
  const [ititle, setItitle] = React.useState('');
  const [itype, setInspectionType] = React.useState(inspectionTypes[0].label);
  const [idate, setiDate] = React.useState(initialValue);
  const [itime, setiTime] = React.useState(dayjs());
  const [assignee, setAssignee] = React.useState(assignees[0].name);
  const [projectcomplexity, setComplexity] = React.useState(complexityOptions[0].value);
  const [compartmentProgress, setCompartmentProgress] = React.useState([0, 0, 0, 0, 0]);
  const [formError, setFormError] = React.useState('');
  const [openErrorDialog, setOpenErrorDialog] = React.useState(false);



  const apiUrl = "http://localhost:8000/inspection";

  //Rings code
  React.useEffect(() => {
    const progress = [
      sitecode && projectname && location && projectcomplexity ? 100 : 0,  // Compartment 1: Project Details
      ititle && itype ? 100 : 0,                                           // Compartment 2: Inspection Info
      idate ? 100 : 0,                                                     // Compartment 3: Date
      itime ? 100 : 0,                                                     // Compartment 4: Time
      assignee ? 100 : 0                                                   // Compartment 5: Assignee
    ];
    setCompartmentProgress(progress);
  }, [sitecode, projectname, location, projectcomplexity, ititle, itype, idate, itime, assignee]);
  

  const handleSubmit = () => {
    if (
      sitecode.trim() === '' &&
      projectname.trim() === '' &&
      ititle.trim() === '' &&
      itype.trim() === '' &&
      idate.trim() === '' &&
      itime.trim() === '' &&
      assignee.trim() === '' &&
      projectcomplexity.trim() === '' &&
      location.trim() === ''
    ) {
      setFormError("Please fill in all required fields.");
      setOpenErrorDialog(true); // Open the dialog when there is an error
      return;
    }
    if (!/^[a-zA-Z]/.test(ititle)) {
      setFormError("Inspection title must start with a letter.");
      setOpenErrorDialog(true); // Open the dialog when the title is invalid
      return;
    }
    setFormError('');
    setOpenErrorDialog(false); // Close the dialog if there are no errors

    console.log("API URL:", apiUrl);
    fetch(`${apiUrl}/createinspection`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sitecode, projectname, ititle, itype, idate, itime, assignee, projectcomplexity, location })
    })
    .then((res) => {
      if (res.ok) {
        navigate('/project-manager');
        onSuccess();
      } else {
        alert("Unable to create Inspection");
      }
    })
    .catch(error => {
      console.error("Error occurred during submission:", error);
      alert("An unexpected error occurred. Please try again.");
    });
  };

  const fetchHighlightedDays = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/getHighlightedDays`);
      const data = await response.json();
      setHighlightedDays(data.days);
    } catch (error) {
      console.error("Error fetching highlighted days:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchHighlightedDays();
  }, []);

  const handleMonthChange = (date) => {
    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }
    setIsLoading(true);
    setHighlightedDays([]);
    fetchHighlightedDays(date);
  };

  const handleDateChange = (newDate) => {
    const formattedDate = newDate.format('YYYY-MM-DD');
    if (highlightedDays.includes(formattedDate)) {
      alert("This date is already booked for an inspection and cannot be selected.");
      return;
    }
    setSelectedDate(newDate);
    setiDate(formattedDate);
  };

  const handleTimeChange = (newTime) => {
    setSelectedTime(newTime);
    setiTime(newTime.format('HH:mm'));
  };

  const handleComplexityChange = (event) => setComplexity(event.target.value);

  return (
    <>
     <div className="progress-rings">
  {compartmentProgress.map((progress, index) => (
    <div 
      key={index} 
      style={{ 
        display: 'inline-block', 
        marginLeft: '70px', // Add 70px margin to the left
        marginRight: '70px', // Set a different margin to the right
        textAlign: 'center', 
        position: 'relative',
        fontWeight: 'bold', 
        width: '100px', // Adjust width to match the size of the ring
        height: '80px', // Adjust height to match the size of the ring
      }}
    >
      <CircularProgress 
        variant="determinate" 
        value={progress} 
        size={80} // Increase the size of the rings
        thickness={5} // Adjust thickness if desired
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '1rem', // Increase font size for better visibility
          fontWeight: 'bold',
        }}
      >
        {`${progress}%`}
      </div>
      <p 
        style={{ 
          fontSize: '0.9rem', 
          marginTop: '10px',
          backgroundColor: '#FCCD2A', //yellow label
          padding: '4px 8px', // Add some padding for label-like spacing
          borderRadius: '12px', // Rounded corners
          display: 'inline-block', // Ensures the label wraps around the text content
          width: '120px',
        }}
      >
        {['Project Details', 'Inspection Info', 'Date', 'Time', 'Assignee'][index]}
      </p>

    </div>
  ))}
</div>


      <Dialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Incorrect Input</DialogTitle>
        <DialogContent style={{ textAlign: 'center' }}> {/* Center content */}
          <img 
            src={errorIcon} // Replace with your image path
            alt="Error Icon"
            style={{ width: '100px', height: '100px', marginBottom: '15px' }} // Adjust size as needed
          />
          <DialogContentText id="alert-dialog-description">
            {formError}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenErrorDialog(false)} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>



    
      <div className="form-container">
        <div className="compartment compartment-1">
          <h2>Project Details</h2>
          <TextField
            fullWidth
            label="Project Name"
            variant="outlined"
            margin="normal"
            value={projectname}
            onChange={(e) => setProjectName(e.target.value)}
            InputProps={{
             
              startAdornment: (
                <InputAdornment position="start">
                  <HomeWorkTwoToneIcon style={{ color: '#051094' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Site Code"
            variant="outlined"
            margin="normal"
            value={sitecode}
            onChange={(e) => setSiteCode(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmojiObjectsTwoToneIcon style={{ color: '#051094' }}/>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Location"
            variant="outlined"
            margin="normal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon style={{ color: '#051094' }}/>
                </InputAdornment>
              ),
            }}
          />
          <div className="complexity-container">
            <span>Complexity</span>
            <RadioGroup
              aria-label="complexity"
              name="complexity"
              value={projectcomplexity}
              onChange={handleComplexityChange}
              style={{ display: 'flex', flexDirection: 'row' }}
            >
              {complexityOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {option.icon}
                      <span style={{ marginLeft: '8px' }}>{option.label}</span>
                    </div>
                  }
                />
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="compartment compartment-2">
          <h2>Inspection Details</h2>
          <TextField
            fullWidth
            label="Inspection Title"
            variant="outlined"
            margin="normal"
            value={ititle}
            onChange={(e) => setItitle(e.target.value)} 
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AssistantTwoToneIcon style={{ color: '#051094' }}/>
                </InputAdornment>
              ),
            }}
            error={formError.includes('Inspection title')}
            helperText={formError.includes('Inspection title') ? 'Inspection title must start with a letter.' : ''}
          />
          <TextField
            select
            fullWidth
            label="Inspection Type"
            value={itype}
            onChange={(e) => setInspectionType(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DeblurTwoToneIcon style={{ color: '#051094' }}/>
                </InputAdornment>
              ),
            }}
            margin="normal"
          >
            {inspectionTypes.map((type) => (
              <MenuItem 
                key={type.label} 
                value={type.label}
                style={{ backgroundColor: type.background, color: '#fff' }}
              >
                {type.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className="calendar-clock-container">
          <div className="compartment compartment-calendar">
            <h2>Date</h2>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StaticDatePicker
                orientation="portrait"
                loading={isLoading}
                onMonthChange={handleMonthChange}
                onChange={handleDateChange}
                renderLoading={() => <DayCalendarSkeleton />}
                value={selectedDate}
                slots={{ day: ServerDay }}
                slotProps={{ day: { highlightedDays } }}
                shouldDisableDate={(date) => {
                  const today = dayjs().startOf('day');
                  return date.isBefore(today) || highlightedDays.includes(date.format('YYYY-MM-DD'));
                }}
              />
            </LocalizationProvider>
          </div>

          <div className="compartment compartment-clock">
            <h2>Time</h2>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StaticTimePicker
                displayStaticWrapperAs="desktop"
                value={selectedTime}
                onChange={handleTimeChange}
              />
            </LocalizationProvider>
            <div className="selected-time-box">
              
              <p>Selected Time:</p>
              <p>{selectedTime.format('hh:mm A')}</p>
            </div>
          </div>
        </div>

        <div className="compartment compartment-4">
          <h2>Assign To</h2>
          <TextField
            select
            fullWidth
            label="Assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            margin="normal"
          >
            {assignees.map(({ name, img }) => (
              <MenuItem key={name} value={name}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={img} alt={name} style={{ borderRadius: '50%', width: '30px', height: '30px', marginRight: '8px' }} />
                  {name}
                </div>
              </MenuItem>
            ))}
          </TextField>
        </div>

        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          style={{ marginTop: '20px' }} 
          startIcon={<BookmarkAddedTwoToneIcon />}
          onClick={handleSubmit}
        >
          Create Inspection
        </Button>
      </div>
    </>
  );
}
