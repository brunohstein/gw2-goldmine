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
Item.prototype.getRarity        = function() {
  if (this.rarity == 0) { return 'junk' }
  else if (this.rarity == 1) { return 'common' }
  else if (this.rarity == 2) { return 'fine' }
  else if (this.rarity == 3) { return 'masterwork' }
  else if (this.rarity == 4) { return 'rare' }
  else if (this.rarity == 5) { return 'exotic' }
  else if (this.rarity == 6) { return 'legendary' };
};
Item.prototype.getImage         = function() { return this.image; };
Item.prototype.getMaxOfferPrice = function() { return toGSC(this.max_offer_price); };
Item.prototype.getOfferQuantity = function() { return this.offer_quantity; };
Item.prototype.getMinSalePrice  = function() { return toGSC(this.min_sale_price); };
Item.prototype.getSaleQuantity  = function() { return this.sale_quantity; };
Item.prototype.printItem = function() {
  $('ul', '#results').append(
    ['<li>',
      '<img src="' + this.getImage() + '" />',
      '<span class="name ' + this.getRarity() + '">'+ this.getName() + '</span>',
      '<span class="level">'+ this.getLevel() + '</span>',
      '<span class="offer">'+ this.getMaxOfferPrice() + '</span>',
      '<span class="sale">'+ this.getMinSalePrice() + '</span>',
    '</li>'].join('')
  );
};

toGSC = function(val) {
  var openG = '<span class="gold">';    var closeG = '</span>';
  var openS = '<span class="silver">';  var closeS = '</span>';
  var openC = '<span class="copper">';  var closeC = '</span>';

  var sign = (val < 0 ? -1 : 1);
  var g = Math.floor(sign * val / 10000);
  var s = Math.floor((sign * val - g * 10000) / 100);
  var c = sign * val - g * 10000 - s * 100;
  
  if (g) return openG + (sign * g) + closeG + openS + s + closeS + openC + c + closeC;
  if (s) return openS + (sign * s) + closeS + openC + c + closeC;
  if (c) return openC + (sign * c) + closeC;
  return openC + '0' + closeC;
};

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
        
        var items = new Array(),
            results = 0;

        $.each(data.results, function(i, result) { items.push(result); });

        for (i = 0; i < items.length; i++) {
          var me = items[i];
          if (me.min_sale_unit_price > 10 && me.max_offer_unit_price > 10 && me.min_sale_unit_price > me.max_offer_unit_price * 10 && me.sale_availability > 50 && me.offer_availability > 50) {
            var profitable = new Item(me.name, me.restriction_level, me.rarity, me.img, me.max_offer_unit_price, me.offer_availability, me.min_sale_unit_price, me.sale_availability);
            profitable.printItem();
            results++;
          }
        };

        if (results == 0) {
          $('ul', '#results').html('<li>No donuts for you today.</li>');
        }
      }
    );

    return false;
  });
});