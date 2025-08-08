document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const categoryTabsContainer = document.getElementById('categoryTabs');
    
    let activeCategory = 'All';
    let currentResults = [];
    let allData = []; // 전체 데이터를 저장할 변수

    // guide_data.json 파일에서 데이터를 비동기적으로 불러옵니다.
    fetch('data/guide_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(guideData => {
            // 데이터에 포함된 불필요한 앞뒤 공백을 제거합니다.
            const cleanedData = guideData.map(item => {
                const trimmedItem = {};
                for (const key in item) {
                    trimmedItem[key] = typeof item[key] === 'string' ? item[key].trim() : item[key];
                }
                return trimmedItem;
            });
            allData = cleanedData; // 전체 데이터 저장
            initializeApp(allData);
        })
        .catch(error => {
            console.error('Error fetching or parsing guide_data.json:', error);
            resultsContainer.innerHTML = `<p style="color: red;">가이드 데이터를 불러오는 데 실패했습니다. 파일을 확인해주세요.</p>`;
        });


    function initializeApp(data) {
        const subCategoryColorMap = createColorMap(data, 'Sub Category', ['#ff85c0', '#79d7f2', '#82e0aa', '#ffd700', '#d3a4ff']);
        const itemColorMap = createColorMap(data, 'Item', ['#ff9a9e', '#a1c4fd', '#b8e986', '#fceabb', '#f8c3d4', '#d4a5a5']);

        function createColorMap(data, key, colors) {
            const uniqueValues = [...new Set(data.map(item => item[key]))];
            const map = new Map();
            uniqueValues.forEach((value, index) => {
                map.set(value, colors[index % colors.length]);
            });
            return map;
        }

        function highlightText(text, query) {
            if (!query || !text) return text;
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedQuery, 'gi');
            return String(text).replace(regex, `<span class="highlight">$&</span>`);
        }

        /**
         * 검색어 유무에 따라 결과 렌더링을 다르게 처리하는 함수
         * @param {Array} results - 표시할 데이터 배열
         * @param {string} query - 사용자가 입력한 검색어
         */
        function renderResults(results, query) {
            resultsContainer.innerHTML = '';
            noResultsMessage.classList.toggle('hidden', results.length > 0);
            currentResults = results;

            // 검색어가 있으면 리스트 형태로, 없으면 그리드 형태로 클래스 변경
            if (query) {
                resultsContainer.className = 'results-list';
            } else {
                resultsContainer.className = 'results-grid';
            }

            results.forEach((item, index) => {
                const resultElement = document.createElement('div');
                resultElement.dataset.index = index;
                
                const path = item['Path'] ? item['Path'].replace(/>/g, ' > ') : '';

                if (query) {
                    // 검색어가 있을 때의 뷰 (경로만 표시)
                    resultElement.className = 'result-list-item';
                    resultElement.innerHTML = `
                        <p class="card-path">${highlightText(path, query)}</p>
                    `;
                } else {
                    // 검색어가 없을 때의 기존 뷰 (전체 정보 카드)
                    resultElement.className = 'result-card';
                    const subCategoryColor = subCategoryColorMap.get(item['Sub Category']) || 'var(--icloud-text-primary)';
                    const itemColor = itemColorMap.get(item['Item']) || 'var(--icloud-text-primary)';
                    
                    resultElement.innerHTML = `
                        <div style="flex-grow: 1;">
                            <div>
                                <p class="card-sub-category" style="color: ${subCategoryColor};">${highlightText(item['Sub Category'], query)}</p>
                                <p class="card-item" style="color: ${itemColor};"> ㄴ ${highlightText(item['Item'], query)}</p>
                                <p class="card-sub-item">  &nbsp;&nbsp;&nbsp;ㄴ ${highlightText(item['Sub item'], query)}</p>
                            </div>
                            <div class="field-group">
                                <p class="field-title">세부 내용</p>
                                <p class="field-content">&nbsp; ${highlightText(item['Field'], query)}</p>
                            </div>
                        </div>
                        <p class="card-path"><b>경로 : </b> ${highlightText(path, query)}</p>
                    `;
                }
                
                // 상세 페이지로 이동하는 이벤트 리스너
                resultElement.addEventListener('click', () => {
                    const clickedItem = currentResults[parseInt(resultElement.dataset.index)];

                    const subCategoryColor = subCategoryColorMap.get(clickedItem['Sub Category']) || 'var(--icloud-text-primary)';
                    const itemColor = itemColorMap.get(clickedItem['Item']) || 'var(--icloud-text-primary)';

                    const dataToStore = {
                        ...clickedItem,
                        subCategoryColor: subCategoryColor,
                        itemColor: itemColor
                    };

                    sessionStorage.setItem('hioderDetailData', JSON.stringify(dataToStore));
                    window.location.href = 'detail.html';
                });

                resultsContainer.appendChild(resultElement);
            });
        }

        function createCategoryTabs() {
            const categories = ['All', ...new Set(allData.map(item => item['Sub Category']).filter(Boolean))];
            
            categories.forEach(category => {
                const button = document.createElement('button');
                button.textContent = category;
                button.dataset.category = category;
                button.className = 'filter-tab';
                if (category === activeCategory) button.classList.add('active');

                button.addEventListener('click', () => {
                    activeCategory = category;
                    document.querySelectorAll('#categoryTabs .filter-tab').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.category === activeCategory);
                    });
                    handleSearchAndFilter();
                });
                categoryTabsContainer.appendChild(button);
            });
        }

        function handleSearchAndFilter() {
            const originalQuery = searchInput.value.trim();
            const queryForMatching = originalQuery.toLowerCase().replace(/\s/g, '');
            let filteredResults = allData;

            if (activeCategory !== 'All') {
                filteredResults = filteredResults.filter(item => item['Sub Category'] === activeCategory);
            }

            if (queryForMatching) {
                filteredResults = filteredResults.filter(item => 
                    Object.values(item).some(value => 
                        String(value).toLowerCase().replace(/\s/g, '').includes(queryForMatching)
                    )
                );
            }
            renderResults(filteredResults, originalQuery);
        }

        searchInput.addEventListener('input', handleSearchAndFilter);
        createCategoryTabs();
        handleSearchAndFilter();
    }
});
