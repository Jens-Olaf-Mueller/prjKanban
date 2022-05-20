// ##########################################################################
//                          D E C L A R A T I O N S
// ##########################################################################
let editMode = false,   // flag for edit-mode
    boardIsVisible,     // flad for board to be displayed or not
    currID = 0,         // current id in edit mode (to apply changes)
    lastMenu = 0,       // saving the last menu we have been
    arrTasks = [],      // array, holding the tasks
    arrTrash = [],      // array, holding the deleted tasks (maybe not required...!)
    objSettings = {
        category: ["Marketing", "Product", "Sale", "Management"],
        priority: ["low", "medium", "important", "high"],
        staff: {
            names: ["Sebastian Zimmermann", "John Fieweger", "Olaf Müller", "Max Mustermann"],
            images: ["sebastian.jpg", "john.jpg", "olaf.jpg", "max.jpg"]
        },
        columns: ["to do", "scheduled", "in progress", "done"]
    };

// for demo only
// ##########################################################################
//createTasks(4); // nur zu Demozwecken!
//renderTasks();
activateMenuItem(0);

function createTasks(count) {
    let arrState = ['todo', 'schedule', 'progress', 'done', 'deleted'];

    for (let i = 0; i < count; i++) {
        const rnd = getRandom(0, objSettings.staff.names.length - 1);
        arrTasks.push(generateDemoTasks(rnd, i, arrState))

    }
}

function generateDemoTasks(rnd, i, arrState) {
    return {
        id: i,
        title: `Task ${i+1}`,
        description: `Das ist die Task-Beschreibung #${2+i*i-1}`,
        category: objSettings.category[rnd],
        deadline: `${today()}`,
        priority: objSettings.priority[rnd],
        staff: {
            name: objSettings.staff.names[rnd],
            image: objSettings.staff.images[rnd]
        },
        status: arrState[i]
    }
}

// Pushes all relevant arrays to the server after changes where made on the board (at the moment create & edit tasks)

function serverUpdate() {
    backend.setItem('arrTasks', JSON.stringify(arrTasks));
    backend.setItem('arrTrash', JSON.stringify(arrTrash));
}

// DEMOFUNKTIONEN ZUM LÖSCHEN VON TASKS

function deleteAll() {
    arrTasks = [];
    serverUpdate();
}

function deleteTask(i) {
    arrTasks.splice(i);
    serverUpdate();
}
// ##########################################################################

// ANCHOR addTask
// adds a new task or applies changes to an existing task,
// if flag 'editMode' is set to 'true'
function addTask() {
    let name = $('imgClerk').alt,
        foto = objSettings.staff.images[getStaffIndex(name)];
    if (editMode) {
        editTask(name, foto);
        renderTasks();
    } else {
        deadlineDate = isItADate();
        arrTasks.push(generatedTask(name, foto, deadlineDate));
        activateMenuItem(0); // display the board after adding new task!
    }
    showInputForm(false);
    serverUpdate();
}

function editTask(name, foto) {
    arrTasks[currID].title = $('inpTaskTitle').value;
    arrTasks[currID].description = $('txtDescription').value;
    arrTasks[currID].category = $('optCategory').value;
    arrTasks[currID].deadline = format$($('inpDeadline').value);
    arrTasks[currID].priority = $('optPriority').value;
    arrTasks[currID].staff.name = name;
    arrTasks[currID].staff.image = foto;
    serverUpdate();
}

function isItADate() {
    let deadlineDate = $('inpDeadline').value;
    if (deadlineDate == "") {
        deadlineDate = today();
    };
    return deadlineDate;
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
    if (task.title.toLowerCase().includes(search) && container.classList.contains(task.status)) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.description.toLowerCase().includes(search) && container.classList.contains(task.status)) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.deadline.toLowerCase().includes(search) && container.classList.contains(task.status)) {
        container.innerHTML += generateTaskHTML(task);
    } else if (task.staff.name.toLowerCase().includes(search) && container.classList.contains(task.status)) {
        container.innerHTML += generateTaskHTML(task);
    }
}

function generateTaskHTML(task) {
    return `
    <div id="task-${task.id}" class="task grab ${task.priority}" draggable="true" ondragstart="drag(event)" 
        ondblclick ="showInputForm(${task.id})" title="double-click for edit!">
        <img class="printer" src="./img/printer48.png" onclick="printTask(${task.id})" title ="print task">
        <div>
            <h3>${task.title}</h3>
            <p class="description">${task.description}</p>
        </div>
        <div class="taskEnd">
            <p>${task.deadline}</p> 
            <img class="portrait" src ="./img/${task.staff.image}" title="${task.staff.name}">
        </div>
    </div>`; //&#9754
}

