// Array of quote objects
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Please add a new one.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Clear previous quote
  quoteDisplay.innerHTML = "";

  // Create elements dynamically
  const quoteText = document.createElement("p");
  quoteText.textContent = randomQuote.text;

  const quoteCategory = document.createElement("p");
  quoteCategory.textContent = `Category: ${randomQuote.category}`;

  // Append to quote display area
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Function required by ALX: createAddQuoteForm
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
  addButton.addEventLis
