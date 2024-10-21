import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Box, Button, TextField, Typography, Table, TableBody, TableCell, TableRow, Paper, TableContainer, Grid } from '@mui/material';

const ArchitectDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [doneAppointments, setDoneAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch('http://localhost:8000/apo/appoints');
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                setAppointments(data);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };
        fetchAppointments();
    }, []);

    const handleNotify = async (appointment) => {
        const notifyData = {
            clientName: appointment.clientName,
            email: appointment.email,
            preferredDate: appointment.preferredDate,
            preferredTime: appointment.preferredTime,
        };
        console.log('Notify me clicked for:', notifyData);
        alert(`Reminder set for ${notifyData.clientName}'s appointment on ${notifyData.preferredDate} at ${notifyData.preferredTime}`);
    };

    const handleDone = async (appointmentId) => {
        try {
            const response = await fetch(`http://localhost:8000/apo/appoints/${appointmentId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete appointment');
            }
            setAppointments(appointments.filter((appointment) => appointment._id !== appointmentId));
            setDoneAppointments([...doneAppointments, appointmentId]);
            alert('Appointment marked as done and deleted from the database.');
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    const filteredAppointments = appointments.filter((appointment) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            appointment.clientName.toLowerCase().includes(searchTermLower) ||
            appointment.email.toLowerCase().includes(searchTermLower) ||
            appointment.phoneNumber.toLowerCase().includes(searchTermLower) ||
            appointment.projectType.toLowerCase().includes(searchTermLower) ||
            appointment.preferredDate.toLowerCase().includes(searchTermLower) ||
            appointment.preferredTime.toLowerCase().includes(searchTermLower) ||
            appointment.location.toLowerCase().includes(searchTermLower)
        );
    });

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Filtered Appointments', 10, 10);

        const tableData = filteredAppointments.map(appointment => [
            appointment.clientName,
            appointment.email,
            appointment.phoneNumber,
            appointment.projectType,
            appointment.preferredDate,
            appointment.preferredTime,
            appointment.location
        ]);

        autoTable(doc, {
            head: [['Client Name', 'Email', 'Phone', 'Project Type', 'Date', 'Time', 'Location']],
            body: tableData,
        });

        doc.save('Filtered_Appointments.pdf');
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Architect Dashboard
            </Typography>

            <Box display="flex" justifyContent="center" mb={3}>
                <TextField
                    variant="outlined"
                    label="Search appointments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    fullWidth
                    sx={{ maxWidth: 600 }}
                />
            </Box>

            <Box textAlign="center" mb={3}>
                <Button variant="contained" color="primary" onClick={generatePDF}>
                    Generate PDF
                </Button>
            </Box>

            <Grid container spacing={2}>
                {filteredAppointments.length > 0 ? (
                    filteredAppointments
                        .filter((appointment) => !doneAppointments.includes(appointment._id))
                        .map((appointment) => (
                            <Grid item xs={12} sm={6} key={appointment._id}>
                                <Paper elevation={3} sx={{ mb: 3, p: 2, maxWidth: 450 }}>
                                    <Typography variant="h6" gutterBottom>
                                        {appointment.clientName}
                                    </Typography>
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell><strong>Email</strong></TableCell>
                                                    <TableCell>{appointment.email}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><strong>Phone</strong></TableCell>
                                                    <TableCell>{appointment.phoneNumber}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><strong>Project Type</strong></TableCell>
                                                    <TableCell>{appointment.projectType}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><strong>Date</strong></TableCell>
                                                    <TableCell>{appointment.preferredDate}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><strong>Time</strong></TableCell>
                                                    <TableCell>{appointment.preferredTime}</TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell><strong>Location</strong></TableCell>
                                                    <TableCell>{appointment.location}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Box mt={2} display="flex" justifyContent="space-between">
                                        <Button variant="outlined" color="primary" onClick={() => handleNotify(appointment)}>
                                            Notify Me
                                        </Button>
                                        <Button variant="contained" color="success" onClick={() => handleDone(appointment._id)}>
                                            Done
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))
                ) : (
                    <Typography variant="body1" align="center" sx={{ width: '100%' }}>
                        No appointments found.
                    </Typography>
                )}
            </Grid>
        </Box>
    );
};

export default ArchitectDashboard;
