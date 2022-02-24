// TERM OBJECT
class Term {
  constructor(desc, url, type) {
    this.desc = desc;
    this.url = url;
    this.type = type;
    this.date = Date.now();
  }
}

// GENERAL VARIABLES
let myTerms;
let myFolders;
let activeFolderName;
let currentFolderTab;
let selectedTerm = new Term("", "", "");
let selectedElement;

// GENERAL DOM OBJECTS
const folderContentsSection = document.getElementById(
  "folder-contents-section"
);
const folderTabs = document.getElementById("folder-tabs");
const moveToSubmenu = document.getElementById("move-to-submenu");
const dropdownContents = document.getElementById("dropdown-contents");
const popupEl = document.getElementById("popup");

// NEEDED FOR CHROME EXTENSIONS
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  descEl.value = tabs[0].title; // gets the title and url of the current tab
  urlEl.value = tabs[0].url; // seems only works for chrome extensions
});

// ************ LOCAL STORAGE ************ //
// Verifies if there is data in the Local Storage and load it
function getTermsFromLocalStorage() {
  myTerms = JSON.parse(localStorage.getItem("myTerms"));
  if (!myTerms) myTerms = [];

  myFolders = JSON.parse(localStorage.getItem("myFolders"));
  // If there's no folder, set "Folder1" as default folder
  if (!myFolders) {
    myFolders = ["Folder1"];
  }
  activeFolderName = myFolders[0];
}

function updateLocalStorage() {
  if (myTerms.length !== 0) {
    localStorage.setItem("myTerms", JSON.stringify(myTerms));
    localStorage.setItem("myFolders", JSON.stringify(myFolders));
  } else {
    localStorage.clear();
  }
}

// ************ GENERAL FUNCTIONS ************ //
function getIndexOfTerm() {
  for (let i = 0; i < myTerms.length; i++) {
    if (myTerms[i].desc === selectedTerm.desc) {
      return i;
    }
  }
}

// Fetches for special chars and replace them
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => {
    return map[m];
  });
}

// POPUP MESSAGE
function popupMessage(text) {
  popupEl.textContent = text;
  popupEl.classList.add("appear");
  popupEl.addEventListener("animationend", () =>
    popupEl.classList.remove("appear")
  );
}

// **************** INPUT FIELDS **************** //
const descEl = document.getElementById("desc-el");
const urlEl = document.getElementById("url-el");

// **************** BUTTONS **************** //

// VARIABLES
const saveBtn = document.getElementById("save-btn");
const deleteAllBtn = document.getElementById("delete-all-btn");
const deleteBtn = document.getElementById("delete-btn");
const updateBtn = document.getElementById("update-btn");
const cancelBtn = document.getElementById("cancel-btn");
const editBtn = document.getElementById("edit-btn");
const moveToBtn = document.getElementById("move-to-btn");
const sortEl = document.getElementById("sort-el");
const searchContainer = document.querySelector(".search-container");

// SAVE BUTTON
saveBtn.addEventListener("click", () => {
  const desc = escapeHtml(descEl.value);
  const url = escapeHtml(urlEl.value);
  // Checks if there are values input
  if (desc && url) {
    saveTerm(new Term(desc, url, activeFolderName));
    descEl.value = "";
    urlEl.value = "";
  } else {
    alert("Insert values!");
  }
});

function saveTerm(term) {
  if (!myTerms) {
    myTerms[0] = term;
  } else {
    myTerms.push(term);
  }
  updateLocalStorage();
  appendTerm(term);
  popupMessage("Term saved!");
}

// DELETE ALL BUTTON
deleteAllBtn.addEventListener("dblclick", () => {
  if (confirm("Are you sure you want to clear all your terms?")) {
    localStorage.clear();

    renderApp();
    popupMessage("All terms deleted! :(");
  }
});

