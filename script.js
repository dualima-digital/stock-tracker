const API_URL = "https://script.google.com/macros/s/AKfycbxz73Cq_qqjiniriidhm2Q0LeCCEV4vhp7REP0qAIC6we_HWVrCBk6pqbi5Vp33DxioeQ/exec";
const API_TOKEN = "baraganteng"; // must match backend

// ---------------- LIST TO BUY ----------------
function initListPage() {
  loadList();
  setInterval(loadList, 5 * 60 * 1000); // auto-refresh every 5 min
  checkMonthReset();
}

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
  for (let item of skipped) {
    await fetch(`${API_URL}?action=skipItem&item=${encodeURIComponent(item)}&token=${API_TOKEN}`);
  }
  loadList(); // refresh list after submit
}

async function checkMonthReset() {
  let today = new Date();
  if (today.getDate() === 1) {
    await fetch(`${API_URL}?action=getList&token=${API_TOKEN}`);
    loadList();
  }
}

// ---------------- STOCK UPDATE ----------------
let allItems = [];

function initUpdatePage() {
  loadItems();
  setInterval(loadItems, 5 * 60 * 1000); // auto-refresh every 5 min
}

async function loadItems() {
  let res = await fetch(`${API_URL}?action=getItems&token=${API_TOKEN}`);
  allItems = await res.json();
  renderDropdown(allItems);
}

function renderDropdown(items) {
  let dropdown = document.getElementById("itemDropdown");
  dropdown.innerHTML = "";

  if (!items || items.length === 0) {
    let opt = document.createElement("option");
    opt.textContent = "No products available";
    dropdown.appendChild(opt);
    return;
  }

  // Always show dummy "Select a product..." first
  let dummy = document.createElement("option");
  dummy.textContent = "Select a product...";
  dummy.disabled = true;
  dummy.selected = true;
  dropdown.appendChild(dummy);

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
  await fetch(`${API_URL}?action=updateStock&item=${encodeURIComponent(item)}&qty=${qty}&type=${type}&token=${API_TOKEN}`);
  alert("Stock updated!");
}
