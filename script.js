// Theme toggle logic
const themeToggleBtn = document.getElementById('toggleTheme');
const body = document.body;

// Load theme from localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark');
  } else {
    body.classList.remove('dark');
  }
}

// Toggle theme and save to localStorage
function toggleTheme() {
  body.classList.toggle('dark');
  if (body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
}

// Responsive: Optional, but ensures theme toggle works on all screen sizes
window.addEventListener('resize', () => {
  // No-op for now, but placeholder for future responsive JS if needed
});

// Event listener
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// Initialize theme on load
loadTheme();

// --- Add Show and Analytics Logic ---
const addBtn = document.getElementById('addBtn');
const titleInput = document.getElementById('titleInput');
const totalEpInput = document.getElementById('totalEpInput');
const categoryInput = document.getElementById('categoryInput');
const showList = document.getElementById('showList');
const statTotal = document.getElementById('stat-total');
const statEpisodes = document.getElementById('stat-episodes');
const statCompleted = document.getElementById('stat-completed');
const statWatching = document.getElementById('stat-watching');
const statHold = document.getElementById('stat-hold');
const statDropped = document.getElementById('stat-dropped');
const statPlan = document.getElementById('stat-plan');

let shows = [];

function updateAnalytics() {
  // Only count shows that are not Dropped
  const validShows = shows.filter(show => show.category !== 'Dropped');
  statTotal.textContent = validShows.length;
  let totalEpisodes = 0;
  validShows.forEach(show => {
    // Only count watched episodes for shows that are not 'Plan to Watch'
    if (show.category !== 'Plan to Watch') {
      totalEpisodes += show.watched || 0;
    }
  });
  statEpisodes.textContent = totalEpisodes;

  // Count by status
  let completed = 0, watching = 0, hold = 0, dropped = 0, plan = 0;
  shows.forEach(show => {
    switch (show.category) {
      case 'Completed': completed++; break;
      case 'Watching': watching++; break;
      case 'On Hold': hold++; break;
      case 'Dropped': dropped++; break;
      case 'Plan to Watch': plan++; break;
    }
  });
  statCompleted.textContent = completed;
  statWatching.textContent = watching;
  statHold.textContent = hold;
  statDropped.textContent = dropped;
  statPlan.textContent = plan;
}

const filterButtons = document.querySelectorAll('.filter');
let currentFilter = 'All';

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.getAttribute('data-cat');
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderShows();
  });
});

function renderShows() {
  showList.innerHTML = '';
  let filteredShows = shows;
  if (currentFilter !== 'All') {
    filteredShows = shows.filter(show => show.category === currentFilter);
  }
  filteredShows.forEach((show, idx) => {
    const card = document.createElement('div');
    card.className = 'show-card';
    card.innerHTML = `<strong>${show.title}</strong><br>Status: <span>${show.category}</span>`;
    if (["Watching", "Plan to Watch", "On Hold"].includes(show.category)) {
      card.innerHTML += '<br>Episodes: ';
      const epCounter = document.createElement('div');
      epCounter.style.display = 'flex';
      epCounter.style.alignItems = 'center';
      epCounter.style.gap = '0.5em';
      const decBtn = document.createElement('button');
      decBtn.textContent = '-';
      decBtn.style.padding = '0.2em 0.7em';
      decBtn.addEventListener('click', () => {
        if (show.watched > 0) {
          show.watched--;
          renderShows();
          updateAnalytics();
        }
      });
      const epDisplay = document.createElement('span');
      epDisplay.textContent = show.watched + ' / ' + show.episodes;
      const incBtn = document.createElement('button');
      incBtn.textContent = '+';
      incBtn.style.padding = '0.2em 0.7em';
      incBtn.addEventListener('click', () => {
        if (show.watched < show.episodes) {
          show.watched++;
          if (show.watched === show.episodes) {
            show.category = 'Completed';
          }
          renderShows();
          updateAnalytics();
        }
      });
      epCounter.appendChild(decBtn);
      epCounter.appendChild(epDisplay);
      epCounter.appendChild(incBtn);
      card.appendChild(epCounter);
    } else {
      card.innerHTML += `<br>Episodes: ${show.episodes}`;
    }
    showList.appendChild(card);
  });
}

