/**
 * JavaScript for the Students Corner page with hierarchical structure
 */
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const classSelect = document.getElementById('classSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const contentTabs = document.getElementById('contentTabs');
    const contentTabBtns = document.querySelectorAll('.content-tab-btn');
    const contentTabPanes = document.querySelectorAll('.content-tab-pane');

    // Content grids
    const notesGrid = document.getElementById('notes-grid');
    const videosGrid = document.getElementById('videos-grid');
    const worksheetsGrid = document.getElementById('worksheets-grid');

    // No content elements
    const notesNoContent = document.getElementById('notes-no-content');
    const videosNoContent = document.getElementById('videos-no-content');
    const worksheetsNoContent = document.getElementById('worksheets-no-content');

    // Modals
    const pdfModal = document.getElementById('pdfModal');
    const videoModal = document.getElementById('videoModal');
    const closePdfModal = document.querySelector('.close-modal');
    const closeVideoModal = document.querySelector('.close-video-modal');

    // PDF controls
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfTitle = document.getElementById('pdfTitle');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const zoomLevelSelect = document.getElementById('zoomLevel');

    // Video controls
    const videoTitle = document.getElementById('videoTitle');
    const videoFrame = document.getElementById('videoFrame');

    // PDF.js variables
    let pdfDoc = null;
    let currentPage = 1;
    let zoomLevel = 1;
    let pageRendering = false;
    let pageNumPending = null;

    // Subject mappings
    const subjectMappings = {
        '6': ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'],
        '7': ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'],
        '8': ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'],
        '9': ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'],
        '10': ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'],
        '11': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Economics', 'Business Studies'],
        '12': ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Economics', 'Business Studies']
    };

    // Sample content data
    const contentData = {
        notes: {
            '6': {
                'Mathematics': [
                    { title: 'Numbers and Algebra', description: 'Basic number system and algebraic expressions', file: 'sample.pdf' },
                    { title: 'Geometry Basics', description: 'Points, lines, angles and shapes', file: 'https://drive.google.com/file/d/1pIFtlJJo6niBiwu7rmoMNBRPAGB_jZcc/view?usp=drive_link' }
                ],
                'Science': [
                    { title: 'Living Organisms', description: 'Plants, animals and their habitats', file: 'sample.pdf' },
                    { title: 'Materials and Solutions', description: 'Basic chemistry concepts', file: 'sample.pdf' }
                ]
            },
            '10': {
                'Mathematics': [
                    { title: 'Real Numbers', description: 'Euclid\'s division algorithm and fundamental theorem', file: 'sample.pdf' },
                    { title: 'Polynomials', description: 'Relationship between zeros and coefficients', file: 'sample.pdf' }
                ],
                'Science': [
                    { title: 'Light - Reflection and Refraction', description: 'Laws of reflection and refraction', file: 'sample.pdf' },
                    { title: 'Life Processes', description: 'Nutrition, respiration, transportation', file: 'sample.pdf' }
                ]
            }
        },
        videos: {
            '6': {
                'Mathematics': [
                    { title: 'Introduction to Algebra', description: 'Understanding variables and expressions', duration: '15:30', videoId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
                    { title: 'Geometry Fundamentals', description: 'Basic geometric shapes and properties', duration: '12:45', videoId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' }
                ],
                'Science': [
                    { title: 'Plant Kingdom', description: 'Classification and characteristics of plants', duration: '18:20', videoId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' }
                ]
            },
            '10': {
                'Mathematics': [
                    { title: 'Quadratic Equations', description: 'Solving quadratic equations by factorization', duration: '22:15', videoId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' },
                    { title: 'Coordinate Geometry', description: 'Distance formula and section formula', duration: '19:30', videoId: 'dQw4w9WgXcQ', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' }
                ]
            }
        },
        worksheets: {
            '6': {
                'Mathematics': [
                    { title: 'Practice Set 1 - Numbers', description: 'Practice problems on whole numbers and integers', file: 'sample.pdf' },
                    { title: 'Geometry Worksheet', description: 'Exercises on basic geometric constructions', file: 'sample.pdf' }
                ]
            },
            '10': {
                'Mathematics': [
                    { title: 'Real Numbers - Practice Sheet', description: 'Advanced problems on real numbers', file: 'sample.pdf' },
                    { title: 'Trigonometry Worksheet', description: 'Practice problems on trigonometric ratios', file: 'sample.pdf' }
                ]
            }
        }
    };

    // Initialize
    init();

    function init() {
        setupEventListeners();
        hideAllContent();
    }

    function setupEventListeners() {
        // Class selection
        classSelect.addEventListener('change', handleClassSelection);

        // Subject selection
        subjectSelect.addEventListener('change', handleSubjectSelection);

        // Content tabs
        contentTabBtns.forEach(btn => {
            btn.addEventListener('click', handleTabClick);
        });

        // Modal close events
        if (closePdfModal) {
            closePdfModal.addEventListener('click', closePDFModal);
        }

        if (closeVideoModal) {
            closeVideoModal.addEventListener('click', closeVideoModalFunc);

        }

        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === pdfModal) {
                closePDFModal();
            }
            if (event.target === videoModal) {
                closeVideoModalFunc();
            }
        });

        // PDF controls
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    queueRenderPage(currentPage);
                }
            });
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function() {
                if (pdfDoc && currentPage < pdfDoc.numPages) {
                    currentPage++;
                    queueRenderPage(currentPage);
                }
            });
        }

        if (zoomLevelSelect) {
            zoomLevelSelect.addEventListener('change', function() {
                zoomLevel = parseFloat(this.value);
                queueRenderPage(currentPage);
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', handleKeydown);
    }

    function handleClassSelection() {
        const selectedClass = classSelect.value;

        // Reset subject selection
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        subjectSelect.disabled = !selectedClass;

        // Hide content tabs and content
        hideAllContent();

        if (selectedClass && subjectMappings[selectedClass]) {
            // Populate subjects
            subjectMappings[selectedClass].forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.toLowerCase().replace(/\s+/g, '-');
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });
        }
    }

    function handleSubjectSelection() {
        const selectedClass = classSelect.value;
        const selectedSubject = subjectSelect.value;

        if (selectedClass && selectedSubject) {
            // Show content tabs
            contentTabs.style.display = 'flex';

            // Load content for the default active tab
            const activeTab = document.querySelector('.content-tab-btn.active');
            if (activeTab) {
                loadContent(activeTab.dataset.content, selectedClass, selectedSubject);
            }
        } else {
            hideAllContent();
        }
    }

    function handleTabClick(event) {
        const clickedTab = event.currentTarget;
        const contentType = clickedTab.dataset.content;

        // Update active tab
        contentTabBtns.forEach(btn => btn.classList.remove('active'));
        clickedTab.classList.add('active');

        // Update active content pane
        contentTabPanes.forEach(pane => pane.classList.remove('active'));
        document.getElementById(`${contentType}-content`).classList.add('active');

        // Load content
        const selectedClass = classSelect.value;
        const selectedSubject = subjectSelect.value;

        if (selectedClass && selectedSubject) {
            loadContent(contentType, selectedClass, selectedSubject);
        }
    }

    function loadContent(contentType, classNum, subject) {
        const subjectKey = getSubjectKey(subject);
        const data = contentData[contentType]?.[classNum]?.[subjectKey] || [];

        const grid = document.getElementById(`${contentType}-grid`);
        const noContent = document.getElementById(`${contentType}-no-content`);

        if (data.length > 0) {
            grid.style.display = 'grid';
            noContent.style.display = 'none';

            if (contentType === 'notes') {
                renderNotes(grid, data);
            } else if (contentType === 'videos') {
                renderVideos(grid, data);
            } else if (contentType === 'worksheets') {
                renderWorksheets(grid, data);
            }
        } else {
            grid.style.display = 'none';
            noContent.style.display = 'block';
        }
    }

    function renderNotes(grid, notes) {
        grid.innerHTML = '';

        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'material-item';
            noteElement.innerHTML = `
                <div class="material-header">
                    <div class="material-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="material-info">
                        <h4>${note.title}</h4>
                        <p>${note.description}</p>
                    </div>
                </div>
                <div class="material-actions">
                    <button class="btn btn-sm btn-primary view-pdf" data-pdf="${note.file}" data-title="${note.title}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            `;

            grid.appendChild(noteElement);
        });

        // Add event listeners to view buttons
        const viewButtons = grid.querySelectorAll('.view-pdf');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const pdfUrl = this.dataset.pdf;
                const title = this.dataset.title;
                openPDF(pdfUrl, title);
            });
        });
    }

    function renderVideos(grid, videos) {
        grid.innerHTML = '';

        videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'video-item';
            videoElement.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <button class="video-play-btn" data-video-id="${video.videoId}" data-title="${video.title}">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                <div class="video-content">
                    <h4 class="video-title">${video.title}</h4>
                    <p class="video-description">${video.description}</p>
                    <span class="video-duration">${video.duration}</span>
                </div>
            `;

            grid.appendChild(videoElement);
        });

        // Add event listeners to play buttons
        const playButtons = grid.querySelectorAll('.video-play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const videoId = this.dataset.videoId;
                const title = this.dataset.title;
                openVideo(videoId, title);
            });
        });
    }

    function renderWorksheets(grid, worksheets) {
        grid.innerHTML = '';

        worksheets.forEach(worksheet => {
            const worksheetElement = document.createElement('div');
            worksheetElement.className = 'material-item';
            worksheetElement.innerHTML = `
                <div class="material-header">
                    <div class="material-icon">
                        <i class="fas fa-download"></i>
                    </div>
                    <div class="material-info">
                        <h4>${worksheet.title}</h4>
                        <p>${worksheet.description}</p>
                    </div>
                </div>
                <div class="material-actions">
                    <button class="btn btn-sm btn-accent download-pdf" data-pdf="${worksheet.file}" data-title="${worksheet.title}">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            `;

            grid.appendChild(worksheetElement);
        });

        // Add event listeners to download buttons
        const downloadButtons = grid.querySelectorAll('.download-pdf');
        downloadButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const pdfUrl = this.dataset.pdf;
                const title = this.dataset.title;
                downloadPDF(pdfUrl, title);
            });
        });
    }

    function openPDF(url, title) {
        pdfModal.style.display = 'block';
        pdfTitle.textContent = title;

        // Use sample PDF for demo
        const samplePdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf';

        // Disable right-click
        pdfViewer.addEventListener('contextmenu', e => {
            e.preventDefault();
            return false;
        });

        // Load PDF
        pdfjsLib.getDocument(samplePdfUrl).promise.then(pdf => {
            pdfDoc = pdf;
            totalPagesEl.textContent = pdf.numPages;
            currentPage = 1;
            renderPage(currentPage);
        }).catch(error => {
            console.error('Error loading PDF:', error);
            pdfViewer.innerHTML = `<div class="pdf-error"><p>Error loading PDF. Please try again later.</p></div>`;
        });
    }

    function openVideo(videoId, title) {
        videoModal.style.display = 'block';
        videoTitle.textContent = title;
        videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    function downloadPDF(url, title) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function renderPage(pageNum) {
        pageRendering = true;

        // Clear previous content
        while (pdfViewer.firstChild) {
            pdfViewer.removeChild(pdfViewer.firstChild);
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        pdfViewer.appendChild(canvas);

        // Get page
        pdfDoc.getPage(pageNum).then(page => {
            const viewport = page.getViewport({ scale: zoomLevel });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Add touch support for pinch-to-zoom
            addTouchSupport(canvas);

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                pageRendering = false;
                currentPageEl.textContent = pageNum;

                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
    }

    function addTouchSupport(canvas) {
        let initialDistance = 0;
        let initialZoom = zoomLevel;

        canvas.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                initialZoom = zoomLevel;
            }
        });

        canvas.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );

                const scale = currentDistance / initialDistance;
                let newZoom = initialZoom * scale;

                // Clamp zoom level
                newZoom = Math.max(0.5, Math.min(3, newZoom));

                if (Math.abs(newZoom - zoomLevel) > 0.1) {
                    zoomLevel = newZoom;
                    zoomLevelSelect.value = zoomLevel;
                    queueRenderPage(currentPage);
                }
            }
        });
    }

    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    function closePDFModal() {
        pdfModal.style.display = 'none';
        pdfDoc = null;
    }

    function closeVideoModalFunc() {
        videoModal.style.display = 'none';
        videoFrame.src = '';
    }

    function handleKeydown(e) {
        if (pdfModal.style.display === 'block') {
            if (e.key === 'ArrowLeft' && currentPage > 1) {
                currentPage--;
                queueRenderPage(currentPage);
            } else if (e.key === 'ArrowRight' && pdfDoc && currentPage < pdfDoc.numPages) {
                currentPage++;
                queueRenderPage(currentPage);
            } else if (e.key === 'Escape') {
                closePDFModal();
            }
        }

        if (videoModal.style.display === 'block' && e.key === 'Escape') {
            closeVideoModalFunc();
        }
    }

    function hideAllContent() {
        contentTabs.style.display = 'none';

        // Hide all grids and show no-content messages
        [notesGrid, videosGrid, worksheetsGrid].forEach(grid => {
            grid.style.display = 'none';
        });

        [notesNoContent, videosNoContent, worksheetsNoContent].forEach(noContent => {
            noContent.style.display = 'block';
        });
    }

    function getSubjectKey(subject) {
        // Convert subject select value back to key
        return subject.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
});