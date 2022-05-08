// ##########################################################################
//                          D E C L A R A T I O N S
// ##########################################################################
let editMode = false,           // flag for edit-mode
    currID = 0,                 // current id in edit mode (to apply changes)
    arrTasks = [],              // array, holding the tasks
    arrTrash = [],              // array, holding the deleted tasks
    objSettings = {
    category: ["Marketing","Product","Sale","Management"],
    priority: ["low","medium","important","high"],
    staff:    {names : ["Sebastian Zimmermann","John Fieweger","Olaf Müller","Max Mustermann"],
               images: ["sebastian.jpg","john.jpg","olaf.jpg","max.jpg"]}
};


// for demo only
// ##########################################################################
createTasks(5); // nur zu Demozwecken!
renderTasks();

function createTasks (count) {
    let arrState = ['todo','schedule','progress','done'];
    for (let i = 0; i < count; i++) {
        const rnd = getRandom(0, objSettings.staff.names.length - 1);
        arrTasks.push({ id: i,
            title: `Task ${i+1}`, 
            description: `Das ist die Task-Beschreibung #${2+i*i-1}`,
            category: objSettings.category[rnd],
            deadline: `${today()}`,  
            priority: objSettings.priority[rnd],          
            staff: {name: objSettings.staff.names[rnd], 
                    image: objSettings.staff.images[rnd]},
            status: arrState[i]
        })      
    }
}
// ##########################################################################

// adds a new task or applies changes to an existing task,
// if flag 'editMode' is set to 'true'
function addTask() {
    let name = document.getElementById('imgClerk').alt,
        foto = objSettings.staff.images[getStaffIndex(name)];
    if (editMode) {
        arrTasks[currID].title = document.getElementById('inpTaskTitle').value;
        // rrTasks[currID].title = $('inpTaskTitle').value;
        arrTasks[currID].description = document.getElementById('txtDescription').value;
        arrTasks[currID].category = document.getElementById('optCategory').value;
        arrTasks[currID].deadline = format$(document.getElementById('inpDeadline').value);
        arrTasks[currID].priority = document.getElementById('optPriority').value;        
        arrTasks[currID].staff.name = name;
        arrTasks[currID].staff.image = foto;
        renderTasks ();
    } else {
        arrTasks.push({id: arrTasks.length,
            title: document.getElementById('inpTaskTitle').value, 
            description: document.getElementById('txtDescription').value,
            category: document.getElementById('optCategory').value,
            deadline: format$(document.getElementById('inpDeadline').value),      
            priority: document.getElementById('optPriority').value, 
            staff: {name: name, 
                    image: foto},
            status: 'todo'
        });
        activateMenuItem(0); // display the board after adding new task!
    }
    showInputForm(false);
}

// renders all existing tasks into the correct sections (todo, scheduled etc.)
function renderTasks () {
    let boardSections = Array.from(document.querySelectorAll('#divMainBoard >div'));
    // first clear all Sections!
    for (let i = 0; i < boardSections.length; i++) {boardSections[i].innerHTML = '';}

    // now render all tasks into the correct section with a double loop
    for (let i = 0; i < arrTasks.length; i++) {
        const task = arrTasks[i];
        for (let j = 0; j < boardSections.length; j++) {
            let container = boardSections[j];
            if (container.classList.contains(task.status)) {
                container.innerHTML += `
                <div id="task-${task.id}" class="task grab" draggable="true" ondragstart="drag(event)" 
                    ondblclick ="showInputForm(${task.id})" title="double-click for edit!">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <img src ="./img/${task.staff.image}" title="${task.staff.name}">
                    <p>${task.deadline} &#9754</p>
                </div>`;
            }
        }
    }
}

// selects the given menu-item
function activateMenuItem(index) {
    if(editMode) return;
    let items = document.querySelectorAll('.menu-items >li');
    items.forEach(item => {item.classList.remove('active')}); // first remove all other selections!

    switch (index) {
        case 0:
            closeSections('backlog form help');
            showBoard(true);
            break;
        case 1:
            closeSections('board form help');
            // showBackLog();
            break;
        case 2:
            closeSections('board backlog help');
            showInputForm();
            break;
        case 3:
            closeSections('board backlog form');
            // showHelp();
            break;
        default: 
            return; // if no index is provided, we only unselect the links and exit
    }
    items[index].classList.add('active');
}

