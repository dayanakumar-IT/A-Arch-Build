import React, { useEffect } from 'react';
import { Viewer, ImagePanorama } from 'panolens';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DateRangeIcon from '@mui/icons-material/DateRange'; // Icon for Date
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Icon for Time
import CloudIcon from '@mui/icons-material/Cloud'; // Icon for Weather
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Icon for Compliance Status
import FeedbackIcon from '@mui/icons-material/Feedback'; // Icon for Follow-up
import NoteIcon from '@mui/icons-material/Note'; // Icon for General Remarks
import backgroundImage from '../assets/header-bg.jpg';

// Dark color palette
const colors = {
  darkRed: '#8B0000',
  darkBlue: '#1E3A8A',
  darkGreen: '#006400',
  darkOrange: '#FF8C00',
  darkPurple: '#4B0082',
  darkGray: '#333333',
  lightGray: '#444444',
};

// Flip-card styles
const flipCardStyle = {
  perspective: '1000px',
  width: '180px',
  height: '200px',
  margin: '0 auto',
};

const flipCardInnerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  textAlign: 'center',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
};

const flipCardFrontStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  backgroundColor: '#333',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '10px',
  boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)',
};

const flipCardBackStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  backgroundColor: '#444',
  color: '#fff',
  transform: 'rotateY(180deg)',
  borderRadius: '10px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)',
};

