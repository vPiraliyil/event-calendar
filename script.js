const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

// Event array to hold all events
let events = JSON.parse(localStorage.getItem('events')) || []; // Load events from localStorage or start with an empty array

let currentDate = new Date();
let selectedDateStr = '';
let isEditing = false;
let editingEventIndex = null;

// Get form and button elements
const eventList = document.getElementById('event-list');
const addEventButton = document.getElementById('add-event-button');
const eventForm = document.getElementById('event-form');
const eventDateInput = document.getElementById('event-date');
const eventDescriptionInput = document.getElementById('event-description');
const saveEventButton = document.getElementById('save-event-button');
const cancelEventButton = document.getElementById('cancel-event-button');
const eventFormTitle = document.getElementById('event-form-title');

let lastSelectedDateElement = null; // Track the last clicked date element

// Utility function to save events array to localStorage
const saveEventsToLocalStorage = () => {
    localStorage.setItem('events', JSON.stringify(events));
};

// Function to add blank days for layout alignment
const addBlankDays = (count) => {
    let blankHTML = '';
    for (let i = 0; i < count; i++) {
        blankHTML += `<div class="date inactive"></div>`;
    }
    return blankHTML;
};

// Function to update the calendar
const updateCalendar = () => {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthYearElement.textContent = monthYearString;

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    let datesHTML = addBlankDays(firstDayIndex);

    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = date.toISOString().split('T')[0];
        const eventCount = events.filter(event => event.date === dateStr).length;
        const isToday = date.toDateString() === new Date().toDateString();

        datesHTML += `<div class="date ${isToday ? 'active' : ''}" onclick="selectDate('${dateStr}', this)">
                        <span class="day-number">${day}</span>
                        ${eventCount > 0 ? `<span class="event-count">${eventCount}</span>` : ''}
                      </div>`;
    }

    const remainingDays = (7 - (firstDayIndex + totalDays) % 7) % 7;
    datesHTML += addBlankDays(remainingDays);
    datesElement.innerHTML = datesHTML;
};

// Display events for selected date
const displayEvents = (dateStr) => {
    selectedDateStr = dateStr;
    eventList.innerHTML = '';

    const dayEvents = events.filter(event => event.date === dateStr);
    dayEvents.forEach((event, index) => {
        const eventItem = document.createElement('div');
        eventItem.classList.add('event-item');

        // Add content for event item and delete button
        eventItem.innerHTML = `
            <span>${event.time} - ${event.description}</span>
            <button class="delete-event-button">Delete</button>
        `;

        // Add click event to edit the event when clicking on the event item
        eventItem.addEventListener('click', () => editEvent(event, index));

        // Get the delete button and add an event listener for deletion
        const deleteButton = eventItem.querySelector('.delete-event-button');
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents triggering the edit function
            deleteEvent(index, dateStr);
        });

        eventList.appendChild(eventItem);
    });
};

// Toggle the event form for adding/editing events
const toggleEventForm = (show, edit = false) => {
    eventForm.classList.toggle('hidden', !show);
    addEventButton.classList.toggle('hidden', show);
    isEditing = edit;

    // Set the form title based on whether we are adding or editing
    eventFormTitle.textContent = edit ? 'Edit Event' : 'Add Event';

    if (show && !edit) {
        // Set default date and time to the selected date at 12:00
        eventDateInput.value = `${selectedDateStr}T12:00`;
        eventDescriptionInput.value = '';
    }
};

// Save new or edited event
const saveEvent = () => {
    const newDateStr = eventDateInput.value.split("T")[0];
    const time = new Date(eventDateInput.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const description = eventDescriptionInput.value.trim();

    if (!description) {
        alert("Please enter a description.");
        return;
    }

    if (isEditing) {
        // Update the event in the array
        events[editingEventIndex] = { date: newDateStr, time, description };
    } else {
        // Add a new event
        events.push({ date: newDateStr, time, description });
    }

    saveEventsToLocalStorage(); // Save updated events to localStorage
    updateCalendar();
    displayEvents(newDateStr);
    toggleEventForm(false);
    selectedDateStr = newDateStr; // Update the selected date to the new date if changed
};

// Delete an event
const deleteEvent = (index, dateStr) => {
    if (confirm("Are you sure you want to delete this event?")) {
        const dayEvents = events.filter(event => event.date === dateStr);
        const eventToDelete = dayEvents[index];
        const eventIndex = events.indexOf(eventToDelete);
        events.splice(eventIndex, 1); // Remove event from main events array
        saveEventsToLocalStorage(); // Save updated events to localStorage
        updateCalendar();
        displayEvents(dateStr);
    }
};

// Edit an existing event
const editEvent = (event, index) => {
    eventDateInput.value = `${event.date}T${event.time}`;
    eventDescriptionInput.value = event.description;
    editingEventIndex = events.indexOf(event);
    toggleEventForm(true, true);
};

// Select date and display events for that day
function selectDate(dateStr, element) {
    displayEvents(dateStr);
    toggleEventForm(false); // Hide the form if visible

    // Highlight the selected date
    if (lastSelectedDateElement) {
        lastSelectedDateElement.classList.remove('selected');
    }
    element.classList.add('selected');
    lastSelectedDateElement = element;
}

// Event listeners for adding, saving, and canceling events
addEventButton.addEventListener('click', () => toggleEventForm(true));
saveEventButton.addEventListener('click', saveEvent);
cancelEventButton.addEventListener('click', () => toggleEventForm(false));

// Navigation event listeners
prevButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// Initial calendar load
updateCalendar();
