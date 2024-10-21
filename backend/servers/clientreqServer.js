// Import Express for handling requests
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

// Create an instance of Express
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors())

// In-memory storage for consultations
//let consultations = [];

//connecting mongodb
const clientReqDB = mongoose.createConnection('mongodb://localhost:27017/m-app')
clientReqDB.on('connected', () => {
    console.log('Client Req DB connected');
});

// Handle connection errors
clientReqDB.on('error', (err) => {
    console.log('Connection error:', err);
});
//creating schema  
const consultationSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    clientName: { type: String, required: true },
    dateOfConsultation: { type: String, required: true },
    conductedBy: { type: String, required: true },
    projectGoals: { type: String, required: true },
    budgetConstraints: { type: String, required: true },
    aestheticPreferences: {
        typeOfBuilding: { type: String },
        approvedType: { type: String },
        designStyle: { type: String },
        roofType: { type: String },
        wallMaterial: { type: String },
        roofMaterial: { type: String },
        doorWindowMaterial: { type: String }
    },
    functionalRequirements: {
        groundFloor: {
            masterBedroom: { type: String },
            attachedBathroom: { type: String },
            kitchen: { type: String },
            pantry: { type: String },
            receptionArea: { type: String },
            conferenceRoom: { type: String },
            cafeteria: { type: String }
        },
        firstFloor: {
            numberOfBedrooms: { type: Number },
            terrace: { type: String },
            numberOfWorkspacesPerFloor: { type: Number },
            meetingRoomsPerFloor: { type: Number },
            breakoutArea: { type: String }
        },
        upperFloors: {
            numberOfSuitesPerFloor: { type: Number },
            suiteTypes: {
                oceanView: { type: Number },
                gardenView: { type: Number }
            },
            privateBalconies: { type: String }
        },
        outdoorSpaces: {
            swimmingPool: { type: String },
            beachAccess: { type: String },
            gardens: { type: String }
        }
    },
  
    clientFeedback: { type: String, required: true },
    additionalNotes: { type: String, required: true }
});



//creating model
const consultationModel = clientReqDB.model('Consulation',consultationSchema);



// Create a new consultation record
app.post('/consultations', async (req, res) => {
    const {
        projectName,
        clientName,
        dateOfConsultation,
        conductedBy,     
        projectGoals,
        budgetConstraints,
        aestheticPreferences,
        functionalRequirements,
       
        clientFeedback,
        additionalNotes
    } = req.body;

   /* const newConsultation = {
        id: consultations.length + 1,
        projectName,
        clientName,
        dateOfConsultation,
        conductedBy,
        projectGoals,
        budgetConstraints,
        aestheticPreferences,
        functionalRequirements,
        regulatoryRequirements,
        sustainabilityGoals,
        clientFeedback,
        additionalNotes
    };

    consultations.push(newConsultation);
    console.log(consultations);*/
   try {
    const newConsultation = new consultationModel({projectName,
        clientName,
        dateOfConsultation,
        conductedBy,     
        projectGoals,
        budgetConstraints,
        aestheticPreferences,
        functionalRequirements,
      
        clientFeedback,
        additionalNotes});

    await newConsultation.save();
    res.status(201).json(newConsultation);
    
   } catch (error) {
         console.log(error)
         res.status(500).json({message:error.message});
   }
 

   
})

// Retrieve all consultations
app.get('/consultations', async (req, res) => {
    try {
        const consultations = await consultationModel.find();
        res.status(200).json(consultations);

    } catch (error) {
        console.log(error)
         res.status(500).json({message:error.message});
        
    }
   
});

//update a consulation requirement
app.put("/consultations/:id",async(req,res) => {
    try {
        const {
            projectName,
            clientName,
            dateOfConsultation,
            conductedBy,     
            projectGoals,
            budgetConstraints,
            aestheticPreferences,
            functionalRequirements,
          
            clientFeedback,
            additionalNotes
        } = req.body;
         const id = req.params.id;
         const updatedConsultation = await consultationModel.findByIdAndUpdate(
            id,
            {
                projectName,
                clientName,
                dateOfConsultation,
                conductedBy,     
                projectGoals,
                budgetConstraints,
                aestheticPreferences,
                functionalRequirements,
                
                clientFeedback,
                additionalNotes
            },
            {new: true}
        )
             
             if (!updatedConsultation) {
                return res.status(404).json({ message: "Consultation not found" })
            }
            res.json(updatedConsultation)
        
    } catch (error) {
        console.log(error)
         res.status(500).json({message:error.message});
    }
  
     

})
//Delete a consultation
app.delete('/consultations/:id',async (req,res) => {
    try {
        const id = req.params.id;
        await consultationModel.findByIdAndDelete(id);
        res.status(204).end();
        
    } catch (error) {
        console.log(error)
         res.status(500).json({message:error.message});
        
    }
 
})


// Export the app
module.exports = app;
