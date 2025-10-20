// --- Quotes array (load from localStorage if exists) ---
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// --- Web Storage helpers ---
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) quotes = parsed;
  }
}

function saveLastViewedIndex(index) {
  sessionStorage.setItem('lastViewedQuoteIndex', String(index));
}

function loadLastViewedIndex() {
  const val = sessionStorage.getItem('lastViewedQuoteIndex');
  if (val === null) return -1;
  const idx = parseInt(val, 10);
  return Number.isNaN(idx) ? -1 : idx;
}

// --- Category Filter helpers ---
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  // Keep current selection
  const currentSelection = localStorage.getItem('lastSelectedCategory') || 'all';

  // Get unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  // Clear all options except "All"
  select.innerHTML = '<option value="all">All Categories</option>';

  // Add categories
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore last selected filter
  select.value = currentSelection;
}

// --- Display quotes ---
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Please add a new one.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  quoteDisplay.innerHTML = "";
  const pText = document.createElement("p");
  pText.textContent = randomQuote.text;
  const pCategory = document.createElement("p");
  pCategory.textContent = `Category: ${randomQuote.category}`;

  quoteDisplay.appendChild(pText);
  quoteDisplay.appendChild(pCategory);

  saveLastViewedIndex(randomIndex);
}

// --- Filter quotes by category ---
function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const selectedCategory = select.value;
  localStorage.setItem('lastSelectedCategory', selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const filteredQuotes = selectedCategory === "all" 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  filteredQuotes.forEach(q => {
    const pText = document.createElement("p");
    pText.textContent = q.text;
    const pCategory = document.createElement("p");
    pCategory.textContent = `Category: ${q.category}`;
    quoteDisplay.appendChild(pText);
    quoteDisplay.appendChild(pCategory);
  });
}

// --- Add quote ---
function createAddQuoteForm() {
  const formContainer = document.createElement("div");
  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
  document.body.appendChild(formContainer);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  // Update categories in dropdown dynamically
  populateCategories();

  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");

  // Update display according to current filter
  filterQuotes();
}

// --- JSON Import / Export ---
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const imported = JSON.parse(ev.target.result);
      const validQuotes = imported.filter(q => q && q.text && q.category);
      if (validQuotes.length === 0) {
        alert("No valid quotes found.");
        return;
      }
      quotes.push(...validQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      filterQuotes();
    } catch (err) {
      alert("Failed to import JSON file.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// --- Initialization ---
loadQuotes();
createAddQuoteForm();
populateCategories();

// Event listeners
const newQuoteButton = document.getElementById("newQuote");
if (newQuoteButton) newQuoteButton.addEventListener("click", showRandomQuote);

const exportBtn = document.getElementById("exportBtn");
if (exportBtn) exportBtn.addEventListener("click", exportToJson);

// Show last selected filter on load
filterQuotes();
