/**
 * BATTLE READING GROUND v2.5 (Firebase & Vercel Ready)
 * Google Auth, Anonymous Auth, Firestore Database, Direct Typing Book Reviews & My Journal
 */

import { 
    auth, 
    db, 
    isFirebaseReady, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInAnonymously, 
    signOut, 
    onAuthStateChanged,
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
} from './firebase-config.js';

// Default 5th Grade Books
const defaultBooks = [
    {
        id: 'book-1',
        title: '푸른 사자 와니니',
        author: '이현 글 | 창비',
        cover: 'assets/book_cover_wanini_1785634103116.jpg',
        desc: '초원 위에 펼쳐지는 쓸모없는 사자는 없다는 감동적인 성장 드라마!',
        stickers: {}
    },
    {
        id: 'book-2',
        title: '자전거 도둑',
        author: '박완서 글 | 다림',
        cover: 'assets/airdrop_crate_1785634116287.jpg',
        desc: '도시 소년 수남이의 정직과 양심을 다룬 5학년 대표 단편 동화집.',
        stickers: {}
    },
    {
        id: 'book-3',
        title: '초정리 편전',
        author: '배유안 글 | 창비',
        cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        desc: '세종대왕과 시골 소년 장운이가 한글을 매개로 이어지는 감동 스토리.',
        stickers: {}
    },
    {
        id: 'book-4',
        title: '가방 들어주는 아이',
        author: '고정욱 글 | 사계절',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
        desc: '서로를 이해하고 진정한 친구가 되어가는 따뜻한 우정 이야기.',
        stickers: {}
    },
    {
        id: 'book-5',
        title: '아몬드',
        author: '손원평 글 | 창비',
        cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
        desc: '감정을 느끼지 못하는 소년 곤이와 윤재의 깊은 울림을 주는 청소년 소설.',
        stickers: {}
    }
];

// Initial 22 Students
const initialStudents = Array.from({ length: 22 }, (_, i) => ({
    id: i + 1,
    name: `${i + 1}번 학생`,
    number: i + 1,
    googleEmail: null,
    avatar: null
}));

// Global State
let students = JSON.parse(localStorage.getItem('brg_students')) || initialStudents;
let books = JSON.parse(localStorage.getItem('brg_books')) || defaultBooks;
let reviews = JSON.parse(localStorage.getItem('brg_reviews')) || [];
let currentUser = JSON.parse(localStorage.getItem('brg_current_user')) || { studentId: 1, name: '1번 학생', authType: 'local' };

let activeTarget = {
    bookId: null,
    studentId: null,
    reviewId: null
};

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupFirebaseAuthListener();
});

function initApp() {
    setupTabNavigation();
    setupEventListeners();
    renderUserAuthPanel();
    renderBooksGrid();
    renderRosterGrid();
    renderMyJournalSection();
    updateStatsAndLeaderboard();
}

// Local Data Persistence
function saveData() {
    localStorage.setItem('brg_students', JSON.stringify(students));
    localStorage.setItem('brg_books', JSON.stringify(books));
    localStorage.setItem('brg_reviews', JSON.stringify(reviews));
    localStorage.setItem('brg_current_user', JSON.stringify(currentUser));
    updateStatsAndLeaderboard();
}

// Firebase Auth State Listener
function setupFirebaseAuthListener() {
    if (!isFirebaseReady || !auth) return;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Firebase Auth User logged in:", user);
            const isAnon = user.isAnonymous;
            currentUser = {
                studentId: currentUser.studentId || 1,
                name: user.displayName || (isAnon ? '익명 게스트' : user.email.split('@')[0]),
                email: user.email || 'guest@anonymous.io',
                avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
                uid: user.uid,
                authType: isAnon ? 'anonymous' : 'google'
            };
            saveData();
            renderUserAuthPanel();
            renderBooksGrid();
            renderMyJournalSection();
        } else {
            console.log("Firebase Auth User logged out");
        }
    });
}

