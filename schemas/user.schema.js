import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom d'utilisateur est obligatoire"],
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, 
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer une adresse email valide']
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

export default userSchema;