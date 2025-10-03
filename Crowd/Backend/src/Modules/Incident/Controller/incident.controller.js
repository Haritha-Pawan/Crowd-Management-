import Incident from '../model/incident.model.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const createIncident = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const { type } = req.body;
    let incidentData = { type };

    const baseUrl = `${req.protocol}://${req.get('host')}`; // Construct base URL

    // Map form fields to incidentData based on type
    switch (type) {
      case 'Lost Person':
        incidentData.name = req.body.name;
        incidentData.age = req.body.age;
        incidentData.lastSeen = req.body.lastSeen;
        incidentData.gender = req.body.gender;
        if (req.file) {
          incidentData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        }
        break;
      case 'Emergency':
        incidentData.emergencyType = req.body.emergencyType;
        incidentData.description = req.body.description;
        incidentData.location = req.body.location;
        break;
      case 'Lost Item':
        incidentData.itemName = req.body.itemName;
        incidentData.itemDescription = req.body.description;
        incidentData.lastSeenLocation = req.body.lastSeenLocation;
        if (req.file) {
         incidentData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        }
        break;
      case 'Complaints':
        incidentData.subject = req.body.subject;
        incidentData.complaintDetails = req.body.complaintDetails;
        break;
      default:
        return res.status(400).json({ message: 'Invalid incident type' });
    }

    console.log('Incident Data to be saved:', incidentData);

    const incident = new Incident(incidentData);
    await incident.save();


    console.log('Incident saved successfully:', incident);

    // Emit WebSocket event for real-time notification
    if (req.app.get('io')) {
      req.app.get('io').emit('newIncident', incident);
    }

    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getIncidents = async (req, res) => {
  try {

    const incidents = await Incident.find().sort({ time: -1 });

    console.log('Fetched Incidents:', incidents);  // Logs incidents fetched from the database
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Solved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const incident = await Incident.findByIdAndUpdate(id, { status }, { new: true });
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    //  Emit WebSocket event for status update
    if (req.app.get('io')) {
      req.app.get('io').emit('incidentStatusUpdated', {
        id: incident._id,
        status: incident.status,
      });
    }

    res.json(incident);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    
    const incident = await Incident.findByIdAndDelete(id);

    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Optionally, remove image file from server if stored locally
    if (incident.imageUrl) {
      const imgPath = path.join(__dirname, '..', 'public', incident.imageUrl);
      fs.unlink(imgPath, (err) => {
        if (err) console.error('Failed to delete image:', err);
      });
    }

    // ✅ Emit WebSocket event for deletion
    if (req.app.get('io')) {
      req.app.get('io').emit('incidentDeleted', { id });
    }

    res.json({ message: 'Incident deleted' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
