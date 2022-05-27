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
const MENUITEMS = $('.menu-items li');

async function init() {
    await includeHTML();
    await downloadFromServer();
    loadSettings();
    renderBoardColumns();
    taskDownload();
    renderTasks();
    activateMenuItem(0);
}

// Pushes all relevant arrays to the server after changes where made on tkillrehe board (at the moment create & edit tasks)
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
        const findID = obj => obj.id === id; // define a search expression (on which index in the array is the id?)
        let taskInd = arrTasks.findIndex(findID);
        if (taskInd >= 0) {
            arrTasks.splice(taskInd, 1);
            renderTasks();
            serverUpdate();             
        } else {
            playSound('wrong.mp3');
            msgBox(`Task with id# ${id} not found!`,'Error!','OK',true,true);
        }               
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
        editMode = false;
        activateMenuItem(lastMenu);
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
        status: 'backlog'
            // status: 'todo'
    }
}

// pushes the task from backlog to the board into the 'todo'-section
function pushToBoard(id) {
    let task = arrTasks[id];
    if (task.status == 'backlog') {
        task.status = 'todo';
        serverUpdate();
        renderBacklog();
    }
}

// updates all ID's after deleting a task
function updateTaskIDs () {
    for (let i = 0; i < arrTasks.length; i++) {
        arrTasks[i].id = i;
    }
}

// renders all existing tasks into the correct sections (todo, scheduled etc.)
function renderTasks() {
    let boardSections = Array.from($('#divMainBoard .columns >div')); // first clear all Sections!
    for (let i = 0; i < boardSections.length; i++) { boardSections[i].innerHTML = ''; } 
    updateTaskIDs();
    // now render all tasks into the correct section with a double loop
    for (let i = 0; i < arrTasks.length; i++) {
        const task = arrTasks[i];
        for (let j = 0; j < boardSections.length; j++) {
            let container = boardSections[j];
            if (container.classList.contains(task.status)) {
                container.innerHTML += generateTaskHTML(task);
                setTaskIconState(task);
            }
        }
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
    let stateMatch = container.classList.contains(task.status);
    if (task.title.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.description.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.deadline.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.staff.name.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.priority.toLowerCase().includes(search) && stateMatch) {
        container.innerHTML += generateTaskHTML(task);
    }
}

function generateTaskHTML(task) {
    return /*html*/ `
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
    if (editMode) return; // in edit mode we exit immediately
    lastMenu = getActiveMenuItem();
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
    setHeaderIcons(); // hide icons except from settings, when board is invisible!
}

// saves the active menu item in the global variable 'lastMenu'
// in order to return to the previous menu when cancelled (used in add task and settings)
function getActiveMenuItem() {
    for (let i = 0; i < MENUITEMS.length; i++) {
        if (MENUITEMS[i].classList.contains('active')) return i;
    }
}

// enables or disables the icons 'trash' and the searchbar in header
function setHeaderIcons(status) {
    let activeMenu = getActiveMenuItem();
    $('imgBin').classList.toggle('hidden', !boardIsVisible);
    $('.searchbar').classList.toggle('hidden', (activeMenu > 1));
    let arrNodes = $('#divMainBoard .columns.hidden'), columnsHidden;
    if (NodeList.prototype.isPrototypeOf(arrNodes)) {
        columnsHidden = arrNodes.length;
    } else {
        columnsHidden = arrNodes.classList.contains('trash') ? 0 : 1;
    } 
    $('imgColumnAdd').classList.toggle('hidden', !(activeMenu == 0 && columnsHidden > 0));
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
    $('divClerks').dataset.tooltip = 'select user';
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
    renderBacklog();
    let backlog = $('divBacklog');
    if (visible) {
        backlog.classList.remove('hidden');
    } else {
        backlog.classList.add('hidden');
    }
    serverUpdate();
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
        lastMenu = getActiveMenuItem();
        setHeaderIcons(editMode);
        currID = id; // save the id for apply changes!
        form.classList.add('edit-mode');
        loadTaskData(id);
    }
    form.classList.remove('hidden');
    $('.imgBacklog').classList.toggle('hidden', !editMode || lastMenu == 1);
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

function moveTaskToBacklog() {
    arrTasks[currID].status = 'backlog';
    showInputForm(false);
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

function changeList(control) {
    const PLUS = '&#x2795',
          MINUS = '&#x2796';
    let listID = control.list.id,
        listName = listID.substring(3),
        arrDest = listName.includes('Category') ? objSettings.category : objSettings.columns,
        value = control.value,
        button = $('btn' + listName);
    
    button.classList.add('hidden');
    if (value.length < 4) {
        return false;
    } else if (arrDest.includes(value)) {
        button.innerHTML = MINUS;
    } else {
        button.innerHTML = PLUS;
    }
    button.classList.remove('hidden');
    button.title = button.innerHTML == '\u2795' ? `add ${value} to ${listName}` : `remove ${value} from ${listName}`;
}

function updateList (control, button) {
    let value = $(control).value,
        listName = 'lst' + control.substring(3),
        arrDest = listName.includes('Category') ? objSettings.category : objSettings.columns;

    // if the new value ain't in the list and the button shows plus, we add it
    if (!arrDest.includes(value) && button.innerHTML ==  '\u2795') {
        arrDest.push(value);
    // if the button shows a minus, we delete the item from list
    } else if (arrDest.includes(value) && button.innerHTML ==  '\u2796') {
        arrDest.splice(arrDest.indexOf(value),1);
        $(control).value = '';
    }

    initSelectionFields(listName);
    $(button.id).classList.add('hidden');
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

function renderBoardColumns() {
    let board = $('divMainBoard');
    board.innerHTML = '';
    for (let i = 0; i < objSettings.columns.length; i++) {
        const title = objSettings.columns[i].toUpperCase(),
              state =  title.toLowerCase().replaceAll(' ', '');
        board.innerHTML += `
            <div class="columns">
                <h3>${title}</h3>
                <img class="imgCloseX-small" src="./img/close-48.png" onclick="hideColumn(${i})" title="hide column">
                <div class="${state} flx-ctr" ondrop="drop(event)" ondragover="allowDrop(event)" data-candrop="true"></div>
            </div>`;
    }
    board.innerHTML += HTML_TRASH_COLUMN;
}

// hides a column from board
function hideColumn (index) {
    let columns = $('.columns');
    columns[index].classList.add('hidden');
    setHeaderIcons();
}

// displays all hidden columns again
function showColumns () {
    let hiddenColumns = Array.from($('.columns.hidden')),
        trash = $('divTrash');
    hiddenColumns.forEach(col => {
        col.classList.remove('hidden');
    });
    trash.classList.toggle('hidden',trashState != 2);
    setHeaderIcons();
}