function loadBacklog() {
    $('divBacklog').innerHTML = '';
    $('divBacklog').innerHTML = /*html*/ `
    <div class="backlogContent">
            <div class="headline">
                <h2>Backlog</h2>
                <span>The following tasks need to be planned into a sprint</span>
            </div>

            <div class="backlogEntries">
                <table>
                    <tr id="tableHeadlines">
                        <th class="assignedTo">ASSIGNED TO</th>
                        <th class="categoryTD">CATEGORY</th>
                        <th class="detailsTD">DETAILS</th>
                    </tr>
                    <tr class="trbc-blue">
                        <td class="assignedTo">
                            <img src="img/sebastian.jpg">
                            <div class="name">
                                <span>Sebastian Zimmermann</span>
                            </div>
                        </td>
                        <td class="categoryTD">Marketing</td>
                        <td class="detailsTD">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis nihil aspernatur ipsam magni, quod corrupti reiciendis aliquam similique fuga praesentium, beatae laudantium deserunt eveniet? Repellat doloremque veritatis enim. Esse, magni.</td>
                    </tr>
                    <tr class="trbc-green">
                        <td class="assignedTo">
                            <img src="img/sebastian.jpg">
                            <div class="name">
                                <span>Sebastian Zimmermann</span>
                            </div>
                        </td>
                        <td class="categoryTD">Development</td>
                        <td class="detailsTD">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis nihil aspernatur ipsam magni, quod corrupti reiciendis aliquam similique fuga praesentium, beatae laudantium deserunt eveniet? Repellat doloremque veritatis enim. Esse, magni.</td>
                    </tr>
                    <tr class="trbc-purple">
                        <td class="assignedTo">
                            <img src="img/sebastian.jpg">
                            <div class="name">
                                <span>Sebastian Zimmermann</span>
                            </div>
                        </td>
                        <td class="categoryTD">Sales</td>
                        <td class="detailsTD">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis nihil aspernatur ipsam magni, quod corrupti reiciendis aliquam similique fuga praesentium, beatae laudantium deserunt eveniet? Repellat doloremque veritatis enim. Esse, magni.</td>
                    </tr>
                </table>
            </div>

        </div>
    `;
}