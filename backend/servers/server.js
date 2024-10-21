const express = require('express');
const inspectionApp = require('./inspectionServer');
const projectApp = require('./projectServer');
const inspecrecordApp = require('./inspecRecordServer'); // Include the new file for records
const dailylogApp = require('./dailylogServer')
const dailyissuesApp = require('./dailyissueServer')
const projecttaskApp = require('./projecttasksSercer')
const clientApp   = require('./clientServer')
const clientreqApp = require('./clientreqServer')
const reportApp = require('./reportServer')
const vendorApp = require('./vendorServer')
const permitApp = require('./permitServer')
const proposalApp = require('./proposalServer')
const proApp = require('./procurementServer')
const appointApp = require('./appointmentServer')
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Use the inspection server routes with prefix /inspection
app.use('/inspection', inspectionApp);

// Use the project server routes with prefix /project
app.use('/project', projectApp);

// Use the inspectRecord server routes with prefix /record
app.use('/record', inspecrecordApp); // Add the route for record

// Use the Daily Log server routes with prefix /record
app.use('/daily', dailylogApp); // Add the route for daily log

// Use the Daily issues server routes with prefix /record
app.use('/problem', dailyissuesApp); // Add the route for daily issues

// Use the Project Tasks server routes with prefix /record
app.use('/pt', projecttaskApp); // Add the route for Project Tasks

// Use the Clients server routes with prefix /record
app.use('/cl', clientApp); // Add the route for Clients

// Use the Clients Req server routes with prefix /record
app.use('/rq', clientreqApp); // Add the route for Clients Req

// Use the Reports (soil, env, survey) server routes with prefix /record
app.use('/report', reportApp); // Add the route for Reports (soil, env, survey)

// Use the Vendor  server routes with prefix /record
app.use('/vd', vendorApp); // Add the route for Vendor

// Use the Permit  server routes with prefix /record
app.use('/pm', permitApp); // Add the route for Permit

// Use the proposal  server routes with prefix /record
app.use('/vp', proposalApp); // Add the route for proposal

// Use the procuremnet  server routes with prefix /record
app.use('/pr', proApp); // Add the route for procuremnet

// Use the appointment  server routes with prefix /record
app.use('/apo', appointApp); // Add the route for appointment

// Listen on a single port
app.listen(8000, () => {
    console.log('Server running on port 8000');
});
