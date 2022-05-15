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
    let arrState = ['todo','schedule','progress','done','deleted'];
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

// ANCHOR addTask
// adds a new task or applies changes to an existing task,
// if flag 'editMode' is set to 'true'
function addTask() {
    let name = $('imgClerk').alt,
        foto = objSettings.staff.images[getStaffIndex(name)];
    if (editMode) {
        arrTasks[currID].title = $('inpTaskTitle').value;
        arrTasks[currID].description = $('txtDescription').value;
        arrTasks[currID].category = $('optCategory').value;
        arrTasks[currID].deadline = format$($('inpDeadline').value);
        arrTasks[currID].priority = $('optPriority').value;        
        arrTasks[currID].staff.name = name;
        arrTasks[currID].staff.image = foto;
        renderTasks ();
    } else {
        arrTasks.push({id: arrTasks.length,
            title: $('inpTaskTitle').value, 
            description: $('txtDescription').value,
            category: $('optCategory').value,
            deadline: format$($('inpDeadline').value),      
            priority: $('optPriority').value, 
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
    let boardSections = Array.from($('#divMainBoard >div'));
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
                    ondblclick="showInputForm(${task.id})" title="double-click for edit!">
                    <img class="printer" src ="./img/printer48.png" onclick="printTask(${task.id})" title ="print task">
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <img class="portrait" src ="./img/${task.staff.image}" title="${task.staff.name}">
                    <p>${task.deadline} &#9754</p>
                </div>`;
            }
        }
    }
}

// selects the given menu-item
function activateMenuItem(index) {
    if(editMode) return;
    let items = $('.menu-items >li');
    items.forEach(item => {item.classList.remove('active')}); // first remove all other selections!

    switch (index) {
        case 0:
            closeSections('backlog form help trash');
            showBoard(true);
            break;
        case 1:
            closeSections('board form help trash');
            // showBackLog();
            break;
        case 2:
            closeSections('board backlog help trash');
            showInputForm();
            break;
        case 3:
            closeSections('board backlog form trash');
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
    if (section.includes('trash')) showTrash(false);
}

// resets the input-form and the flag for edit-mode
function resetForm () {
    let form = $('frmInput'),
        image = $('imgClerk');
    image.src ='./img/profile-dummy.png';
    image.alt ='';
    $('divClerks').dataset.tooltip = 'select clerk';
    form.reset();
    initSelectionFields('optCategory');
    initSelectionFields('optPriority');
    editMode = false;
}

// initializes the form's <SELECTION>-Elements 
function initSelectionFields (selection) {
    let key = selection.substr(3).toLowerCase();
        srcArray = objSettings[key],
        select = $(selection);
    select.innerHTML = '<option value="">- bitte wählen -</option>';
    for (let i = 0; i < srcArray.length; i++) {
        const cat = srcArray[i];
        select.innerHTML += `<option value="${cat}">${cat}</option>`;
    }
}

// display the board with all states
function showBoard (visible) {
    let board = $('divMainBoard');
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
function  loadTaskData(id) { 
    $('inpTaskTitle').value = arrTasks[id].title;
    $('optCategory').value = arrTasks[id].category;
    $('txtDescription').value = arrTasks[id].description;
    $('inpDeadline').value = format$(arrTasks[id].deadline,'yyyy-mm-dd');  
    $('optPriority').value = arrTasks[id].priority;
    let frmImage =  $('imgClerk');
    frmImage.src = './img/' + arrTasks[id].staff.image;
    frmImage.alt = arrTasks[id].staff.name;
    $('divClerks').dataset.tooltip = frmImage.alt; // this adds the css-based tooltip!
}

// changes the picture and the name of the staff in the input-form
function changeStaff() {
    let image = $('imgClerk'),
        firstname = image.alt.split(' ')[0].toLowerCase(),   // images contain only firstname: 'sebastian.jpg'
        index = getStaffIndex(firstname);                    // search index of the staff-image in settings
    index ++;
    if (index >= objSettings.staff.images.length) index = 0; // make sure we stay in correct range of the array!
    image.src = './img/' + objSettings.staff.images[index];
    image.alt = objSettings.staff.names[index];
    $('divClerks').dataset.tooltip = image.alt; // this adds the css-based tooltip!
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
// if we are in input- or edit mode, trash bin is ALWAYS off! (force = true)
function toggleTrash(force) {
    let formIsVisible = !$('divInput').classList.contains('hidden');
    force = formIsVisible ? true : force;
    $('divTrashBin').classList.toggle('hidden',force);    
}

// displays all task in trash array ANCHOR showTrash
function showTrash(visible) {
    if (visible) {
        closeSections('board backlog form help');
        $('divTrash').classList.remove('hidden');
        toggleTrash(true);
    } else {
        $('divTrash').classList.add('hidden');
    }   
}

function printTask(index){
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
        child = $(data),
        id = getIDNumber(child);
    let status = event.target.classList[0];
    event.target.appendChild(child);
    arrTasks[id].status = status; 

//   event.dataTransfer.dropEffect = "copy";
}