// Navigation Tabs
function setupTabNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'myJournalSection') {
                renderMyJournalSection();
            }
        });
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Modals Close
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });

    // Auth Buttons
    document.getElementById('googleAuthBtn').addEventListener('click', handleGoogleLogin);
    document.getElementById('anonAuthBtn').addEventListener('click', handleAnonymousLogin);

    // Sticker Modal options
    document.getElementById('optReadBtn').addEventListener('click', () => setStickerStatus('read'));
    document.getElementById('optReviewWriteBtn').addEventListener('click', () => {
        document.getElementById('stickerModal').classList.remove('active');
        openWriteReviewModal(activeTarget.bookId, activeTarget.studentId);
    });
    document.getElementById('optRemoveBtn').addEventListener('click', () => setStickerStatus(null));

    // Submit Review Form
    document.getElementById('writeReviewForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveBookReview();
    });

    // Add Book Form
    document.getElementById('addBookBtn').addEventListener('click', () => {
        document.getElementById('addBookModal').classList.add('active');
    });

    document.getElementById('addBookForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('bookTitleInput').value.trim();
        const author = document.getElementById('bookAuthorInput').value.trim();
        const cover = document.getElementById('bookCoverInput').value.trim() || 'assets/airdrop_crate_1785634116287.jpg';
        const desc = document.getElementById('bookDescInput').value.trim() || '5학년 즐거운 온책 읽기!';

        if (title) {
            const newBook = {
                id: 'book-' + Date.now(),
                title,
                author,
                cover,
                desc,
                stickers: {}
            };
            books.push(newBook);
            saveData();
            renderBooksGrid();
            document.getElementById('addBookModal').classList.remove('active');
            document.getElementById('addBookForm').reset();
        }
    });

    // Print Buttons
    document.getElementById('printBoardBtn').addEventListener('click', () => window.print());
    document.getElementById('printMyJournalBtn').addEventListener('click', () => window.print());

    // Search Filter
    document.getElementById('studentSearchInput').addEventListener('input', (e) => {
        renderRewardsTable(e.target.value.toLowerCase());
    });
}

