const STORAGE_KEY = 'dompet_kartu_member_v1';
const OWNER_STORAGE_KEY = 'dompet_kartu_owner_v1';
const DEFAULT_OWNER_NAME = 'tamu';
const DEFAULT_CARDS = [
    {
        name: 'Edit Kartu Pertamamu',
        category: 'Klik Disini',
        number: '12345678910'
    }
];

const cardContainer = document.getElementById('cardContainer');
const addCardBtn = document.getElementById('addCardBtn');
const totalCardSpan = document.querySelector('.total-card');
const usernameSpan = document.querySelector('.username');

const navNameBtn = document.querySelector('.nav-name');
const ownerModal = document.getElementById('ownerModal');
const closeOwnerModalBtn = document.getElementById('closeOwnerModalBtn');
const ownerForm = document.getElementById('ownerForm');
const ownerNameInput = document.getElementById('ownerNameInput');

const navSearchBtn = document.querySelector('.nav-search');
const searchModal = document.getElementById('searchModal');
const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
const searchForm = document.getElementById('searchForm');
const searchCardInput = document.getElementById('searchCardInput');
const searchFeedback = document.getElementById('searchFeedback');

const navTermsBtn = document.querySelector('.nav-terms');
const termsModal = document.getElementById('termsModal');
const closeTermsModalBtn = document.getElementById('closeTermsModalBtn');
const termsContent = termsModal.querySelector('.terms-content');

const navTopBtn = document.querySelector('.nav-top');

const cardMenuModal = document.getElementById('cardMenuModal');
const closeCardMenuBtn = document.getElementById('closeCardMenuBtn');
const menuCardTitle = document.getElementById('menuCardTitle');
const zoomBarcodeBtn = document.getElementById('zoomBarcodeBtn');
const copyNumberBtn = document.getElementById('copyNumberBtn');
const copyNumberLabel = document.getElementById('copyNumberLabel');
const editCardMenuBtn = document.getElementById('editCardMenuBtn');
const deleteCardMenuBtn = document.getElementById('deleteCardMenuBtn');

const barcodeFullscreen = document.getElementById('barcodeFullscreen');
const closeBarcodeFullscreenBtn = document.getElementById('closeBarcodeFullscreenBtn');
const zoomedBarcodeSvg = document.getElementById('zoomedBarcodeSvg');
const zoomedBarcodeFallback = document.getElementById('zoomedBarcodeFallback');

const cardModal = document.getElementById('cardModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cardForm = document.getElementById('cardForm');
const submitBtn = document.getElementById('submitBtn');

const inputName = document.getElementById('cardName');
const inputCategory = document.getElementById('cardCategory');
const inputNumber = document.getElementById('cardNumber');

let activeCard = null;
let isSearchingCard = false;
let copyLabelTimer = null;

// Reset label tombol salin nomor ke default
function resetCopyButtonLabel() {
    if (copyLabelTimer) {
        clearTimeout(copyLabelTimer);
        copyLabelTimer = null;
    }
    copyNumberLabel.textContent = 'Salin Nomor';
}

// Salin teks ke clipboard dengan fallback execCommand
async function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
    }
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    document.body.appendChild(tempInput);
    tempInput.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(tempInput);
    return copied;
}

// Gulir halus ke paling atas halaman
navTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Buka pop-up Syarat & Ketentuan
navTermsBtn.addEventListener('click', function() {
    if (termsContent) {
        termsContent.scrollTop = 0;
    }
    termsModal.classList.add('active');
});

// Tutup pop-up Syarat & Ketentuan
function closeTermsModal() {
    termsModal.classList.remove('active');
}

closeTermsModalBtn.addEventListener('click', closeTermsModal);

termsModal.addEventListener('click', function(e) {
    if (e.target === termsModal) {
        closeTermsModal();
    }
});

// Bersihkan tanda border hasil pencarian sebelumnya
function clearSearchHighlights() {
    cardContainer.querySelectorAll('.card-box.search-match').forEach((box) => {
        box.classList.remove('search-match');
    });
}

// Kembalikan border hasil pencarian ke default saat tap/klik di mana saja
document.addEventListener('click', function(e) {
    if (isSearchingCard) {
        isSearchingCard = false;
        return;
    }
    if (e.target.closest('.nav-search') || e.target.closest('#searchModal')) {
        return;
    }
    clearSearchHighlights();
});