// selects the given menu-item
function activateMenuItem(index) {
    closeSmallMenu();
    if (editMode) return;
    let items = $('.menu-items >li');
    // first remove all other selections!
    let i = 0;
    items.forEach(item => { 
        if (item.classList.contains('active')) lastMenu = i; // saving the last menu-index
        item.classList.remove('active');
        i++;
    }); 

    switch (index) {
        case 0:
            closeSections('backlog form help trash settings');
            showBoard(true);
            break;
        case 1:
            closeSections('board form help trash settings');
            showBackLog(true);
            break;
        case 2:
            closeSections('board backlog help trash settings');
            showInputForm();
            break;
        case 3:
            closeSections('board backlog form trash settings');
            showHelp(true);
            break;
        default:
            return; // if no index is provided, we only unselect the links and exit
    }
    items[index].classList.add('active');

    // hide icons except from settings, when board is invisible!
    hideIcons(!boardIsVisible);
}

// enables or disables the icons 'plus' and 'trash' in statusbar
function hideIcons(status) {
    $('imgBin').classList.toggle('hidden', status);
    $('imgPlus').classList.toggle('hidden', status);
    $('divTrashBin').classList.toggle('hidden', status);
}

// helper-function for fnc 'activateMenuItem': closes all open forms & div's
function closeSections(section) {
    if (section.includes('board')) showBoard(false);
    if (section.includes('backlog')) showBackLog(false);
    if (section.includes('form')) showInputForm(false);
    if (section.includes('help')) showHelp(false);
    if (section.includes('trash')) showTrash(false);
    if (section.includes('settings')) showSettings(false);
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
    let key = selection.substr(3).toLowerCase();
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
    if (visible) todo('Help-Sektion ist noch nicht implementiert!');
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
        activateMenuItem();
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
    toggleTrash(true);
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
    return tmp[1];
}

// displays or hides the trash bin in the lower right corner
// if we are in input- or edit mode, trash bin is ALWAYS off! (force = true)
function toggleTrash(force) {
    let trashIsVisible = !$('divTrash').classList.contains('hidden');
    if (trashIsVisible) {
        $('divTrash').classList.add('hidden');
        return;
    }
    let formIsVisible = !$('divInput').classList.contains('hidden');
    force = formIsVisible ? true : force;
    $('divTrashBin').classList.toggle('hidden', force);
}

// displays all task in trash array ANCHOR showTrash
function showTrash(visible) {
    if (visible) {
        // closeSections('board backlog form help');
        $('divTrash').classList.remove('hidden');
        $('divTrashBin').classList.add('hidden');
    } else {
        $('divTrash').classList.add('hidden');
    }
}

// displays or hides the settings
function showSettings(visible) {
    if (visible) {
        initSelectionFields('selPriority');
        initSelectionFields('lstCategory');
        initSelectionFields('lstColumns');

        $('divSettings').classList.remove('hidden');
        closeSections('board backlog form trash');
    } else {
        $('divSettings').classList.add('hidden');
    }

    hideIcons(true);
}

// short print-function
function printTask(index) {
    let divContent = $('task-' + index).innerHTML,
        printWindow = window.open('', '', 'height=720,width=1000');

    printWindow.document.write('<html><head><title>Task drucken</title>');
    printWindow.document.write(`<style> 
        .print-window {
            display: flex;
            flex-direction: column;
            align-items: center;
        } </style>`);
    printWindow.document.write('</head><body class="print-window">');
    printWindow.document.write(divContent);
    printWindow.document.getElementsByClassName('printer')[0].remove();
    let foto = printWindow.document.getElementsByClassName('portrait')[0];
    foto.style.height = '200px';
    foto.style.width = '150px';
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// executes the search either from click on the magnifier icon
// or by pressing the enter key!
function executeSearch() {
    todo('Suche ist noch nicht implementiert!');
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
        child = $(data),
        id = getIDNumber(child);
    let status = event.target.classList[0];

    // deleting per drag'n drop is an exception:
    // we can drag from another column or drop into the bin!
    if (status == 'deleted') {
        $('#divTrash .deleted').appendChild(child);
        return;
    }
    event.target.appendChild(child);
    arrTasks[id].status = status;
    serverUpdate();
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