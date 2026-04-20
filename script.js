const API_URL = "https://script.google.com/macros/s/AKfycbzPj0q8wRapY4EcsJyr_STdHthCiXxzp__YHugYwa4-No7ym5d6vvSY9Qlw2i3iQjzy0A/exec";
const API_TOKEN = "baraganteng"; // must match backend

// ---------------- LIST TO BUY ----------------
async function loadList() {
  let res = await fetch(`${API_URL}?action=getList&token=${API_TOKEN}`);
  let items = await res.json();
  let form = document.getElementById("listForm");
  form.innerHTML = "";

  if (!items || items.length === 0) {
    form.innerHTML = "<p>No items to buy right now.</p>";
    return;
  }

  items.forEach(item => {
    let product = Array.isArray(item) ? item[0] : item;
    if (product) {
      let div = document.createElement("div");
      div.innerHTML = `
        <label>
          <input type="checkbox" name="skip" value="${product}"> ${product}
        </label>
      `;
      form.appendChild(div);
    }
  });
}

async function submitList() {
  let skipped = Array.from(document.querySelectorAll("input[name=skip]:checked"))
                     .map(cb => cb.value);

  if (skipped.length === 0) {
    alert("No items selected.");
    return;
  }

  if (!confirm("Are you sure you want to mark selected items as SKIP/DONE?")) {
    return;
  }

  for (let item of skipped) {
    await fetch(`${API_URL}?action=skipItem&item=${encodeURIComponent(item)}&token=${API_TOKEN}`);
  }
  loadList(); // refresh list after submit
}

// ---------------- STOCK UPDATE ----------------
let allItems = [];

function initUpdatePage() {
  // Show dummy option immediately
  renderDropdown([]);
  loadItems();
}

async function loadItems() {
  let res = await fetch(`${API_URL}?action=getItems&token=${API_TOKEN}`);
  allItems = await res.json();
  renderDropdown(allItems);
}

function renderDropdown(items) {
  let dropdown = document.getElementById("itemDropdown");
  dropdown.innerHTML = "";

  // Always show dummy "Select a product..." first
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