function handleAddShow() {
  const title = titleInput.value.trim();
  const episodes = parseInt(totalEpInput.value, 10);
  const category = categoryInput.value;
  if (!title || isNaN(episodes) || episodes < 1) {
    alert('Please enter a valid title and number of episodes.');
    return;
  }
  // If status is Completed, set watched to episodes, else 0
  const watched = (category === 'Completed') ? episodes : 0;
  shows.push({ title, episodes, category, watched });
  renderShows();
  updateAnalytics();
  // Clear inputs
  titleInput.value = '';
  totalEpInput.value = '';
  // Do not reset categoryInput.value so the selected status is preserved
}

if (addBtn) {
  addBtn.addEventListener('click', handleAddShow);
}

// --- Clubs Logic ---
const clubNameInput = document.getElementById('clubNameInput');
const createClubBtn = document.getElementById('createClubBtn');
const clubList = document.getElementById('clubList');
const clubDetails = document.getElementById('clubDetails');
let clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
let clubMembers = JSON.parse(localStorage.getItem('clubMembers') || '{}');
let selectedClubIdx = null;
let clubDescs = JSON.parse(localStorage.getItem('clubDescs') || '{}');
let clubChats = JSON.parse(localStorage.getItem('clubChats') || '{}');

function saveClubDescs() {
  localStorage.setItem('clubDescs', JSON.stringify(clubDescs));
}
function saveClubChats() {
  localStorage.setItem('clubChats', JSON.stringify(clubChats));
}

function renderClubs() {
  clubList.innerHTML = '';
  clubs.forEach((club, idx) => {
    const clubDiv = document.createElement('div');
    clubDiv.textContent = club;
    clubDiv.className = 'club-item';
    clubDiv.style.cursor = 'pointer';
    // Edit club name button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit club name';
    editBtn.style.marginLeft = '8px';
    editBtn.style.background = '#ffd600';
    editBtn.style.color = '#222';
    editBtn.style.border = 'none';
    editBtn.style.borderRadius = '4px';
    editBtn.style.cursor = 'pointer';
    editBtn.style.padding = '0.2em 0.6em';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newName = prompt('Edit club name:', club);
      if (newName && newName.trim() && !clubs.includes(newName.trim())) {
        // Update club name everywhere
        const oldName = clubs[idx];
        clubs[idx] = newName.trim();
        if (clubMembers[oldName]) {
          clubMembers[newName.trim()] = clubMembers[oldName];
          delete clubMembers[oldName];
        }
        if (clubDescs[oldName]) {
          clubDescs[newName.trim()] = clubDescs[oldName];
          delete clubDescs[oldName];
        }
        if (clubChats[oldName]) {
          clubChats[newName.trim()] = clubChats[oldName];
          delete clubChats[oldName];
        }
        saveClubs(); saveClubMembers(); saveClubDescs(); saveClubChats();
        renderClubs();
        if (selectedClubIdx === idx) {
          renderClubDetails();
        }
      }
    });
    // Add delete button
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.style.marginLeft = '8px';
    delBtn.style.background = '#e53935';
    delBtn.style.color = 'white';
    delBtn.style.border = 'none';
    delBtn.style.borderRadius = '4px';
    delBtn.style.cursor = 'pointer';
    delBtn.style.padding = '0.2em 0.6em';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const oldName = clubs[idx];
      clubs.splice(idx, 1);
      delete clubMembers[oldName];
      delete clubDescs[oldName];
      delete clubChats[oldName];
      saveClubs(); saveClubMembers(); saveClubDescs(); saveClubChats();
      renderClubs();
      renderClubDetails();
    });
    clubDiv.appendChild(editBtn);
    clubDiv.appendChild(delBtn);
    clubDiv.addEventListener('click', () => {
      selectedClubIdx = idx;
      renderClubDetails();
    });
    clubList.appendChild(clubDiv);
  });
}

