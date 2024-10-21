import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  AppBar,
  Toolbar,
  Grid,
  CircularProgress,
  TextField,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Edit, Delete, ArrowBack, Search } from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

// Define colors for each equipment type
const equipmentColors = {
  Excavator: '#004578',
  Bulldozer: '#005a9e',
  Crane: '#106ebe',
  'Concrete Mixer': '#0078d4',
  'Drilling Machine': '#2b88d8',
  'Welding Machine': '#71afe5',
  Forklift: '#c7e0f4',
  Scaffolding: '#003f5c',
  Generator: '#008E97',
  Ladder: '#00416A'
};

// DetailView Component
function DetailView({ progress, onBack, onEdit, onDelete }) {
  const detailRef = useRef();

  const generatePDF = () => {
    const pdf = new jsPDF();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor('#ffffff');
    pdf.setFillColor('#051094');
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 15, 'F');
    pdf.text('Daily Progress Report', pdf.internal.pageSize.getWidth() / 2, 10, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor('#000');
    pdf.text(`Date: ${new Date(progress.date).toLocaleDateString()}`, 10, 25);

    const details = [
      `Site Code: ${progress.sitecode}`,
      `Location: ${progress.location}`,
      `Weather: ${Array.isArray(progress.weather) ? progress.weather.join(', ') : progress.weather}`
    ];

    details.forEach((detail, index) => {
      pdf.text(detail, pdf.internal.pageSize.getWidth() - 80, 25 + index * 8);
    });

    pdf.setFontSize(14);
    pdf.setTextColor('#051094');
    pdf.setFillColor('#A0D683');
    pdf.rect(10, 50, pdf.internal.pageSize.getWidth() - 20, 8, 'F');
    pdf.text('Summary of Activities', pdf.internal.pageSize.getWidth() / 2, 55, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor('#000');
    let yOffset = 70;
    const margin = 10;
    const lineHeight = 7;

    progress.workforceDetails.forEach((team, index) => {
      pdf.text(
        `Team ${index + 1} (${team.teamName}): Worked for ${team.workhrs} hours, focusing on tasks like ${team.tasksdone.join(', ')}. Status: ${team.taskstatus}.`,
        margin,
        yOffset,
        { maxWidth: pdf.internal.pageSize.getWidth() - margin * 2 }
      );
      yOffset += lineHeight * 1.5;
    });

    yOffset += 5;
    pdf.setFontSize(14);
    pdf.setTextColor('#051094');
    pdf.text('Equipment Usage:', margin, yOffset);
    yOffset += lineHeight;
    pdf.setFontSize(12);
    pdf.setTextColor('#000');
    progress.equipmentDetails.forEach((equipment) => {
      pdf.text(
        `The ${equipment.equiptype} was used for ${equipment.usedhrs} hours.`,
        margin,
        yOffset,
        { maxWidth: pdf.internal.pageSize.getWidth() - margin * 2 }
      );
      yOffset += lineHeight * 1.5;
    });

    yOffset += 10;
    pdf.setFontSize(14);
    pdf.setTextColor('#051094');
    pdf.setFillColor('#A0D683');
    pdf.rect(10, yOffset, pdf.internal.pageSize.getWidth() - 20, 8, 'F');
    pdf.text('Observations & Comments', pdf.internal.pageSize.getWidth() / 2, yOffset + 5, { align: 'center' });

    yOffset += 15;
    pdf.setFontSize(12);
    pdf.setTextColor('#000');

    const observations = pdf.splitTextToSize(`Observations: ${progress.observations}`, pdf.internal.pageSize.getWidth() - margin * 2);
    observations.forEach((line) => {
      pdf.text(line, margin, yOffset);
      yOffset += lineHeight;
    });

    yOffset += 5;

    const comments = pdf.splitTextToSize(`Comments: ${progress.comments}`, pdf.internal.pageSize.getWidth() - margin * 2);
    comments.forEach((line) => {
      pdf.text(line, margin, yOffset);
      yOffset += lineHeight;
    });

    pdf.save(`Progress_Report_${progress.sitecode}.pdf`);
  };

  if (!progress) {
    return null;
  }

  const workforceHoursData = progress.workforceDetails.map((team) => ({
    teamName: team.teamName,
    workhrs: parseInt(team.workhrs.split('-')[0], 10) || 0
  }));

  const equipmentUsageData = progress.equipmentDetails.map((equipment) => ({
    name: equipment.equiptype,
    hours: parseInt(equipment.usedhrs.split('-')[0], 10) || 0
  }));

  return (
    <Box sx={{ padding: 2 }} ref={detailRef}>
      {/* Details and Buttons */}
      <AppBar position="static" sx={{ background: 'linear-gradient(350deg, #211C6A, #4137D0)', marginBottom: 2 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}>
            Daily Progress Report
          </Typography>
          <IconButton color="inherit" onClick={() => onEdit(progress)}>
            <Edit />
          </IconButton>
          <IconButton color="inherit" onClick={() => onDelete(progress._id)}>
            <Delete />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
          padding: 2,
          borderRadius: 2,
          marginBottom: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 'bold',color:'#051094' }}>
          Date: {new Date(progress.date).toLocaleDateString()}
        </Typography>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 'bold' ,color:'#051094'}}>
            Site Code: {progress.sitecode}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: 'serif', fontWeight: 'bold' ,color:'#051094'}}>Location: {progress.location}</Typography>
          <Typography variant="h7" sx={{ fontFamily: 'serif', fontWeight: 'bold', color: '#051094' }}>
            Weather: {Array.isArray(progress.weather) ? progress.weather.join(', ') : progress.weather}
          </Typography>

        </Box>
      </Box>


      {/* Workforce Details */}
      <Typography
        variant="h6"
        sx={{
          background: 'linear-gradient(350deg, #211C6A, #4137D0)',
          textAlign: 'center',
          color: 'white',
          padding: 2,
          fontFamily: 'serif',
          fontWeight: 'bold',
          letterSpacing: '0.1rem',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}
      >
        Workforce Details
      </Typography>



      <Box sx={{ marginBottom: 3, padding: 2 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)', overflow: 'hidden', border: '2px solid #051094', background: 'linear-gradient(145deg, #e8f5e9, #ffffff)' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#A0D683', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)' }}>
                {['Team Name', 'Work Hours', 'Tasks Done', 'Task Status'].map((header, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{
                      padding: '16px',
                      borderBottom: '3px solid #051094',
                      fontFamily: 'serif',
                      fontWeight: 'bold',
                      color: '#051094',
                      fontSize: '1.2rem',
                      letterSpacing: '0.05rem',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                      backgroundColor: '#AFDBF5'
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {progress.workforceDetails.map((team, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#f0f9ff' : '#e1f7e7',
                    '&:hover': {
                      backgroundColor: '#b2fab4',
                      transform: 'scale(1.02)',
                      boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
                    },
                    transition: 'transform 0.3s, background-color 0.3s, box-shadow 0.3s'
                  }}
                >
                  <TableCell align="center" sx={{ padding: '12px', borderBottom: '2px solid #051094', fontFamily: 'serif', color: '#051094' }}>
                    {team.teamName}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '12px', borderBottom: '2px solid #051094', fontFamily: 'serif', color: '#051094' }}>
                    {team.workhrs} Hours
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '12px', borderBottom: '2px solid #051094', fontFamily: 'serif', color: '#051094' }}>
                    {team.tasksdone ? team.tasksdone.join(', ') : 'N/A'}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '12px', borderBottom: '2px solid #051094', fontFamily: 'serif', color: '#051094' }}>
                    {team.taskstatus}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Equipment Details */}
      <Typography
        variant="h6"
        sx={{
          background: 'linear-gradient(350deg, #211C6A, #4137D0)',
          textAlign: 'center',
          color: 'white',
          padding: 2,
          fontFamily: 'serif',
          fontWeight: 'bold',
          letterSpacing: '0.1rem',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}
      >
        Equipment Details
      </Typography>

      <Box sx={{ marginBottom: 3, padding: 2 }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            border: '2px solid #051094',
            background: 'linear-gradient(145deg, #e8f5e9, #ffffff)'
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#A0D683', boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)' }}>
                {['Equipment Type', 'Used Hours'].map((header, index) => (
                  <TableCell
                    key={index}
                    align="center"
                    sx={{
                      padding: '16px',
                      borderBottom: '3px solid #051094',
                      fontFamily: 'serif',
                      fontWeight: 'bold',
                      color: '#051094',
                      fontSize: '1.2rem',
                      letterSpacing: '0.05rem',
                      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                      backgroundColor: '#AFDBF5'
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {progress.equipmentDetails.map((equipment, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? '#f0f9ff' : '#e1f7e7',
                    '&:hover': {
                      backgroundColor: '#b2fab4',
                      transform: 'scale(1.02)',
                      boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)'
                    },
                    transition: 'transform 0.3s, background-color 0.3s, box-shadow 0.3s'
                  }}
                >
                  <TableCell align="center" sx={{ padding: '12px', borderBottom: '2px solid #051094', fontFamily: 'serif', color: '#051094' }}>
                    {equipment.equiptype}
                  </TableCell>
                  <TableCell align="center" sx={{ padding: '12px', borderBottom: '2px solid #051094', fontFamily: 'serif', color: '#051094' }}>
                    {equipment.usedhrs} Hours
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Observations, Site Conditions, and Comments Sections */}
      <Card sx={{ padding: 2, backgroundColor: '#E8E8E8', marginBottom: 3 }}>
        {/* Observations Section */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ background: 'linear-gradient(350deg, #211C6A, #4137D0)', borderRadius: '20px', marginBottom: 1 }}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'white',
                padding: 1,
                fontFamily: 'serif',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Observations
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph sx={{ fontFamily: 'serif' }}>
              {progress.observations}
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Site Conditions Picture Section */}
        {progress.conditions && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: '#AFDBF5', borderRadius: '20px', marginBottom: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  color: '#051094',
                  padding: 1,
                  fontFamily: 'serif',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                Site Conditions Picture
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                <img
                  src={`http://localhost:8000/daily/uploads/${progress.conditions}`}
                  alt="Site Conditions"
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: 'auto',
                    borderRadius: '10px'
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Comments Section */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ background: 'linear-gradient(350deg, #211C6A, #4137D0)', borderRadius: '20px', marginBottom: 1 }}>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                color: 'white',
                padding: 1,
                fontFamily: 'serif',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Comments
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph sx={{ fontFamily: 'serif' }}>
              {progress.comments}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Card>

      {/* Workforce and Equipment Usage Charts */}
      <Box sx={{ padding: 2 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: '#A0D683', borderRadius: '20px', padding: '8px 16px', '&:hover': { backgroundColor: '#98c47b' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Typography variant="h6" sx={{ color: '#0f2557', fontFamily: 'serif', fontWeight: 'bold', display: 'inline-block' }}>
                Workforce and Equipment Usage Over Time
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
  <Box sx={{ display: 'flex', gap: 2 }}>
    {/* Workforce Worked Hours Bar Chart */}
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" sx={{ marginBottom: 1, color: '#0f2557' }}>
        Workforce Worked Hours
      </Typography>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={workforceHoursData}>
          <XAxis dataKey="teamName" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Define the color list for different teams */}
          <Bar dataKey="workhrs">
            {workforceHoursData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#4caf50', '#66bb6a', '#81c784', '#a5d6a7'][index % 8]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>

    {/* Equipment Usage Bar Chart */}
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle1" sx={{ marginBottom: 1, color: '#0f2557' }}>
        Equipment Usage
      </Typography>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={equipmentUsageData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* Equipment Bars */}
          <Bar dataKey="hours">
            {equipmentUsageData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={equipmentColors[entry.name] || '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  </Box>
</AccordionDetails>
        </Accordion>
      </Box>

      {/* Generate PDF Button */}
      <Box sx={{ textAlign: 'center', marginTop: 3 }}>
        <Button variant="contained" onClick={generatePDF}>
          Generate PDF
        </Button>
      </Box>
    </Box>
  );
}

// Main ProgressList Component
export default function ProgressList({ onSuccessEditDailyLog}) {
  const [progressData, setProgressData] = useState([]);
  const [view, setView] = useState('list');
  const [selectedProgress, setSelectedProgress] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/daily/progress')
      .then((response) => response.json())
      .then((data) => {
        setProgressData(data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch progress data.');
        setLoading(false);
      });
  }, [location]);

  const handleEdit = (progress) => {
    console.log(progress); // Check if sitecode, location, and weather are present
    onSuccessEditDailyLog();
    navigate('/quality-assurance', { state: { progress } });
  };


  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      fetch(`http://localhost:8000/daily/progress/${id}`, { method: 'DELETE' })
        .then(() => {
          setProgressData((prevData) => prevData.filter((item) => item._id !== id));
        })
        .catch(() => alert('Failed to delete the entry.'));
    }
  };

  const handleViewDetail = (progress) => {
    setSelectedProgress(progress);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedProgress(null);
  };

  const handleSearchChange = (event) => {
    setSearchDate(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredData = useMemo(() => {
    if (!searchDate) return progressData;
    const search = new Date(searchDate).toLocaleDateString();
    return progressData.filter((progress) => {
      const progressDate = new Date(progress.date).toLocaleDateString();
      return progressDate.includes(search);
    });
  }, [searchDate, progressData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [currentPage, filteredData]);

  const prepareStackedBarData = useCallback(() => {
    const dateMap = {};

    progressData.forEach((progress) => {
      const date = new Date(progress.date).toLocaleDateString();
      if (!dateMap[date]) {
        dateMap[date] = {
          date,
          'Workforce On Hold': 0,
          'Workforce In Progress': 0,
          'Workforce Completed': 0
        };
        progress.equipmentDetails.forEach((equipment) => {
          dateMap[date][`Equipment ${equipment.equiptype}`] = 0;
        });
      }

      progress.workforceDetails.forEach((team) => {
        const statusKey = `Workforce ${team.taskstatus}`;
        if (dateMap[date][statusKey] !== undefined) {
          dateMap[date][statusKey] += 1;
        }
      });

      progress.equipmentDetails.forEach((equipment) => {
        const equipmentKey = `Equipment ${equipment.equiptype}`;
        if (dateMap[date][equipmentKey] !== undefined) {
          dateMap[date][equipmentKey] += 1;
        }
      });
    });

    return Object.values(dateMap);
  }, [progressData]);

  const stackedBarData = useMemo(() => prepareStackedBarData(), [prepareStackedBarData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return view === 'detail' ? (
    <DetailView progress={selectedProgress} onBack={handleBackToList} onEdit={handleEdit} onDelete={handleDelete} />
  ) : (
    <Box sx={{ padding: 2 }}>
      

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 4 }}>
        <TextField
          label="Search by Date"
          type="date"
          variant="outlined"
          value={searchDate}
          onChange={handleSearchChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 300 }}
          InputProps={{ endAdornment: <Search /> }}
        />
      </Box>

      {/* Stacked Bar Chart */}
      <Box sx={{ width: '100%', maxWidth: 1000, margin: '0 auto', marginBottom: 4 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#0f2557', fontWeight: 'bold' }}>
          Workforce and Equipment Usage Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={stackedBarData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Workforce Bars */}
            <Bar dataKey="Workforce On Hold" stackId="a" fill="#FDCC0D" name="Workforce On Hold" />
            <Bar dataKey="Workforce In Progress" stackId="a" fill="#DEB100" name="Workforce In Progress" />
            <Bar dataKey="Workforce Completed" stackId="a" fill="#BF9600" name="Workforce Completed" />
            
            {/* Equipment Bars */}
            <Bar dataKey="Equipment Excavator" stackId="b" fill="#004578" name="Excavator" />
            <Bar dataKey="Equipment Bulldozer" stackId="b" fill="#005a9e" name="Bulldozer" />
            <Bar dataKey="Equipment Crane" stackId="b" fill="#72A0c1" name="Crane" />
            <Bar dataKey="Equipment Concrete Mixer" stackId="b" fill="#0078d4" name="Concrete Mixer" />
            <Bar dataKey="Equipment Drilling Machine" stackId="b" fill="#2b88d8" name="Drilling Machine" />
            <Bar dataKey="Equipment Welding Machine" stackId="b" fill="#71afe5" name="Welding Machine" />
            <Bar dataKey="Equipment Forklift" stackId="b" fill="#c7e0f4" name="Forklift" />
            <Bar dataKey="Equipment Scaffolding" stackId="b" fill="#003f5c" name="Scaffolding" />
            <Bar dataKey="Equipment Generator" stackId="b" fill="#008E97" name="Generator" />
            <Bar dataKey="Equipment Ladder" stackId="b" fill="#00416A" name="Ladder" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Grid container spacing={2}>
        {filteredData.length === 0 ? (
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ textAlign: 'center', marginTop: 4 }}>
              No progress entries found for the selected date.
            </Typography>
          </Grid>
        ) : (
          paginatedData.map((progress) => (
            <Grid item xs={12} sm={6} md={4} key={progress._id}>
              <Card
                sx={{
                  backgroundColor: '#AFDBF5',
                  borderRadius: '25px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
                onClick={() => handleViewDetail(progress)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Date: {new Date(progress.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">Site Code: {progress.sitecode}</Typography>
                  <Typography variant="body1">Location: {progress.location}</Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px 16px 16px' }}>
                  <Button
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetail(progress);
                    }}
                  >
                    View Details
                  </Button>
                  <Box>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(progress);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(progress._id);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Box>
  );
}
