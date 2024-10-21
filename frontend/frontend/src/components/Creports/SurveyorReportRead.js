import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, TextField , Modal, Box,FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TerrainView from './TerrainView';

const SurveyorReportRead = ({onEditSReport, backtoForm}) => {
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSummary, setShowSummary] = useState({});  // State for animation
    const [show3DView, setShow3DView] = useState({});  // State to manage 3D view visibility
    const [selectedReport, setSelectedReport] = useState(null);  // For holding the report to edit
    const [openModal, setOpenModal] = useState(false);  // Modal state
    const [formData, setFormData] = useState({
        landArea: '',
        elevation: '',
        topography: '',
        boundaryDetails: {
            clearlyMarked: false,
            disputed: false,
        },
        document: null,
        existingDocument: '',  // For holding the existing document preview URL
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8000/report/api/surveyor-reports');
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Error fetching surveyor reports:', error);
        }
    };

    const toggleSummary = (id) => {
        setShowSummary((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const toggle3DView = (id) => {
        setShow3DView((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/report/api/surveyor-report/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Report deleted successfully.', {
                    position: 'top-right',
                    autoClose: 3000,
                 
                });
                fetchReports(); // Refresh reports list after deletion
            } else {
                toast.error('Failed to delete the report.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Error deleting report:', error);
        }
    };

    const handleEdit = (report) => {
        // Pre-fill the form with selected report's data
        setFormData({
            landArea: report.landArea || '',
            elevation: report.elevation || '',
            topography: report.topography || '',
            boundaryDetails: {
                clearlyMarked: report.boundaryDetails?.clearlyMarked || false,
                disputed: report.boundaryDetails?.disputed || false,
            },
            document: null,  // Reset document for new upload
            existingDocument: report.document,  // Hold the existing document
        });
        setSelectedReport(report);
        setOpenModal(true); // Open the modal
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            boundaryDetails: {
                ...prevState.boundaryDetails,
                [name]: checked,
            },
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            document: e.target.files[0],  // New document file
        }));
    };

    const handleModalClose = () => {
        setOpenModal(false);
        setSelectedReport(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const updateData = new FormData();
        updateData.append('landArea', formData.landArea);
        updateData.append('elevation', formData.elevation);
        updateData.append('topography', formData.topography);
        updateData.append('boundaryDetails', JSON.stringify(formData.boundaryDetails));
        
        if (formData.document) {
            updateData.append('document', formData.document);  // Append new document if uploaded
        }

        try {
            const response = await fetch(`http://localhost:8000/report/api/surveyor-report/${selectedReport._id}`, {
                method: 'PUT',
                body: updateData,
            });

            if (response.ok) {
                toast.success('Report updated successfully.', {
                    position: 'top-right',
                    className: 'toast-message',
                });
                setOpenModal(false);  // Close the modal
                fetchReports();  // Refresh the reports list
            } else {
                toast.error('Failed to update the report.', {
                    position: 'top-right',
                    className: 'toast-message',
                });
            }
        } catch (error) {
            toast.error('Error updating the report.', {
                position: 'top-right',
                className: 'toast-message',
            });
            console.error('Error updating report:', error);
        }
    };



    const evaluateValue = (field, value) => {
        if (field === 'landArea') {
            return value > 1000 ? 'Good size for large development.' : 'Small, may limit options.';
        } else if (field === 'elevation') {
            return value > 100 ? 'High elevation, could be challenging.' : 'Low elevation, easy to build.';
        } else if (field === 'topography') {
            return value === 'flat' ? 'Ideal for construction.' : 'Challenging terrain.';
        } else if (field === 'boundary') {
            return value === true ? 'Clearly marked, good to go.' : 'Disputed, needs resolution.';
        }
        return '';
    };

    const filteredReports = reports.filter((report) => {
        const searchValue = searchTerm.toLowerCase();
        return (
            report.landArea?.toString().includes(searchValue) ||
            report.elevation?.toString().includes(searchValue) ||
            report.topography?.toLowerCase().includes(searchValue)
        );
    });

    return (
        <div className="overview-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <ToastContainer />
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Surveyor Report Overview</h1>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <TextField
                    variant="outlined"
                    label="Search Reports"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by land area, elevation, or topography"
                    style={{ width: '100%', maxWidth: '400px' }}
                />
            </div>
            <div className="card-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {filteredReports.map((report) => {
                    const boundaryDetails = report.boundaryDetails || { clearlyMarked: false, disputed: false };
                    const imageSrc = `http://localhost:8000/report/${report.document}`;

                    return (
                        <div className="card" key={report._id} style={{ width: '400px', margin: '10px' }}>
                            <img
                                src={imageSrc}
                                alt="Surveyor Report"
                                className="report-image"
                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                            />
                            <div className="report-info" style={{ padding: '10px' }}>
                                <Typography variant="h6" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '10px 0' }}>
                                    Land Area: {report.landArea} sq.m
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Elevation:</strong> {report.elevation} m
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Topography:</strong> {report.topography}
                                </Typography>
                                <Typography style={{ fontSize: '1.1rem', margin: '5px 0' }}>
                                    <strong>Boundary Details:</strong>
                                </Typography>
                                <ul>
                                    <li>Clearly Marked: {boundaryDetails.clearlyMarked ? 'Yes' : 'No'}</li>
                                    <li>Disputed: {boundaryDetails.disputed ? 'Yes' : 'No'}</li>
                                </ul>

                                <Typography
                                    variant="h6"
                                    onClick={() => toggleSummary(report._id)}
                                    className="summary-title"
                                    style={{ cursor: 'pointer', color: '#075e86', marginTop: '10px' }}
                                >
                                    Summary
                                </Typography>

                                {showSummary[report._id] && (
                                    <div className="summary-content">
                                        <Typography style={{ fontSize: '1rem', margin: '5px 0' }}>
                                            <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Land Area:</span> {report.landArea} sq.m reflects the total surveyed area of the land. — <span style={{ color: '#ff6b6b' }}>{evaluateValue('landArea', report.landArea)}</span>
                                        </Typography>
                                        <Typography style={{ fontSize: '1rem', margin: '5px 0' }}>
                                            <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Elevation:</span> {report.elevation} meters is the land's height above sea level. — <span style={{ color: '#4caf50' }}>{evaluateValue('elevation', report.elevation)}</span>
                                        </Typography>
                                        <Typography style={{ fontSize: '1rem', margin: '5px 0' }}>
                                            <span style={{ color: '#2196f3', fontWeight: 'bold' }}>Topography:</span> The surface features are described as {report.topography}. — <span style={{ color: '#2196f3' }}>{evaluateValue('topography', report.topography)}</span>
                                        </Typography>
                                        <Typography style={{ fontSize: '1rem', margin: '5px 0' }}>
                                            <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Boundary Details:</span> Clearly Marked: {boundaryDetails.clearlyMarked ? 'Yes' : 'No'} | Disputed: {boundaryDetails.disputed ? 'Yes' : 'No'} — <span style={{ color: '#ff9800' }}>{evaluateValue('boundary', boundaryDetails.clearlyMarked)}</span>
                                        </Typography>
                                    </div>
                                )}

                                <Button
                                    variant="contained"
                                    style={{ backgroundColor: '#075e86', color: '#fff', marginTop: '10px' }}
                                    onClick={() => toggle3DView(report._id)}
                                >
                                    {show3DView[report._id] ? 'Hide 3D View' : 'Show 3D View'}
                                </Button>
                                {show3DView[report._id] && (
                                    <div style={{ marginTop: '15px' }}>
                                        <TerrainView imageSrc={imageSrc} />
                                    </div>
                                )}
                                <div className="buttons-container" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '15px' }}>
                                    <Button
                                        variant="contained"
                                        style={{ backgroundColor: '#075e86', color: '#fff' }}
                                        onClick={() => handleEdit(report)}
                                    >
                                        Update
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleDelete(report._id)}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="contained"
                                        style={{ backgroundColor: '#ffb600', color: '#fff' }}
                                        onClick={() => backtoForm()}
                                    >
                                        Other Forms
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

             {/* Editing Modal */}
            <Modal open={openModal} onClose={handleModalClose}>
                <Box className="modal-contentR" sx={{ padding: '20px', backgroundColor: '#f0f8ff', borderRadius: '10px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ color: '#075e86', marginBottom: '20px', textAlign: 'center' }}>Edit Surveyor Report</h2>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            type="number"
                            label="Land Area (sq.m)"
                            name="landArea"
                            value={formData.landArea}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{ inputProps: { min: 0 } }}  // Ensures only positive numbers
                            style={{ backgroundColor: '#e8f5e9', borderRadius: '5px' }}
                        />
            <TextField
                type="number"
                label="Elevation (m)"
                name="elevation"
                value={formData.elevation}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                InputProps={{ inputProps: { min: 0 } }}  // Ensures only positive numbers
                style={{ backgroundColor: '#fce4ec', borderRadius: '5px' }}
            />
            <TextField
                select
                label="Topography"
                name="topography"
                value={formData.topography}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                SelectProps={{
                    native: true,
                }}
                style={{ backgroundColor: '#fff3e0', borderRadius: '5px' }}
            >
                <option value="">Select Topography</option>
                <option value="Flat">Flat</option>
                <option value="Hilly">Hilly</option>
                <option value="Sloped">Sloped</option>
            </TextField>
            <Typography variant="h6" style={{ color: '#075e86', marginTop: '20px' }}>
    Boundary Details
</Typography>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.boundaryDetails.clearlyMarked}
                            onChange={handleCheckboxChange}
                            name="clearlyMarked"
                        />
                    }
                    label="Clearly Marked"
                    style={{ color: '#388e3c' }}  // Adding green color
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={formData.boundaryDetails.disputed}
                            onChange={handleCheckboxChange}
                            name="disputed"
                        />
                    }
                    label="Disputed"
                    style={{ color: '#d32f2f' }}  // Adding red color
                />
            </FormGroup>

            {formData.existingDocument && !formData.document && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <p style={{ color: '#075e86' }}>Existing Document:</p>
                    <img
                        src={`http://localhost:8000/report/${formData.existingDocument}`}
                        alt="Existing Document"
                        style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '10px', border: '2px solid #ddd', borderRadius: '8px' }}
                    />
                </div>
            )}

            <Button
                variant="contained"
                component="label"
                style={{ backgroundColor: '#ff9800', color: '#fff', marginBottom: '20px' }}
            >
                Upload New Document
                <input type="file" hidden onChange={handleFileChange} />
            </Button>

            <Button
                variant="contained"
                color="primary"
                type="submit"
                style={{ backgroundColor: '#4caf50', color: '#fff', marginTop: '20px', width: '100%' }}
            >
                Save Changes
            </Button>
        </form>
    </Box>
