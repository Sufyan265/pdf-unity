// let file_info = document.querySelector(".file-info")

const formFile = document.getElementById("formFile");

function showSelectedFileCount() {
    const fileCount = formFile.files.length;
    const selectedFile = document.getElementById("selectedFile");
    // file_info.innerHTML = "";
    selectedFile.innerHTML = `${fileCount} files selected`;
}

let mergeBtn = document.querySelector(".merge-btn")

const refreshIconSpan = document.querySelector(".refresh-icon")
const fileSelector = document.querySelector(".file-selector")



// formFile.addEventListener('input', () => {
//     if (!formFile.files[0] || formFile.files[0].type !== 'application/pdf') {
//         selectedFile.innerHTML = `Please select a PDF file.`;
//     }
// })


formFile.addEventListener("change", function () {
    let defaultText;
    function errorStyle() {
        mergeBtn.style.display = 'none';
        selectedFile.style.color = 'red';
        defaultText = setTimeout(() => {
            selectedFile.style.color = '#555';
            selectedFile.innerHTML = `No files selected`;
        }, 7000)
    }

    if (!formFile.files[0] || formFile.files[0].type !== 'application/pdf') {
        errorStyle();
        selectedFile.innerHTML = `Please select PDF files.`;
    }
    else if (formFile.files.length < 2) {
        errorStyle();
        selectedFile.innerHTML = `Please select 2 or more PDF files for merge.`;
    }
     
    else {
        clearTimeout(defaultText)
        selectedFile.style.color = '#555';
        mergeBtn.style.display = 'block';
        refreshIconSpan.style.display = 'block';
        fileSelector.style.left = "13px";
    }
    // */
})


// const refreshBtn = document.getElementById('refreshBtn');

const refreshIcon = document.querySelectorAll(".refresh-icon i")[0]

refreshIcon.addEventListener('click', function () {
    formFile.value = '';
    fileCount = 0;
    console.log(fileCount)
    selectedFile.style.color = '#555';
    selectedFile.innerHTML = `No files selected`;
    submitBtn.style.display = 'none';
    refreshIconSpan.style.display = 'none';
    fileSelector.style.left = "unset";
});



// console.log("_________________________________________Drag & Drop_________________________________________________2")

const box = document.querySelector(".box")
const dropBox = document.getElementById("dropBox");

dropBox.addEventListener("click", openFileInput);
function openFileInput(event) {
    if (event.target.id === "dropBox" || event.target.tagName === "P") {
        document.querySelector(".choose-btn").click()
    }
}

function handleDragOver(event) {
    event.preventDefault();
    box.classList.add('dragover');
}

function handleDragLeave(event) {
    box.classList.remove('dragover');
}

function handleDrop(event) {
    box.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        formFile.files = files;
        formFile.dispatchEvent(new Event('change'));
    }
    event.preventDefault();
}

// console.log("_________________________________________Animation_________________________________________________2")

const listItems = document.querySelectorAll('.list-item');

function animateListItems() {
    listItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 200); // Adjust the delay according to your preference
    });
}

function checkVisibility() {
    listItems.forEach((item) => {
        const itemLeft = item.getBoundingClientRect().left;
        const windowWidth = window.innerWidth;

        if (itemLeft < windowWidth - 50) {
            item.classList.add('visible');
        }
    });
}

animateListItems();
checkVisibility();

window.addEventListener('scroll', checkVisibility);


// */