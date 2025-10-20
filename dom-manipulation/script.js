let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API

// ------------------- Web Storage -------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ------------------- DOM Functions -------------------
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;
  const currentSelection = localStorage.getItem("lastSelectedCategory") || "all";
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

function filterQuotes() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;
  const selectedCategory = select.value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (!filtered.length) { quoteDisplay.textContent = "No quotes available."; return; }
  filtered.forEach(q => {
    const pText = document.createElement("p"); pText.textContent = q.text;
    const pCategory = document.createElement("p"); pCategory.textContent = `Category: ${q.category}`;
    quoteDisplay.appendChild(pText); quoteDisplay.appendChild(pCategory);
  });
}

function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (!quotes.length) { quoteDisplay.textContent = "No quotes available."; return; }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const q = quotes[randomIndex];
  quoteDisplay.innerHTML = "";
  const pText = document.createElement("p"); pText.textContent = q.text;
  const pCategory = document.createElement("p"); pCategory.textContent = `Category: ${q.category}`;
  quoteDisplay.appendChild(pText); quoteDisplay.appendChild(pCategory);
  sessionStorage.setItem("lastViewedQuoteIndex", randomIndex);
}

// ------------------- Add Quote -------------------
function createAddQuoteForm() {
  const container = document.createElement("div");
  const inputText = document.createElement("input"); inputText.id = "newQuoteText"; inputText.placeholder = "Enter a new quote";
  const inputCategory = document.createElement("input"); inputCategory.id = "newQuoteCategory"; inputCategory.placeholder = "Enter quote category";
  const addButton = document.createElement("button"); addButton.textContent = "Add Quote"; addButton.addEventListener("click", addQuote);
  container.appendChild(inputText); container.appendChild(inputCategory); container.appendChild(addButton);
  document.body.appendChild(container);
}

async function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim(); const category = categoryInput.value.trim();
  if (!text || !category) { alert("Enter both quote and category."); return; }
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  alert("Quote added!");
  textInput.value = ""; categoryInput.value = "";

  // POST new quote to server
  await postQuoteToServer(newQuote);
}

// ------------------- JSON Import/Export -------------------
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "quotes.json"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
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
      quotes.push(...valid); saveQuotes(); populateCategories(); filterQuotes(); alert("Quotes imported!");
    } catch { alert("Failed to import."); } finally { event.target.value = ""; }
  };
  reader.readAsText(file);
}

// ------------------- Server Sync -------------------
// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.slice(0,5).map(p => ({ text: p.title, category: "Server" }));
  } catch (err) { console.error(err); return []; }
}

// Post a quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
  } catch (err) { console.error("POST failed", err); }
}

// Sync quotes with server and resolve conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const newQuotes = serverQuotes.filter(sq => !quotes.some(lq => lq.text === sq.text));
  if (newQuotes.length) {
    quotes.push(...newQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes synced with server!");
  }
}

// ------------------- Periodic Sync -------------------
setInterval(syncQuotes, 60000);

// ------------------- Init -------------------
loadQuotes();
createAddQuoteForm();
populateCategories();
filterQuotes();
document.getElementById("newQuote")?.addEventListener("click", showRandomQuote);
document.getElementById("exportBtn")?.addEventListener("click", exportToJson);
