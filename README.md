# Mustard - client side food ordering

Mustard is a library that makes it easy to add Ordr.in powered food ordering to any website. This currently involves displaying a list of restaurants and an interactive menu.

## Installation

Mustard currently must be served by a server that proxies the [Ordr.in API](http://ordr.in/developers/api) or can make requests to the API and insert the result into the page. Currently, we provide the node module [deliveratorjs](https://github.com/ordrin/deliveratorjs), which provides this and other functionality.

## Quick start

The minimal page that will serve an menu is the following (assuming that `mustard.js` is in `/ordrin/script` and `main.css` is in `/ordrin/style`):

```html
<!Doctype html>
<html>
  <head>
    <link href="/ordrin/style/main.css" rel="stylesheet" type="text/css">
    <!--[if lt IE 9]><script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
    <script>
      var ordrin = typeof ordrin==="undefined"?{}:ordrin;
      ordrin.rid = 141; // the restaurant's ordr.in ID
      ordrin.render = "menu";
      ordrin.restaurantUrl = ordrin.orderUrl = location.origin+"path/to/api/proxy";
      (function(){
        var ow = document.createElement('script'); ow.type = 'text/javascript'; ow.async = true;
        ow.src = '{{path}}/script/mustard.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ow, s);  
      })();
    </script>
  </head>
  <body>
    <div id="ordrinMenu"></div>
  </body>
</html>
```

A few things to note about the page:

1. We only support loading Mustard asynchronously.
2. Currently, all parameters must be passed to Mustard by assigning to keys in the `ordrin` javascript object.
3. For Mustard to function, the menu HTML must be in a `<div>` with the id `ordrinMenu`. If Mustard is rendering the menu, as in this example, the `<div>` should be empty as its contents will be overwritten.

### No Proxy

If you want to make this quick start page but don't have a server that proxies the Ordr.in API, you can still render the page by adding only a couple of lines of code to the script tag in the quick start page. After the line that sets the `ordrin` variable, the following two lines should be added:

```js
ordrin.noProxy = true;
ordrin.menu = {{{data}}};
```

Fill in `{{{data}}}` by making a request to the restaurant details function of the [Restaurant API](http://ordr.in/developers/restaurant) and replacing `{{{data}}}` with the value of the `menu` key in the repsonse to that API call.

In this case, the `restaurantUrl` and `orderUrl` variables are not needed and will not have any effect, so the line setting them is not required.

## API

Mustard exposes the parts of the [Ordr.in API](http://ordr.in/developers/api) that do not require user authentication. Mustard puts the API into `ordrin.api`. Every API function takes a callback function as the last argument, and finishes by calling `callback(error, data)`

### Data Classes
```js
Address(addr, city, state, zip, phone, addr2)
CreditCard(name, expiryMonth, expiryYear, billAddress, number, cvc)
TrayItem(itemId, quantity, options)
Tray(items)
```

### Restaurant API
This API is for retreiving information about restaurants. The documentation for the underlying API calls can be found at the [Ordr.in Restaurant API documentation](http://ordr.in/developers/restaurant). All of these functions are in the `restaurant` object (`ordrin.api.restaurant`).
```js
// Get the list of restaurants that will deliver to that address
getDeliveryList(dateTime, address, callback)
 
// Check whether the restaurant will deliver to that address at that
// time
getDeliveryCheck(restaurantId, dateTime, address, callback)
 
// Get the fee and tax for an order with the given price, as well as
// delivery check information
getFee(restaurantId, subtotal, tip, dateTime, address, callback)
 
// Get all information about the restaurant, including their menu
getDetails(restaurantId, callback)
```

### Order API
This API is for placing orders. The documentation for the underlying API calls can be found at the [Ordr.in Order API documentation](http://ordr.in/developers/order). This function is in the `order` object (`ordrin.api.order`).
```js
// Place an order
placeOrder(restaurantId, tray, tip, deliveryTime, firstName, lastName, address, creditCard, email, callback)
```

## Interface

The following classes are used for externally visible data:

### Option
Represents an option on an item in the tray
#### Fields:

1. `id`: The menu id of the option
2. `name`: The name of the option
3. `price`: The price of the option in cents
4. `totalPrice`: the price of the option multiplied by the item quantity in dollars

---

### TrayItem
Represents an item in the tray
#### Fields:

1. `trayItemId`: The tray id of the item (used for uniquely identifying items in the tray
2. `itemId`: The menu id of the item
3. `itemName`: The name of the item
4. `quantity`: The selected quantity for the item in the tray
5. `options`: The selected options for the item in the tray
6. `price`: The base price of the item in cents
7. `quantityPrice`: the price of the item (excluding options) in dollars

#### Methods:

1. `buildItemString()`: Returns the part of the ordr.in API query string corresponding to this item
2. `renderTrayHtml()`: Returns the DOM node corresponding to this item in the tray
3. `hasOptionSelected(optionId)`: Returns true if this item has an option selected with this `optionId` and false otherwise
4. `getTotalPrice()`: Returns the total price of this tray item, taking into account selected options and quantity

---

### Tray
Represents a tray of food to be ordered.
#### Fields:

1. `items`: A hash mapping tray item ids to items in the tray

#### Methods:

1. `addItem(item)`: Adds `item` to the tray
2. `removeItem(id)`: Removes the item with the tray id `id` from the tray
3. `buildTrayString()`: Returns the part of the ordr.in API query string corresponding to the tray
4. `getSubtotal()`: Returns the total price of all items in the tray

---

### The Pages

Mustard can render two pages: a list of restaurants and a menu.

Both pages currently use the following values, many of which can be accessed either directly or through accessors:

#### Delivery address
The address that food should be delivered to. This should be an instance of `ordrin.api.Address`

Direct: `ordrin.address`

Accessors: `ordrin.mustard.getAddress()`, `ordrin.mustard.setAddress()` 

#### Delivery date/time
The time at which the food should be delivered. This should be either the string `ASAP`, a string of the form `MM-dd+HH:mm`, or a `Date` object in the future.

Direct: `ordrin.dateTime`

Accessors: `ordrin.mustard.getDeliveryTime()`, `ordrin.mustard.setDeliveryTime()`

#### Render
Tells Mustard what to render when the page loads. The value should be `"menu"` to render the menu, `"restaurants"` to render the restaurants, `"all"` to render both, or anything else to render nothing. Setting this after Mustard loads has no effect.

Direct: `ordrin.render`

#### Restaurant API URL
The base URL for requests to the restaurant API. Setting this after Mustard loads has no effect. 

Direct: `ordrin.resaurantUrl`

#### Order API URL
The base URL for requests to the order API. Setting this after Mustard loads has no effect.

Direct: `ordrin.orderUrl`

#### No Proxy
Mustard will not make any API requests if this value is truthy.

Direct: `ordrin.noProxy`

### Restaurant List

Mustard will render a restaurant list into  a `<div>` with the id `ordrinRestaurants` when it loads if `ordrin.render` is set to `"restaurants"`. After Mustard has loaded, the restaurant list can be rendered into that `<div>` again by calling `ordrin.mustard.renderRestaurants()`.

This page also uses the following values:

#### Restaurant List
The list of restuarant objects in the same form as the return value of the delivery list request in the [Restaurant API](http://ordr.in/developers/restaurant). If this is not provided before Mustard loads, Mustard will attempt to download it from the API using the `address` and `dateTime`.

Direct: `ordrin.restaurantList`

#### Restaurant List Template
A string containing a [Mustache](https://github.com/janl/mustache.js) template for rendering the list of restaurants. The default is at `templates/restaurants.html.mustache`

Direct: `ordrin.restaurantsTemplate`

#### Menu URI root
Direct: `menu_uri`

### Menu

Mustard will render a menu into a `<div>` with the id `ordrinMenu` when if loads if `ordrin.render` is set to `"restaurants"`. After Mustard has loaded, the restaurant list can be rendered into that `<div>` again by calling `ordrin.mustard.renderMenu()`.

This page also uses the following values:

#### Restaurant ID
Ordr.in's ID number for the restaurant

Direct: `ordrin.rid`

Accessors: `ordrin.mustard.getRid()`, `ordrin.mustard.setRid()`

#### Menu
A menu in the same structure as the value of the `menu` key in the return value of the [Restaurant API](http://ordr.in/developers/restaurant) details function. If this is not provided before Mustard loads, Mustard will attempt to download it from the API using the restaurant ID.

Direct: `ordrin.menu`

#### Menu Template
A string containing a [Mustache](https://github.com/janl/mustache.js) template for rendering the menu. The default is at `templates/menu.html.mustache`.

Direct: `ordrin.menuTemplate`

#### Dialog Template
A string containing a [Mustache](https://github.com/janl/mustache.js) template for rendering the dialog box for selecting item options and quantity. The default is at `templates/dialog.html.mustache`.

Direct: `ordrin.dialogTemplate`

#### Tray Item Template
A string containing a [Mustache](https://github.com/janl/mustache.js) template for rendering an itemin the tray. The default is at `templates/trayItem.html.mustache`.

Direct: `ordrin.trayItemTemplate`

#### Tray
A tray of items. An instance of `Tray`.

Direct: `ordrin.tray`

Accessor: `ordrin.mustard.getTray()`

#### Tip
The tip as an integer number of cents.

Direct: `ordrin.tip`

Accessor: `ordrin.mustard.getTip()`