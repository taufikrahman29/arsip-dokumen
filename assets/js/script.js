/**
 * Sistem Informasi Arsip Dokumen Lapas Kelas IIA Bekasi
 * Vanilla JavaScript Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Mobile Navbar Toggle (Public)
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('show');
        });
    }

    // 2. Mobile Sidebar Toggle (Admin)
    const sidebarToggle = document.getElementById('sidebarToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    if (sidebarToggle && adminSidebar) {
        sidebarToggle.addEventListener('click', function () {
            adminSidebar.classList.toggle('show');
        });
    }

    // 3. Confirm Delete Prompts
    const deleteButtons = document.querySelectorAll('.btn-confirm-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            const message = this.getAttribute('data-confirm') || 'Apakah Anda yakin ingin menghapus data dokumen/kategori ini?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // 4. File Upload Drag & Drop Preview
    const fileBox = document.getElementById('fileUploadBox');
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (fileBox && fileInput) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileBox.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            fileBox.addEventListener(eventName, () => fileBox.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileBox.addEventListener(eventName, () => fileBox.classList.remove('dragover'), false);
        });

        fileBox.addEventListener('drop', function (e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileNameDisplay(files[0].name);
            }
        });

        fileInput.addEventListener('change', function () {
            if (this.files.length > 0) {
                updateFileNameDisplay(this.files[0].name);
            }
        });

        function updateFileNameDisplay(name) {
            if (fileNameDisplay) {
                fileNameDisplay.innerHTML = '📄 File terpilih: <strong>' + escapeHtml(name) + '</strong>';
                fileNameDisplay.style.color = '#15803d';
            }
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.innerText = text;
        return div.innerHTML;
    }
});
