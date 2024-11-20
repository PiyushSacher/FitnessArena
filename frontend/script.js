// Handle adding items to the cart
// function addToCart(planName, planPrice) {
//   const cartItemsContainer = document.getElementById('cartItems');
//   const cartItem = document.createElement('div');
//   cartItem.className = 'cart__item';
//   cartItem.innerHTML = `
//     <p>${planName} - $${planPrice}</p>
//     <button class="btn remove__btn" onclick="removeFromCart(this)">Remove</button>
//   `;
//   cartItemsContainer.appendChild(cartItem);
//   openCartModal();
// }

// // Display cart modal
// function openCartModal() {
//   document.getElementById('cartModal').style.display = 'block';
// }

// // Close cart modal
// function closeCartModal() {
//   document.getElementById('cartModal').style.display = 'none';
// }

// // Remove item from cart
// function removeFromCart(button) {
//   button.parentElement.remove();
//   if (document.getElementById('cartItems').children.length === 0) {
//     closeCartModal();
//   }
// }

// Function to add an item to the cart
async function addToCart(planName, planPrice) {
  try {
    const response = await fetch('/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName, planPrice })
    });

    const result = await response.json();
    if (response.ok) {
      updateCartDisplay(result.cart);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
}

// Function to update the cart display
function updateCartDisplay(cart) {
  const cartItemsContainer = document.getElementById('cartItems');
  cartItemsContainer.innerHTML = ''; // Clear current cart display

  let totalAmount = 0;

  cart.forEach(item => {
    totalAmount += item.planPrice * item.quantity;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart__item';
    cartItem.innerHTML = `
      <p>${item.planName} - $${item.planPrice} x ${item.quantity}</p>
      <button class="btn remove__btn" onclick="removeFromCart('${item.planName}')">Remove</button>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  document.getElementById('totalAmount').textContent = `Total: $${totalAmount}`;
  openCartModal();
}

// Function to remove an item from the cart
async function removeFromCart(planName) {
  try {
    const response = await fetch('/remove-from-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName })
    });

    const result = await response.json();
    if (response.ok) {
      updateCartDisplay(result.cart);
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
  }
}


// Display cart modal
function openCartModal() {
  document.getElementById('cartModal').style.display = 'block';
}

// Close cart modal
function closeCartModal() {
  document.getElementById('cartModal').style.display = 'none';
}

// Click listener to open cart modal
document.querySelector('.cart__btn').addEventListener('click', openCartModal);

// Display login/signup modal
function openModal() {
  document.getElementById("loginSignupModal").style.display = "block";
}

// Close login/signup modal
function closeModal() {
  document.getElementById("loginSignupModal").style.display = "none";
}

// Toggle to signup form
function showSignupForm() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
}

// Toggle to login form
function showLoginForm() {
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

// DOMContentLoaded event listener to handle login and signup forms
document.addEventListener('DOMContentLoaded', () => {
  // Signup handler
  async function signup(event) {
    event.preventDefault();  // Prevent form submission reload
    const name = document.getElementById('signupName').value;
    const age = document.getElementById('signupAge').value;
    const phone = document.getElementById('signupPhone').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age, phone, email, password })
      });

      const result = await response.json();
      alert(result.message);
      if (response.ok) {
        console.log('New user registered:', { name, age, phone, email });
        window.location.href = 'login.html';  // Redirect to login page
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  }

  // Login handler
async function login(event) {
  event.preventDefault();  // Prevent form submission reload
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    alert(result.message);
    if (response.ok) {
      console.log('New user logged in:', {
        name: result.username,  // Assuming 'username' is sent in the response
        email: email,
        age: result.age, 
        phone: result.phone, 
        password: password  // Be cautious with logging sensitive information
      });
      localStorage.setItem("username", result.username); // Store username in local storage
      window.location.href = 'index.html';  // Redirect to home page
    }
  } catch (error) {
    console.error('Error logging in:', error);
  }
}


  // Add event listeners to forms
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');

  if (signupForm) {
    signupForm.addEventListener('submit', signup);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', login);
  }

  // Check if user is logged in on page load
  const loginButton = document.getElementById('loginButton');
  const logoutButton = document.getElementById('logoutButton');
  const userInfo = document.querySelector('.user-info');
  const username = localStorage.getItem("username");

  if (username) {
    // User is logged in
    userInfo.style.display = "block";
    document.getElementById("username").textContent = username;
    if (loginButton) loginButton.style.display = "none";
    if (logoutButton) logoutButton.style.display = "inline-block";
  } else {
    // User is not logged in
    userInfo.style.display = "none";
    if (loginButton) loginButton.style.display = "inline-block";
    if (logoutButton) logoutButton.style.display = "none";
  }

  // Logout handler
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        const response = await fetch('/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        if (response.ok) {
          alert(result.message);
          localStorage.removeItem("username");  // Clear username from local storage
          window.location.href = 'index.html';  // Redirect to home page
        } else {
          alert('Logout failed. Please try again.');
        }
      } catch (error) {
        console.error('Error logging out:', error);
      }
    });
  }
});
// Display username or default text if not logged in
// Display username or default text if not logged in
function displayWelcomeMessage() {
  const username = localStorage.getItem("username");
  const usernameElement = document.getElementById("username");

  if (usernameElement) { // Check if the element exists
    if (username) {
      usernameElement.textContent = `Welcome, ${username}!`;
    } else {
      usernameElement.textContent = 'Welcome, Guest!';
    }
  } else {
    console.warn("Element with ID 'username' not found.");
  }
}

// Call displayWelcomeMessage when the home page loads
window.onload = displayWelcomeMessage;

 

// Click listener to open cart modal
// document.querySelector('.cart__btn').addEventListener('click', openCartModal);