// SORT TERMS FEATURE
sortEl.addEventListener("change", (e) => {
  if (e.target.value === "alphabetically") {
    renderMyTermsAlphabetically();
  } else if (e.target.value === "by-date") {
    renderMyTermsByDate();
  }
});
function sortByDesc() {
  myTerms.sort((a, b) =>
    a.desc.localeCompare(b.desc, "en", { ignorePunctuation: true })
  );
}
function sortByDate() {
  myTerms.sort((a, b) => a.date - b.date);
}
function renderMyTermsAlphabetically() {
  sortByDesc();
  renderMyTerms();
}
function renderMyTermsByDate() {
  sortByDate();
  renderMyTerms();
}

// SEARCH TERM FEATURE
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const closeBtn = document.getElementById("close-btn");
const searchResContainer = document.getElementById("search-results-container");
const searchUl = document.getElementById("search-results");
let searchResults;

searchBtn.addEventListener("click", () => {
  searchBtn.classList.remove("active");
  closeBtn.classList.add("active");
  searchInput.classList.add("active");
  searchInput.focus();
});
closeBtn.addEventListener("click", () => {
  closeBtn.classList.remove("active");
  searchBtn.classList.add("active");
  searchInput.value = "";
  searchInput.classList.remove("active");
  searchResContainer.classList.remove("active");
});

searchInput.addEventListener("keyup", () => {
  const numberOfMatches = document.getElementById("number-of-matches");
  searchResults = [];

  let string = searchInput.value.trim().toLowerCase();
  if (string === "") {
    searchResContainer.classList.remove("active");
  } else {
    searchResContainer.classList.add("active");

    myTerms.forEach((term) => {
      if (term.desc.toLowerCase().includes(string)) {
        searchResults.push(term);
      }

      while (searchUl.firstChild) {
        searchUl.removeChild(searchUl.firstChild);
      }
      for (const term of searchResults) {
        const li = document.createElement("li");
        li.innerHTML = `<a target="_blank" href="${term.url}">${term.desc}</a>`;
        searchUl.appendChild(li);
      }
      const matches = searchResults.length;
      if (matches === 0) {
        numberOfMatches.textContent = "No terms found";
      } else if (matches === 1) {
        numberOfMatches.textContent = "1 term found";
      } else {
        numberOfMatches.textContent = `${matches} terms found`;
      }
    });
  }
});

// EDIT BUTTON
function hideButtons() {
  saveBtn.style.display = "none";
  deleteAllBtn.style.display = "none";
  sortEl.style.display = "none";
  searchContainer.style.display = "none";
}
function disableContents() {
  folderContentsSection.classList.add("disabled");
  folderTabs.classList.add("disabled");
}
editBtn.addEventListener("click", () => {
  descEl.value = selectedTerm.desc;
  descEl.focus();
  urlEl.value = selectedTerm.url;
  hideButtons();
  disableContents();
  updateBtn.classList.add("appear");
  cancelBtn.classList.add("appear");
  selectedElement.classList.add("selected");
});

// UPDATE BUTTON
updateBtn.addEventListener("click", () => {
  const desc = descEl.value;
  const url = urlEl.value;
  // Checks if there are values input
  if (!desc || !url) {
    alert("Insert values!");
    return;
  }

  const index = getIndexOfTerm();

  myTerms[index].desc = desc;
  myTerms[index].url = url;

  selectedTerm = myTerms[index];

  updateLocalStorage();
  const target = selectedElement.firstChild;
  target.href = selectedTerm.url;
  target.textContent = selectedTerm.desc;

  clearEditMode();
  popupMessage("Changes saved!");
});

// CANCEL BUTTON
cancelBtn.addEventListener("click", clearEditMode);

function clearEditMode() {
  descEl.value = "";
  urlEl.value = "";
  saveBtn.style.display = "inline-block";
  deleteAllBtn.style.display = "inline-block";
  sortEl.style.display = "inline-block";
  searchContainer.style.display = "inline-block";
  folderContentsSection.classList.remove("disabled");
  folderTabs.classList.remove("disabled");
  updateBtn.classList.remove("appear");
  cancelBtn.classList.remove("appear");
  selectedElement.classList.remove("selected");
}