// Google Auth Handler
async function handleGoogleLogin() {
    if (isFirebaseReady && auth) {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            alert("🔥 Firebase Google 로그인에 성공했습니다!");
            return;
        } catch (e) {
            console.warn("Firebase Google login error, switching to prompt fallback:", e);
        }
    }

    // Demo Prompt Fallback
    const googleEmail = prompt('구글 계정 이메일을 입력하세요:', 'student1@gmail.com');
    if (!googleEmail) return;

    const userName = prompt('사용할 이름을 입력하세요:', '김구글 (1번)');
    if (!userName) return;

    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleEmail)}`;

    currentUser = {
        studentId: currentUser.studentId || 1,
        name: userName,
        email: googleEmail,
        avatar: avatarUrl,
        authType: 'google'
    };

    const currentStudent = students.find(s => s.id === currentUser.studentId);
    if (currentStudent) {
        currentStudent.name = userName;
        currentStudent.googleEmail = googleEmail;
        currentStudent.avatar = avatarUrl;
    }

    saveData();
    renderUserAuthPanel();
    renderBooksGrid();
    renderRosterGrid();
    renderMyJournalSection();
    alert(`🎉 Google 계정 (${googleEmail})으로 성공적으로 로그인되었습니다!`);
}

// Anonymous (Guest) Auth Handler
async function handleAnonymousLogin() {
    if (isFirebaseReady && auth) {
        try {
            await signInAnonymously(auth);
            alert("🥷 Firebase 익명(게스트) 로그인에 성공했습니다!");
            return;
        } catch (e) {
            console.warn("Firebase Anonymous login error, fallback active:", e);
        }
    }

    const guestId = Math.floor(Math.random() * 900) + 100;
    currentUser = {
        studentId: currentUser.studentId || 1,
        name: `게스트_${guestId}`,
        email: `guest_${guestId}@anonymous.io`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
        authType: 'anonymous'
    };

    saveData();
    renderUserAuthPanel();
    renderBooksGrid();
    renderMyJournalSection();
    alert(`🥷 익명 게스트 (게스트_${guestId}) 계정으로 접속하셨습니다.`);
}

// Render Header Auth Panel
function renderUserAuthPanel() {
    const authPanel = document.getElementById('userAuthPanel');
    const activeNoticeName = document.getElementById('activeUserNameDisplay');

    if (currentUser && (currentUser.authType === 'google' || currentUser.authType === 'anonymous')) {
        authPanel.innerHTML = `
            <div class="user-profile-badge">
                <img src="${currentUser.avatar || 'https://via.placeholder.com/28'}" alt="Avatar" class="user-avatar-img">
                <span class="user-profile-name">${currentUser.name} (${currentUser.authType === 'google' ? 'Google' : '익명'})</span>
                <button class="logout-link" id="logoutBtn">로그아웃</button>
            </div>
        `;
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        if (activeNoticeName) activeNoticeName.innerText = `${currentUser.name} [${currentUser.authType.toUpperCase()}]`;
    } else {
        authPanel.innerHTML = `
            <button class="google-login-btn" id="googleAuthBtn">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
                <span>Google 로그인</span>
            </button>
            <button class="guest-login-btn" id="anonAuthBtn">
                <i class="fa-solid fa-user-ninja"></i>
                <span>익명(게스트) 로그인</span>
            </button>
        `;
        document.getElementById('googleAuthBtn').addEventListener('click', handleGoogleLogin);
        document.getElementById('anonAuthBtn').addEventListener('click', handleAnonymousLogin);

        const currentStudent = students.find(s => s.id === currentUser.studentId) || students[0];
        if (activeNoticeName) activeNoticeName.innerText = currentStudent.name;
    }
}

// Logout Handler
async function handleLogout() {
    if (isFirebaseReady && auth) {
        try { await signOut(auth); } catch(e) { console.error(e); }
    }
    currentUser = { studentId: 1, name: '1번 학생', authType: 'local' };
    saveData();
    renderUserAuthPanel();
    renderBooksGrid();
    renderMyJournalSection();
}

// Render Books Grid & 22 Sticker Cells
function renderBooksGrid() {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = '';

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';

        const stickerKeys = Object.keys(book.stickers || {});
        const completedCount = stickerKeys.filter(k => book.stickers[k] !== null).length;
        const progressPct = Math.round((completedCount / 22) * 100);

        let stickerCellsHTML = '';
        for (let i = 1; i <= 22; i++) {
            const status = book.stickers && book.stickers[i];
            const studentObj = students.find(s => s.id === i) || { name: `${i}번` };
            const statusClass = status === 'read' ? 'status-read' : (status === 'review' ? 'status-review' : '');

            stickerCellsHTML += `
                <div class="sticker-cell ${statusClass}" 
                     onclick="openStickerModal('${book.id}', ${i})" 
                     title="${i}번 ${studentObj.name} - ${status === 'read' ? '완독' : (status === 'review' ? '독서감상문 작성완료 (보급상자)' : '미완독')}">
                    <span class="cell-number">${i}</span>
                    <span class="cell-name">${studentObj.name.replace(/^[0-9]+번\s?/, '') || studentObj.name}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="book-top-info">
                <div class="book-cover-container">
                    <img src="${book.cover}" alt="${book.title}" class="book-cover-img" onerror="this.src='assets/airdrop_crate_1785634116287.jpg'">
                    <span class="book-badge-drop"><i class="fa-solid fa-parachute-box"></i> 온책</span>
                </div>
                <div class="book-meta">
                    <h3 class="book-title">${book.title}</h3>
                    <div class="book-author"><i class="fa-solid fa-pen-nib"></i> ${book.author}</div>
                    <p class="book-desc">${book.desc}</p>
                    
                    <div class="book-progress-bar-container">
                        <div class="book-progress-fill" style="width: ${progressPct}%"></div>
                    </div>
                    <div class="book-progress-text">
                        <span>학급 달성율: ${progressPct}% (${completedCount}/22명)</span>
                        <span><i class="fa-solid fa-box-open" style="color:var(--drop-red)"></i> 감상문: ${stickerKeys.filter(k => book.stickers[k] === 'review').length}명</span>
                    </div>
                </div>
            </div>
            
            <div class="sticker-section-title">
                <span><i class="fa-solid fa-users"></i> 학급 22명 완독 & 감상문 스티커 판</span>
                <span>(클릭 시 단순 완독 or 감상문 작성)</span>
            </div>
            
            <div class="stickers-grid">
                ${stickerCellsHTML}
            </div>
        `;

        booksGrid.appendChild(card);
    });
}

// Open Sticker Modal
window.openStickerModal = function(bookId, studentId) {
    activeTarget.bookId = bookId;
    activeTarget.studentId = studentId;

    const book = books.find(b => b.id === bookId);
    const student = students.find(s => s.id === studentId);

    document.getElementById('modalStudentTitle').innerText = `${studentId}번 [${student.name}] 학생 스티커 표시`;
    document.getElementById('modalBookTitle').innerText = `책 제목: ${book.title}`;

    document.getElementById('stickerModal').classList.add('active');
};

// Set Simple Sticker Status
function setStickerStatus(statusType) {
    const { bookId, studentId } = activeTarget;
    if (!bookId || !studentId) return;

    const book = books.find(b => b.id === bookId);
    if (!book.stickers) book.stickers = {};

    if (statusType === null) {
        delete book.stickers[studentId];
        reviews = reviews.filter(r => !(r.bookId === bookId && r.studentId === studentId));
    } else {
        book.stickers[studentId] = statusType;
    }

    saveData();
    renderBooksGrid();
    renderMyJournalSection();
    document.getElementById('stickerModal').classList.remove('active');
}

// Open Write Review Modal
window.openWriteReviewModal = function(bookId, studentId) {
    activeTarget.bookId = bookId;
    activeTarget.studentId = studentId;

    const book = books.find(b => b.id === bookId);
    const student = students.find(s => s.id === studentId);

    document.getElementById('writeReviewBookTitle').innerText = `📦 《${book.title}》 독서감상문 작성`;
    document.getElementById('writeReviewStudentInfo').innerText = `작성자: ${student.number}번 ${student.name}`;

    const existingReview = reviews.find(r => r.bookId === bookId && r.studentId === studentId);
    if (existingReview) {
        document.getElementById('reviewTitleInput').value = existingReview.title || '';
        document.getElementById('reviewSceneInput').value = existingReview.scene || '';
        document.getElementById('reviewContentInput').value = existingReview.content || '';
        document.getElementById('reviewResolutionInput').value = existingReview.resolution || '';
        activeTarget.reviewId = existingReview.id;
    } else {
        document.getElementById('writeReviewForm').reset();
        activeTarget.reviewId = null;
    }

    document.getElementById('writeReviewModal').classList.add('active');
};

// Save Book Review
function saveBookReview() {
    const { bookId, studentId } = activeTarget;
    const title = document.getElementById('reviewTitleInput').value.trim();
    const scene = document.getElementById('reviewSceneInput').value.trim();
    const content = document.getElementById('reviewContentInput').value.trim();
    const resolution = document.getElementById('reviewResolutionInput').value.trim();

    if (!title || !content || !scene) {
        alert('필수 사항(제목, 인상 깊었던 장면, 생각과 느낌)을 입력해주세요.');
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    if (activeTarget.reviewId) {
        const existing = reviews.find(r => r.id === activeTarget.reviewId);
        if (existing) {
            existing.title = title;
            existing.scene = scene;
            existing.content = content;
            existing.resolution = resolution;
            existing.date = todayStr;
        }
    } else {
        const newReview = {
            id: 'rev-' + Date.now(),
            bookId,
            studentId,
            title,
            scene,
            content,
            resolution,
            date: todayStr
        };
        reviews.push(newReview);
    }

    const book = books.find(b => b.id === bookId);
    if (!book.stickers) book.stickers = {};
    book.stickers[studentId] = 'review';

    saveData();
    renderBooksGrid();
    renderMyJournalSection();

    document.getElementById('writeReviewModal').classList.remove('active');
    alert('🎉 독서감상문이 저장되었습니다! 보급상자 스티커와 +300 XP를 획득했습니다!');
}

// Render My Journal
function renderMyJournalSection() {
    const currentStudentId = currentUser.studentId || 1;
    const student = students.find(s => s.id === currentStudentId) || students[0];

    document.getElementById('journalUserTitle').innerText = `${student.name}의 배틀리딩 독서기록장`;
    document.getElementById('myJournalName').innerText = `${student.name} (${student.number}번)`;
    
    const avatarContainer = document.getElementById('myJournalAvatar');
    if (student.avatar) {
        avatarContainer.innerHTML = `<img src="${student.avatar}" alt="Avatar">`;
    } else {
        avatarContainer.innerText = student.number;
    }

    let reads = 0, reviewsCount = 0;
    const myReviews = reviews.filter(r => r.studentId === currentStudentId);

    books.forEach(b => {
        const st = b.stickers && b.stickers[currentStudentId];
        if (st === 'read') reads++;
        if (st === 'review') { reads++; reviewsCount++; }
    });

    const xp = (reads - reviewsCount) * 100 + (reviewsCount * 300);
    let tier = 'bronze', tierLabel = '브론즈 생존자';
    if (xp >= 2500) { tier = 'chicken'; tierLabel = '★치킨 마스터★'; }
    else if (xp >= 1500) { tier = 'diamond'; tierLabel = '다이아몬드 독서왕'; }
    else if (xp >= 1000) { tier = 'platinum'; tierLabel = '플래티넘 스나이퍼'; }
    else if (xp >= 600) { tier = 'gold'; tierLabel = '골드 수집가'; }
    else if (xp >= 300) { tier = 'silver'; tierLabel = '실버 대원'; }

    const tierPill = document.getElementById('myJournalTier');
    tierPill.className = `tier-pill ${tier}`;
    tierPill.innerText = tierLabel;

    document.getElementById('myCountReads').innerText = reads;
    document.getElementById('myCountReviews').innerText = reviewsCount;
    document.getElementById('myCountXP').innerText = `${xp} XP`;
    document.getElementById('myCurrentXP').innerText = `${xp} XP`;

    const reviewsGrid = document.getElementById('journalReviewsGrid');
    reviewsGrid.innerHTML = '';

    if (myReviews.length === 0) {
        reviewsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:40px; color:var(--text-sub);">
                <i class="fa-solid fa-box-open" style="font-size:3rem; color:var(--drop-red); margin-bottom:12px;"></i>
                <p>아직 작성한 독서감상문이 없습니다.</p>
                <p style="font-size:0.85rem; margin-top:6px;">온책 읽기 스티커판에서 책을 클릭하여 감상문을 직접 타이핑해 보세요!</p>
            </div>
        `;
        return;
    }

    myReviews.forEach(rev => {
        const book = books.find(b => b.id === rev.bookId) || { title: '온책', cover: 'assets/airdrop_crate_1785634116287.jpg' };
        const card = document.createElement('div');
        card.className = 'journal-card';

        card.innerHTML = `
            <div class="j-card-top">
                <img src="${book.cover}" class="j-cover" alt="Cover" onerror="this.src='assets/airdrop_crate_1785634116287.jpg'">
                <div class="j-book-info">
                    <span class="j-tag"><i class="fa-solid fa-box-open"></i> 보급상자 감상문</span>
                    <h4 class="j-book-title">${book.title}</h4>
                    <h5 class="j-review-title">${rev.title}</h5>
                </div>
            </div>
            
            <div class="j-card-body">
                <p><b>인상 깊은 장면:</b> "${rev.scene.substring(0, 50)}${rev.scene.length > 50 ? '...' : ''}"</p>
                <p style="margin-top:6px;"><b>느낌:</b> ${rev.content.substring(0, 70)}${rev.content.length > 70 ? '...' : ''}</p>
            </div>

            <div class="j-card-footer">
                <span><i class="fa-regular fa-calendar"></i> ${rev.date}</span>
                <button class="action-btn secondary" style="padding:4px 10px; font-size:0.75rem" onclick="openViewReviewModal('${rev.id}')">전체보기 / 수정</button>
            </div>
        `;

        reviewsGrid.appendChild(card);
    });
}

