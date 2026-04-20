// Replace with your deployed Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbwNA5tYvCjiO3mNIUt2-yJHiu5w8c8KEbV75n2Hvqevr3C3wlyqcXLedmRt72IpjETgpA/exec";
const API_TOKEN = "baraganteng"; // must match backend

// ---------------- LIST TO BUY ----------------
async function loadList() {
  try {
    let res = await fetch(`${API_URL}?action=getList&token=${API_TOKEN}`);
    let items = await res.json();
    let tbody = document.getElementById("listForm");
    tbody.innerHTML = "";

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3">No items to buy right now.</td></tr>`;
      return;
    }

    items.forEach(item => {
      let product = Array.isArray(item) ? item[0] : item;
      if (product) {
        let row = document.createElement("tr");
        row.innerHTML = `
          <td>${product}</td>
          <td>
            <input type="checkbox" name="done" value="${product}" 
                   onclick="toggleExclusiveCheckbox('${product}','DONE')">
          </td>
          <td>
            <input type="checkbox" name="skip" value="${product}" 
                   onclick="toggleExclusiveCheckbox('${product}','SKIP')">
          </td>
        `;
        tbody.appendChild(row);
      }
    });
  } catch (err) {
    console.error("Error loading list:", err);
    document.getElementById("listForm").innerHTML =
      `<tr><td colspan="3">Error loading list.</td></tr>`;
  }
}

// Ensure only one checkbox per item can be selected
function toggleExclusiveCheckbox(item, type) {
  const doneBox = document.querySelector(`input[name=done][value="${item}"]`);
  const skipBox = document.querySelector(`input[name=skip][value="${item}"]`);

  if (type === "DONE" && doneBox.checked) {
    skipBox.checked = false;
  }
  if (type === "SKIP" && skipBox.checked) {
    doneBox.checked = false;
  }
}

async function submitList() {
  let doneItems = Array.from(document.querySelectorAll("input[name=done]:checked"))
                       .map(cb => cb.value);
  let skippedItems = Array.from(document.querySelectorAll("input[name=skip]:checked"))
                          .map(cb => cb.value);

  if (doneItems.length === 0 && skippedItems.length === 0) {
    alert("No items selected.");
    return;
  }

  if (!confirm("Are you sure you want to process selected items?")) return;

  // DONE items → add to stock (qty=1) and clear from list
  for (let item of doneItems) {
    await fetch(`${API_URL}?token=${API_TOKEN}&action=doneItem&item=${encodeURIComponent(item)}`);
  }

  // SKIP items → mark skipped
  for (let item of skippedItems) {
    await fetch(`${API_URL}?token=${API_TOKEN}&action=skipItem&item=${encodeURIComponent(item)}`);
  }

  alert("Submission complete! DONE items added to stock, SKIP items marked.");
  loadList(); // refresh list after submit
}

// ---------------- STOCK UPDATE ----------------
let allItems = [];

function initUpdatePage() {
  renderDropdown([]);
  loadItems();
}

async function loadItems() {
  try {
    let res = await fetch(`${API_URL}?action=getItems&token=${API_TOKEN}`);
    allItems = await res.json();
    renderDropdown(allItems);
  } catch (err) {
    console.error("Error loading items:", err);
    renderDropdown([]);
  }
}

function renderDropdown(items) {
  let dropdown = document.getElementById("itemDropdown");
  dropdown.innerHTML = "";

  let dummy = document.createElement("option");
  dummy.textContent = "Select a product...";
  dummy.disabled = true;
  dummy.selected = true;
  dropdown.appendChild(dummy);

  if (!items || items.length === 0) return;

  items.forEach(item => {
    let opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    dropdown.appendChild(opt);
  });
}

function filterDropdown() {
  let query = document.getElementById("searchBar").value.toLowerCase();
  let filtered = allItems.filter(item => item.toLowerCase().includes(query));
  renderDropdown(filtered);
}

async function submitUpdate() {
  let item = document.getElementById("itemDropdown").value;
  if (item === "Select a product...") {
    alert("Please select a valid product.");
    return;
  }
  let qty = document.getElementById("qty").value;
  let type = document.getElementById("type").value;

  if (!confirm(`Confirm update: ${type} ${qty} for ${item}?`)) return;

  await fetch(`${API_URL}?action=updateStock&item=${encodeURIComponent(item)}&qty=${qty}&type=${type}&token=${API_TOKEN}`);
  alert("Stock updated!");
}