function saveClubs() {
  localStorage.setItem('clubs', JSON.stringify(clubs));
}

function saveClubMembers() {
  try {
    localStorage.setItem('clubMembers', JSON.stringify(clubMembers));
    console.log('clubMembers saved to localStorage successfully.');
  } catch (e) {
    console.error('Error saving clubMembers to localStorage:', e);
  }
}

function handleAddClub() {
  const name = clubNameInput.value.trim();
  if (!name) {
    alert('Please enter a club name.');
    return;
  }
  clubs.push(name);
  saveClubs();
  renderClubs();
  clubNameInput.value = '';
}

function renderClubDetails() {
  console.log('renderClubDetails started for club:', clubs[selectedClubIdx]);
  if (selectedClubIdx === null || !clubs[selectedClubIdx]) {
    clubDetails.innerHTML = '<em>Select a club to see details.</em>';
    console.log('renderClubDetails: No club selected or invalid club.');
    return;
  }

  const club = clubs[selectedClubIdx];
  if (!clubMembers[club]) clubMembers[club] = [];
  if (!clubDescs[club]) clubDescs[club] = '';
  if (!clubChats[club]) clubChats[club] = [];

  // Clear existing content to prevent duplicate event listeners and elements
  clubDetails.innerHTML = '';

  // Club name and edit
  const clubNameSection = document.createElement('div');
  clubNameSection.innerHTML = `<strong>${club}</strong> <button id="editDescBtn" style="background:#ffd600;color:#222;border:none;border-radius:4px;cursor:pointer;padding:0.1em 0.5em;">Edit Description</button><br>`;
  clubDetails.appendChild(clubNameSection);

  // Club description
  const descDiv = document.createElement('div');
  descDiv.style.margin = '0.5em 0';
  descDiv.innerHTML = `<em>${clubDescs[club] || 'No description yet.'}</em>`;
  clubDetails.appendChild(descDiv);

  // Edit description logic
  const editDescBtn = clubNameSection.querySelector('#editDescBtn');
  if (editDescBtn) {
    editDescBtn.addEventListener('click', () => {
      const newDesc = prompt('Edit club description:', clubDescs[club] || '');
      if (newDesc !== null) {
        clubDescs[club] = newDesc;
        saveClubDescs();
        renderClubDetails();
      }
    });
  }

  // Invite link
  const inviteDiv = document.createElement('div');
  inviteDiv.style.margin = '0.5em 0';
  const inviteBtn = document.createElement('button');
  inviteBtn.textContent = 'Copy Invite Link';
  inviteBtn.style.background = '#6200ea';
  inviteBtn.style.color = 'white';
  inviteBtn.style.border = 'none';
  inviteBtn.style.borderRadius = '4px';
  inviteBtn.style.cursor = 'pointer';
  inviteBtn.style.padding = '0.2em 0.8em';
  inviteBtn.addEventListener('click', () => {
    const dummyLink = `${window.location.origin}/join-club/${encodeURIComponent(club)}`;
    navigator.clipboard.writeText(dummyLink).then(() => {
      inviteBtn.textContent = 'Copied!';
      setTimeout(() => { inviteBtn.textContent = 'Copy Invite Link'; }, 1200);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      inviteBtn.textContent = 'Copy (Failed)';
      setTimeout(() => { inviteBtn.textContent = 'Copy Invite Link'; }, 2000);
    });
    // Display the link on the page for visibility
    const linkDisplay = document.createElement('input');
    linkDisplay.type = 'text';
    linkDisplay.value = dummyLink;
    linkDisplay.readOnly = true;
    linkDisplay.style.width = '100%';
    linkDisplay.style.marginTop = '0.5em';
    linkDisplay.style.background = '#f0f0f0';
    linkDisplay.style.border = '1px solid #ccc';
    linkDisplay.style.padding = '0.5em';
    linkDisplay.style.borderRadius = '4px';
    // Remove any previous link display before adding a new one
    const existingLinkDisplay = inviteDiv.querySelector('input[type="text"]');
    if (existingLinkDisplay) {
      existingLinkDisplay.remove();
    }
    inviteDiv.appendChild(linkDisplay);
    linkDisplay.select(); // Select the text for easy manual copying
  });
  inviteDiv.appendChild(inviteBtn);
  clubDetails.appendChild(inviteDiv);

  // Members section
  const membersSection = document.createElement('div');
  membersSection.innerHTML = 'Members:';
  
  // Add member form - move to before member list
  const addMemberDiv = document.createElement('div');
  addMemberDiv.style.marginTop = '0.5em';
  const memberInput = document.createElement('input');
  memberInput.type = 'text';
  memberInput.placeholder = 'Add member name';
  memberInput.style.marginRight = '0.5em';
  memberInput.id = 'memberInput'; // Add ID for easier selection
  const addMemberBtn = document.createElement('button');
  addMemberBtn.id = 'addMemberButton'; // Assigning a unique ID
  addMemberBtn.textContent = 'Add Member';
  addMemberBtn.style.background = '#6200ea';
  addMemberBtn.style.color = 'white';
  addMemberBtn.style.border = 'none';
  addMemberBtn.style.borderRadius = '4px';
  addMemberBtn.style.cursor = 'pointer';
  addMemberBtn.style.padding = '0.2em 0.8em';
  // Event listener moved to delegation below
  addMemberDiv.appendChild(memberInput);
  addMemberDiv.appendChild(addMemberBtn);
  membersSection.appendChild(addMemberDiv);

  const memberList = document.createElement('ul');
  clubMembers[club].forEach((member, i) => {
    console.log('Rendering member:', member);
    const li = document.createElement('li');
    li.textContent = member;
    // Remove member button
    const rmBtn = document.createElement('button');
    rmBtn.textContent = 'Remove';
    rmBtn.style.marginLeft = '8px';
    rmBtn.style.background = '#e53935';
    rmBtn.style.color = 'white';
    rmBtn.style.border = 'none';
    rmBtn.style.borderRadius = '4px';
    rmBtn.style.cursor = 'pointer';
    rmBtn.style.padding = '0.1em 0.5em';
    rmBtn.addEventListener('click', () => {
      clubMembers[club].splice(i, 1);
      saveClubMembers();
      renderClubDetails();
    });
    li.appendChild(rmBtn);
    memberList.appendChild(li);
  });
  membersSection.appendChild(memberList);
  clubDetails.appendChild(membersSection);

  // Event delegation for the add member button
  clubDetails.removeEventListener('click', handleClubDetailsClick); // Remove existing to prevent duplicates
  clubDetails.addEventListener('click', handleClubDetailsClick);

  function handleClubDetailsClick(event) {
    if (event.target.id === 'addMemberButton') {
      const memberInputElem = document.getElementById('memberInput');
      if (!memberInputElem) {
        console.error('memberInput element not found!');
        return;
      }
      console.log('Add Member button clicked!');
      const nameValue = memberInputElem.value; // Get value before trim
      console.log('Raw member input value:', nameValue);
      const name = nameValue.trim();
      console.log('Attempting to add member:', name);
      if (!name) {
        console.log('No name entered, returning.');
        return;
      }
      const currentClub = clubs[selectedClubIdx];
      if (!clubMembers[currentClub]) {
        clubMembers[currentClub] = [];
      }
      console.log('Current club:', currentClub);
      console.log('clubMembers before push:', JSON.stringify(clubMembers[currentClub]));
      clubMembers[currentClub].push(name);
      console.log('clubMembers after push:', JSON.stringify(clubMembers[currentClub]));
      saveClubMembers();
      renderClubDetails();
      memberInputElem.value = ''; // Clear the input field after adding
      console.log('Member added and details re-rendered.');
    }
  }

  // Club chat
  const chatSection = document.createElement('div');
  chatSection.innerHTML = '<br><strong>Club Chat:</strong>';
  const chatDiv = document.createElement('div');
  chatDiv.style.maxHeight = '120px';
  chatDiv.style.overflowY = 'auto';
  chatDiv.style.background = '#f3e8ff';
  chatDiv.style.padding = '0.5em';
  chatDiv.style.margin = '0.5em 0';
  chatDiv.style.borderRadius = '6px';
  clubChats[club].forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = msg;
    msgDiv.style.marginBottom = '0.2em';
    chatDiv.appendChild(msgDiv);
  });
  chatSection.appendChild(chatDiv);

  // Chat input
  const chatInputDiv = document.createElement('div');
  chatInputDiv.style.display = 'flex';
  chatInputDiv.style.gap = '0.5em';
  const chatInput = document.createElement('input');
  chatInput.type = 'text';
  chatInput.placeholder = 'Type a message...';
  chatInput.style.flex = '1';
  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';
  sendBtn.style.background = '#6200ea';
  sendBtn.style.color = 'white';
  sendBtn.style.border = 'none';
  sendBtn.style.borderRadius = '4px';
  sendBtn.style.cursor = 'pointer';
  sendBtn.style.padding = '0.2em 0.8em';
  sendBtn.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    clubChats[club].push(msg);
    saveClubChats();
    renderClubDetails();
    chatInput.value = '';
  });
  chatInputDiv.appendChild(chatInput);
  chatInputDiv.appendChild(sendBtn);
  chatSection.appendChild(chatInputDiv);
  clubDetails.appendChild(chatSection);
  console.log('renderClubDetails finished.');
}