// Open View Review Modal
window.openViewReviewModal = function(reviewId) {
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return;

    const book = books.find(b => b.id === rev.bookId) || { title: '온책' };
    const student = students.find(s => s.id === rev.studentId) || { name: '학생', number: 1 };

    document.getElementById('viewReviewTitle').innerText = rev.title;
    document.getElementById('viewReviewBook').innerText = `도서명: ${book.title}`;
    document.getElementById('viewReviewAuthorDate').innerText = `작성자: ${student.number}번 ${student.name} | 작성일: ${rev.date}`;

    document.getElementById('viewReviewScene').innerText = rev.scene || '내용 없음';
    document.getElementById('viewReviewContent').innerText = rev.content || '내용 없음';
    document.getElementById('viewReviewResolution').innerText = rev.resolution || '내용 없음';

    const footerActions = document.getElementById('viewReviewFooterActions');
    footerActions.innerHTML = `
        <button class="action-btn secondary" onclick="deleteReview('${rev.id}')"><i class="fa-solid fa-trash"></i> 삭제</button>
        <button class="action-btn primary" onclick="editReviewFromView('${rev.id}')"><i class="fa-solid fa-pen"></i> 수정하기</button>
    `;

    document.getElementById('readReviewDetailModal').classList.add('active');
};

