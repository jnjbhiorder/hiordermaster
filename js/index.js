document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const featuredContainer = document.getElementById('featured-issue-container');
    const sliderTrack = document.getElementById('slider-track');
    const issuesGrid = document.getElementById('issues-grid');
    const nextButton = document.getElementById('next-slide');
    const prevButton = document.getElementById('prev-slide');
    const dotsNav = document.getElementById('slider-dots');

    // Modal Elements
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const closeModalBtn = document.querySelector('.close-modal');

    // --- Modal Logic ---
    const openModal = (imgSrc) => {
        if (modal && modalImg) {
            modal.style.display = 'block';
            modalImg.src = imgSrc;
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.style.display = 'none';
        }
    };

    // Add event listeners to close the modal
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(modal) modal.addEventListener('click', (e) => {
        // Close if the background (modal itself) is clicked, but not the image
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- Event Delegation for Image Clicks ---
    // Use event delegation on parent containers to handle clicks on dynamically added images.
    
    // For slider images
    if(sliderTrack) sliderTrack.addEventListener('click', (e) => {
        const imageWrapper = e.target.closest('.featured-issue-card-image-wrapper');
        if (imageWrapper) {
            const img = imageWrapper.querySelector('img');
            if (img && img.src) {
                openModal(img.src);
            }
        }
    });

    // For grid images
    if(issuesGrid) issuesGrid.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('issue-card-image')) {
            openModal(e.target.src);
        }
    });


    // --- Fetch and Render Issues ---
    fetch('data/issues_data.json')
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                if(issuesGrid) issuesGrid.innerHTML = '<p>등록된 이슈가 없습니다.</p>';
                return;
            }

            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

            // --- This Month's Issue Slider ---
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            const thisMonthIssues = sortedData.filter(issue => {
                const issueDate = new Date(issue.date);
                return issueDate.getFullYear() === currentYear && issueDate.getMonth() === currentMonth;
            });

            if (thisMonthIssues.length > 0) {
                if(featuredContainer) featuredContainer.style.display = 'block';
                let currentIndex = 0;
                let slideInterval;

                // Create slides and dots
                thisMonthIssues.forEach((issue, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'slide';
                    slide.innerHTML = `
                        <div class="featured-issue-card">
                            <div class="featured-issue-card-content">
                                <span class="featured-issue-card-badge">이달의 이슈</span>
                                <h2 class="featured-issue-card-title">${issue.title}</h2>
                                <p class="featured-issue-card-text">${issue.content}</p>
                                <p class="featured-issue-card-date">${issue.date}</p>
                            </div>
                            <div class="featured-issue-card-image-wrapper">
                                 <img src="${issue.image}" alt="${issue.title}" class="featured-issue-card-image">
                            </div>
                        </div>
                    `;
                    if(sliderTrack) sliderTrack.appendChild(slide);

                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    dot.dataset.slide = index;
                    if(dotsNav) dotsNav.appendChild(dot);
                });

                const slides = sliderTrack ? Array.from(sliderTrack.children) : [];
                const dots = dotsNav ? Array.from(dotsNav.children) : [];

                const updateSlidePosition = () => {
                    if(sliderTrack) sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
                    if(dots.length > 0) {
                        dots.forEach(dot => dot.classList.remove('active'));
                        dots[currentIndex].classList.add('active');
                    }
                };

                const moveToNextSlide = () => {
                    currentIndex = (currentIndex + 1) % slides.length;
                    updateSlidePosition();
                };

                const startSlideShow = () => {
                    slideInterval = setInterval(moveToNextSlide, 5000); // 5 seconds
                };

                const stopSlideShow = () => {
                    clearInterval(slideInterval);
                };

                if(nextButton) nextButton.addEventListener('click', () => {
                    stopSlideShow();
                    moveToNextSlide();
                    startSlideShow();
                });

                if(prevButton) prevButton.addEventListener('click', () => {
                    stopSlideShow();
                    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    updateSlidePosition();
                    startSlideShow();
                });

                if(dotsNav) dotsNav.addEventListener('click', e => {
                    if (e.target.classList.contains('dot')) {
                        stopSlideShow();
                        currentIndex = parseInt(e.target.dataset.slide);
                        updateSlidePosition();
                        startSlideShow();
                    }
                });
                
                // Hide controls if only one slide
                if (slides.length <= 1) {
                    if(nextButton) nextButton.style.display = 'none';
                    if(prevButton) prevButton.style.display = 'none';
                    if(dotsNav) dotsNav.style.display = 'none';
                } else {
                    startSlideShow();
                }

                updateSlidePosition();
            } else {
                 if(featuredContainer) featuredContainer.style.display = 'none';
            }

            // --- Render All Issues ---
            if(issuesGrid) {
                sortedData.forEach(issue => {
                    const card = document.createElement('div');
                    card.className = 'issue-card';
                    card.innerHTML = `
                        <img src="${issue.image}" alt="${issue.title}" class="issue-card-image">
                        <div class="issue-card-content">
                            <h3 class="issue-card-title">${issue.title}</h3>
                            <p class="issue-card-text">${issue.content}</p>
                            <p class="issue-card-date">${issue.date}</p>
                        </div>
                    `;
                    issuesGrid.appendChild(card);
                });
            }

        })
        .catch(error => {
            console.error('Error fetching issues data:', error);
            if(issuesGrid) issuesGrid.innerHTML = '<p>영업이슈를 불러오는 데 실패했습니다.</p>';
        });
});
