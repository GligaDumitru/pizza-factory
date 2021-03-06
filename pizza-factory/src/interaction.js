import order from './order';
import inventory from './inventory';
import moment from 'moment';


function showPrice() {
    document.getElementById('price').innerHTML = '$' + order.getTotal();
}


function initialize(document) {
    document.querySelectorAll('.pizza-size').forEach(function(sizeElement) {
        sizeElement.addEventListener('click',
            function() {
                var name = sizeElement.getAttribute('data-pizza-size');

                document.querySelectorAll('.pizza-size').forEach(function(element) {
                    element.classList.remove('selected');
                });

                if (!order.isSize(name)) {
                    sizeElement.classList.add('selected');
                }

                order.toggleSize(name);
            });
    });

    document.querySelectorAll('.pizza-crust').forEach(function(crustElement) {
        crustElement.addEventListener('click',
            function() {
                var name = crustElement.getAttribute('data-pizza-crust');

                document.querySelectorAll('.pizza-crust').forEach(function(element) {
                    element.classList.remove('selected');
                });

                if (!order.isCrust(name)) {
                    crustElement.classList.add('selected');
                }

                order.toggleCrust(name);
            });
    });

    document.querySelectorAll('.pizza-ingredient').forEach(function(ingredientElement) {
        ingredientElement.addEventListener('click',
            function() {
                ingredientElement.classList.toggle('selected');
                order.toggleIngredient(ingredientElement.getAttribute('data-pizza-ingredient'));
                showPrice();
            });
    });

    function toggleDisplay(element) {
        element.style.display = element.style.display != 'block' ? 'block' : 'none';

    }

    function updateDisplayedStock() {
        let stock = inventory.getStock();
        let container = document.querySelector('#container-inventory');
        while (container.lastChild) {
            container.removeChild(container.lastChild);
        }
        let list = document.createElement('ul');
        stock.forEach(item => {
            let li = document.createElement('li');
            li.innerHTML = `item: ${item.item}, quantity: ${item.quantity}`;
            list.appendChild(li);
        });
        container.appendChild(list);

    }
    document.querySelector('#show-inventory').addEventListener('click', function() {
        let container = document.querySelector('#container-inventory');
        toggleDisplay(container);
        updateDisplayedStock();
    });

    document.querySelector('#order').addEventListener('click', function() {
        var errors = order.isValid();
        if (errors.length == 0) {
            alert('Thank you for your order!');
            order.save();
            order.reset();

            document.querySelector('.pizza-size.selected').classList.remove('selected');
            document.querySelector('.pizza-crust.selected').classList.remove('selected');
            document.querySelectorAll('.pizza-ingredient').forEach(function(ingredientElement) {
                ingredientElement.classList.remove('selected');
            });

            showPrice();
            updateDisplayedStock();
        } else {
            alert('Cannot complete order because\r\n' + errors.reduce((acc, i) => acc + i + '\r\n'));
        }
    });

    var storedPizza = order.loadConfigurationIfExists();
    updatePizzaSelection(storedPizza);

    var storedHistory = order.loadHistoryIfExists();
    storedHistory.forEach(showOrder);

    showPrice();
}

function updatePizzaSelection(pizza) {
    if (pizza) {
        if (pizza.size != null) {
            document.querySelector('[data-pizza-size=' + pizza.size + ']').classList.add('selected');
        }

        if (pizza.crust != null) {
            document.querySelector('[data-pizza-crust=' + pizza.crust + ']').classList.add('selected');
        }

        for (var i in pizza.ingredients) {
            if (pizza.ingredients[i]) {
                document.querySelector('[data-pizza-ingredient=' + i + ']').classList.add('selected');
            }
        }
    }
}

function showOrder(orderItem) {
    // compute comma-separated ingredient list
    var ingredientsList = '';
    for (var i in orderItem.ingredients) {
        if (orderItem.ingredients[i]) {
            ingredientsList += i + ', ';
        }
    }
    ingredientsList = ingredientsList.substr(0, ingredientsList.length - 2);

    var orderElement = window.document.createElement('div');
    orderElement.classList.add('order');

    // create new elements for the order
    var descriptionElement = window.document.createElement('span');
    descriptionElement.classList.add('left', 'order-summary');

    var dateElement = window.document.createElement('span');
    dateElement.classList.add('right', 'order-date');

    var clearElement = window.document.createElement('div');
    clearElement.classList.add('clear');

    // set the inner HTML of the elements
    descriptionElement.innerHTML = orderItem.size + ' pizza with a ' + orderItem.crust + ' crust and a topping of: ' + ingredientsList + ' - $' + orderItem.price + '.';
    dateElement.innerHTML = moment(orderItem.created).fromNow();

    // add the elements to the list
    orderElement.appendChild(descriptionElement);
    orderElement.appendChild(dateElement);
    orderElement.appendChild(clearElement);

    window.document.querySelector('#history').appendChild(orderElement);
};

export default {
    showPrice: showPrice,
    showOrder: showOrder,
    updatePizzaSelection: updatePizzaSelection,
    initialize: initialize,

};