// Muat nama pemilik dari localStorage
function loadOwnerName() {
    try {
        const saved = localStorage.getItem(OWNER_STORAGE_KEY);
        if (saved !== null && saved.trim() !== '') {
            return saved.trim();
        }
        return DEFAULT_OWNER_NAME;
    } catch (err) {
        console.warn('Gagal membaca nama pemilik dari localStorage:', err);
        return DEFAULT_OWNER_NAME;
    }
}

// Simpan nama pemilik ke localStorage dan perbarui tampilan
function setOwnerName(name) {
    const cleanName = (name && name.trim()) ? name.trim() : DEFAULT_OWNER_NAME;
    usernameSpan.textContent = cleanName;
    try {
        localStorage.setItem(OWNER_STORAGE_KEY, cleanName);
    } catch (err) {
        console.warn('Gagal menyimpan nama pemilik ke localStorage:', err);
    }
}

// Buka pop-up Nama Pemilik Kartu
navNameBtn.addEventListener('click', function() {
    const currentName = usernameSpan.textContent.trim();
    ownerNameInput.value = currentName === DEFAULT_OWNER_NAME ? '' : currentName;
    ownerModal.classList.add('active');
    ownerNameInput.focus();
});

// Tutup pop-up Nama Pemilik Kartu
function closeOwnerModal() {
    ownerModal.classList.remove('active');
}

closeOwnerModalBtn.addEventListener('click', closeOwnerModal);

ownerModal.addEventListener('click', function(e) {
    if (e.target === ownerModal) {
        closeOwnerModal();
    }
});

// Simpan nama pemilik dari form
ownerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    setOwnerName(ownerNameInput.value);
    closeOwnerModal();
});

// Buka pop-up Pencarian Kartu
navSearchBtn.addEventListener('click', function() {
    searchCardInput.value = '';
    searchFeedback.classList.remove('visible');
    searchModal.classList.add('active');
    searchCardInput.focus();
});

// Tutup pop-up Pencarian Kartu
function closeSearchModal() {
    searchModal.classList.remove('active');
    searchFeedback.classList.remove('visible');
}

closeSearchModalBtn.addEventListener('click', closeSearchModal);

searchModal.addEventListener('click', function(e) {
    if (e.target === searchModal) {
        closeSearchModal();
    }
});

searchCardInput.addEventListener('input', function() {
    searchFeedback.classList.remove('visible');
});

// Proses pencarian kartu berdasarkan nama kartu
searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    isSearchingCard = true;
    const keyword = searchCardInput.value.trim().toLowerCase();

    clearSearchHighlights();

    if (!keyword) {
        searchFeedback.classList.add('visible');
        return;
    }

    const allCards = Array.from(cardContainer.querySelectorAll('.card-box'));
    const matchedCards = allCards.filter((box) => {
        const cardName = box.querySelector('.name').textContent.trim().toLowerCase();
        return cardName.includes(keyword);
    });

    if (matchedCards.length === 0) {
        searchFeedback.classList.add('visible');
        return;
    }

    searchFeedback.classList.remove('visible');
    matchedCards.forEach((box) => box.classList.add('search-match'));

    closeSearchModal();
    matchedCards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Update jumlah total kartu di bagian hero
function updateTotalCards() {
    const total = cardContainer.querySelectorAll('.card-box').length;
    totalCardSpan.textContent = total;
}

// Render barcode Code 128 ke elemen SVG di dalam kartu
function renderBarcode(svgEl, fallbackEl, number) {
    svgEl.dataset.value = number;
    svgEl.innerHTML = '';
    fallbackEl.textContent = number;
    fallbackEl.style.display = 'none';
    svgEl.style.display = 'block';

    if (typeof JsBarcode === 'undefined') {
        svgEl.style.display = 'none';
        fallbackEl.style.display = 'block';
        return;
    }

    try {
        // Sesuaikan lebar bar otomatis jika nomor cukup panjang agar tetap muat di kartu
        const barWidth = number.length > 14 ? 1.3 : 1.7;
        JsBarcode(svgEl, number, {
            format: 'CODE128',
            width: barWidth,
            height: 46,
            displayValue: true,
            font: 'Google Sans',
            fontOptions: 'bold',
            fontSize: 14,
            textMargin: 4,
            margin: 4,
            background: '#ffffff',
            lineColor: '#111111'
        });
    } catch (err) {
        svgEl.style.display = 'none';
        fallbackEl.style.display = 'block';
    }
}