// MOVE TO BUTTON
moveToBtn.addEventListener("mouseover", showMoveToSubmenu);
moveToBtn.addEventListener("mouseout", hideMoveToSubmenu);
moveToSubmenu.addEventListener("mouseover", showMoveToSubmenu);
moveToSubmenu.addEventListener("mouseout", hideMoveToSubmenu);

function showMoveToSubmenu() {
  moveToSubmenu.style.display = "block"; // first, make it appear (if not, the height will be 0)

  const windowHeight = window.innerHeight;
  const submenuHeight = moveToSubmenu.offsetHeight;
  const movetoMenuPosY =
    dropdownContents.offsetTop + dropdownContents.offsetHeight * 0.3;
  let compensatePos = submenuHeight + movetoMenuPosY - windowHeight;
  if (compensatePos < 0) {
    compensatePos = 0;
  } else {
    compensatePos += 2;
  }
  moveToSubmenu.style.top = 23 - compensatePos + "px";
}

function hideMoveToSubmenu() {
  moveToSubmenu.style.display = "none";
}

// DELETE
deleteBtn.addEventListener("click", deleteTerm);
function deleteTerm() {
  // Remove from the myTerms array and update localStorage
  const index = getIndexOfTerm();
  const deletedTerm = myTerms.splice(index, 1)[0];

  // Remove from the list
  document.getElementById(selectedTerm.type).removeChild(selectedElement);

  updateLocalStorage();
  popupMessage("Term deleted!");
}

// CLOSES DROPDOWN if clicked somewhere else
window.onload = () => {
  document.onclick = (e) => {
    if (
      !e.target.parentElement.classList.contains("dropdown-btn") &&
      e.target.id !== "move-to-btn"
    ) {
      dropdownContents.classList.remove("active");
    }
  };
};

// **************** CLASSES **************** //

// FOLDER CONTENTS SECTION
class FolderContentsSection {
  constructor(type) {
    const ul = document.createElement("ul");
    // const section = document.createElement('section')
    ul.id = type;
    ul.classList.add("content");
    if (type === activeFolderName) {
      ul.classList.add("active");
    }
    folderContentsSection.appendChild(ul);
  }
}

// FOLDER TABS SECTION
class NewFolderButton {
  // + BUTTON
  constructor() {
    const li = document.createElement("li");
    li.id = "new-folder-btn";
    li.textContent = "+";
    li.title = "Add new folder";
    li.addEventListener("click", () => {
      this.createNewSection();
    });

    folderTabs.appendChild(li);
  }

  createNewSection() {
    const name = prompt("Name your new folder").trim().toLowerCase();
    if (!name) {
      alert("Insert a valid name!");
      return; // if empty or cancel, do nothing
    }
    new FolderContentsSection(name);
    new FolderTab(name, true);
    new MoveToSubmenuItem(name);
    myFolders.push(name);

    popupMessage(`"${name.toUpperCase()}" folder created!`);
  }
}

class FolderTab {
  constructor(type, newTab = false) {
    this.li = document.createElement("li");
    this.type = type;
    this.li.dataset.id = this.type;
    this.li.title = "Double click to edit folder name";
    this.li.textContent = this.type.toUpperCase();

    if (activeFolderName === this.type) {
      this.li.classList.add("active");
      currentFolderTab = this.li;
    }
    // If it's a new tab, append it before the +Tab
    if (!newTab) {
      folderTabs.appendChild(this.li);
    } else {
      folderTabs.insertBefore(this.li, folderTabs.lastChild);
      this.setActive();
    }

    this.li.addEventListener("click", () => {
      this.setActive();
    });
    this.li.addEventListener("dblclick", () => {
      this.changeFolderName(this.type);
    });
  }

