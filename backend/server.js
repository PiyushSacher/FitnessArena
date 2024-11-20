const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Session setup
app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
}));

// Initialize cart in session if it doesn't exist
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});

// In-memory cart storage
let cart = [];

// Add to cart route
app.post('/add-to-cart', (req, res) => {
  const { planName, planPrice } = req.body;

  // Check if the item already exists in the cart
  const existingItemIndex = req.session.cart.findIndex(item => item.planName === planName);

  if (existingItemIndex > -1) {
    // Increment quantity if item already exists
    req.session.cart[existingItemIndex].quantity += 1;
  } else {
    // Add new item if it doesn't exist
    req.session.cart.push({ planName, planPrice, quantity: 1 });
  }

  res.status(200).json({ message: 'Item added to cart', cart: req.session.cart });
});

// Remove from cart route
app.post('/remove-from-cart', (req, res) => {
  const { planName } = req.body;

  // Remove item from the cart
  req.session.cart = req.session.cart.filter(item => item.planName !== planName);

  res.status(200).json({ message: 'Item removed from cart', cart: req.session.cart });
});

// Get cart items route
app.get('/cart', (req, res) => {
  res.status(200).json({ cart: req.session.cart });
});

// Helper function to read data from data.json
function readData() {
  const dataFilePath = path.join(__dirname, 'data.json');
  if (fs.existsSync(dataFilePath)) {
    try {
      const data = fs.readFileSync(dataFilePath);
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading data file:', err);
      return { users: [] };
    }
  } else {
    return { users: [] };
  }
}

// Helper function to write data to data.json
function writeData(data) {
  const dataFilePath = path.join(__dirname, 'data.json');
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing data file:', err);
  }
}

// Serve index.html at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});


// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const data = readData();

  const user = data.users.find(user => user.email === email && user.password === password);
  if (user) {
    req.session.user = user; // Save user data in session
    res.status(200).json({ message: 'Successfully logged in', username: user.name , redirect:'/'}); // Include username in response
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});


// Signup route (for creating new users)
app.post('/signup', (req, res) => {
  const { name, age, phone, email, password } = req.body;
  let data = readData();
  const userExists = data.users.some(user => user.email === email);
  
  if (userExists) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = { name, age, phone, email, password };
  data.users.push(newUser);
  writeData(data);

  console.log('New user registered:', newUser);

  res.status(201).json({ message: 'User registered successfully' });
});

// Middleware to protect routes
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/');
}

// Protected route example (if needed)
app.get('/profile', ensureAuthenticated, (req, res) => {
  res.json(req.session.user);
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');  // Clear the session cookie
    res.status(200).json({ message: 'Logout successful' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