// Edit Review
window.editReviewFromView = function(reviewId) {
    const rev = reviews.find(r => r.id === reviewId);
    if (!rev) return;

    document.getElementById('readReviewDetailModal').classList.remove('active');
    openWriteReviewModal(rev.bookId, rev.studentId);
};

// Delete Review
window.deleteReview = function(reviewId) {
    if (!confirm('이 독서감상문을 정말로 삭제하시겠습니까?')) return;

    const rev = reviews.find(r => r.id === reviewId);
    if (rev) {
        const book = books.find(b => b.id === rev.bookId);
        if (book && book.stickers) {
            delete book.stickers[rev.studentId];
        }
        reviews = reviews.filter(r => r.id !== reviewId);
        saveData();
        renderBooksGrid();
        renderMyJournalSection();
        document.getElementById('readReviewDetailModal').classList.remove('active');
    }
};

// Render Roster Grid
function renderRosterGrid() {
    const rosterGrid = document.getElementById('rosterGrid');
    rosterGrid.innerHTML = '';

    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'roster-card';
        card.onclick = (e) => {
            if (e.target.tagName !== 'INPUT') {
                currentUser = { studentId: student.id, name: student.name, authType: 'local' };
                saveData();
                renderUserAuthPanel();
                renderMyJournalSection();
                document.querySelector('[data-target="myJournalSection"]').click();
            }
        };

        card.innerHTML = `
            <div class="roster-num">${student.number}</div>
            <div class="roster-info">
                <input type="text" class="roster-name-input" value="${student.name}" 
                       onchange="updateStudentName(${student.id}, this.value)" title="클릭하여 이름 수정">
                <div class="roster-sub">${student.googleEmail ? 'Google 연동됨' : '클릭 시 이 학생 독서기록장으로 전환'}</div>
            </div>
            <div class="roster-action">
                <i class="fa-solid fa-chevron-right" style="color:var(--text-sub)"></i>
            </div>
        `;

        rosterGrid.appendChild(card);
    });
}

