console.log("✅ app.js loaded successfully");

// === Classes Data ===
const classes = [
  { id: 1, name: "Java programming", price: 15, description: "Learn how to code with Java", image: "../Images/Java.jpg", location: "Online", seats: 30 },
  { id: 2, name: "Artificial Intelligence", price: 25, description: "Learn more about AI", image: "../Images/AI.jpg", location: "London Campus", seats: 30 },
  { id: 3, name: "Data Science and Machine Learning", price: 20, description: "Learn machine learning", image: "../Images/Machine.jpg", location: "Manchester Campus", seats: 30 },
  { id: 4, name: "Information in Organisations", price: 10, description: "Learn SQL and databases", image: "../Images/SQL.jpg", location: "Online", seats: 30 },
  { id: 5, name: "Web Development", price: 30, description: "Build modern websites", image: "../Images/web.jpg", location: "London Campus", seats: 30 },
  { id: 6, name: "Cybersecurity Fundamentals", price: 18, description: "Protect systems and data", image: "../Images/Cyber.jpg", location: "Online", seats: 30 },
  { id: 7, name: "Cloud Computing", price: 22, description: "Explore cloud tech", image: "../Images/cloud.jpg", location: "London Campus", seats: 30 },
  { id: 8, name: "Mobile App Development", price: 28, description: "Build Android/iOS apps", image: "../Images/Mobile.jpg", location: "London Campus", seats: 30 },
  { id: 9, name: "Blockchain Technology", price: 35, description: "Learn blockchain", image: "../Images/Blockchain.jpg", location: "Online", seats: 30},
  { id: 10, name: "UI/UX Design", price: 12, description: "Learn UI/UX design", image: "../Images/UI.jpg", location: "London Campus", seats: 30 }
];

// === DOM Elements ===
const classList = document.getElementById("class-list");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const sortSelect = document.getElementById("sortSelect");

let cart = [];
let filteredClasses = [...classes];

// === Render Classes ===
function renderClasses(list = classes) {
  classList.innerHTML = "";
  list.forEach(cls => {
    const card = document.createElement("div");
    card.classList.add("card");

    const isAvailable = cls.seats > 0;
    const availabilityLabel = isAvailable
      ? `<button class="add-to-cart" onclick="addToCart(${cls.id})">Add to Cart</button>`
      : `<button class="add-to-cart disabled" disabled>Fully Booked</button>`;

    card.innerHTML = `
      <img src="${cls.image}" alt="${cls.name}" class="card-image" />
      <h3>${cls.name}</h3>
      <p>${cls.description}</p>
      <p><strong>Location:</strong> ${cls.location}</p>
      <p><strong>Price:</strong> $${cls.price}</p>
      <p><strong>Seats Left:</strong> ${cls.seats}</p>
      ${availabilityLabel}
    `;
    classList.appendChild(card);
  });
}

// === Search Functionality ===
function searchClasses() {
  const query = searchInput.value.trim().toLowerCase();
  filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(query) ||
    cls.description.toLowerCase().includes(query) ||
    cls.location.toLowerCase().includes(query)
  );
  renderClasses(sortClasses(filteredClasses));
}

// === Sort Functionality ===
function sortClasses(list = filteredClasses) {
  const sortValue = sortSelect.value;
  let sorted = [...list];

  if (sortValue === "asc") {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortValue === "desc") {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortValue === "az") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortValue === "za") {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  }

  return sorted;
}

// === CART SYSTEM ===
function addToCart(id) {
  const selectedClass = classes.find(c => c.id === id);

  if (selectedClass.seats <= 0) {
    alert("⚠️ Sorry, this class is fully booked!");
    return;
  }

  cart.push(selectedClass);
  selectedClass.seats--; // Decrease available seats
  renderCart();
  renderClasses(filteredClasses); // Refresh to show updated seat count
}

function renderCart() {
  const cartContainer = document.getElementById("cart-container");
  const cartList = document.getElementById("cart-items");
  const totalDisplay = document.getElementById("total-price");

  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - $${item.price}
      <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
    `;
    cartList.appendChild(li);
    total += item.price;
  });

  totalDisplay.textContent = `$${total.toFixed(2)}`;
  cartContainer.style.display = cart.length ? "block" : "none";
}

function removeFromCart(index) {
  const removedItem = cart[index];
  removedItem.seats++; // Restore seat when removed from cart
  cart.splice(index, 1);
  renderCart();
  renderClasses(filteredClasses); // Refresh UI
}

function checkout() {
  if (cart.length === 0) {
    alert("🛒 Your cart is empty!");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  alert(`✅ Thank you for your purchase of $${total.toFixed(2)}!`);
  cart = [];
  renderCart();
  renderClasses(filteredClasses); // Refresh seat data post-purchase
}

// === Event Listeners ===
document.addEventListener("DOMContentLoaded", () => {
  renderClasses();
  searchBtn.addEventListener("click", searchClasses);
  searchInput.addEventListener("keyup", searchClasses);
  sortSelect.addEventListener("change", () => renderClasses(sortClasses(filteredClasses)));
});