const list = document.querySelector("#list");
const newButton = document.querySelector(".new-book");
const addButton = document.querySelector(".add-book");
const formElement = document.querySelector(".form");
const formClose = document.querySelector(".form-close");

let myLibrary = [];

function Book(name, author, pages, read) {
	this.name = name;
	this.author = author;
	this.pages = pages;
	this.read = read;
}

function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

function saveLibraryToLocal() {
	if(storageAvailable("localStorage")) {
		localStorage.setItem("library", JSON.stringify(myLibrary));
	}
}

function readLibraryFromLocal() {
	if(storageAvailable("localStorage")) {
		myLibrary = JSON.parse(localStorage.getItem("library"));
	}
}

function addBookToLibrary(name = "My Book", author = "Me", pages = "1", read = false) {
	let book = new Book(name, author, pages, read);
	myLibrary.push(book);
	return book;
}

function createBookElement(book, index = (myLibrary.length - 1)) {
	const bookElement = document.createElement("div");
	const name = document.createElement("p");
	const author = document.createElement("p");
	const pages = document.createElement("p");
	const read = document.createElement("p");
	const removeButton = document.createElement("button");

	bookElement.classList.toggle("card");
	name.classList.toggle("title");
	author.classList.toggle("author");
	pages.classList.toggle("pages");
	read.classList.toggle("read");
	removeButton.classList.toggle("remove");

	name.textContent = book.name;
	author.textContent = `by ${book.author}`;
	pages.textContent = `${book.pages} pages`;
	read.style.backgroundColor = book.read ? "green" : "red";
	removeButton.textContent = "Remove";

	read.addEventListener("click", toggleRead);
	removeButton.addEventListener("click", removeBook);

	bookElement.setAttribute("data-index", index);
	bookElement.append(name, author, pages, read, removeButton);
	list.appendChild(bookElement);
}

function toggleRead(evt) {
	const index = parseInt(evt.target.parentElement.getAttribute("data-index"));
	const status = myLibrary[index].read;
	status ? myLibrary[index].read = false :
			myLibrary[index].read = true;

	renderBooks();
}

function removeBook(evt) {
	const index = parseInt(evt.target.parentElement.getAttribute("data-index"));
	myLibrary.splice(index, 1);

	saveLibraryToLocal();
	renderBooks();
}

function renderBooks() {
	Array.from(list.children).forEach(child => {
		list.removeChild(child);
	});
	myLibrary.forEach(createBookElement);
}

function validInput({name, author, pages}) {
	if (!name || !author || pages <= 0) return false;
	return true;
}

newButton.addEventListener("click", () => {
	newButton.style.display = "none";
	formElement.style.display = "block";
});

formClose.addEventListener("click", () => {
	newButton.style.display = "block";
	formElement.style.display = "none";
});

addButton.addEventListener("click", () => {
	const name = document.querySelector("#new-name").value;
	const author = document.querySelector("#new-author").value;
	const pages = parseInt(document.querySelector("#new-pages").value);
	const read = document.querySelector("#new-read").checked;

	if(!validInput({name, author, pages})) return;

	document.querySelectorAll("input, select").forEach(input => {
		input.value = "";
		input.checked = false;
	});
	createBookElement(
		addBookToLibrary(name, author, pages, read)
	);
	saveLibraryToLocal();
});

window.addEventListener("click", evt => {
	if(evt.target == formElement) {
		formElement.style.display = "none";
		newButton.style.display = "block";
	}
});

window.addEventListener("load", () => {
	readLibraryFromLocal();
	renderBooks();
})
