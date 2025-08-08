document.addEventListener('DOMContentLoaded', () => {
    const featuredContainer = document.getElementById('featured-issue-container');
    const sliderTrack = document.getElementById('slider-track');
    const issuesGrid = document.getElementById('issues-grid');
    const nextButton = document.getElementById('next-slide');
    const prevButton = document.getElementById('prev-slide');
    const dotsNav = document.getElementById('slider-dots');

    fetch('data/issues_data.json')
        .then(response => response.json())
        .then(data => {
            if (!data || data.length === 0) {
                issuesGrid.innerHTML = '<p>등록된 이슈가 없습니다.</p>';
                return;
            }

            const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));

            // --- 이달의 이슈 슬라이더 구현 ---
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();

            const thisMonthIssues = sortedData.filter(issue => {
                const issueDate = new Date(issue.date);
                return issueDate.getFullYear() === currentYear && issueDate.getMonth() === currentMonth;
            });

            if (thisMonthIssues.length > 0) {
                featuredContainer.style.display = 'block';
                let currentIndex = 0;
                let slideInterval;

                // 슬라이드 및 도트 생성
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
                    sliderTrack.appendChild(slide);

                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    dot.dataset.slide = index;
                    dotsNav.appendChild(dot);
                });

                const slides = Array.from(sliderTrack.children);
                const dots = Array.from(dotsNav.children);

                const updateSlidePosition = () => {
                    sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
                    dots.forEach(dot => dot.classList.remove('active'));
                    dots[currentIndex].classList.add('active');
                };

                const moveToNextSlide = () => {
                    currentIndex = (currentIndex + 1) % slides.length;
                    updateSlidePosition();
                };

                const startSlideShow = () => {
                    slideInterval = setInterval(moveToNextSlide, 5000); // 5초마다 자동 슬라이드
                };

                const stopSlideShow = () => {
                    clearInterval(slideInterval);
                };

                nextButton.addEventListener('click', () => {
                    stopSlideShow();
                    moveToNextSlide();
                    startSlideShow();
                });

                prevButton.addEventListener('click', () => {
                    stopSlideShow();
                    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    updateSlidePosition();
                    startSlideShow();
                });

                dotsNav.addEventListener('click', e => {
                    if (e.target.classList.contains('dot')) {
                        stopSlideShow();
                        currentIndex = parseInt(e.target.dataset.slide);
                        updateSlidePosition();
                        startSlideShow();
                    }
                });
                
                // 슬라이드가 1개 이하면 버튼/도트 숨기기
                if (slides.length <= 1) {
                    nextButton.style.display = 'none';
                    prevButton.style.display = 'none';
                    dotsNav.style.display = 'none';
                } else {
                    startSlideShow(); // 슬라이드가 2개 이상일 때만 자동 재생 시작
                }

                updateSlidePosition();
            } else {
                 featuredContainer.style.display = 'none';
            }

            // --- 전체 이슈 렌더링 ---
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

        })
        .catch(error => {
            console.error('Error fetching issues data:', error);
            issuesGrid.innerHTML = '<p>영업이슈를 불러오는 데 실패했습니다.</p>';
        });
});