  setActive() {
    // Deactivate current folder before activating the selected one
    currentFolderTab.classList.remove("active");
    const currentFolderTabId = currentFolderTab.dataset.id;
    document.getElementById(currentFolderTabId).classList.remove("active");

    // Set Selected Folder as Current Folder
    currentFolderTab = this.li;
    currentFolderTab.classList.add("active");
    activeFolderName = currentFolderTab.dataset.id;
    document.getElementById(activeFolderName).classList.add("active");
  }
  changeFolderName(type) {
    const name = prompt("Rename your folder", type.toUpperCase())
      .trim()
      .toLowerCase();
    if (!name) {
      alert("Insert a valid name!");
      return; // if empty or cancel, do nothing
    }

    this.li.textContent = name.toUpperCase();

    myTerms.forEach((term) => {
      if (term.type === type) {
        term.type = name;
      }
    });
    myFolders.forEach((folder, index) => {
      if (folder === type) {
        myFolders[index] = name;
        this.type = name;
      }
    });

    updateLocalStorage();
    popupMessage(`Folder name changed to "${name.toUpperCase()}"`);
  }
}

// MOVE TO SUBMENU ITEMS
class MoveToSubmenuItem {
  constructor(type) {
    this.submenuItem = document.createElement("li");
    this.submenuItem.textContent = type.toUpperCase();

    this.submenuItem.addEventListener("click", () => {
      this.moveTerm(type);
    });

    moveToSubmenu.appendChild(this.submenuItem);
  }

  moveTerm(type) {
    const moveFrom = document.getElementById(selectedTerm.type);
    moveFrom.removeChild(selectedElement);

    const index = getIndexOfTerm();
    myTerms[index].type = type;
    selectedTerm = myTerms[index];

    const moveTo = document.getElementById(selectedTerm.type);
    moveTo.appendChild(selectedElement);

    updateLocalStorage();
    popupMessage(`Term moved to "${type.toUpperCase()}" folder!`);
  }
}

function renderMoveToSubmenuItems() {
  if (!myFolders) return;
  for (const folder of myFolders) {
    new MoveToSubmenuItem(folder);
  }
}

// TERMS
// one dropdown button for each term (list item)
class DropdownButton {
  constructor(element, term) {
    this.btn = document.createElement("button");
    this.btn.classList.add("dropdown-btn");
    this.btn.title = "Options";
    const img = document.createElement("img");
    img.src = "img/menu-vertical.png";
    this.btn.appendChild(img);
    this.btn.addEventListener("click", (e) => {
      this.showDropdown(e);
      this.setSelectedTerm(element, term);
    });
  }

  showDropdown(e) {
    dropdownContents.classList.remove("active");
    dropdownContents.classList.add("active");

    // to prevent dropdown outside window
    const windowHeight = window.innerHeight;
    const dropdownHeight = dropdownContents.offsetHeight;

    let compensatePos = dropdownHeight + e.pageY - windowHeight;
    if (compensatePos < 0) {
      compensatePos = 0;
    } else {
      compensatePos += 2;
    }
    dropdownContents.style.top = e.pageY - compensatePos + "px";
  }

  setSelectedTerm(element, term) {
    selectedTerm = term;
    selectedElement = element;
  }
}

function appendTerm(term) {
  const li = document.createElement("li");
  li.innerHTML = `<a target="_blank" href="${term.url}">${term.desc}</a>`;
  const button = new DropdownButton(li, term).btn;
  li.appendChild(button);
  document.getElementById(term.type).appendChild(li);
}

// Lists the terms in the <ul> and creates a delete button for each <li>
function renderMyTerms() {
  // first, clear all terms from the lists
  const uls = document.querySelectorAll(".content");
  for (const ul of uls) {
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }
  for (const term of myTerms) {
    appendTerm(term);
  }
}

// RENDER FOLDER-RELATED / CONTENT SECTIONS, TABS & MOVE TO SUBMENUES
function renderMyFolders() {
  if (!myFolders) return;

  // Clear all tabs before rendering
  while (folderTabs.firstChild) {
    folderTabs.removeChild(folderTabs.firstChild);
  }

  for (const folder of myFolders) {
    new FolderContentsSection(folder);
    new FolderTab(folder);
    new MoveToSubmenuItem(folder);
  }
  new NewFolderButton();
}

function renderApp() {
  getTermsFromLocalStorage();
  renderMyFolders();
  renderMyTermsByDate();
}
renderApp();