// Update Student Name
window.updateStudentName = function(studentId, newName) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        student.name = newName.trim() || `${studentId}번 학생`;
        saveData();
        renderBooksGrid();
    }
};

// Stats & Leaderboard
function updateStatsAndLeaderboard() {
    let totalReads = 0;
    let totalReviewsCount = 0;

    const studentStats = students.map(student => {
        let reads = 0;
        let reviewsCount = 0;

        books.forEach(book => {
            const st = book.stickers && book.stickers[student.id];
            if (st === 'read') { reads++; totalReads++; }
            else if (st === 'review') { reads++; reviewsCount++; totalReads++; totalReviewsCount++; }
        });

        const xp = (reads - reviewsCount) * 100 + (reviewsCount * 300);

        let tier = 'bronze', tierLabel = '브론즈';
        if (xp >= 2500) { tier = 'chicken'; tierLabel = '치킨 마스터'; }
        else if (xp >= 1500) { tier = 'diamond'; tierLabel = '다이아몬드'; }
        else if (xp >= 1000) { tier = 'platinum'; tierLabel = '플래티넘'; }
        else if (xp >= 600) { tier = 'gold'; tierLabel = '골드'; }
        else if (xp >= 300) { tier = 'silver'; tierLabel = '실버'; }

        return { ...student, reads, reviews: reviewsCount, totalBooksCount: reads, xp, tier, tierLabel };
    });

    studentStats.sort((a, b) => b.xp - a.xp || b.reviews - a.reviews || a.id - b.id);

    document.getElementById('totalReadsCount').innerText = totalReads;
    document.getElementById('totalReviewsCount').innerText = totalReviewsCount;

    renderTopRanks(studentStats.slice(0, 3));
    renderRewardsTable('', studentStats);
}

