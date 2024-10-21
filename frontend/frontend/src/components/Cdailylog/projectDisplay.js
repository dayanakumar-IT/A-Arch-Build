import React, { useState, useEffect } from 'react';
import { Button, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NotesIcon from "@mui/icons-material/Notes";

// Import images
import img1 from '../assets/img1.jpg';
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import img4 from '../assets/img4.jpg';
import img5 from '../assets/img5.jpg';
import img6 from '../assets/img6.jpg';
import img7 from '../assets/img7.jpg';
import img8 from '../assets/img8.jpg';
import img9 from '../assets/img9.jpg';
import img10 from '../assets/img10.jpg';

export default function ProjectForDailyLog({ setDailyLog, setDailyIssue }) {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const apiUrl = "http://localhost:8000/project";

    // List of images for random assignment
    const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

    const fetchProjects = async (page = 1, limit = 6) => {
        try {
            const response = await fetch(`${apiUrl}/projects?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }
            const data = await response.json();
            setProjects(data.data);
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(project => 
        project.projectname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderProject = (project) => {
        // Randomly select an image for the header
        const randomImage = images[Math.floor(Math.random() * images.length)];

        return (
            <div
                className="card"
                style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '400px',
                    border: '2px solid #0f2557',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    backgroundColor: '#FEF9F2',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}
            >
                {/* Header image */}
                <div
                    style={{
                        height: '150px',
                        backgroundImage: `url(${randomImage})`,
                        backgroundSize: 'cover',
                        borderRadius: '8px 8px 0 0'
                    }}
                ></div>

                {/* Project details */}
                <div style={{ padding: '16px', height: 'calc(100% - 150px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h5 style={{ margin: '8px 0', color: '#0f2557', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.projectname}</h5>
                        <p style={{ margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <strong>Site Code:</strong> {project.sitecode}
                        </p>
                        <p style={{ margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <strong>Location:</strong> {project.location}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            style={{
                                backgroundColor: '#64b5f6',
                                color: '#fff',
                                minWidth: '110px', // Reduced button width
                                padding: '6px 8px'
                            }}
                            onClick={() => {
                                // Call setDailyLog passed as prop to update dailyLog in the parent component
                                 setDailyIssue({
                                     section: 'CreateIssue',
                                     siteCode: project.sitecode,
                                     locationName: project.location,
                                 });
                             }}
                        >
                            Add Issue
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<NotesIcon />}
                            style={{
                                backgroundColor: '#43a047',
                                color: '#fff',
                                minWidth: '110px', // Reduced button width
                                padding: '6px 8px'
                            }}
                            onClick={() => {
                               // Call setDailyLog passed as prop to update dailyLog in the parent component
                                setDailyLog({
                                    section: 'CreateDailyLog',
                                    siteCode: project.sitecode,
                                    locationName: project.location,
                                });
                            }}
                        >
                            Daily Log
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container">
            {error && <p className="text-danger">{error}</p>}

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', top: '90px', width: '100%' }}>
            <TextField
                label="Search by name or location"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                    backgroundColor: '#fff',
                    width: '50%',  // Adjust the width to your preference
                }}
            />
        </div>


            <div className="row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px' }}>
                {filteredProjects.map((project) => (
                    <div className="col-md-4" key={project._id} style={{ flex: '1 1 calc(33% - 16px)' }}>
                        {renderProject(project)}
                    </div>
                ))}
            </div>
        </div>
    );
}