// Render barcode besar ke layar penuh putih
function renderFullscreenBarcode(number) {
    zoomedBarcodeSvg.innerHTML = '';
    zoomedBarcodeFallback.textContent = number;
    zoomedBarcodeFallback.style.display = 'none';
    zoomedBarcodeSvg.style.display = 'block';

    if (typeof JsBarcode === 'undefined') {
        zoomedBarcodeSvg.style.display = 'none';
        zoomedBarcodeFallback.style.display = 'block';
        return;
    }

    try {
        const barWidth = number.length > 18 ? 2 : number.length > 12 ? 2.6 : 3.2;
        JsBarcode(zoomedBarcodeSvg, number, {
            format: 'CODE128',
            width: barWidth,
            height: 120,
            displayValue: true,
            font: 'Google Sans',
            fontOptions: 'bold',
            fontSize: 22,
            textMargin: 8,
            margin: 12,
            background: '#ffffff',
            lineColor: '#111111'
        });
    } catch (err) {
        zoomedBarcodeSvg.style.display = 'none';
        zoomedBarcodeFallback.style.display = 'block';
    }
}

// Ambil seluruh data kartu dari DOM saat ini
function collectCardsFromDOM() {
    return Array.from(cardContainer.querySelectorAll('.card-box')).map((cardBox) => ({
        name: cardBox.querySelector('.name').textContent.trim(),
        category: cardBox.querySelector('.category').textContent.trim(),
        number: (cardBox.querySelector('svg.code').dataset.value || '').trim()
    }));
}

// Simpan data kartu ke localStorage
function saveCardsToStorage() {
    try {
        const cards = collectCardsFromDOM();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (err) {
        console.warn('Gagal menyimpan data ke localStorage:', err);
    }
}

// Muat data kartu dari localStorage
function loadCardsFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return DEFAULT_CARDS;
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : DEFAULT_CARDS;
    } catch (err) {
        console.warn('Gagal membaca data dari localStorage:', err);
        return DEFAULT_CARDS;
    }
}

// Membuat elemen DOM .card-box baru
function createCardElement(name, category, number) {
    const cardBox = document.createElement('div');
    cardBox.className = 'card-box';

    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = name;

    const categoryEl = document.createElement('div');
    categoryEl.className = 'category';
    categoryEl.textContent = category;

    const wrapEl = document.createElement('div');
    wrapEl.className = 'barcode-wrap';

    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.classList.add('code');

    const fallbackEl = document.createElement('div');
    fallbackEl.className = 'number-fallback';

    renderBarcode(svgEl, fallbackEl, number);
    wrapEl.append(svgEl, fallbackEl);

    cardBox.append(nameEl, categoryEl, wrapEl);
    return cardBox;
}

// Render semua kartu ke dalam container
function renderCards(cards) {
    cardContainer.innerHTML = '';
    cards.forEach((item) => {
        const cardEl = createCardElement(item.name, item.category, item.number);
        cardContainer.appendChild(cardEl);
    });
    updateTotalCards();
}

// Tutup pop-up Menu Kartu
function closeCardMenuModal() {
    cardMenuModal.classList.remove('active');
    resetCopyButtonLabel();
}

closeCardMenuBtn.addEventListener('click', function() {
    closeCardMenuModal();
    activeCard = null;
});

cardMenuModal.addEventListener('click', function(e) {
    if (e.target === cardMenuModal) {
        closeCardMenuModal();
        activeCard = null;
    }
});

// Tutup tampilan barcode layar penuh
function closeBarcodeFullscreen() {
    barcodeFullscreen.classList.remove('active');
}

closeBarcodeFullscreenBtn.addEventListener('click', closeBarcodeFullscreen);

// Tombol Perbesar Barcode di Menu Kartu
zoomBarcodeBtn.addEventListener('click', function() {
    if (!activeCard) return;
    const number = (activeCard.querySelector('svg.code').dataset.value || '').trim();
    closeCardMenuModal();
    renderFullscreenBarcode(number);
    barcodeFullscreen.classList.add('active');
});

