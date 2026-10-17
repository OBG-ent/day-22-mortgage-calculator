// Mortgage Calculator — simple build
// Practice: form input handling, math formulas, DOM rendering, loops.

const form = document.getElementById("calc-form");
const results = document.getElementById("results");

// Turn a number into nicely formatted currency, e.g. 1234.5 -> "$1,234.50"
function money(value) {
  return value.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

function calculate(event) {
  event.preventDefault(); // keep the page from reloading on submit

  // --- Read and validate the inputs ---
  const price = parseFloat(document.getElementById("price").value);
  const down = parseFloat(document.getElementById("down").value);
  const rate = parseFloat(document.getElementById("rate").value);
  const years = parseInt(document.getElementById("years").value, 10);

  if (price <= 0 || down < 0 || rate < 0 || years <= 0 || down >= price) {
    alert("Check your numbers: price must be positive and down payment must be less than the price.");
    return;
  }

  // --- The math ---
  const principal = price - down;          // how much is borrowed
  const monthlyRate = rate / 100 / 12;     // interest rate per month (as a decimal)
  const numPayments = years * 12;          // total number of monthly payments

  // Standard fixed-payment loan formula:
  // M = P * r(1+r)^n / ((1+r)^n - 1)
  // If the rate is 0%, the payment is simply principal divided by months.
  let monthly;
  if (monthlyRate === 0) {
    monthly = principal / numPayments;
  } else {
    const growth = Math.pow(1 + monthlyRate, numPayments);
    monthly = (principal * monthlyRate * growth) / (growth - 1);
  }

  const totalInterest = monthly * numPayments - principal;

  // --- Show the headline numbers ---
  document.getElementById("monthly").textContent = money(monthly);
  document.getElementById("borrowed").textContent = money(principal);
  document.getElementById("interest").textContent = money(totalInterest);
  results.classList.remove("hidden");

  // --- Build the year-by-year amortization table ---
  // We simulate every monthly payment: part pays interest, the rest pays principal.
  const tbody = document.querySelector("#schedule tbody");
  tbody.innerHTML = ""; // clear any previous table rows

  let balance = principal;
  for (let year = 1; year <= years; year++) {
    let principalPaid = 0;
    let interestPaid = 0;

    for (let month = 0; month < 12; month++) {
      const interestPortion = balance * monthlyRate;
      const principalPortion = monthly - interestPortion;
      interestPaid += interestPortion;
      principalPaid += principalPortion;
      balance -= principalPortion;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${year}</td>
      <td>${money(principalPaid)}</td>
      <td>${money(interestPaid)}</td>
      <td>${money(Math.max(balance, 0))}</td>
    `;
    tbody.appendChild(row);
  }
}

form.addEventListener("submit", calculate);

// Run once on page load so visitors see results immediately.
calculate(new Event("submit"));
