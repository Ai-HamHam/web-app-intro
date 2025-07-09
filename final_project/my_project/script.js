document.addEventListener('DOMContentLoaded', () => {
    const dataList = document.querySelector('ul');
    const addDataForm = document.querySelector('form');
    const value1Input = addDataForm.querySelector('input[name="value1"]');
    const value2Input = addDataForm.querySelector('input[name="value2"]');

    // データ一覧を取得して表示
    async function fetchData() {
        const res = await fetch('/data');
        const data = await res.json();
        const list = document.querySelector('ul');
        list.innerHTML = '';
        data.forEach(item => {
            const li = document.createElement('li');

            // 表示用span
            const textSpan = document.createElement('span');
            textSpan.innerHTML = `日付:${item.value_1}<br>memo:${item.value_2 ?? ''}`;
            li.appendChild(textSpan);

            // ボタンをspanでまとめて右寄せ
            const btnSpan = document.createElement('span');
            btnSpan.style.display = 'flex';
            btnSpan.style.flexDirection = 'row';
            btnSpan.style.justifyContent = 'flex-end';
            btnSpan.style.alignItems = 'center';
            btnSpan.style.marginLeft = 'auto';

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

                // 保存ボタンとキャンセルボタンをbutton要素で作成
                const saveBtn = document.createElement('button');
                saveBtn.textContent = '保存';
                saveBtn.classList.add('save-btn');

                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'キャンセル';
                cancelBtn.classList.add('cancel-btn');
                cancelBtn.style.marginLeft = '8px';

                // ボタンを横並び・中央配置にするためのspan
                const editBtnSpan = document.createElement('span');
                editBtnSpan.style.display = 'flex';
                editBtnSpan.style.flexDirection = 'row';
                editBtnSpan.style.justifyContent = 'flex-end';
                editBtnSpan.style.alignItems = 'center';
                editBtnSpan.style.width = '100%';
                editBtnSpan.style.marginTop = '8px';
                editBtnSpan.appendChild(saveBtn);
                editBtnSpan.appendChild(cancelBtn);

                // 編集フォーム表示
                li.innerHTML = '';
                li.appendChild(value1Edit);
                li.appendChild(value2Edit);
                li.appendChild(editBtnSpan);

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

            btnSpan.appendChild(editBtn);
            btnSpan.appendChild(delBtn);

            // liをflex化してボタンを右端に
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

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

            setNowToValue1(); // 追加後に再度自動入力

        } catch (error) {
            console.error('データの追加に失敗しました:', error);
            alert('データの追加に失敗しました。');
        }
    });

    // 値1に自動で今の日時（何年、何月、何曜日、何時）が記入されるようにする
    function setNowToValue1() {
        const now = new Date();
        const week = ['日', '月', '火', '水', '木', '金', '土'];
        const str = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日(${week[now.getDay()]}) ${now.getHours()}時${now.getMinutes()}分`;
        value1Input.value = str;
    }

    // ページ読み込み時に自動入力
    setNowToValue1();

    // フォームがリセットされたときも自動入力
    addDataForm.addEventListener('reset', setNowToValue1);

    fetchData();

    // マウスストーカーを作成
    function createStalker() {
        const stalker = document.createElement('div');
        stalker.className = 'mouse-stalker';

        // ランダムな色を生成
        const color1 = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
        const color2 = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
        stalker.style.background = color1;
        stalker.style.opacity = '0.2';
        stalker.style.border = `2px solid ${color1}`;

        // ランダムな大きさ（最小20px, 最大60px程度）
        const size = Math.floor(Math.random() * 41) + 20;
        stalker.style.width = `${size}px`;
        stalker.style.height = `${size}px`;

        document.body.appendChild(stalker);

        // ランダムな追従スピード（1〜5px/frame）
        const speed = Math.random() * 4 + 1;

        let mouseX = 0, mouseY = 0;
        let stalkerX = window.innerWidth / 2, stalkerY = window.innerHeight / 2;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateStalker() {
            const dx = mouseX - stalkerX;
            const dy = mouseY - stalkerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // マウスに当たったらグラデーション
            if (distance < size / 2) {
                stalker.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
                stalker.style.opacity = '0.5';
                stalker.style.border = `2px solid ${color2}`;
            } else {
                stalker.style.background = color1;
                stalker.style.opacity = '0.2';
                stalker.style.border = `2px solid ${color1}`;
            }

            if (distance > speed) {
                stalkerX += (dx / distance) * speed;
                stalkerY += (dy / distance) * speed;
            } else {
                stalkerX = mouseX;
                stalkerY = mouseY;
            }

            stalker.style.left = `${stalkerX}px`;
            stalker.style.top = `${stalkerY}px`;
            requestAnimationFrame(animateStalker);
        }
        animateStalker();
    }

    // 最初のストーカーを1つ作成
    createStalker();

    // 何もないところをダブルクリックでストーカー追加
    document.addEventListener('dblclick', (e) => {
        // ボタンや入力欄など以外でのみ追加
        if (e.target === document.body || e.target === document.documentElement) {
            createStalker();
        }
    });
});