const DisplayRecordsWith360View = ({ records }) => {
  useEffect(() => {
    records.forEach((record, recordIndex) => {
      record.issues.forEach((issue, issueIndex) => {
        const viewer = new Viewer({
          container: document.getElementById(`viewer-${recordIndex}-${issueIndex}`),
        });
        const panorama = new ImagePanorama(`http://localhost:8000/record/${issue.imagePath}`);
        viewer.add(panorama);
      });
    });
  }, [records]);

  const handleMouseEnter = (e) => {
    e.currentTarget.querySelector('.flip-card-inner').style.transform = 'rotateY(180deg)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.querySelector('.flip-card-inner').style.transform = 'rotateY(0deg)';
  };

  return (
    <div>
      {records.map((record, recordIndex) => (
        <Paper
          elevation={3}
          key={record._id}
          style={{
            margin: '20px',
            padding: '30px',
            borderRadius: '15px',
            backgroundColor: '#1C1C1C',
            color: '#FFFFFF',
            maxWidth: '1200px',  // Increased width
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {/* Header Section with Background Image */}
          <Box
            style={{
                backgroundImage: `url(${backgroundImage})`, // Use the imported image
                backgroundSize: 'cover',
                padding: '40px',
                borderRadius: '10px',
                textAlign: 'center',
                position: 'relative',  // Allow positioning of overlay
                height: '250px',  // Adjusted height for a better look
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            >
            {/* Add overlay */}
            <Box
                style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',  // Semi-transparent dark overlay
                borderRadius: '10px',
                }}
            />
            
            <Typography
                variant="h3"
                style={{
                fontWeight: 'bold',
                color: '#FFFFFF',
                position: 'relative',  // Ensure text is above overlay
                zIndex: 1,
                textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',  // Stronger text shadow
                padding: '0 20px',  // Add some padding for wider titles
                }}
            >
                {record.inspectionTitle}
            </Typography>
          </Box>

          {/* Information Grid */}
          <Grid container spacing={2} style={{ marginTop: '30px', marginBottom: '30px' }}>
            <Grid item xs={6} style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Creative Date View */}
              <Paper
                style={{
                  backgroundColor: '#2B2B2B',
                  padding: '10px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)',
                  width: '200px',
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: colors.darkBlue,
                    marginBottom: '10px',
                  }}
                >
                  <DateRangeIcon />
                </Avatar>
                <Typography variant="body1" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                  {record.inspectionDate}
                </Typography>
                <Typography variant="caption" style={{ color: '#CCCCCC' }}>
                  Inspection Date
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Creative Time View */}
              <Paper
                style={{
                  backgroundColor: '#2B2B2B',
                  padding: '10px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)',
                  width: '200px',
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: colors.darkGreen,
                    marginBottom: '10px',
                  }}
                >
                  <AccessTimeIcon />
                </Avatar>
                <Typography variant="body1" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                  {record.inspectionTime}
                </Typography>
                <Typography variant="caption" style={{ color: '#CCCCCC' }}>
                  Inspection Time
                </Typography>
              </Paper>
            </Grid>
          </Grid>

                    <Grid container spacing={4} style={{ marginBottom: '30px' }}>
            {[
                {
                icon: <CloudIcon style={{ fontSize: '2rem' }} />,
                label: 'Weather',
                value: record.weatherConditions,
                color: colors.darkOrange,
                },
                {
                icon: <CheckCircleIcon style={{ fontSize: '2rem' }} />,
                label: 'Compliance Status',
                value: record.overallComplianceStatus,
                color: colors.darkPurple,
                },
                {
                icon: <FeedbackIcon style={{ fontSize: '2rem' }} />,
                label: 'Follow-up Needed',
                value: record.followUpNeeded,
                color: colors.darkGreen,
                },
                {
                icon: <NoteIcon style={{ fontSize: '2rem' }} />,
                label: 'General Remarks',
                value: record.generalRemarks,
                color: colors.darkBlue,
                },
            ].map((info, index) => (
                <Grid item xs={3} key={index}>
                <div
                    style={flipCardStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flip-card-inner" style={flipCardInnerStyle}>
                    {/* Front of the card */}
                    <div style={{ ...flipCardFrontStyle, backgroundColor: info.color }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {info.icon}
                        <Typography variant="caption" style={{ marginTop: '10px', color: '#fff' }}>
                            {info.label}
                        </Typography>
                        </div>
                    </div>
                    {/* Back of the card */}
                    <div style={flipCardBackStyle}>
                        <Typography variant="body1" style={{ fontWeight: 'bold', color: '#fff' }}>
                        {info.value}
                        </Typography>
                    </div>
                    </div>
                </div>
                </Grid>
            ))}
            </Grid>

          {/* Issues Section with Accordion */}
          <Accordion
            style={{
              backgroundColor: '#2B2B2B',
              borderRadius: '10px',
              boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.7)',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon style={{ color: '#FFFFFF' }} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              style={{ color: '#FFFFFF' }}
            >
              <Typography variant="h5" style={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                Issues
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {record.issues.map((issue, issueIndex) => (
                <Paper
                  elevation={2}
                  key={issueIndex}
                  style={{
                    marginBottom: '20px',
                    padding: '15px',
                    borderRadius: '10px',
                    backgroundColor: '#86B6F6',
                  }}
                >
                  <Typography variant="h6" gutterBottom style={{ color: 'black' }}>
                    Issue {issue.count}: {issue.issue}
                  </Typography>
                  <Typography
                        variant="body2"
                        gutterBottom
                        style={{
                            color: 'white',              // Text color (adjust as needed)
                            backgroundColor: 'black',  // Background color for the label (blue in this case)
                            fontWeight: 'bold',          // Make it bold to resemble a label
                            padding: '4px 8px',          // Padding for space inside the label
                            borderRadius: '4px',         // Rounding the edges to make it label-like
                            display: 'inline-block',     // Ensure the label fits snugly around the text
                            fontSize: '0.9rem',          // Adjust font size (optional, based on preference)
                        }}
                        >
                        Severity Level: {issue.severityLevel}
                  </Typography>


                  {/* 360 Viewer for each issue image */}
                  <div
                    id={`viewer-${recordIndex}-${issueIndex}`}
                    style={{
                      width: '100%',
                      height: '300px',
                      border: '1px solid #555',
                      borderRadius: '10px',
                    }}
                  >
                    {/* The 360 image viewer will render here */}
                  </div>
                </Paper>
              ))}
            </AccordionDetails>
          </Accordion>
        </Paper>
      ))}
    </div>
  );
};

export default DisplayRecordsWith360View;
