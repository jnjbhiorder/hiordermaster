document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
    const searchInput = document.getElementById('manualSearchInput');
    const resultsContainer = document.getElementById('searchResults');
    const boardBody = document.getElementById('boardBody');
    const paginationContainer = document.getElementById('pagination');
    const manualBoard = document.getElementById('manualBoard');
    const categoryTabs = document.getElementById('categoryTabs');

    // 전역 변수 설정
    let manualData = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    let currentCategory = '전체';

    // manualData.json 파일에서 데이터 로드
    fetch('data/manualData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // 데이터를 No 기준으로 내림차순 정렬
            manualData = data.sort((a, b) => b.No - a.No);
            createCategoryTabs(); // 카테고리 탭 생성
            displayFilteredData(); // 초기 데이터 표시
            searchInput.addEventListener('input', () => handleSearch()); // 검색 이벤트 리스너 추가
        })
        .catch(error => {
            console.error('Error fetching or parsing manualData.json:', error);
            if (manualBoard) manualBoard.innerHTML = `<p class="result-item" style="color: red;">매뉴얼 데이터를 불러오는 데 실패했습니다. 파일을 확인해주세요.</p>`;
        });

    /**
     * 카테고리 탭을 생성하고 이벤트 리스너를 추가하는 함수
     */
    function createCategoryTabs() {
        // 'Category' 또는 'MainCategory' 키를 모두 확인하고, 값이 있는 경우에만 추출하여 중복 제거
        const categories = ['전체', ...new Set(
            manualData
                .map(item => item.Category || item.MainCategory) // Category 또는 MainCategory 키 사용
                .filter(Boolean) // null 또는 undefined 값 제거
        )];
        
        categoryTabs.innerHTML = ''; // 기존 탭 초기화

        categories.forEach(category => {
            const tabButton = document.createElement('button');
            tabButton.className = 'filter-tab';
            tabButton.textContent = category;
            if (category === currentCategory) {
                tabButton.classList.add('active');
            }

            tabButton.addEventListener('click', () => {
                currentCategory = category;
                displayFilteredData();
                
                // 활성 탭 스타일 업데이트
                document.querySelectorAll('.filter-tab').forEach(btn => btn.classList.remove('active'));
                tabButton.classList.add('active');
            });

            categoryTabs.appendChild(tabButton);
        });
    }

    /**
     * 현재 선택된 카테고리에 따라 데이터를 필터링하고 표시하는 함수
     */
    function displayFilteredData() {
        let filteredData = manualData;
        if (currentCategory !== '전체') {
            // 'Category' 또는 'MainCategory' 키를 모두 확인하여 필터링
            filteredData = manualData.filter(item => (item.Category || item.MainCategory) === currentCategory);
        }
        displayData(filteredData);
    }

    /**
     * 주어진 데이터를 기반으로 게시판과 페이지네이션을 표시하는 함수
     * @param {Array} data - 표시할 데이터 배열
     */
    function displayData(data) {
        currentPage = 1; // 페이지를 1로 초기화
        renderBoard(currentPage, data);
        setupPagination(data);
    }

    /**
     * 특정 페이지에 해당하는 데이터를 게시판에 렌더링하는 함수
     * @param {number} page - 현재 페이지 번호
     * @param {Array} data - 전체 데이터 배열
     */
    function renderBoard(page, data) {
        if (!boardBody || !manualBoard || !paginationContainer) return;

        boardBody.innerHTML = '';
        resultsContainer.innerHTML = ''; // 검색 결과 영역 비우기
        manualBoard.style.display = ''; // 게시판 보이기
        paginationContainer.style.display = 'flex'; // 페이지네이션 보이기

        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = data.slice(start, end);

        paginatedItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="board-no">${item.No}</td>
                <td class="board-title"><a href="${item.link}" target="_blank">${item.Title}</a></td>
            `;
            boardBody.appendChild(row);
        });
    }

    /**
     * 페이지네이션 버튼을 생성하는 헬퍼 함수
     * @param {number} page - 생성할 페이지 번호
     * @param {Array} data - 전체 데이터 배열
     * @param {boolean} isActive - 현재 페이지 여부
     * @returns {HTMLButtonElement} 생성된 버튼 요소
     */
    function createPageButton(page, data, isActive = false) {
        const button = document.createElement('button');
        button.innerText = page;
        if (isActive) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = page;
            renderBoard(currentPage, data);
            setupPagination(data);
        });
        return button;
    }

    /**
     * 데이터에 따라 페이지네이션 컨트롤을 생성하는 함수
     * @param {Array} data - 전체 데이터 배열
     */
    function setupPagination(data) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(data.length / itemsPerPage);

        if (pageCount <= 1) return;

        const maxPageButtons = 5; // 한 번에 보여줄 최대 페이지 버튼 수

        // 이전 버튼
        const prevButton = document.createElement('button');
        prevButton.innerText = '이전';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderBoard(currentPage, data);
                setupPagination(data);
            }
        });
        paginationContainer.appendChild(prevButton);

        let startPage, endPage;
        if (pageCount <= maxPageButtons) {
            startPage = 1;
            endPage = pageCount;
        } else {
            let maxPagesBeforeCurrent = Math.floor(maxPageButtons / 2);
            let maxPagesAfterCurrent = Math.ceil(maxPageButtons / 2) - 1;
            if (currentPage <= maxPagesBeforeCurrent) {
                startPage = 1;
                endPage = maxPageButtons;
            } else if (currentPage + maxPagesAfterCurrent >= pageCount) {
                startPage = pageCount - maxPageButtons + 1;
                endPage = pageCount;
            } else {
                startPage = currentPage - maxPagesBeforeCurrent;
                endPage = currentPage + maxPagesAfterCurrent;
            }
        }

        // 첫 페이지 & ...
        if (startPage > 1) {
            paginationContainer.appendChild(createPageButton(1, data));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.innerText = '...';
                ellipsis.style.cssText = 'padding: 8px 4px; color: var(--icloud-text-secondary); align-self: center;';
                paginationContainer.appendChild(ellipsis);
            }
        }

        // 페이지 번호 버튼들
        for (let i = startPage; i <= endPage; i++) {
            paginationContainer.appendChild(createPageButton(i, data, i === currentPage));
        }

        // 마지막 페이지 & ...
        if (endPage < pageCount) {
            if (endPage < pageCount - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.innerText = '...';
                ellipsis.style.cssText = 'padding: 8px 4px; color: var(--icloud-text-secondary); align-self: center;';
                paginationContainer.appendChild(ellipsis);
            }
            paginationContainer.appendChild(createPageButton(pageCount, data));
        }

        // 다음 버튼
        const nextButton = document.createElement('button');
        nextButton.innerText = '다음';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                renderBoard(currentPage, data);
                setupPagination(data);
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    /**
     * 텍스트에서 검색어를 하이라이트 처리하는 함수
     * @param {string} text - 원본 텍스트
     * @param {string} query - 검색어
     * @returns {string} 하이라이트 처리된 HTML 문자열
     */
    function highlightText(text, query) {
        if (!query || !text) return text;
        const plainQuery = query.replace(/\s/g, '');
        if (!plainQuery) return text;
        const regex = new RegExp(plainQuery.split('').join('\\s*'), 'gi');
        return String(text).replace(regex, `<span class="highlight">$&</span>`);
    }

    /**
     * 검색 입력에 따라 결과를 표시하거나 필터링된 목록으로 돌아가는 함수
     */
    function handleSearch() {
        const originalQuery = searchInput.value.trim();
        const queryForMatching = originalQuery.toLowerCase().replace(/\s/g, '');

        if (!queryForMatching) {
            // 검색어가 없으면 필터링된 게시판 표시
            resultsContainer.innerHTML = '';
            manualBoard.style.display = '';
            paginationContainer.style.display = 'flex';
            categoryTabs.style.display = 'flex';
            displayFilteredData(); // 필터링된 데이터 다시 표시
            return;
        }

        // 검색어가 있으면 게시판, 탭, 페이지네이션 숨기고 검색 결과 표시
        manualBoard.style.display = 'none';
        paginationContainer.style.display = 'none';
        categoryTabs.style.display = 'none';
        resultsContainer.innerHTML = '';

        const filteredResults = manualData.filter(item => {
            const title = (item.Title || '').toLowerCase().replace(/\s/g, '');
            const text = (item.text || '').toLowerCase().replace(/\s/g, '');
            return title.includes(queryForMatching) || text.includes(queryForMatching);
        });

        if (filteredResults.length > 0) {
            filteredResults.forEach(item => {
                const resultDiv = document.createElement('div');
                resultDiv.className = 'result-item';

                let snippetHTML = '';
                const textToSearch = item.text || '';
                const titleToSearch = item.Title || '';

                // 제목에 검색어가 없으면 본문에서 스니펫 생성
                if (!titleToSearch.toLowerCase().replace(/\s/g, '').includes(queryForMatching) && textToSearch.toLowerCase().replace(/\s/g, '').includes(queryForMatching)) {
                    const sentences = textToSearch.split(/[.!?。]/);
                    let foundSentence = '';
                    for (const sentence of sentences) {
                        if (sentence.toLowerCase().replace(/\s/g, '').includes(queryForMatching)) {
                            foundSentence = sentence.trim();
                            break;
                        }
                    }
                    if (foundSentence) {
                        snippetHTML = `<p class="result-snippet">...${highlightText(foundSentence, originalQuery)}...</p>`;
                    }
                }

                resultDiv.innerHTML = `
                    <a href="${item.link}" target="_blank">${highlightText(item.Title, originalQuery)}</a>
                    ${snippetHTML}
                    <p class="result-link">${item.link}</p>
                `;
                resultsContainer.appendChild(resultDiv);
            });
        } else {
            resultsContainer.innerHTML = '<p class="result-item">검색 결과가 없습니다.</p>';
        }
    }
});
