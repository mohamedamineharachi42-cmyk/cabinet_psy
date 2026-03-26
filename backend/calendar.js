# Add content to calendar.js
@"
// Calendar functionality for appointments
class AppointmentCalendar {
    constructor() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.init();
    }
    
    init() {
        console.log('Calendar initialized');
        
        // Initialize flatpickr if available
        if (typeof flatpickr !== 'undefined') {
            flatpickr("#calendar", {
                locale: "fr",
                minDate: "today",
                maxDate: new Date().fp_incr(30),
                dateFormat: "Y-m-d",
                onChange: (selectedDates, dateStr) => {
                    this.selectedDate = dateStr;
                    this.loadTimeSlots();
                }
            });
        }
        
        // Add event listeners for time slots
        this.loadTimeSlots();
    }
    
    loadTimeSlots() {
        const slotsGrid = document.getElementById('slotsGrid');
        if (!slotsGrid) return;
        
        // Generate time slots (9h-20h)
        const slots = [];
        for (let hour = 9; hour <= 19; hour++) {
            slots.push(`${hour}:00`, `${hour}:30`);
        }
        
        slotsGrid.innerHTML = slots.map(slot => `
            <div class="time-slot" data-time="${slot}">
                ${slot}
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                this.selectedTime = slot.dataset.time;
                
                // Enable next button
                const nextBtn = document.getElementById('nextStep');
                if (nextBtn) nextBtn.disabled = false;
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendar')) {
        window.appointmentCalendar = new AppointmentCalendar();
    }
});
"@ | Out-File -FilePath "C:\Users\amine\Desktop\psyco\frontend\js\calendar.js" -Encoding UTF8"