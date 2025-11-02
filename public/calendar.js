document.addEventListener('DOMContentLoaded', function () {
    console.log('Calendar script loaded');

    // --- Application State (Accessible globally within this function) ---
    // The current month being displayed on the calendar
    let currentMonth = new Date();
    // A map to quickly look up appointments by date (YYYY-MM-DD)
    let appointments = {};
    // Unique ID used for the Local Storage key to separate data
    const userId = crypto.randomUUID();
    const APPOINTMENTS_STORAGE_KEY = `calendar_appointments_${userId}`;

    // The central, mutable array that holds all appointment objects
    let allAppointmentsData = [];

    // --- Local Storage Persistence Functions ---

    /** Saves the current central state array (allAppointmentsData) to Local Storage. */
    function saveAppointmentsToLS() {
        try {
            localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(allAppointmentsData));
        } catch (e) {
            console.error("Error saving to Local Storage:", e);
        }
    }

    /** Loads appointments from Local Storage into the central state array. */
    function loadAppointmentsFromLS() {
        const storedData = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        if (storedData) {
            try {
                allAppointmentsData = JSON.parse(storedData);
            } catch (e) {
                console.error("Error parsing Local Storage data, using mock data.", e);
                allAppointmentsData = generateInitialMockData();
            }
        } else {
            // If LS is empty, use mock data as seed and save it
            allAppointmentsData = generateInitialMockData();
        }
        // Ensure data is saved after loading/resetting it
        saveAppointmentsToLS();
    }

    // --- API Endpoint Placeholders (for future use) ---
    /*
    // If you want to switch back to an API, you would:
    // 1. Re-define the BASE_URL and other endpoint constants here.
    // 2. Re-introduce the fetchWithBackoff utility function.
    // 3. Replace the logic in loadData(), scheduleAppointment(), and deleteAppointment()
    //    with your API calls (GET, POST, DELETE) instead of Local Storage calls.
    */

    // --- Utility Functions ---

    /** Shows/hides the loading indicator */
    function toggleLoading(show) {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.classList.toggle('hidden', !show);
        }
    }

    /** Formats a Date object into YYYY-MM-DD string */
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /** Clears the calendar grid and updates the header */
    function clearCalendar() {
        const monthYearDisplay = document.getElementById('month-year-display');
        if (monthYearDisplay) {
            monthYearDisplay.textContent = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
        const calendarGrid = document.getElementById('calendar-grid');
        if (calendarGrid) {
            calendarGrid.innerHTML = '';
        }
    }

    /** Converts the allAppointmentsData array into the 'appointments' map keyed by date */
    function processAppointments() {
        const newAppointments = {};
        allAppointmentsData.forEach(data => {
            const dateKey = data.date;
            if (!newAppointments[dateKey]) {
                newAppointments[dateKey] = [];
            }
            newAppointments[dateKey].push({
                id: data.id,
                title: data.title,
                time: data.time
            });
        });

        // Sort appointments by time
        for (const date in newAppointments) {
            newAppointments[date].sort((a, b) => (a.time > b.time) ? 1 : -1);
        }
        appointments = newAppointments;
        renderCalendar();
    }

    /** Renders the calendar grid for the currentMonth state (made globally accessible) */
    window.renderCalendar = function () {
        clearCalendar();
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const today = new Date();
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return; // Prevent errors if running before DOM is fully ready

        // Find the day of the week for the 1st of the month (0=Sun, 6=Sat)
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        // Get the total number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 1. Fill leading empty cells
        for (let i = 0; i < firstDayOfMonth; i++) {
            const cell = document.createElement('div');
            cell.className = 'p-1 appointment-cell border-b border-r';
            calendarGrid.appendChild(cell);
        }

        // 2. Fill date cells
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = formatDate(date);

            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

            const cell = document.createElement('div');
            cell.className = `p-1 appointment-cell border-b border-r ${date.getDay() === 0 ? 'border-l' : ''} ${isToday ? 'today' : 'hover:bg-gray-50 transition'}`;
            cell.setAttribute('data-date', dateKey);

            const dateNumDiv = document.createElement('div');
            dateNumDiv.className = 'date-number';
            dateNumDiv.onclick = () => window.openModal(dateKey); // Use window scope for global functions

            const dateSpan = document.createElement('span');
            dateSpan.textContent = day;
            dateSpan.className = isToday ? 'today-num' : '';
            dateNumDiv.appendChild(dateSpan);
            cell.appendChild(dateNumDiv);

            cell.className += 'date-number';
            cell.onclick = () => window.openModal(dateKey); // Use window scope for global functions

            // 3. Render appointments for this date
            const dayAppointments = appointments[dateKey] || [];
            dayAppointments.forEach(appt => {
                const apptDiv = document.createElement('div');
                apptDiv.className = 'appointment flex justify-between items-center group';
                // Note: The delete button uses a globally defined function (window.deleteAppointment)
                apptDiv.innerHTML = `
                    <span title="${appt.title} at ${appt.time}">${appt.time} - ${appt.title}</span>
                    <button class="text-xs ml-2 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-500" title="Delete Appointment" onclick="window.deleteAppointment('${appt.id}')">
                       <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                `;
                cell.appendChild(apptDiv);
            });

            calendarGrid.appendChild(cell);
        }

        // 4. Fill trailing empty cells
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < remainingCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'p-1 appointment-cell border-b border-r';
            calendarGrid.appendChild(cell);
        }
    }

    /** Change the calendar month by offset (e.g., -1 for prev, 1 for next) (made globally accessible) */
    window.changeMonth = function (offset) {
        currentMonth.setMonth(currentMonth.getMonth() + offset);
        window.renderCalendar();
    }

    /** Reset calendar view to the current month/day and triggers a data refresh (made globally accessible) */
    window.goToToday = function () {
        currentMonth = new Date();
        window.renderCalendar();
        loadData();
    }

    /** Shows the appointment modal (made globally accessible) */
    window.openModal = function (dateKey) {
        const dateObj = new Date(dateKey + 'T00:00:00');
        const readableDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });

        const modalDateDisplay = document.getElementById('modal-date-display');
        const appointmentDateInput = document.getElementById('appointment-date-input');

        if (modalDateDisplay) modalDateDisplay.textContent = readableDate;
        if (appointmentDateInput) appointmentDateInput.value = dateKey;

        const modal = document.getElementById('appointment-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    /** Closes the appointment modal (made globally accessible) */
    window.closeModal = function (event) {
        // Allows closing by clicking the backdrop
        if (event && event.target.id !== 'appointment-modal') return;

        const modal = document.getElementById('appointment-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    /** Sets up the application */
    function appSetup() {
        const userIdDisplay = document.getElementById('user-id-display');
        if (userIdDisplay) userIdDisplay.textContent = userId;

        const appointmentForm = document.getElementById('appointment-form');
        if (appointmentForm) {
            appointmentForm.addEventListener('submit', scheduleAppointment);
        }
    }

    /** Fetches appointments from Local Storage (renamed from loadAppointments) */
    function loadData() {
        toggleLoading(true);

        try {
            // 1. Load the data into the central state array
            loadAppointmentsFromLS();

            // 2. Process the data to update the 'appointments' map and re-render the calendar
            processAppointments();

            console.log(`Data Load successful from Local Storage. Loaded ${allAppointmentsData.length} appointments.`);

        } catch (error) {
            console.error('Local Storage load failure:', error);
        } finally {
            toggleLoading(false);
        }
    }

    /** Handles form submission to save a new appointment to Local Storage */
    async function scheduleAppointment(e) {
        e.preventDefault();
        toggleLoading(true);

        const date = document.getElementById('appointment-date-input').value;
        const title = document.getElementById('title').value.trim();
        const time = document.getElementById('time').value;

        if (!date || !title || !time) {
            console.error("Missing required form data.");
            toggleLoading(false);
            return;
        }

        const appointmentData = {
            date: date,
            title: title,
            time: time,
            id: crypto.randomUUID(),
            userId: userId,
            createdAt: new Date().toISOString()
        };

        try {
            // --- API POST Placeholder ---
            /* // Replace the following three lines with your API POST request:
            // const url = `${BASE_URL}${APPOINTMENTS_ENDPOINT}`;
            // const response = await fetchWithBackoff(url, { method: 'POST', body: JSON.stringify(appointmentData), ... });
            // if (response.ok) { await loadData(); } else { // Handle API error }
            */
            // ---------------------------

            // Local Storage: Add to central state array
            allAppointmentsData.push(appointmentData);

            // Local Storage: Save and reload
            saveAppointmentsToLS();
            loadData();

            console.log(`Appointment scheduled for ${date} at ${time}. Saved to Local Storage.`);

            // Reset and close modal
            const form = document.getElementById('appointment-form');
            if (form) form.reset();
            window.closeModal();
        } catch (error) {
            console.error('Scheduling failure:', error);
        } finally {
            toggleLoading(false);
        }
    }

    /** Deletes an appointment from Local Storage (made globally accessible) */
    window.deleteAppointment = async function (docId) {
        // event.stopPropagation() should be handled by the button's inline onclick if needed.

        console.log(`Attempting to delete appointment ID: ${docId}`);
        toggleLoading(true);

        try {
            // --- API DELETE Placeholder ---
            /*
            // Replace the following four lines with your API DELETE request:
            // const url = `${BASE_URL}${DELETE_ENDPOINT(docId)}`;
            // const response = await fetchWithBackoff(url, { method: 'DELETE', ... });
            // if (response.ok) { await loadData(); } else { // Handle API error }
            */
            // ---------------------------

            // Local Storage: Remove from central state array
            const index = allAppointmentsData.findIndex(appt => appt.id === docId);
            if (index > -1) {
                allAppointmentsData.splice(index, 1);
            }

            // Local Storage: Save and reload
            saveAppointmentsToLS();
            loadData();

            console.log(`Appointment ${docId} deleted successfully from Local Storage.`);

        } catch (error) {
            console.error('Deletion failure:', error);
        } finally {
            toggleLoading(false);
        }
    }

    // --- INITIAL MOCK DATA (Only used as a seed if Local Storage is empty) ---
    function generateInitialMockData() {
        const today = new Date();
        return [
            { id: crypto.randomUUID(), date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)), title: 'Client Meeting', time: '14:30', userId: userId },
            { id: crypto.randomUUID(), date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12)), title: 'Team Sync', time: '09:00', userId: userId },
            { id: crypto.randomUUID(), date: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12)), title: 'Gym Time', time: '19:00', userId: userId },
            { id: crypto.randomUUID(), date: formatDate(today), title: 'Presentation Prep', time: '10:00', userId: userId },
        ];
    }


    // --- Initialization ---

    // The previous window.onload was replaced by DOMContentLoaded. 
    // This is the core function call that starts the app after the DOM is ready.
    appSetup();
    loadData();

    // To handle the case where the script is loaded but the user clicks a tab/panel later:
    // This part assumes your panel has an ID like 'appointments-panel' or similar 
    // and you want to ensure the calendar is rendered when that panel becomes active.
    // If your environment handles this automatically, you can ignore this listener.
    const panelElement = document.getElementById('appointments-panel');
    if (panelElement) {
        panelElement.addEventListener('click', function () {
            console.log('Appointments panel active, re-rendering calendar.');
            loadData(); // Ensure latest data and render
        });
    }

});
