const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const filters = document.querySelectorAll(".filters button");
const sortSelect = document.getElementById("sortSelect");
const products = document.querySelectorAll(".product");
const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const searchInput = document.getElementById("searchInput");
const backToTop = document.getElementById("backToTop");
const contactForm = document.getElementById("contactForm");
const contactModal = document.getElementById("contactModal");
const contactModalClose = document.getElementById("contactModalClose");
const productContactForm = document.getElementById("productContactForm");
const contactProduct = document.getElementById("contactProduct");
const wishlistToggle = document.getElementById("wishlistToggle");
const wishlistModal = document.getElementById("wishlistModal");
const wishlistModalClose = document.getElementById("wishlistModalClose");
const wishlistItems = document.getElementById("wishlistItems");
const pagination = document.getElementById("pagination");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let currentPage = 1;
const productsPerPage = 6;

// Initialize cart count
cartCount.textContent = cart.length;

// Theme toggle
themeToggle.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

// Menu toggle
menuToggle.onclick = () => navMenu.classList.toggle("active");

// Update filter button counts
const updateFilterCounts = () => {
  const counts = {
    all: products.length,
    fashion: 0,
    electronics: 0,
    accessories: 0
  };
  products.forEach(p => counts[p.dataset.category]++);
  filters.forEach(btn => {
    const filter = btn.dataset.filter;
    btn.textContent = filter === "all" ? `All (${counts.all})` : `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${counts[filter]})`;
  });
};
updateFilterCounts();

// Update wishlist badge
const updateWishlistBadge = () => {
  wishlistToggle.textContent = `❤️ (${wishlist.length})`;
};
updateWishlistBadge();

// Product filter
filters.forEach(btn => {
  btn.onclick = () => {
    filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentPage = 1;
    updateProductDisplay();
  };
});

// Sorting
sortSelect.onchange = () => {
  currentPage = 1;
  updateProductDisplay();
};

// Enhanced search
searchInput.addEventListener("input", () => {
  currentPage = 1;
  updateProductDisplay();
});

// Pagination
const updateProductDisplay = () => {
  const filter = document.querySelector(".filters button.active").dataset.filter;
  const query = searchInput.value.toLowerCase();
  const sort = sortSelect.value;

  let filteredProducts = Array.from(products).filter(p => {
    if (filter !== "all" && p.dataset.category !== filter) return false;
    const name = p.querySelector("h3").textContent.toLowerCase();
    const category = p.dataset.category.toLowerCase();
    const price = parseFloat(p.querySelector(".price").textContent.replace("$", ""));
    return name.includes(query) || category.includes(query) || price.toString().includes(query);
  });

  // Sort products
  filteredProducts.sort((a, b) => {
    const nameA = a.querySelector("h3").textContent.toLowerCase();
    const nameB = b.querySelector("h3").textContent.toLowerCase();
    const priceA = parseFloat(a.querySelector(".price").textContent.replace("$", ""));
    const priceB = parseFloat(b.querySelector(".price").textContent.replace("$", ""));
    if (sort === "name-asc") return nameA.localeCompare(nameB);
    if (sort === "name-desc") return nameB.localeCompare(nameA);
    if (sort === "price-asc") return priceA - priceB;
    if (sort === "price-desc") return priceB - priceA;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;

  products.forEach(p => p.style.display = "none");
  filteredProducts.slice(start, end).forEach(p => p.style.display = "block");

  // Update pagination buttons
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.classList.toggle("active", i === currentPage);
    btn.onclick = () => {
      currentPage = i;
      updateProductDisplay();
    };
    pagination.appendChild(btn);
  }
};
updateProductDisplay();

// Add to cart
document.querySelectorAll(".btn-buy").forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault();
    const product = btn.closest(".product").querySelector("h3").textContent;
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    cartCount.textContent = cart.length;
    btn.textContent = "Added ✓";
    setTimeout(() => btn.textContent = "Add to Cart", 1000);
  };
});

// Contact seller
document.querySelectorAll(".btn-contact").forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault();
    contactProduct.value = btn.dataset.product;
    document.getElementById("productContactMessage").textContent = "";
    contactModal.classList.add("active");
  };
});

// Wishlist
document.querySelectorAll(".btn-wishlist").forEach(btn => {
  const productId = btn.dataset.productId;
  btn.classList.toggle("active", wishlist.includes(productId));
  btn.onclick = (e) => {
    e.preventDefault();
    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter(id => id !== productId);
      btn.classList.remove("active");
    } else {
      wishlist.push(productId);
      btn.classList.add("active");
    }
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistBadge();
    updateWishlistModal();
  };
});

