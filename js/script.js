// ##########################################################################
//                          D E C L A R A T I O N S
// ##########################################################################
let editMode = false, // flag for edit-mode
    boardIsVisible, // flag for board to be displayed or not
    trashState = 0, // triple-flag for trash bin to  hide [0] | display [1] | show column [2]
    currID = 0, // current id in edit mode (to apply changes)
    lastMenu = 0, // saving the last menu we have been
    arrTasks = [], // array, holding the tasks
    objSettings = {
        category: ["Marketing", "Product", "Sale", "Management"],
        priority: ["low", "medium", "important", "high"],
        staff: {
            names: ["Sebastian Zimmermann", "John Fieweger", "Olaf Müller", "Max Mustermann"],
            images: ["sebastian.jpg", "john.jpg", "olaf.jpg", "max.jpg"]
        },
        columns: ["to do", "scheduled", "in progress", "done"]
    };
// global constants for easier access
const DELETED = 'deleted';
const MENUITEMS = $('.menu-items >li');

// setURL('https://gruppe-220.developerakademie.net/smallest_backend_ever');

async function init() {
    // renderBoardColumns();
    await downloadFromServer();
    taskDownload();
    renderTasks();
    activateMenuItem(0);
}

// Pushes all relevant arrays to the server after changes where made on the board (at the moment create & edit tasks)
function serverUpdate() {
    backend.setItem('arrTasks', JSON.stringify(arrTasks));
}

function taskDownload() {
    arrTasks = JSON.parse(backend.getItem('arrTasks')) || [];
}

// deletes a task completely from array and server
async function killTask(id) {
    playSound('notify.mp3');
    if (await msgBox(`Are you sure, you want to remove this task completely? <br>
        This operation cannot be reversed!`, 'Please confirm!', 'Yes,No', true, true) == 'Yes') {
        arrTasks.splice(id, 1);
        renderTasks();
        serverUpdate();
    }
}

// ANCHOR addTask
// adds a new task or applies changes to an existing task,
// if flag 'editMode' is set to 'true'
async function addTask() {
    await downloadFromServer();
    taskDownload();
    let name = $('imgClerk').alt,
        foto = objSettings.staff.images[getStaffIndex(name)],
        deadline = $('inpDeadline').value.isDate();
    if (editMode) {
        editTask(name, foto);
    } else {
        deadline = deadline ? deadline : today();
        arrTasks.push(generatedTask(name, foto, deadline));
        activateMenuItem(0); // display the board after adding new task!
    }
    serverUpdate();
    renderTasks();
}

function editTask(name, foto) {
    arrTasks[currID].title = $('inpTaskTitle').value;
    arrTasks[currID].description = $('txtDescription').value;
    arrTasks[currID].category = $('optCategory').value;
    arrTasks[currID].deadline = format$($('inpDeadline').value);
    arrTasks[currID].priority = $('optPriority').value;
    arrTasks[currID].staff.name = name;
    arrTasks[currID].staff.image = foto;
}

function generatedTask(name, foto, deadlineDate) {
    return {
        id: arrTasks.length,
        title: $('inpTaskTitle').value,
        description: $('txtDescription').value,
        category: $('optCategory').value,
        deadline: format$(deadlineDate),
        priority: $('optPriority').value,
        staff: {
            name: name,
            image: foto
        },
        status: 'todo'
    }
}

// renders all existing tasks into the correct sections (todo, scheduled etc.)
function renderTasks() {
    let boardSections = Array.from($('#divMainBoard .columns >div')); // first clear all Sections!
    for (let i = 0; i < boardSections.length; i++) { boardSections[i].innerHTML = ''; } // now render all tasks into the correct section with a double loop
    for (let i = 0; i < arrTasks.length; i++) {
        const task = arrTasks[i];
        for (let j = 0; j < boardSections.length; j++) {
            let container = boardSections[j];
            if (container.classList.contains(task.status)) {
                container.innerHTML += generateTaskHTML(task);
            }
        }
        setTaskIconState(task);
    }
}