// helper-function for fnc 'activateMenuItem': closes all open forms & div's
function closeSections (section) {
    if (section.includes('board')) showBoard(false);
    if (section.includes('backlog')) showBackLog(false);
    if (section.includes('form')) showInputForm(false);
    if (section.includes('help')) showHelp(false);
}

// resets the input-form and the flag for edit-mode
function resetForm () {
    let form = document.getElementById('frmInput'),
        image = document.getElementById('imgClerk');
    image.src ='./img/profile-dummy.png';
    image.alt ='';
    image.title ='';        
    form.reset();
    initSelectionFields('optCategory');
    initSelectionFields('optPriority');
    editMode = false;
}

// initializes the form's <SELECTION>-Elements 
function initSelectionFields (selection) {
    let key = selection.substr(3).toLowerCase();
        srcArray = objSettings[key],
        select = document.getElementById(selection);
    select.innerHTML = '<option value="">- bitte wählen -</option>';
    for (let i = 0; i < srcArray.length; i++) {
        const cat = srcArray[i];
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    }
}

// display the board with all states
function showBoard (visible) {
    let board = document.getElementById('divMainBoard');
    if (visible) {
        board.classList.remove('hidden');
        renderTasks();
    } else {
        board.classList.add('hidden');
    }
}

function showBackLog (visible) {
    // not yet implemented
}

function showHelp (visible) {
    // not yet implemented
}

// display OR close the input-form:
// if id is omitted         --> add a NEW task
// if id = 'false'          --> close the form!
// if id contains a task    --> edit the provided task
function showInputForm(id) {
    // make sure that no nonsense happens when we are in edit mode!
    if (editMode && id !==false) return;  
    // if (editMode && id === undefined) {
    //     activateMenuItem(0);
    //     return; 
    // }  
    let form = document.getElementById('divInput'); 
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
    document.getElementById('frmTitle').innerHTML = editMode ? 'Edit task' : 'Add task';
    document.getElementById('btnSubmit').innerHTML = editMode ? 'APPLY CHANGES' : 'CREATE TASK';
}

// loads all datas from the given task(id) into the form for edit mode
function  loadTaskData(id) { 
    document.getElementById('inpTaskTitle').value = arrTasks[id].title;
    document.getElementById('optCategory').value = arrTasks[id].category;
    document.getElementById('txtDescription').value = arrTasks[id].description;
    document.getElementById('inpDeadline').value = format$(arrTasks[id].deadline,'yyyy-mm-dd');
    document.getElementById('optPriority').value = arrTasks[id].priority;
    let frmImage =  document.getElementById('imgClerk');
    frmImage.src = './img/' + arrTasks[id].staff.image;
    frmImage.alt = arrTasks[id].staff.name;
    frmImage.title = arrTasks[id].staff.name; // frmImage.alt;
}

// changes the picture and the name of the staff in the input-form
function changeStaff() {
    let image = document.getElementById('imgClerk'),
        firstname = image.alt.split(' ')[0].toLowerCase(),   // images contain only firstname: 'sebastian.jpg'
        index = getStaffIndex(firstname);                    // search index of the staff-image in settings
    index ++;
    if (index >= objSettings.staff.images.length) index = 0; // make sure we stay in correct range of the array!
    image.src = './img/' + objSettings.staff.images[index];
    image.alt = objSettings.staff.names[index];
    image.title = image.alt;
}

// returns the index of a staff member according to the given name
function getStaffIndex (name) {
    // we can eiter search in names OR pictures (contains a dot => .jpg)!!!
    let arrSearch = name.includes('.') ? objSettings.staff.images : objSettings.staff.names;
    let index = arrSearch.findIndex(i => {
        if (i.toLowerCase().includes(name.toLowerCase())) return true;
    });
    if (index == -1) index = undefined;
    return index;
}

// returns the id as number, provided by the HTML-id
function getIDNumber (task) {
    let tmp = (task.id).split('-');
    return tmp[1];
}

// displays or hides the trash bin in the lower right corner
function toggleTrash() {
    document.getElementById('divTrash').classList.toggle('hidden');
}

// displays all task in trash array
function showTrash() {
    //
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
//   event.dataTransfer.effectAllowed = "move";
}
function drop(event) {
    event.preventDefault();
    let data = event.dataTransfer.getData('text'),
        child = document.getElementById(data),
        id = getIDNumber(child);
    let status = event.target.classList[0];
    event.target.appendChild(child);
    arrTasks[id].status = status; 

//   event.dataTransfer.dropEffect = "copy";
}