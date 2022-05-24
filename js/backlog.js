function loadBacklog(arrTasks) {

    $('backlogContent').innerHTML = '';
    for (let i = arrTasks.length - 1; i >= 0; i--) {
        const task = arrTasks[i];
        $('backlogContent').innerHTML += /*html*/ `
                    <tr class="">
                        <td class="${task.priority}">
                            <img src="./img/${task.staff.image}" title="${task.staff.name}">
                            <div class="name">
                                <span>${task.staff.name}</span>
                            </div>
                        </td>
                        <td class="">Marketing</td>
                        <td class="">${task.description}</td>
                    </tr>
    `;
    }

}