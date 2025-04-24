const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const app = express();
dotenv.config();


const connectToDatabase = require('./connection');

// Middlewares
app.use(cors());
app.use(express.json());
const router = express.Router();

// Storage config
// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const medCardRoutes = require('./routes/medcard.routes');
const miscRoutes = require('./routes/misc.routes');
const adminRoutes = require('./routes/admin.routes');
const doctorAppointment = require('./routes/doctor.routes')
const payments= require('./routes/payment.routes')

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medcards', medCardRoutes);
app.use('/api/misc', miscRoutes);
app.use('/api/admin',adminRoutes) 
app.use('/api/doctor',doctorAppointment);
app.use('/api/payment',payments)


const snacks = ['🍕 Pizza', '🍫 Chocolate', '🍿 Popcorn', '🍪 Cookies', '🥦 Broccoli (ew?)', '🌯 Burrito'];
const randomSnack = snacks[Math.floor(Math.random() * snacks.length)];

// Start server
app.listen(7002, '0.0.0.0', () => {
  console.log('🐍⚠️ Server is running on http://localhost:7000');
  console.log(`
    (¯·.¸¸.->  Welcome Dev Warrior <-.¸¸.·´¯)
 ---------------------------------------------------
 | 🛠️  Coding Level: Ninja Turtle                |
 | 🍕 Fuel: ${randomSnack}                          |
 | 🐛 Bugs: None. Just features with personality |
 | 🤖 AI Assistant: Me, duh!                     |
 | ☕ Mood: 100% Caffeinated                     |
 ---------------------------------------------------
 Har Har Mahadev 🙏 | Ship it like Shiva slays demons 🔱
 `);   

});
app.use('/',async function(req,res){

  try {
    await connectToDatabase();
    // Your logic here...
    res.status(200).send("DB connected and route working!");
  } catch (err) {
    res.status(500).send("Error connecting to DB");
  }
})
module.exports = app;