</Modal>

            <style>{`
                /* Layout for the ReportPage */
                .report-page {
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-start;
                    padding: 20px;
                    height: 100vh;
                }
                /* Styling for each image container */
                .image-containerR {
                    width: 30%;
                    text-align: center;
                    cursor: pointer;
                }
                .report-image {
                    width: 100%;
                    height: 600px;
                    object-fit: cover;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    transition: transform 0.3s ease;
                }
                .report-image:hover {
                    transform: scale(1.05);
                }
                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.75);
                }
                .modal-contentR{
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    max-width: 500px;
                    width: 90%;
                    max-height: 700px;
                    height: auto;
                    overflow-y: auto;
                }
                /* Styling for the form card inside the modal */
                .card-report-soil {
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                    background-color: white;
                    padding: 20px;
                }
                .soil-report-form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .soil-report-input, .soil-report-select, .soil-report-button {
                    padding: 8px;
                    font-size: 1em;
                    width: 100%;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                }
                .soil-report-label {
                    font-size: 1.1em;
                    margin-bottom: 5px;
                }
                input[type="file"] {
                    padding: 5px;
                }
                input[type="range"] {
                    margin-top: 10px;
                }
                div {
                    margin-top: 10px;
                }
                h2 {
                    font-size: 1.5em;
                }
                /* MUI Button at the bottom */
                .soil-report-button {
                    margin-top: 20px;
                }
                .moisture-slider-soil {
                    width: 100%;
                    height: 10px;
                    border-radius: 5px;
                    appearance: none;
                    outline: none;
                }
                .moisture-slider-soil::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #555;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                }
                .moisture-slider-soil::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #555;
                    cursor: pointer;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
                }
                .toast-message-soil-report {
                    font-size: 1rem;
                    text-align: center;
                    white-space: nowrap;
                }
                .toastify-container {
                    width: auto;
                    max-width: 300px;
                }
                .hazardous-materials {
                    display: flex;
                    flex-direction: row;
                    gap: 10px;
                    margin-top: 10px;
                }
                .card-containerR {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 20px;
                }
                .cardR {
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .report-image {
                    width: 100%;
                    border-radius: 8px;
                }
                .report-info {
                    margin-top: 10px;
                }
                .report-info p {
                    margin: 8px 0;
                    font-size: 14px;
                }
                .buttonr-container {
                    display: flex;
                    justify-content: space-between;
                    gap: 5px;
                }
                button {
                    padding: 8px 12px;
                    border: none;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: background-color 0.3s ease;
                }
                button:hover {
                    background-color: #0056b3;
                }
                button:active {
                    background-color: #004494;
                }
                /* For the line sweep animation */
                .summary-title {
                    position: relative;
                    display: inline-block;
                }
                .summary-title::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: #075e86;
                    visibility: hidden;
                    transform: scaleX(0);
                    transition: all 0.3s ease-in-out;
                }
                .summary-title:hover::after {
                    visibility: visible;
                    transform: scaleX(1);
                }
                /* For summary content slide-in */
                .summary-content {
                    animation: slide-in 0.5s ease-in-out forwards;
                }
                @keyframes slide-in {
                    from {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .show-3dview-btn {
                    background-color: #075e86;
                    color: #fff;
                    margin-top: 10px;
                    padding: 10px 20px;
                    text-align: center;
                    width: 100%;
                }
                /* Container for the terrain view (3D view) */
                .terrain-view-container {
                    margin-top: 15px;
                }
            `}</style>
        </div>
    );
};

export default SurveyorReportRead;
