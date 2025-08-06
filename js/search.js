document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('manualSearchInput');
    const resultsContainer = document.getElementById('searchResults');

    // manualData.json 파일에서 데이터를 비동기적으로 불러옵니다.
    fetch('data/manualData.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(manualData => {
            // 검색 이벤트 리스너를 데이터 로드 후에 추가합니다.
            searchInput.addEventListener('input', () => handleSearch(manualData));
        })
        .catch(error => {
            console.error('Error fetching or parsing manualData.json:', error);
            resultsContainer.innerHTML = `<p class="result-item" style="color: red;">매뉴얼 데이터를 불러오는 데 실패했습니다. 파일을 확인해주세요.</p>`;
        });


    function highlightText(text, query) {
        if (!query || !text) return text;
        const plainQuery = query.replace(/\s/g, '');
        if (!plainQuery) return text;
        
        // 정규 표현식을 사용하여 띄어쓰기를 무시하고 일치하는 부분을 찾습니다.
        const regex = new RegExp(plainQuery.split('').join('\\s*'), 'gi');
        return String(text).replace(regex, `<span class="highlight">$&</span>`);
    }

    function handleSearch(manualData) {
        const originalQuery = searchInput.value.trim();
        const queryForMatching = originalQuery.toLowerCase().replace(/\s/g, '');
        resultsContainer.innerHTML = '';

        if (!queryForMatching) {
            return;
        }

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

                // 제목에 검색어가 없으면 본문에서 검색하여 스니펫을 생성합니다.
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
