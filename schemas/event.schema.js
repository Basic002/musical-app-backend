import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  }
}, { 
  timestamps: true 
});

export default eventSchema;