///////////////////////
// Create Item class //
///////////////////////

var Item = function(name, restriction_level, rarity, img, max_offer_unit_price, offer_availability, min_sale_unit_price, sale_availability) {
  this.name            = name;
  this.level           = restriction_level;
  this.rarity          = rarity;
  this.image           = img;
  this.max_offer_price = max_offer_unit_price;
  this.offer_quantity  = offer_availability;
  this.min_sale_price  = min_sale_unit_price;
  this.sale_quantity   = sale_availability;
};

///////////////////////////
// Create Item functions //
///////////////////////////

Item.prototype.getName          = function() { return this.name; };
Item.prototype.getLevel         = function() { return this.level; };
Item.prototype.getrarity        = function() { return this.rarity; };
Item.prototype.getImage         = function() { return this.image; };
Item.prototype.getMaxOfferPrice = function() { return this.max_offer_price; };
Item.prototype.getOfferQuantity = function() { return this.offer_quantity; };
Item.prototype.getMinSalePrice  = function() { return this.min_sale_price; };
Item.prototype.getSaleQuantity  = function() { return this.sale_quantity; };
Item.prototype.printItem        = function() { $('ul', '#results').html('<li>'+ this.getName() +'</li>'); };

$(document).ready(function() {

  //////////////////////////
  // Hide future elements //
  //////////////////////////

  $('#loader').hide();
  $('#results').hide();

  ///////////////////////////////////////
  // Insert select options dynamically //
  ///////////////////////////////////////

  // $.getJSON('http://www.gw2spidy.com/api/v0.9/json/types?callback=?',
  //   {},
  //   function(data) {
  //     $.each(data.results, function(i, type) {
  //       $('select', '#action').append('<option value="' + type.id + '">' + type.name + '</option>');
  //     });
  //   }
  // );

  //////////////////////////////////////////////
  // Initialize script when submit is clicked //
  //////////////////////////////////////////////

  $('#submit').click(function() {
    var type = $('select', '#action').val();

    $('#action').fadeOut();
    $('#loader').fadeIn();

    $.getJSON('http://gw2spidy.com/api/v0.9/json/all-items/' + type + '?callback=?',
      {},
      function(data) {
        $('#loader').fadeOut();
        $('#results').fadeIn();
        
        var items = new Array();

        $.each(data.results, function(i, result) {
          items.push(result);
        });

        for (i = 0; i < items.length; i++) {
          var me = items[i];
          if (me.min_sale_unit_price > me.max_offer_unit_price) {
            var profitable = new Item(me.name, me.restriction_level, me.rarity, me.img, me.max_offer_unit_price, me.offer_availability, me.min_sale_unit_price, me.sale_availability);
            profitable.printItem();
          } else {
            $('ul', '#results').html('<li>Nenhum produto vai te deixar rico hoje. :(</li>');
          }
        };
      }
    );

    return false;
  });
});