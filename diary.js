document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const entryContent = document.getElementById('entry-content');
    const entryTitle = document.getElementById('entry-title');
    const moodOptions = document.querySelectorAll('.mood-option');
    const saveButton = document.getElementById('save-entry');
    const entriesList = document.getElementById('entries-list');
    const totalEntriesEl = document.getElementById('total-entries');
    const monthlyEntriesEl = document.getElementById('monthly-entries');
    const commonMoodEl = document.getElementById('common-mood');
    const entryCountEl = document.querySelector('.entry-count');
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthEl = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const selectedDateEl = document.getElementById('selected-date');
    const dayEntriesList = document.getElementById('day-entries-list');

    // App State
    let selectedMood = '';
    let currentDate = new Date();
    let selectedDate = null;

    // Initialize app
    function init() {
        loadEntries();
        renderCalendar();
        updateDashboardStats();
        setupEventListeners();
    }

    // Navigation
    function setupEventListeners() {
        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const targetPage = item.getAttribute('data-page');
                pages.forEach(page => {
                    page.classList.remove('active');
                    if (page.id === targetPage) {
                        page.classList.add('active');
                    }
                });
            });
        });

        // Mood Selection
        moodOptions.forEach(option => {
            option.addEventListener('click', () => {
                moodOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedMood = option.getAttribute('data-mood');
            });
        });

        // Save Entry
        saveButton.addEventListener('click', saveEntry);

        // Calendar Navigation
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Load entries from localStorage
    function loadEntries() {
        const entries = getEntries();
        renderEntriesList(entries, entriesList);
        updateDashboardStats();
    }

    // Get entries from localStorage
    function getEntries() {
        return JSON.parse(localStorage.getItem('diaryEntries') || '[]');
    }

    // Update entries in localStorage
    function updateEntries(entries) {
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
    }

    // Save an entry
    function saveEntry() {
        const title = entryTitle.value.trim();
        const content = entryContent.value.trim();
        const mood = selectedMood;

        if (!title || !content) {
            alert('Please enter both a title and content for your diary entry');
            return;
        }

        const entry = {
            id: Date.now(),
            title,
            content,
            mood,
            date: new Date().toISOString()
        };

        // Retrieve existing entries
        const entries = getEntries();
        entries.unshift(entry);
        updateEntries(entries);

        // Clear form
        entryTitle.value = '';
        entryContent.value = '';
        moodOptions.forEach(o => o.classList.remove('selected'));
        selectedMood = '';

        // Re-render entries and update stats
        loadEntries();
        renderCalendar();

        // Show success message
        alert('Entry saved successfully!');

        // Navigate to dashboard
        document.querySelector('[data-page="dashboard"]').click();
    }

    // Render entries list
    function renderEntriesList(entries, container) {
        container.innerHTML = '';

        if (entries.length === 0) {
            container.innerHTML = '<p class="empty-state">No entries yet. Start writing!</p>';
            return;
        }

        entries.forEach(entry => {
            const entryDate = new Date(entry.date);
            const formattedDate = formatDate(entryDate);
            
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('entry');
            
            let moodEmoji = '';
            switch(entry.mood) {
                case 'happy': moodEmoji = '😊'; break;
                case 'sad': moodEmoji = '😢'; break;
                case 'excited': moodEmoji = '🎉'; break;
                case 'calm': moodEmoji = '😌'; break;
                case 'angry': moodEmoji = '😠'; break;
                default: moodEmoji = '';
            }

            entryDiv.innerHTML = `
                <div class="entry-header">
                    <div class="entry-title">${entry.title}</div>
                    <div class="entry-date">${formattedDate}</div>
                </div>
                <div class="entry-details">
                    <span class="entry-mood">${moodEmoji}</span>
                    <span>${entry.mood ? entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1) : 'No mood'}</span>
                </div>
                <div class="entry-content">${entry.content}</div>
            `;
            
            container.appendChild(entryDiv);
        });
    }

    // Update dashboard statistics
    function updateDashboardStats() {
        const entries = getEntries();
        
        // Total entries
        totalEntriesEl.textContent = entries.length;
        entryCountEl.textContent = `You have ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} in your diary`;
        
        // Entries this month
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const monthlyEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getMonth() === thisMonth && entryDate.getFullYear() === thisYear;
        });
        
        monthlyEntriesEl.textContent = monthlyEntries.length;
        
        // Most common mood
        if (entries.length > 0) {
            const moodCounts = {};
            entries.forEach(entry => {
                if (entry.mood) {
                    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
                }
            });
            
            let maxCount = 0;
            let commonMood = '';
            
            for (const mood in moodCounts) {
                if (moodCounts[mood] > maxCount) {
                    maxCount = moodCounts[mood];
                    commonMood = mood;
                }
            }
            
            if (commonMood) {
                let moodEmoji = '';
                switch(commonMood) {
                    case 'happy': moodEmoji = '😊'; break;
                    case 'sad': moodEmoji = '😢'; break;
                    case 'excited': moodEmoji = '🎉'; break;
                    case 'calm': moodEmoji = '😌'; break;
                    case 'angry': moodEmoji = '😠'; break;
                }
                commonMoodEl.textContent = `${moodEmoji} ${commonMood.charAt(0).toUpperCase() + commonMood.slice(1)}`;
            } else {
                commonMoodEl.textContent = 'No data';
            }
        } else {
            commonMoodEl.textContent = 'No data';
        }
    }

    // Calendar functions
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update header
        currentMonthEl.textContent = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Clear calendar
        calendarDays.innerHTML = '';
        
        // Get entries for highlighting days with entries
        const entries = getEntries();
        const daysWithEntries = new Set();
        
        entries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate.getMonth() === month && entryDate.getFullYear() === year) {
                daysWithEntries.add(entryDate.getDate());
            }
        });
        
        // Add empty cells for days before first of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day');
            calendarDays.appendChild(emptyDay);
        }
        
        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.classList.add('calendar-day');
            
            if (daysWithEntries.has(day)) {
                dayEl.classList.add('has-entries');
            }
            
            dayEl.innerHTML = `<div class="calendar-day-number">${day}</div>`;
            
            // Check if this is today
            const today = new Date();
            if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
                dayEl.style.backgroundColor = 'rgba(253, 121, 168, 0.1)';
                dayEl.style.fontWeight = 'bold';
            }
            
            // Add click handler
            dayEl.addEventListener('click', () => {
                // Remove selected class from all days
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                
                // Add selected class to clicked day
                dayEl.classList.add('selected');
                
                // Set selected date
                selectedDate = new Date(year, month, day);
                
                // Update selected date display
                selectedDateEl.textContent = formatDate(selectedDate);
                
                // Show entries for that day
                showEntriesForDay(selectedDate);
            });
            
            calendarDays.appendChild(dayEl);
        }
    }

    // Show entries for a specific day
    function showEntriesForDay(date) {
        const entries = getEntries();
        
        const dayEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return (
                entryDate.getDate() === date.getDate() &&
                entryDate.getMonth() === date.getMonth() &&
                entryDate.getFullYear() === date.getFullYear()
            );
        });
        
        renderEntriesList(dayEntries, dayEntriesList);
        
        if (dayEntries.length === 0) {
            dayEntriesList.innerHTML = '<p class="empty-state">No entries for this day.</p>';
        }
    }

    // Helper function to format date
    function formatDate(date) {
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    }

    // Initialize the app
    init();
});