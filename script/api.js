var ordrin = typeof ordrin === "undefined" ? {} : ordrin;

(function(){
  "use strict";

  function getXhr() { 
    if (window.XMLHttpRequest) {
      // Chrome, Firefox, IE7+, Opera, Safari
      return new XMLHttpRequest(); 
    } 
    // IE6
    try { 
      // The latest stable version. It has the best security, performance, 
      // reliability, and W3C conformance. Ships with Vista, and available 
      // with other OS's via downloads and updates. 
      return new ActiveXObject('MSXML2.XMLHTTP.6.0');
    } catch (e) { 
      try { 
        // The fallback.
        return new ActiveXObject('MSXML2.XMLHTTP.3.0');
      } catch (e) { 
        alert('This browser is not AJAX enabled.'); 
        return null;
      } 
    }
  }

  function stringifyPrimitive(value){
    switch(typeof value){
      case 'string' : return value;
      case 'boolean' : return value ? 'true' : 'false';
      case 'number' : return isFinite(value) ? value : '';
      default : return '';
    }
  }

  function escape(value){
    return encodeURIComponent(value).replace('%20', '+');
  }

  function stringify(obj){
    return Object.keys(obj).map(function(k) {
      if(Array.isArray(obj[k])){
        return obj[k].map(function(v){
          return escape(stringifyPrimitive(k))+'='+escape(stringifyPrimitive(v));
        });
      } else {
        return escape(stringifyPrimitive(k))+'='+escape(stringifyPrimitive(obj[k]));
      }
    }).join('&');
  }

  var Tools = function(globals){

    /*
     * Base function to make a request to the ordr.in api
     * host is the base uri, somehting like r-test.ordr.in
     * uri is a full uri string, so everthing after ordr.in
     * method is either GET or POST
     * data is any additional data to be included in the request body or query string
     * headers are additional headers beyond the X-NAAMA-Authentication
     */
    this.makeApiRequest = function(host, uri, method, data, callback){
      data = stringify(data);

      // if (method === "GET" && data.length > 0){
      //   uri += "?" + data;
      // }

      var req = getXhr().open(method, host+uri, false);

      if (method != "GET"){
        req.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
        req.setRequestHeader("Content-Length", data.length);
      }

      req.send(data);

      if(req.status !== 200){
        callback({error: req.status, msg: req.statusText}, null);
        return;
      }

      callback(null, req.response);
    }

    this.buildUriString = function(baseUri, params){
      for (var i = 0; i < params.length; i++){
        baseUri += "/" + encodeURIComponent(params[i]);
      }
      return baseUri;
    }
  };

  var Restaurant = function(globals){
    var tools    = new Tools(globals);


    this.getDeliveryList = function(dateTime, address, callback){
      dateTime = this.checkDateTime(dateTime);

      var params = [
        dateTime,
        address.zip,
        address.city,
        address.addr
      ];

      this.makeRestaurantRequest("/dl", params, {}, "GET", callback);
    }

    this.getDeliveryCheck = function(restaurantId, dateTime, address, callback){
      dateTime = this.checkDateTime(dateTime);

      var params = [
        restaurantId,
        dateTime,
        address.zip,
        address.city,
        address.addr
      ]

      this.makeRestaurantRequest("/dc", params, {}, "GET", callback);
    }

    this.getFee = function(restaurantId, subtotal, tip, dateTime, address, callback){
      dateTime = this.checkDateTime(dateTime);

      var params = [
        restaurantId,
        subtotal,
        tip,
        dateTime,
        address.zip,
        address.city,
        address.addr
      ]

      this.makeRestaurantRequest("/fee", params, {}, "GET", callback);
    }

    this.getDetails = function(restaurantId, callback){
      this.makeRestaurantRequest("/rd", [restaurantId], {}, "GET", callback);
    }

    /*
     * function to make all restaurant api requests
     * uri is the base uri so something like /dl, include the /
     * params are all parameters that go in the url. Note that this is different than the data
     * data is the data that goes either after the ? in a get request, or in the post body
     * method is either GET or POST (case-sensitive)
     */

    this.makeRestaurantRequest = function(uri, params, data, method, callback){
      var uriString = tools.buildUriString(uri, params);
      
      tools.makeApiRequest(globals.restaurantUrl, uriString, method, data, {}, callback);
    }

    this.checkDateTime = function(dateTime){
      if (dateTime != "ASAP"){
        var delivery_date = String(dateTime.getMonth() + 1) + "-" +  String(dateTime.getDate());
        var delivery_time = dateTime.getHours() + ":" + dateTime.getMinutes();
        dateTime = delivery_date + "+" + delivery_time;
      }
      return dateTime;
    }
  };

  // one validation error for a specific field. Used in ValidationError class
  var FieldError = function(field, msg){
    this.field = field;
    this.msg   = msg;
  }

  // extends the Error object, and is thrown whenever an Object fails validation. Can contain multiple field errors.
  var ValidationError = function(name, msg, errors){
    Error.apply(this, arguments);
    this.fields = {};

    // takes an array of FieldErrors and adds them to the field object
    this.addFields = function(fieldErrors){
      for (var i = 0; i < fieldErrors.length; i++){
        this.fields[fieldErrors[i].field] = fieldErrors[i].msg;
      }
    }
  }

  var Address = function (addr, city, state, zip, phone, addr2){
    this.addr  = addr;
    this.city  = city;
    this.state = state;
    this.zip   = zip;
    this.phone = String(phone).replace(/[^\d]/g, ''); // remove all non-number, and stringify
    this.addr2 = addr2;


    this.validate = function(){
      var fieldErrors = [];
      // validate state
      if (/^[A-Z]{2}$/.test(this.state) == false){
        fieldErrors.push(new FieldError("state", "Invalid State format. It should be two upper case letters."));
      }
      // validate zip
      if (/^\d{5}$/.test(this.zip) == false){
        fieldErrors.push(new FieldError("zip", "Invalid Zip code. Should be 5 numbers"));
      }
      // validate phone number
      this.formatPhoneNumber();
      if (this.phone.length != 12){
        fieldErrors.push(new FieldError("phone", "Invalid Phone number. Should be 10 digits"));
      }
      if (fieldErrors.length != 0){
        var error = new ValidationError("Validation Error", "Check field errors for more details");
        error.addFields(fieldErrors);
        throw error;
      }
    }

    this.formatPhoneNumber = function(){
      this.phone = this.phone.substring(0, 3) + "-" + this.phone.substring(3, 6) + "-" + this.phone.substring(6);
    }
    this.validate();
  }

  var init = function(options){    
    if (typeof options.servers !== "undefined"){
      var servers = String(options.servers).toUpperCase();
      if (servers === "PRODUCTION"){
        options.restaurantUrl = "r.ordr.in";
      } else if (servers === "TEST"){
        options.restaurantUrl = "r-test.ordr.in";
      }
    }

    return {
      restaurant: new restaurantLib.Restaurant(options),
      Address: Address
    };
  };

  ordrin.api = init();
  
}());
