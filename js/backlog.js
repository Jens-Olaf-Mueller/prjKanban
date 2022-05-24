function loadBacklog() {

    $('backlogContent').innerHTML = '';
    $('backlogContent').innerHTML = /*html*/ `

            <div class="">
                <table>
                    <tr id="table-header">
                        <th class="assignedTo">ASSIGNED TO</th>
                        <th class="category">CATEGORY</th>
                        <th class="details">DETAILS</th>
                    </tr>
                    <tr class="">
                        <td class="">
                            <img src="img/sebastian.jpg">
                            <div class="name">
                                <span>Sebastian Zimmermann</span>
                            </div>
                        </td>
                        <td class="">Marketing</td>
                        <td class="">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis nihil aspernatur ipsam magni, quod corrupti reiciendis aliquam similique fuga praesentium, beatae laudantium deserunt eveniet? Repellat doloremque veritatis enim. Esse, magni.</td>
                    </tr>
                    <tr class="">
                        <td class="">
                            <img src="img/sebastian.jpg">
                            <div class="name">
                                <span>Sebastian Zimmermann</span>
                            </div>
                        </td>
                        <td class="">Development</td>
                        <td class="">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis nihil aspernatur ipsam magni, quod corrupti reiciendis aliquam similique fuga praesentium, beatae laudantium deserunt eveniet? Repellat doloremque veritatis enim. Esse, magni.</td>
                    </tr>
                    <tr class="">
                        <td class="">
                            <img src="img/sebastian.jpg">
                            <div class="name">
                                <span>Sebastian Zimmermann</span>
                            </div>
                        </td>
                        <td class="">Sales</td>
                        <td class="">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis nihil aspernatur ipsam magni, quod corrupti reiciendis aliquam similique fuga praesentium, beatae laudantium deserunt eveniet? Repellat doloremque veritatis enim. Esse, magni.</td>
                    </tr>
                </table>
            </div>
    `;
}