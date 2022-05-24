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
    // remove the icons before print preview!
    printWindow.document.getElementsByClassName('task-icons')[1].remove();
    printWindow.document.getElementsByClassName('task-icons')[0].remove();
    let foto = printWindow.document.getElementsByClassName('portrait')[0];
    foto.style.height = '200px';
    foto.style.width = '150px';
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

function showColorPicker() {
    let colorPicker = $('inpColorPicker'),
        priority = $('selPriority').value,
        cssColor = getComputedStyle(document.querySelector(':root')).getPropertyValue(`--${priority}`)
    colorPicker.classList.remove('hidden');
    colorPicker.value = cssColor;
}

function saveSettings () {
    let newColor =  $('inpColorPicker').value,
    priority = $('selPriority').value;
    // Set the value of the css variable -- ??? to another value  
    $(':root').style.setProperty(`--${priority}`, newColor);

    // ACHTUNG! 
    // Werte in objSettings speichern und danach
    // objSettings noch zum Server!

    //resetSettingForm();
    showSettings(false);
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
    setHeaderControls(true, 4); // 4 forces the searchbar to be hidden!
}