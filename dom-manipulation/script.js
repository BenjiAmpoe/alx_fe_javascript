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

// --- Category Filter helpers ---
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;
  const currentSelection = localStorage.getItem('lastSelectedCategory') || 'all';
  const categories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
  select.value = currentSelection;
}

// --- Display quotes ---
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const q = quotes[randomIndex];
  quoteDisplay.innerHTML = "";
  const pText = document.createElement("p");
  pText.textContent = q.text;
  const pCategory = document.createElement("p");
  pCategory.textContent = `Category: ${q.category}`;
  quoteDisplay.appendChild(pText);
  quoteDisplay.appendChild(pCategory);
  sessionStorage.setItem('lastViewedQuoteIndex', randomIndex);
}

// --- Filter quotes ---
function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;
  const selectedCategory = select.value;
  localStorage.setItem('lastSelectedCategory', selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  filtered.forEach(q => {
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
  const container = document.createElement("div");
  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";
  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter quote category";
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);
  container.appendChild(inputText);
  container.appendChild(inputCategory);
  container.appendChild(addButton);
  document.body.appendChild(container);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  if (!text || !category) { alert("Enter both quote and category."); return; }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  textInput.value = ""; categoryInput.value = "";
  alert("Quote added!");
  filterQuotes();
}

// --- JSON import/export ---
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "quotes.json"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const imported = JSON.parse(ev.target.result);
      const valid = imported.filter(q => q && q.text && q.category);
      if (!valid.length) { alert("No valid quotes."); return; }
      quotes.push(...valid); saveQuotes(); populateCategories(); alert("Quotes imported!"); filterQuotes();
    } catch { alert("Failed to import."); } finally { event.target.value = ""; }
  };
  reader.readAsText(file);
}

// --- Simulated server sync ---
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API

async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) return;
    const serverData = await response.json();
    // Only keep posts with title and body as text/category simulation
    const serverQuotes = serverData.slice(0,5).map(p => ({ text: p.title, category: "Server" }));
    // Merge with local: server takes precedence
    let newData = serverQuotes.filter(sq => !quotes.some(lq => lq.text === sq.text));
    if (newData.length) {
      quotes.push(...newData);
      saveQuotes();
      populateCategories();
      alert("Quotes updated from server (conflicts resolved).");
      filterQuotes();
    }
  } catch (err) { console.error("Server sync failed", err); }
}

// Periodically sync every 60 seconds
setInterval(syncWithServer, 60000);

// --- Initialization ---
loadQuotes();
createAddQuoteForm();
populateCategories();
filterQuotes();

document.getElementById("newQuote")?.addEventListener("click", showRandomQuote);
document.getElementById("exportBtn")?.addEventListener("click", exportToJson);