// Wishlist modal
wishlistToggle.onclick = () => wishlistModal.classList.add("active");

const updateWishlistModal = () => {
  wishlistItems.innerHTML = "";
  wishlist.forEach(id => {
    const product = Array.from(products).find(p => p.querySelector(".btn-wishlist").dataset.productId === id);
    if (product) {
      const item = document.createElement("div");
      item.className = "product";
      item.innerHTML = `
        <img src="${product.querySelector("img").src}" alt="${product.querySelector("h3").textContent}" loading="lazy">
        <h3>${product.querySelector("h3").textContent}</h3>
        <p class="price">${product.querySelector(".price").textContent}</p>
        <a href="#" class="btn-buy">Add to Cart</a>
        <a href="#" class="btn-contact" data-product="${product.querySelector("h3").textContent}">Contact Seller</a>
        <a href="#" class="btn-wishlist active" data-product-id="${id}">❤️</a>
      `;
      item.querySelector(".btn-buy").onclick = (e) => {
        e.preventDefault();
        cart.push(product.querySelector("h3").textContent);
        localStorage.setItem("cart", JSON.stringify(cart));
        cartCount.textContent = cart.length;
      };
      item.querySelector(".btn-contact").onclick = (e) => {
        e.preventDefault();
        contactProduct.value = product.querySelector("h3").textContent;
        document.getElementById("productContactMessage").textContent = "";
        wishlistModal.classList.remove("active");
        contactModal.classList.add("active");
      };
      item.querySelector(".btn-wishlist").onclick = (e) => {
        e.preventDefault();
        wishlist = wishlist.filter(wid => wid !== id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateWishlistBadge();
        updateWishlistModal();
        updateProductDisplay();
      };
      wishlistItems.appendChild(item);
    }
  });
  if (wishlist.length === 0) {
    wishlistItems.innerHTML = "<p>Your wishlist is empty.</p>";
  }
};
updateWishlistModal();

// Modal close
contactModalClose.onclick = () => {
  contactModal.classList.remove("active");
  document.getElementById("productContactMessage").textContent = "";
};
wishlistModalClose.onclick = () => wishlistModal.classList.remove("active");

// Modal keyboard navigation
[contactModal, wishlistModal].forEach(modal => {
  modal.onkeydown = (e) => {
    if (e.key === "Escape") {
      modal.classList.remove("active");
      document.getElementById("productContactMessage").textContent = "";
    }
    if (e.key === "Tab") {
      const focusable = modal.querySelectorAll("button, input, textarea, [tabindex]:not([tabindex='-1'])");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
});

// Form validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateForm = (form) => {
  const name = form.querySelector("input[name='name']").value.trim();
  const email = form.querySelector("input[name='email']").value.trim();
  const subject = form.querySelector("input[name='subject']").value.trim();
  const message = form.querySelector("textarea[name='message']").value.trim();
  
  if (!name) return "Name is required.";
  if (!email) return "Email is required.";
  if (!validateEmail(email)) return "Please enter a valid email address.";
  if (!subject) return "Subject is required.";
  if (!message) return "Message is required.";
  return "";
};

// Contact form submission
contactForm.onsubmit = (e) => {
  e.preventDefault();
  const messageEl = document.getElementById("contactMessage");
  const error = validateForm(contactForm);
  
  if (error) {
    messageEl.textContent = error;
    messageEl.className = "form-message error";
  } else {
    messageEl.textContent = "Thank you for your message! We'll get back to you soon.";
    messageEl.className = "form-message success";
    contactForm.reset();
    setTimeout(() => {
      messageEl.textContent = "";
    }, 5000);
  }
};

// Product contact form submission
productContactForm.onsubmit = (e) => {
  e.preventDefault();
  const messageEl = document.getElementById("productContactMessage");
  const error = validateForm(productContactForm);
  
  if (error) {
    messageEl.textContent = error;
    messageEl.className = "form-message error";
  } else {
    messageEl.textContent = `Thank you for your inquiry about ${contactProduct.value}! We'll respond soon.`;
    messageEl.className = "form-message success";
    productContactForm.reset();
    setTimeout(() => {
      contactModal.classList.remove("active");
      messageEl.textContent = "";
    }, 3000);
  }
};

// Scroll reveal animation
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.2 });

products.forEach(p => observer.observe(p));

// Back to top button
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("visible", window.scrollY > 300);
});
backToTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });