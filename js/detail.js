document.addEventListener('DOMContentLoaded', () => {
    const detailContainer = document.getElementById('detailContainer');
    const detailDataString = sessionStorage.getItem('hioderDetailData');

    function loadAndRenderDetail() {
        if (!detailDataString) {
            detailContainer.innerHTML = '<p>상세 정보를 불러올 수 없습니다. 가이드 페이지로 돌아가 다시 시도해주세요.</p>';
            return;
        }

        try {
            const item = JSON.parse(detailDataString);

            const subCategoryColor = item.subCategoryColor || 'var(--apple-text-primary)';
            const itemColor = item.itemColor || 'var(--apple-text-primary)';
            const path = item['Path'] ? item['Path'].replace(/>/g, ' &gt; ') : '';

            detailContainer.innerHTML = `
                <div class="detail-card">
                    <p class="detail-sub-category" style="color: ${subCategoryColor};">${item['Sub Category']}</p>
                    <p class="detail-item" style="color: ${itemColor};"> ㄴ ${item['Item']}</p>
                    <p class="detail-sub-item"> &nbsp;&nbsp;&nbsp;ㄴ ${item['Sub item']}</p>

                    <div class="detail-field-group">
                        <p class="detail-field-title">세부 내용</p>
                        <p class="detail-field-content"> &nbsp; ${item['Field']}</p>
                    </div>
                    <div class="detail-field-group">
                        <p class="detail-field-title">사용 목적</p>
                        <p class="detail-field-content purpose-content"> &nbsp; ${item['Purpose']}</p>
                    </div>
                    <p class="detail-path"><b>경로 : </b> ${path}</p>
                </div>
            `;

        } catch (error) {
            console.error("Could not load or render detail:", error);
            detailContainer.innerHTML = '<p style="color: red;">상세 정보를 표시하는 중 오류가 발생했습니다.</p>';
        }
    }

    loadAndRenderDetail();
});
