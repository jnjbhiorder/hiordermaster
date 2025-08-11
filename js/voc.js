document.addEventListener('DOMContentLoaded', () => {
    const tabsContainer = document.getElementById('month-tabs');
    const contentContainer = document.getElementById('voc-content-container');

    // voc_summary.json 파일에서 데이터를 비동기적으로 불러옵니다.
    fetch('data/voc_summary.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // JSON 파일의 최상위 키 (예: "voc_summary") 내부의 배열을 사용합니다.
            const vocDataArray = data.voc_summary; 
            
            // 월별 데이터를 객체 형태로 변환합니다.
            const vocDataByMonth = vocDataArray.reduce((acc, item) => {
                // '2025년 7월' -> '2025-07' 형식으로 변환
                const year = item.month.substring(0, 4);
                const month = item.month.substring(6, 8).replace('월', '').padStart(2, '0');
                const key = `${year}-${month}`;
                
                acc[key] = {
                    monthName: `${month}월`,
                    // podcastTitle, podcastSrc는 JSON에 없으므로 임시값을 넣거나 구조를 맞춰야 합니다.
                    // 여기서는 임시로 고정된 값을 사용하겠습니다. 실제로는 JSON 구조를 맞춰주는 것이 좋습니다.
                    podcastTitle: `${month}월 VOC 분석 팟캐스트 🎧`,
                    podcastSrc: `podcast/voc${year}${month}.m4a`,
                    vocTitle: `${item.month} 주요 VOC 내역`,
                    vocItems: item.issues.map(issue => ({
                        category: issue.category,
                        title: issue.title,
                        content: issue.content,
                        solution: issue.solution
                    }))
                };
                return acc;
            }, {});

            initializeApp(vocDataByMonth);
        })
        .catch(error => {
            console.error('Error fetching or parsing voc_summary.json:', error);
            contentContainer.innerHTML = `<p style="color: red;">VOC 데이터를 불러오는 데 실패했습니다. 파일을 확인해주세요.</p>`;
        });


    function initializeApp(vocDataByMonth) {
        const months = Object.keys(vocDataByMonth).sort((a, b) => new Date(b) - new Date(a));
        let activeMonth = months[0];

        function renderTabs() {
            tabsContainer.innerHTML = '';
            months.forEach(monthKey => {
                const data = vocDataByMonth[monthKey];
                const button = document.createElement('button');
                button.className = `filter-tab ${monthKey === activeMonth ? 'active' : ''}`;
                button.textContent = data.monthName;
                button.dataset.month = monthKey;
                button.addEventListener('click', () => {
                    activeMonth = monthKey;
                    renderTabs();
                    renderContent();
                });
                tabsContainer.appendChild(button);
            });
        }

        function renderContent() {
            contentContainer.innerHTML = '';
            const data = vocDataByMonth[activeMonth];

            const podcastHTML = `
                <h3 style="font-size: 1.8rem; font-weight: 600; margin-bottom: 20px;">${data.podcastTitle}</h3>
                <div class="audio-player">
                    <p><strong>월간 VOC 분석 팟캐스트</strong></p>

                    <audio controls><source src="${data.podcastSrc}" type="audio/mpeg"></audio>
                </div>
                <hr class="divider">
            `;

            const vocTitleHTML = `<h3 style="font-size: 1.8rem; font-weight: 600; margin-bottom: 20px;">${data.vocTitle}</h3>`;

            const vocGrid = document.createElement('div');
            vocGrid.className = 'voc-grid';

            data.vocItems.forEach(item => {
                const card = document.createElement('div');
                card.className = 'voc-card';
                card.innerHTML = `
                    <p class="category">${item.category}</p>
                    <p class="title">${item.title}</p>
                    <p class="content">${item.content}</p>
                    <hr class="divider" style="margin: 20px 0;">
                    <p class="title">주요 해결 방식</p>
                    <p class="content">${item.solution}</p>
                `;
                vocGrid.appendChild(card);
            });

            contentContainer.innerHTML = podcastHTML + vocTitleHTML;
            contentContainer.appendChild(vocGrid);
        }

        renderTabs();
        renderContent();
    }
});

