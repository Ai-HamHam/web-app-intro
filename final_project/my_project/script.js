document.addEventListener('DOMContentLoaded', () => {
    const dataList = document.getElementById('data-list');
    const addDataForm = document.getElementById('add-data-form');
    const value1Input = document.getElementById('value1');
    const value2Input = document.getElementById('value2');

    // データ一覧を取得して表示
    async function fetchData() {
        const res = await fetch('/data');
        const data = await res.json();
        const list = document.getElementById('data-list');
        list.innerHTML = '';
        data.forEach(item => {
            const li = document.createElement('li');

            // 表示用span
            const textSpan = document.createElement('span');
            textSpan.textContent = `ID:${item.id} 値1:${item.value_1} 値2:${item.value_2 ?? ''} `;
            li.appendChild(textSpan);

            // 削除ボタン
            const delBtn = document.createElement('button');
            delBtn.textContent = '削除';
            delBtn.classList.add('delete-btn');
            delBtn.style.marginLeft = '8px';
            delBtn.onclick = async () => {
                if (confirm('本当に削除しますか？')) {
                    await fetch(`/data/${item.id}`, { method: 'DELETE' });
                    fetchData();
                }
            };

            // 編集ボタン
            const editBtn = document.createElement('button');
            editBtn.textContent = '編集';
            editBtn.classList.add('edit-btn');
            editBtn.style.marginLeft = '8px';
            editBtn.onclick = () => {
                // 編集フォームを生成
                const value1Edit = document.createElement('input');
                value1Edit.type = 'text';
                value1Edit.value = item.value_1;
                value1Edit.style.marginRight = '4px';

                const value2Edit = document.createElement('input');
                value2Edit.type = 'text';
                value2Edit.value = item.value_2 ?? '';
                value2Edit.style.marginRight = '4px';

                const saveBtn = document.createElement('save-btn');
                saveBtn.textContent = '保存';

                const cancelBtn = document.createElement('cancel-btn');
                cancelBtn.textContent = 'キャンセル';
                cancelBtn.style.marginLeft = '4px';

                // 編集フォーム表示
                li.innerHTML = '';
                li.appendChild(value1Edit);
                li.appendChild(value2Edit);
                li.appendChild(saveBtn);
                li.appendChild(cancelBtn);

                saveBtn.onclick = async () => {
                    await fetch(`/data/${item.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            value_1: value1Edit.value,
                            value_2: value2Edit.value
                        })
                    });
                    fetchData();
                };

                cancelBtn.onclick = () => {
                    fetchData();
                };
            };

            // ボタンをspanでまとめて右寄せ
            const btnSpan = document.createElement('span');
            btnSpan.appendChild(editBtn);
            btnSpan.appendChild(delBtn);
            li.appendChild(btnSpan);

            list.appendChild(li);
        });
    }

    // データ追加フォーム送信時
    addDataForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const value1 = value1Input.value;
        const value2 = value2Input.value;

        try {
            await fetch('/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value_1: value1, value_2: value2 }),
            });

            value1Input.value = '';
            value2Input.value = '';

            await fetchData();

        } catch (error) {
            console.error('データの追加に失敗しました:', error);
            alert('データの追加に失敗しました。');
        }
    });

    fetchData();
});