if (createClubBtn) {
  createClubBtn.addEventListener('click', handleAddClub);
}

// Render clubs and details on page load
renderClubs();
renderClubDetails();

// --- Get Recommendations Logic ---
const getRecoBtn = document.getElementById('getReco');
const recoList = document.getElementById('recoList');

const popularAnime = [
  'Attack on Titan',
  'Demon Slayer',
  'My Hero Academia',
  'One Piece',
  'Naruto',
  'Jujutsu Kaisen',
  'Fullmetal Alchemist: Brotherhood',
  'Death Note',
  'Spy x Family',
  'Chainsaw Man'
];
const mightLikeAnime = [
  'Mob Psycho 100',
  'Violet Evergarden',
  'Steins;Gate',
  'Your Lie in April',
  'Haikyuu!!',
  'Kaguya-sama: Love is War',
  'Re:Zero',
  'Dr. Stone',
  'The Promised Neverland',
  'Made in Abyss'
];

function getRecommendations() {
  recoList.innerHTML = '';
  // Show 5 popular and 3 might like (randomized)
  const shuffledPopular = popularAnime.sort(() => 0.5 - Math.random());
  const shuffledMight = mightLikeAnime.sort(() => 0.5 - Math.random());
  const recos = [
    { label: 'Popular Anime', items: shuffledPopular.slice(0, 5) },
    { label: 'You Might Like', items: shuffledMight.slice(0, 3) }
  ];
  recos.forEach(group => {
    const groupTitle = document.createElement('li');
    groupTitle.textContent = group.label + ':';
    groupTitle.style.fontWeight = 'bold';
    recoList.appendChild(groupTitle);
    group.items.forEach(anime => {
      const li = document.createElement('li');
      li.textContent = anime;
      recoList.appendChild(li);
    });
  });
}

if (getRecoBtn) {
  getRecoBtn.addEventListener('click', getRecommendations);
} 