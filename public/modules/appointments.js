/**
 * appointments.js - Appointments modal management module
 * Handles appointment modal display, form submission, and modal closing
 */

class AppointmentManager {
    constructor() {
        this.modal = document.getElementById('appointment-modal');
        this.appointmentForm = document.getElementById('appointment-form');
        this.modalCounselorName = document.getElementById('modal-counselor-name');
        this.user = null;
        this.userType = 'student';
        this._handlersAttached = false;
        this.resumeDropzone = document.getElementById('resume-dropzone');
        this.resumeFileInput = document.getElementById('resume-upload-input');
        this._resumeHandlersAttached = false;
        this.resumeUploading = false;
    }

    /**
     * Initialize appointment manager with optional user context
     * @param {Object|null} user - logged in user object from localStorage
     * @param {string} userType - 'student' or 'counselor'
     */
    init(user = null, userType = 'student') {
        this.user = user;
        this.userType = userType || 'student';

        // Attach UI handlers once
        if (!this._handlersAttached) {
            if (this.appointmentForm) {
                this.appointmentForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
            }

            if (this.modal) {
                this.modal.addEventListener('click', (e) => this.closeModal(e));
            }

            this._handlersAttached = true;
        }

        // Populate UI immediately
        this.loadAppointments();
        this.loadResumes();
        this.attachResumeUploadHandler();
    }

    /**
     * Resolve stored identifier regardless of property naming.
     */
    getUserId() {
        if (!this.user) return null;
        return this.user.id
            || this.user.user_id
            || this.user.student_id
            || this.user.ID_number
            || this.user.id_number
            || this.user.ID
            || this.user.studentId
            || this.user.userId
            || null;
    }

