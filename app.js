const classColors = [
    "#E8F0FF",  // 강의 0 배경색
    "#FFF7D6",  // 강의 1 배경색
    "#E8FFE8",  // 강의 2 배경색
    "#FFE8F0",  // 강의 3 배경색
    "#F0E8FF",  // 강의 4 배경색
    "#E8FFFF",  // 강의 5 배경색
    "#FFF0E8"   // 강의 6 배경색
];

let selectedNoticeText = "";  // 사용자가 클릭한 공지 본문 저장

// ------------------------------
// 1) 공지 목록 불러오기
// ------------------------------
async function loadNotices() {
    try {
        let res = await fetch("http://hufsmate-production.up.railway.app/notices");
        let data = await res.json();

        const container = document.getElementById("notice-list");

        // 공지 제목들 렌더링
        data.titles.forEach((classNotices, classIndex) => {
            classNotices.forEach((title, idx) => {
                const item = document.createElement("div");
                item.className = "notice-item";
                item.innerText = title;

                // 🔥 공지 아이템에 강의별 배경색 적용
                item.style.backgroundColor = classColors[classIndex] + "40";  
                // 뒤의 40은 투명도(약 25%)



                // 공지 클릭 이벤트
                item.onclick = () => {
                    selectedNoticeText = data.contents[classIndex][idx];
                    document.getElementById("notice-content").innerText = selectedNoticeText;

                    // 기존 선택 제거
                    document.querySelectorAll(".notice-item")
                        .forEach(el => el.classList.remove("selected"));
                    item.classList.add("selected");

                    // 🔥 클릭 시, 전체 배경을 그라데이션으로 변경
                    changeBackgroundGradient(classColors[classIndex]);
                };

                container.appendChild(item);
            });
        });

    } catch (err) {
        console.error("공지 불러오기 오류:", err);
    }
}

loadNotices();


// ------------------------------
// 2) AI 분석 요청 보내기
// ------------------------------
async function askAI() {
    if (!selectedNoticeText) {
        alert("먼저 공지를 선택하세요!");
        return;
    }

    const userPrompt = document.getElementById("user-command").value;
    const button = document.getElementById("ai-button");
    const spinner = document.getElementById("loading-spinner");

    // 🔥 버튼 로딩 상태 ON
    button.classList.add("loading");
    spinner.style.display = "inline-block";

    try {
        let res = await fetch("http://hufsmate-production.up.railway.app/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: selectedNoticeText,
                prompt: userPrompt
            })
        });

        let data = await res.json();
        document.getElementById("result").innerText = data.result;

    } catch (err) {
        console.error("AI 요청 오류:", err);
        alert("AI 분석 중 오류 발생");
    }

    // 🔥 버튼 로딩 상태 OFF
    button.classList.remove("loading");
    spinner.style.display = "none";
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function changeBackgroundGradient(color) {
    // 문서 전체에 transition 적용
    document.body.style.transition = "background 1.2s ease";

    // 클릭된 강의 색을 기준으로 그라데이션 생성
    document.body.style.background = `
        linear-gradient(135deg, ${color} 0%, #ffffff 80%)
    `;
}


async function refreshCache() {
    const button = document.getElementById("refresh-cache-button");
    const status = document.getElementById("cache-status");

    // 로딩 상태 UI
    button.disabled = true;
    button.innerText = "⏳ 새로고침 중...";
    status.innerText = "";

    try {
        let res = await fetch("http://hufsmate-production.up.railway.app/refresh-cache", {
            method: "POST"
        });

        let data = await res.json();

        // 성공 메시지
        status.innerText = " 캐시가 새로고침되었습니다!";

        await sleep(500);
        
        status.innerText = "";

        // 공지 목록 다시 로드
        document.getElementById("notice-list").innerHTML = "";
        loadNotices();

    } catch (err) {
        status.innerText = "오류 발생!";
        console.error(err);
    }

    // 버튼 복구
    button.disabled = false;
    button.innerText = "🔄 강의 목록 새로고침";
}