// deteremines if we show a printer or bin in the task headline, depending on state
function setTaskIconState(task) {
    const icons = $('#task-' + task.id + ' .task-icons');
    if (task.status == DELETED) {
        icons[0].classList.add('hidden');
        icons[1].classList.remove('hidden');
    } else {
        icons[0].classList.remove('hidden');
        icons[1].classList.add('hidden');
    }
}

function filterTasks() {
    let search = $('search').value;
    search = search.toLowerCase();
    let boardSections = Array.from($('#divMainBoard .columns >div'));
    for (let i = 0; i < boardSections.length; i++) { boardSections[i].innerHTML = ''; }
    for (let i = 0; i < arrTasks.length; i++) {
        const task = arrTasks[i];
        for (let j = 0; j < boardSections.length; j++) {
            let container = boardSections[j];
            generateFilterTask(task, container, search);
        }
    }
}

function generateFilterTask(task, container, search) {
    let stateIsValid = container.classList.contains(task.status);
    if (task.title.toLowerCase().includes(search) && stateIsValid) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.description.toLowerCase().includes(search) && stateIsValid) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.deadline.toLowerCase().includes(search) && stateIsValid) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.staff.name.toLowerCase().includes(search) && stateIsValid) {
        container.innerHTML += generateTaskHTML(task);
    }
}

function generateTaskHTML(task) {
    return `
    <div id="task-${task.id}" class="task grab ${task.priority}" draggable="true" ondragstart="drag(event)" 
        ondblclick ="showInputForm(${task.id})" title="double-click for edit!">
        <img class="task-icons" src="./img/printer48.png" onclick="printTask(${task.id})" title ="print task">
        <img class="task-icons hidden" src="./img/trash48.png" onclick="killTask(${task.id})" title ="remove task">
        <div>
            <h3>${task.title}</h3>
            <p class="description">${task.description}</p>
        </div>
        <div class="taskEnd">
            <p>${task.deadline}</p> 
            <img class="portrait" src ="./img/${task.staff.image}" title="${task.staff.name}">
        </div>
    </div>`;
}

// selects the given menu-item
function activateMenuItem(index) {
    if (editMode) return; // in this cases we exit immediately
    closeSmallMenu();
    getActiveMenuItem();
    // first remove all other selections and save the last menu-index!
    for (let i = 0; i < MENUITEMS.length; i++) {
        MENUITEMS[i].classList.remove('active');
    }

    closeSections();
    switch (index) {
        case 0:
            showBoard(true);
            break;
        case 1:
            showBackLog(true);
            break;
        case 2:
            showInputForm();
            break;
        case 3:
            showHelp(true);
            break;
        default:
            return; // if no index is provided, we only unselect the links and exit
    }
    MENUITEMS[index].classList.add('active');
    hideIcons(!boardIsVisible); // hide icons except from settings, when board is invisible!
}

// saves the active menu item in the global variable 'lastMenu'
// in order to return to the previous menu when cancelled (used in add task and settings)
function getActiveMenuItem() {
    for (let i = 0; i < MENUITEMS.length; i++) {
        if (MENUITEMS[i].classList.contains('active')) lastMenu = i;
    }
}

// enables or disables the icons 'plus' and 'trash' in statusbar
function hideIcons(status) {
    $('imgBin').classList.toggle('hidden', status);
    $('imgPlus').classList.toggle('hidden', status);
}

// helper-function for fnc 'activateMenuItem': closes all open forms & div's
function closeSections() {
    $('divMainBoard').classList.add('hidden');
    $('divInput').classList.add('hidden');
    showBackLog(false);
    showHelp(false);
    toggleTrash(false);
    $('divSettings').classList.add('hidden');
    boardIsVisible = false; // reset flag!
}

// resets the input-form and the flag for edit-mode
function resetForm() {
    let form = $('frmInput'),
        image = $('imgClerk');

    image.src = './img/profile-dummy.png';
    image.alt = '';
    $('divClerks').dataset.tooltip = 'select clerk';
    form.reset();
    initSelectionFields('optCategory');
    initSelectionFields('optPriority');
    editMode = false;
}