    /**
     * Attach resume upload handlers to dropzone and hidden input
     */
    attachResumeUploadHandler() {
        if (this._resumeHandlersAttached) return;

        const dropzone = this.resumeDropzone || document.getElementById('resume-dropzone');
        const fileInput = this.resumeFileInput || document.getElementById('resume-upload-input');

        if (!dropzone || !fileInput) return;

        const resetVisual = () => dropzone.classList.remove('border-primary', 'bg-primary/5');
        const setHighlight = () => dropzone.classList.add('border-primary', 'bg-primary/5');

        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            setHighlight();
        });
        dropzone.addEventListener('dragleave', () => resetVisual());
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            resetVisual();
            const files = e.dataTransfer && e.dataTransfer.files;
            const file = files && files[0];
            this.handleResumeFile(file);
        });

        fileInput.addEventListener('change', (e) => {
            const files = e.target && e.target.files;
            const file = files && files[0];
            this.handleResumeFile(file);
            e.target.value = '';
        });

        this.resumeDropzone = dropzone;
        this.resumeFileInput = fileInput;
        this._resumeHandlersAttached = true;
    }

    /**
     * Validate and process selected resume file
     * @param {File|null} file
     */
    handleResumeFile(file) {
        if (!file || this.resumeUploading) return;

        const allowedExtensions = ['pdf', 'doc', 'docx'];
        const extension = file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            alert('Please upload a PDF or DOC/DOCX file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Please upload a file smaller than 5 MB.');
            return;
        }

        this.uploadResume(file);
    }

    /**
     * Update dropzone status while uploading
     * @param {boolean} state
     */
    setResumeUploading(state) {
        this.resumeUploading = state;
        if (!this.resumeDropzone) return;

        const message = this.resumeDropzone.querySelector('p');
        if (state) {
            this.resumeDropzone.classList.add('opacity-60', 'pointer-events-none');
            if (message) message.textContent = 'Uploading resume...';
        } else {
            this.resumeDropzone.classList.remove('opacity-60', 'pointer-events-none');
            if (message) message.textContent = 'Drag and drop or click to browse (PDF, DOCX)';
        }
    }

    /**
     * Upload resume to backend
     * @param {File} file
     */
    async uploadResume(file) {
        const userId = this.getUserId();
        if (!userId) {
            alert('Please log in before uploading a resume.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            this.setResumeUploading(true);
            const resp = await fetch(`/app/uploadresume/${encodeURIComponent(userId)}`, {
                method: 'POST',
                body: formData
            });

            if (!resp.ok) {
                const msg = await resp.text().catch(() => 'Resume upload failed.');
                throw new Error(msg || 'Resume upload failed.');
            }

            alert('Resume uploaded successfully.');
            this.loadResumes();
        } catch (err) {
            console.error('uploadResume error', err);
            alert('Unable to upload resume right now. Please try again.');
        } finally {
            this.setResumeUploading(false);
        }
    }

    /**
     * Open the appointment modal
     * @param {string} counselorName - Name of the counselor
     * @param {string} role - Role of the counselor (optional)
     */
    openAppointmentModal(counselorName, role = '') {
        if (!this.modal) return;

        if (this.modalCounselorName) {
            this.modalCounselorName.textContent = counselorName;
        }

        this.modal.classList.remove('hidden');
        this.modal.classList.add('flex');
    }

    /**
     * Close the appointment modal
     * @param {Event} event - Click event object
     */
    closeModal(event = null) {
        if (!this.modal) return;

        // Only close if clicking on the modal background itself
        if (event && event.target.id !== 'appointment-modal') {
            return;
        }
        
        this.modal.classList.add('hidden');
        this.modal.classList.remove('flex');
    }

    /**
     * Handle appointment form submission
     * @param {Event} e - Form submit event
     */
    handleFormSubmit(e) {
        e.preventDefault();
        
        const topic = document.getElementById('meeting-topic').value;
        const date = document.getElementById('meeting-date').value;
        const time = document.getElementById('meeting-time').value;
        const modeInput = document.querySelector('input[name="meeting_mode"]:checked');
        const mode = modeInput ? modeInput.value : 'Not selected';
        const counselor = this.modalCounselorName ? this.modalCounselorName.textContent : 'Unknown';

        // Display confirmation
        alert(`Appointment Set!\n\nCounselor: ${counselor}\nTopic: ${topic}\nDate: ${date}\nTime: ${time}\nMode: ${mode}`);
        
        // Reset form and close modal
        this.appointmentForm.reset();
        this.closeModal();
    }

    /* ---------------------- Dynamic data loading ---------------------- */
    async loadAppointments() {
        // Attempt to fetch appointments from backend. If not available, render placeholders.
        try {
            const panel = document.getElementById('panel-appointments');
            if (!panel) return;

            const containerId = 'appointment-list';
            let container = document.getElementById(containerId);
            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                container.className = 'mt-8 space-y-4';
                panel.appendChild(container);
            }

            // If backend endpoints exist, use them. Otherwise, show default message.
            const userId = this.getUserId();
            if (!userId) {
                container.innerHTML = `
                    <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg text-center">
                        <p class="text-gray-500 italic">No appointment data available. Please log in.</p>
                    </div>
                `;
                return;
            }

            const endpoint = this.userType === 'student'
                ? `/api/appointments/student/${userId}`
                : `/api/appointments/counselor/${userId}`;

            const resp = await fetch(endpoint).catch(() => null);
            if (!resp || !resp.ok) {
                // fallback: show empty state
                container.innerHTML = `
                    <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg text-center">
                        <p class="text-gray-500 italic">No appointment bookings found.</p>
                    </div>
                `;
                return;
            }

            const data = await resp.json();
            const appointments = data && data.appointments ? data.appointments : [];

            if (this.userType === 'student') this.renderStudentAppointments(appointments);
            else this.renderCounselorAppointments(appointments);

        } catch (err) {
            console.warn('loadAppointments error', err);
        }
    }

    renderStudentAppointments(appointments) {
        const panel = document.getElementById('panel-appointments');
        const container = document.getElementById('appointment-list');
        if (!panel || !container) return;

        if (!appointments || appointments.length === 0) {
            container.innerHTML = `
                <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg text-center">
                    <p class="text-gray-500 italic">You have no scheduled appointments.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = appointments.map(apt => `
            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-gray-800">${apt.counselor_name || 'Counselor'}</h3>
                    <span class="text-xs font-semibold px-2 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${(apt.status||'pending').toUpperCase()}</span>
                </div>
                <p class="text-sm text-gray-600 mb-1">📅 ${apt.date || apt.appointment_date || 'TBD'} at ${apt.time || apt.appointment_time || 'TBD'}</p>
                <p class="text-sm text-gray-600">${apt.location || 'Location TBD'}</p>
            </div>
        `).join('');
    }

    renderCounselorAppointments(appointments) {
        const panel = document.getElementById('panel-appointments');
        const container = document.getElementById('appointment-list');
        if (!panel || !container) return;

        if (!appointments || appointments.length === 0) {
            container.innerHTML = `
                <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg text-center">
                    <p class="text-gray-500 italic">No appointment requests.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = appointments.map(apt => `
            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-gray-800">${apt.student_name || 'Student'}</h3>
                    <span class="text-xs font-semibold px-2 py-1 rounded-full ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${(apt.status||'pending').toUpperCase()}</span>
                </div>
                <p class="text-sm text-gray-600 mb-1">Requested: ${apt.requested_date || 'TBD'} at ${apt.requested_time || 'TBD'}</p>
                <p class="text-sm text-gray-600">Concern: ${apt.concern || 'General'}</p>
            </div>
        `).join('');
    }

    async loadResumes() {
        try {
            const panel = document.getElementById('panel-resume');
            if (!panel) return;

            const containerId = 'resume-list';
            let container = document.getElementById(containerId);
            if (!container) {
                container = document.createElement('div');
                container.id = containerId;
                container.className = 'mt-6 space-y-4';
                panel.appendChild(container);
            }

            const userId = this.getUserId();
            if (!userId && this.userType === 'student') {
                container.innerHTML = `<p class="text-gray-500 italic">No resume data available. Please log in.</p>`;
                return;
            }

            const endpoint = this.userType === 'student'
                ? `/app/getmyresume/${encodeURIComponent(userId)}`
                : `/api/resumes/queue`;

            const resp = await fetch(endpoint).catch(() => null);
            if (!resp || !resp.ok) {
                container.innerHTML = `<p class="text-sm text-gray-500 italic">No pending resumes for review.</p>`;
                return;
            }

            const data = await resp.json();
            const resumes = Array.isArray(data)
                ? data
                : (data && (data.resume || data.resumes)) || [];
            this.renderResumes(resumes);

        } catch (err) {
            console.warn('loadResumes error', err);
        }
    }

    renderResumes(resumes) {
        const container = document.getElementById('resume-list');
        if (!container) return;

        if (!resumes || resumes.length === 0) {
            container.innerHTML = `<p class="text-sm text-gray-500 italic">No pending resumes for review.</p>`;
            return;
        }

        container.innerHTML = resumes.map(resume => {
            const submitted = resume.created_at || resume.submitted_date || '';
            const status = resume.status || 'pending';
            const fileUrl = resume.resume_link || resume.document_link || resume.file_path || '#';
            const title = resume.filename || `Resume ${resume.resume_id || ''}`;
            const counselorNote = resume.councilor_id
                ? `Assigned counselor: ${resume.councilor_id}`
                : 'Waiting for counselor assignment';

            return `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center gap-4 hover:bg-gray-100 transition-colors">
                    <div>
                        <p class="font-semibold text-gray-800">${title}</p>
                        <p class="text-sm text-gray-500">Submitted: ${submitted} | Status: ${status}</p>
                        <p class="text-xs text-gray-400">${counselorNote}</p>
                    </div>
                    <button onclick="window.open('${fileUrl}','_blank')" class="bg-primary text-white py-1.5 px-4 rounded-full text-sm">Open File</button>
                </div>
            `;
        }).join('');
    }
}

// Export as global
window.appointmentManager = new AppointmentManager();

/**
 * Global helper function to open appointment modal
 * Call this from HTML onclick or other event handlers
 * @param {string} counselorName - Name of the counselor
 * @param {string} role - Role of the counselor (optional)
 */
window.openAppointmentModal = (counselorName, role = '') => {
    if (window.appointmentManager) {
        window.appointmentManager.openAppointmentModal(counselorName, role);
    }
};

/**
 * Global helper function to close appointment modal
 * Call this from HTML or other event handlers
 */
window.closeModal = (event = null) => {
    if (window.appointmentManager) {
        window.appointmentManager.closeModal(event);
    }
};

// Auto-initialize appointment manager from localStorage when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        const userRaw = localStorage.getItem('user') || localStorage.getItem('currentUser');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const userType = localStorage.getItem('userType') || (user && user.role) || 'student';

        if (window.appointmentManager && typeof window.appointmentManager.init === 'function') {
            window.appointmentManager.init(user, userType);
        }
    } catch (e) {
        console.warn('appointments auto-init failed', e);
    }
});