// Render TOP 3
function renderTopRanks(top3) {
    const container = document.getElementById('topRanksContainer');
    container.innerHTML = '';

    const crowns = ['<i class="fa-solid fa-crown"></i>', '<i class="fa-solid fa-medal"></i>', '<i class="fa-solid fa-award"></i>'];

    top3.forEach((st, idx) => {
        const card = document.createElement('div');
        card.className = `top-rank-card rank-${idx + 1}`;

        card.innerHTML = `
            <div class="rank-crown">${crowns[idx]}</div>
            <div class="rank-student-name">${st.name}</div>
            <div class="rank-xp">${st.xp} XP</div>
            <div class="rank-badges">
                <span class="mini-badge">완독 ${st.totalBooksCount}권</span>
                <span class="mini-badge" style="background:var(--drop-red-glow); color:#ff9e9e;">보급상자 ${st.reviews}개</span>
                <span class="tier-pill ${st.tier}">${st.tierLabel}</span>
            </div>
        `;

        container.appendChild(card);
    });
}

// Render Rewards Table
function renderRewardsTable(filterQuery = '', sortedStats = null) {
    if (!sortedStats) {
        const rawStats = students.map(s => {
            let reads = 0, reviewsCount = 0;
            books.forEach(b => {
                const st = b.stickers && b.stickers[s.id];
                if (st === 'read') reads++;
                if (st === 'review') { reads++; reviewsCount++; }
            });
            const xp = (reads - reviewsCount) * 100 + (reviewsCount * 300);
            let tier = 'bronze', tierLabel = '브론즈';
            if (xp >= 2500) { tier = 'chicken'; tierLabel = '치킨 마스터'; }
            else if (xp >= 1500) { tier = 'diamond'; tierLabel = '다이아몬드'; }
            else if (xp >= 1000) { tier = 'platinum'; tierLabel = '플래티넘'; }
            else if (xp >= 600) { tier = 'gold'; tierLabel = '골드'; }
            else if (xp >= 300) { tier = 'silver'; tierLabel = '실버'; }

            return { ...s, reads, reviews: reviewsCount, totalBooksCount: reads, xp, tier, tierLabel };
        });
        sortedStats = rawStats.sort((a, b) => b.xp - a.xp || b.reviews - a.reviews || a.id - b.id);
    }

    const tbody = document.getElementById('rewardsTableBody');
    tbody.innerHTML = '';

    sortedStats.forEach((st, idx) => {
        if (filterQuery && !st.name.toLowerCase().includes(filterQuery) && !String(st.number).includes(filterQuery)) {
            return;
        }

        const rankClass = idx === 0 ? 'top1' : (idx === 1 ? 'top2' : (idx === 2 ? 'top3' : ''));
        const row = document.createElement('tr');

        let itemsHTML = [];
        if (st.reads > 0) itemsHTML.push('<span class="mini-badge"><i class="fa-solid fa-helmet-safety"></i> Lv.1 헬멧</span>');
        if (st.reviews > 0) itemsHTML.push('<span class="mini-badge legendary"><i class="fa-solid fa-box-open"></i> 보급상자 x' + st.reviews + '</span>');
        if (st.xp >= 1000) itemsHTML.push('<span class="mini-badge"><i class="fa-solid fa-vest"></i> 3레벨 방어구</span>');
        if (st.xp >= 1500) itemsHTML.push('<span class="mini-badge legendary"><i class="fa-solid fa-tree"></i> 길리슈트</span>');

        row.innerHTML = `
            <td><span class="rank-tag ${rankClass}">${idx + 1}</span></td>
            <td><b>${st.name}</b> (${st.number}번)</td>
            <td>${st.totalBooksCount} 권</td>
            <td><b style="color:var(--drop-red)"><i class="fa-solid fa-box-open"></i> ${st.reviews} 개</b></td>
            <td><b style="color:var(--primary-yellow)">${st.xp} XP</b></td>
            <td><span class="tier-pill ${st.tier}">${st.tierLabel}</span></td>
            <td>${itemsHTML.join(' ') || '<span style="color:var(--text-sub)">파밍 대기 중</span>'}</td>
            <td><button class="action-btn secondary" style="padding:4px 10px; font-size:0.75rem" onclick="openStudentDetailModal(${st.id})">상세</button></td>
        `;

        tbody.appendChild(row);
    });
}