// initializes the form's <SELECTION>-Elements 
function initSelectionFields(selection) {
    let key = selection.substr(3).toLowerCase(),
        srcArray = objSettings[key],
        select = $(selection);
    select.innerHTML = '<option value="">- please select -</option>';
    for (let i = 0; i < srcArray.length; i++) {
        const cat = srcArray[i];
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    }
}

// display the board with all states
function showBoard(visible) {
    let board = $('divMainBoard');
    if (visible) {
        board.classList.remove('hidden');
        renderTasks();
    } else {
        board.classList.add('hidden');
    }
    boardIsVisible = visible;
}

function showBackLog(visible) {
    if (visible) todo('Backlog ist noch nicht implementiert!');
}

function showHelp(visible) {
    let help = $('divHelp');
    if (visible) {
        help.classList.remove('hidden');
    } else {
        help.classList.add('hidden');
    }
}

// ANCHOR display OR close the input-form:
// if id is omitted         --> add a NEW task
// if id = 'false'          --> close the form!
// if id contains a task    --> edit the provided task
function showInputForm(id) {
    // make sure that no nonsense happens when we are in edit mode!
    if (editMode && id !== false) return;
    let form = $('divInput');
    resetForm();
    // form is supposed to be closed! 
    if (id === false) {
        form.classList.add('hidden');
        form.classList.remove('edit-mode');
        activateMenuItem(lastMenu);
        return;
    }
    // if we got a task as paramter, get in edit mode and load datas
    // if id is 'undefined' we are supposed to create a new task!
    if (id != undefined) {
        editMode = true;
        currID = id; // save the id for apply changes!
        form.classList.add('edit-mode');
        loadTaskData(id);
    }
    form.classList.remove('hidden');
    toggleTrash(false);
    $('frmTitle').innerHTML = editMode ? 'Edit task' : 'Add task';
    $('btnSubmit').innerHTML = editMode ? 'APPLY CHANGES' : 'CREATE TASK';
}


// loads all datas from the given task(id) into the form for edit mode ANCHOR loadTaskData
function loadTaskData(id) {
    $('inpTaskTitle').value = arrTasks[id].title;
    $('optCategory').value = arrTasks[id].category;
    $('txtDescription').value = arrTasks[id].description;
    $('inpDeadline').value = format$(arrTasks[id].deadline, 'yyyy-mm-dd');
    $('optPriority').value = arrTasks[id].priority;
    let frmImage = $('imgClerk');
    frmImage.src = './img/' + arrTasks[id].staff.image;
    frmImage.alt = arrTasks[id].staff.name;
    $('divClerks').dataset.tooltip = frmImage.alt; // this adds the css-based tooltip!
}

// changes the picture and the name of the staff in the input-form
function changeStaff() {
    let image = $('imgClerk'),
        firstname = image.alt.split(' ')[0].toLowerCase(), // images contain only firstname: 'sebastian.jpg'
        index = getStaffIndex(firstname); // search index of the staff-image in settings
    index++;
    if (index >= objSettings.staff.images.length) index = 0; // make sure we stay in correct range of the array!
    image.src = './img/' + objSettings.staff.images[index];
    image.alt = objSettings.staff.names[index];
    $('divClerks').dataset.tooltip = image.alt; // this adds the css-based tooltip!
}

// returns the index of a staff member according to the given name
function getStaffIndex(name) {
    // we can eiter search in names OR pictures (contains a dot => .jpg)!!!
    let arrSearch = name.includes('.') ? objSettings.staff.images : objSettings.staff.names;
    let index = arrSearch.findIndex(i => {
        if (i.toLowerCase().includes(name.toLowerCase())) return true;
    });
    if (index == -1) index = undefined;
    return index;
}

// returns the id as number, provided by the HTML-id
function getIDNumber(task) {
    let tmp = (task.id).split('-');
    return parseInt(tmp[1]);
}

