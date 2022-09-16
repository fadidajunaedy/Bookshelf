const books = [];
const STORAGE_KEY = 'BOOKSHELF';
const RENDER_EVENT = 'RENDER_BOOK';

const inputIdBook = document.getElementById('input-id-book');
const inputTitle = document.getElementById('input-title');
const inputAuthor = document.getElementById('input-author');
const inputYear = document.getElementById('input-year');
const inputStatus = document.getElementById('input-status');

const formSearch = document.getElementById('form-search');
const searchValue = document.getElementById('searh-value');

const formSubmit = document.getElementById('form-book');
const btnSubmit = document.getElementById('btn-submit');

const inCompletedContainer = document.getElementById('incomplete-container');
const completedContainer = document.getElementById('completed-container');

const checkStorage = () => {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

document.addEventListener('DOMContentLoaded', function () {
    if (checkStorage()) {
        loadBook();
    }
});

document.addEventListener(RENDER_EVENT, () => {
    inputTitle.value = '';
    inputAuthor.value = '';
    inputYear.value = '';
    inputStatus.checked = false;
    
    inputIdBook.value = '';
    btnSubmit.innerHTML = 'Simpan Buku';
    inCompletedContainer.innerHTML = '';
    completedContainer.innerHTML = '';

    const totalBook = books.length;
    const totalBookCompleted = books.filter((book) => {
        return book.isCompleted == true;
    }).length;
    const totalBookIncomplete = books.filter((book) => {
        return book.isCompleted == false;
    }).length;

    const dataInfoContainer = document.getElementById('data-info');
    dataInfoContainer.innerHTML =
    `
        <h4><i class="fa-solid fa-book"></i> : ${totalBook}</h4>
        <h4>Belum dibaca : ${totalBookIncomplete}</h4>
        <h4>Sudah dibaca : ${totalBookCompleted}</h4>
    `;

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (bookItem.isCompleted) {
            completedContainer.append(bookElement);
        } else {
            inCompletedContainer.append(bookElement);
        }
    }
});

formSubmit.addEventListener('submit', function (e) {
    e.preventDefault();
    if (inputIdBook.value == "") {
        const id = +new Date();
        const title = inputTitle.value;
        const author = inputAuthor.value;
        const year = inputYear.value;
        let isCompleted;

        inputStatus.checked ? isCompleted = true : isCompleted = false;

        const bookObject = generateBookObject( id, title, author, parseInt(year, 10), isCompleted);
        addBook(bookObject);
        window.alert(`Buku dengan ID : ${id} berhasil di tambahkan.`);
    } else {
        const bookId = inputIdBook.value;
        const title = inputTitle.value;
        const author = inputAuthor.value;
        const year = inputYear.value;
        let isCompleted;
        inputStatus.checked ? isCompleted = true : isCompleted = false;

        for(const i in books){
            if(books[i].id == bookId){
                books[i].title = title;
                books[i].author = author;
                books[i].year = year;
                books[i].isCompleted = isCompleted;
            }
        }
        btnSubmit.innerHTML = 'Simpan Buku';
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveBook();
        window.alert(`Buku dengan ID : ${bookId} berhasil di edit.`);
    }
});

function loadBook() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
    const {id, title, author, year, isCompleted} = bookObject;

    const textTitle = document.createElement('h3');
    textTitle.classList.add('book-title')
    textTitle.innerText = title;

    const textYear = document.createElement('p');
    textYear.innerText = "Tahun : " + year;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = "Penulis : " + author;

    const detailBookContainer = document.createElement('div');
    detailBookContainer.classList.add('book-detail');
    detailBookContainer.append(textTitle, textYear, textAuthor);

    const btnContainer = document.createElement('div');
    btnContainer.classList.add('btn-group');

    const container = document.createElement('article');
    container.classList.add('item');
    container.append(detailBookContainer, btnContainer);
    container.setAttribute('id', `book-${id}`);

    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
    editButton.addEventListener('click', function () {
        showData(id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
    deleteButton.addEventListener('click', function () {
        let confirmAction = confirm("Apakah anda yakin ingin menghapus buku ini?");
        if (confirmAction) {
            removeBook(id);
            alert(`Buku dengan ID : ${id} berhasil di hapus.`);
        } else {
            return
        }
    });

    btnContainer.append(editButton, deleteButton);

    if (isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.innerHTML = `<i class="fa-solid fa-rotate-left"></i>`;
        undoButton.addEventListener('click', function () {
            undoCompleted(id);
        });

        btnContainer.prepend(undoButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        checkButton.innerHTML = `<i class="fa-solid fa-check"></i>`;
        checkButton.addEventListener('click', function () {
            addToCompleted(id);
        });

        btnContainer.prepend(checkButton);
    }
    return container;
}

function addToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function undoCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;
    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function showData(bookId) {
    const bookTarget = findBook(bookId);
    inputTitle.value = bookTarget.title;
    inputAuthor.value = bookTarget.author;
    inputYear.value = bookTarget.year;
    bookTarget.isCompleted ? inputStatus.checked = true : inputStatus.checked = false;

    inputIdBook.value = bookTarget.id;
    btnSubmit.innerHTML = 'Edit Buku';
}

function addBook(bookObject){
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function saveBook() {
    if (checkStorage()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

formSearch.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBook();
});

const searchBook = () => {
    const searchValue = document.getElementById("search-value").value.toLowerCase();
    const bookItem = document.getElementsByClassName("item");

    for (const i in bookItem) {
        const itemTitle = bookItem[i].querySelector(".book-title").innerText;
        if (itemTitle.toLowerCase().includes(searchValue)) {
            bookItem[i].classList.remove("hidden");
        } else {
            bookItem[i].classList.add("hidden");
        }
    }
};