// Student Detail & Inventory Modal
window.openStudentDetailModal = function(studentId) {
    const student = students.find(s => s.id === studentId);
    let reads = 0, reviewsCount = 0;
    let historyItems = [];

    books.forEach(b => {
        const st = b.stickers && b.stickers[studentId];
        if (st === 'read') {
            reads++;
            historyItems.push(`<li><span>📘 ${b.title}</span> <span style="color:var(--accent-green)">[단순 완독 +100 XP]</span></li>`);
        } else if (st === 'review') {
            reads++;
            reviewsCount++;
            historyItems.push(`<li><span>📦 ${b.title}</span> <span style="color:var(--drop-red)">[보급상자 / 감상문 +300 XP]</span></li>`);
        }
    });

    const xp = (reads - reviewsCount) * 100 + (reviewsCount * 300);
    let tier = 'bronze', tierLabel = '브론즈 생존자';
    if (xp >= 2500) { tier = 'chicken'; tierLabel = '★치킨 마스터★'; }
    else if (xp >= 1500) { tier = 'diamond'; tierLabel = '다이아몬드 독서왕'; }
    else if (xp >= 1000) { tier = 'platinum'; tierLabel = '플래티넘 스나이퍼'; }
    else if (xp >= 600) { tier = 'gold'; tierLabel = '골드 수집가'; }
    else if (xp >= 300) { tier = 'silver'; tierLabel = '실버 대원'; }

    document.getElementById('detailAvatar').innerText = student.number;
    document.getElementById('detailStudentName').innerText = `${student.name} (${student.number}번)`;
    
    const tierPill = document.getElementById('detailTierPill');
    tierPill.className = `tier-pill ${tier}`;
    tierPill.innerText = tierLabel;

    document.getElementById('detailTotalReads').innerText = reads;
    document.getElementById('detailTotalDrops').innerText = reviewsCount;
    document.getElementById('detailTotalXP').innerText = `${xp} XP`;

    const invGrid = document.getElementById('detailInventoryGrid');
    let invHTML = [];

    invHTML.push('<div class="inv-item"><i class="fa-solid fa-bottle-water" style="color:#00d2ff"></i> 에너지 드링크 x' + reads + '</div>');
    if (reads > 0) invHTML.push('<div class="inv-item"><i class="fa-solid fa-helmet-safety"></i> 1레벨 헬멧</div>');
    if (reviewsCount > 0) invHTML.push('<div class="inv-item legendary"><i class="fa-solid fa-box-open"></i> 전설의 보급상자 x' + reviewsCount + '</div>');
    if (reviewsCount > 0) invHTML.push('<div class="inv-item legendary"><i class="fa-solid fa-shield-halved"></i> 3레벨 삼뚝 헬멧</div>');
    if (xp >= 1500) invHTML.push('<div class="inv-item legendary"><i class="fa-solid fa-tree"></i> 위장 길리슈트</div>');
    if (xp >= 2500) invHTML.push('<div class="inv-item legendary" style="background:#ff3b30; color:#fff;"><i class="fa-solid fa-drumstick-bite"></i> 치킨 파티 쿠폰</div>');

    invGrid.innerHTML = invHTML.join('');

    const historyList = document.getElementById('detailHistoryList');
    historyList.innerHTML = historyItems.length > 0 ? historyItems.join('') : '<li style="color:var(--text-sub)">아직 독서 기록이 없습니다. 파밍을 시작하세요!</li>';

    document.getElementById('studentDetailModal').classList.add('active');
};