function toggleTrash(state) {
    let trashBin = $('divTrashBin'),
        delColumn = $('divTrash');
    if (state === false) {
        trashState = 0;
    } else if (state) {
        trashState = state;
    } else {
        trashState++;
        if (trashState > 2) trashState = 0;
    }

    switch (trashState) {
        case 1:
            trashBin.classList.remove('hidden');
            delColumn.classList.add('hidden');
            break;
        case 2:
            trashBin.classList.add('hidden');
            delColumn.classList.remove('hidden');
            break;
        default: // 0 or false!!!
            trashBin.classList.add('hidden');
            delColumn.classList.add('hidden');
            break;
    }
}

// displays or hides the settings
function showSettings(visible) {
    if (visible) {
        initSelectionFields('selPriority');
        initSelectionFields('lstCategory');
        initSelectionFields('lstColumns');
        getActiveMenuItem();
        closeSections();
        $('divSettings').classList.remove('hidden');
    } else {
        $('divSettings').classList.add('hidden');
        activateMenuItem(lastMenu);
    }
    hideIcons(true);
}

// short print-function
function printTask(index) {
    let printWindow = window.open('', '', 'height=720,width=1000');
    printWindow.document.write('<html><head><title>Task drucken</title>');
    printWindow.document.write(`<style> .print-window {
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;}
                                </style>`);
    printWindow.document.write('</head><body class="print-window">');
    printWindow.document.write($('task-' + index).innerHTML);
    printWindow.document.getElementsByClassName('task-icons')[0].remove();
    let foto = printWindow.document.getElementsByClassName('portrait')[0];
    foto.style.height = '200px';
    foto.style.width = '150px';
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function uploadFile(event) {
    let userImage = $('imgUser');
    userImage.src = URL.createObjectURL(event.target.files[0]);
    userImage.onload = function() {
        URL.revokeObjectURL(userImage.src); // free memory
    }
}

//  #####################################################################################
//  PURPOSE 	: several drag- and drop functions
//  			  
//  PARAMETERS 	: event	    = the fired event
//  			:  			
//  RETURNS 	: -void-
//  #####################################################################################
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('text', event.target.id);
}

function drop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData('text'),
        task = $(data),
        id = getIDNumber(task),
        status = event.target.classList[0],
        dropAllowed = event.target.dataset.candrop;

    // we leave if dropping is forbidden, in order to avoid dropping tasks in each other
    if (!dropAllowed) {
        playSound('wrong.mp3');
        return;
    }
    arrTasks[id].status = status;
    setTaskIconState(arrTasks[id]);

    // deleting per drag'n drop is an exception:
    // we can drag from another column or drop into the bin!
    if (status == DELETED) {
        $('#divTrash .deleted').appendChild(task);
    } else {
        event.target.appendChild(task);
    }
    serverUpdate();
}

//  ###########################################
//  ###             M  E  N  U              ###
//  ###########################################
function toggleMenu() {
    let menu = $('mainmenu');
    debugger
    if (menu.style.display == 'display: flex;flex-direction: column;') {
        console.log(menu.style);
    }
}



function openMenu() {
    smallMenu = $('small-menu-list');
    if (smallMenu.style.display == 'none') {
        smallMenu.style = 'display: unset;';
    } else {
        smallMenu.style = 'display: none;';
    };
    closeSmallMenuWithClickOutside();
}

function closeSmallMenuWithClickOutside() {
    document.addEventListener('mouseup', function(e) {
        if (!smallMenu.contains(e.target)) {
            smallMenu.style = 'display: none;';
        }
    });
}

function closeSmallMenu() {
    $('small-menu-list').style = 'display: none;';
}

function renderBoardColumns() {
    let board = $('divMainBoard');
    board.innerHTML = '';
    for (let i = 0; i < objSettings.columns.length; i++) {
        const title = objSettings.columns[i].toUpperCase();
        board.innerHTML += `
            <div class="columns">
                <h3>${title}</h3>
                <div class="todo flx-ctr" ondrop="drop(event)" ondragover="allowDrop(event)" data-candrop="true"></div>
            </div>`;
    }
}