// Tombol Salin Nomor di Menu Kartu
copyNumberBtn.addEventListener('click', async function() {
    if (!activeCard) return;
    const number = (activeCard.querySelector('svg.code').dataset.value || '').trim();
    if (!number) return;

    try {
        const ok = await copyTextToClipboard(number);
        if (ok) {
            copyNumberLabel.textContent = 'Nomor Berhasil Disalin';
            if (copyLabelTimer) {
                clearTimeout(copyLabelTimer);
            }
            copyLabelTimer = setTimeout(() => {
                copyNumberLabel.textContent = 'Salin Nomor';
                copyLabelTimer = null;
            }, 2000);
        }
    } catch (err) {
        console.warn('Gagal menyalin nomor kartu:', err);
    }
});

// Tombol Edit Kartu di Menu Kartu
editCardMenuBtn.addEventListener('click', function() {
    if (!activeCard) return;

    const cardBox = activeCard;
    closeCardMenuModal();

    modalTitle.textContent = 'Edit Kartu Member';
    submitBtn.textContent = 'Simpan Perubahan';

    inputName.value = cardBox.querySelector('.name').textContent.trim();
    const currentCategory = cardBox.querySelector('.category').textContent.trim();
    const hasOption = Array.from(inputCategory.options).some((opt) => opt.value === currentCategory);
    inputCategory.value = hasOption ? currentCategory : '';
    inputNumber.value = (cardBox.querySelector('svg.code').dataset.value || '').trim();

    cardModal.classList.add('active');
    inputName.focus();
});

// Tombol Hapus Kartu di Menu Kartu
deleteCardMenuBtn.addEventListener('click', function() {
    if (!activeCard) return;

    activeCard.remove();
    updateTotalCards();
    saveCardsToStorage();
    closeCardMenuModal();
    activeCard = null;
});

// Klik tombol Tambah Kartu -> buka modal mode tambah
addCardBtn.addEventListener('click', function() {
    activeCard = null;
    modalTitle.textContent = 'Tambah Kartu Baru';
    submitBtn.textContent = 'Tambah Kartu';
    cardForm.reset();

    cardModal.classList.add('active');
    inputName.focus();
});

// Klik salah satu .card-box -> buka pop-up Menu Kartu
cardContainer.addEventListener('click', function(e) {
    const cardBox = e.target.closest('.card-box');
    if (!cardBox) return;

    cardBox.classList.remove('search-match');
    activeCard = cardBox;
    resetCopyButtonLabel();
    menuCardTitle.textContent = cardBox.querySelector('.name').textContent.trim();
    cardMenuModal.classList.add('active');
});

// Tutup modal tambah/edit kartu
function closeModal() {
    cardModal.classList.remove('active');
    activeCard = null;
}

closeModalBtn.addEventListener('click', closeModal);

cardModal.addEventListener('click', function(e) {
    if (e.target === cardModal) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (barcodeFullscreen.classList.contains('active')) {
            closeBarcodeFullscreen();
        } else if (cardMenuModal.classList.contains('active')) {
            closeCardMenuModal();
            activeCard = null;
        } else if (termsModal.classList.contains('active')) {
            closeTermsModal();
        } else if (searchModal.classList.contains('active')) {
            closeSearchModal();
        } else if (ownerModal.classList.contains('active')) {
            closeOwnerModal();
        } else if (cardModal.classList.contains('active')) {
            closeModal();
        }
    }
});

// Submit form (Tambah baru atau Simpan edit)
cardForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = inputName.value.trim();
    const category = inputCategory.value;
    const number = inputNumber.value.trim();

    if (activeCard) {
        // Mode Edit
        activeCard.querySelector('.name').textContent = name;
        activeCard.querySelector('.category').textContent = category;
        renderBarcode(
            activeCard.querySelector('svg.code'),
            activeCard.querySelector('.number-fallback'),
            number
        );
    } else {
        // Mode Tambah Baru (ditambahkan di bawah kartu terakhir)
        const newCard = createCardElement(name, category, number);
        cardContainer.appendChild(newCard);
        updateTotalCards();
    }

    saveCardsToStorage();
    closeModal();
});

// Inisialisasi saat halaman dimuat
usernameSpan.textContent = loadOwnerName();
const initialCards = loadCardsFromStorage();
renderCards(initialCards);
if (!localStorage.getItem(STORAGE_KEY)) {
    saveCardsToStorage();
}
