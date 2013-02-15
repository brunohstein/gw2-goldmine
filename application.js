///////////////////////
// Create Item class //
///////////////////////

var Item = function(name, restriction_level, rarity, img, max_offer_unit_price, offer_availability, min_sale_unit_price, sale_availability, sale_price_change_last_hour, offer_price_change_last_hour) {
  this.name            = name;
  this.level           = restriction_level;
  this.rarity          = rarity;
  this.image           = img;
  this.max_offer_price = max_offer_unit_price;
  this.offer_quantity  = offer_availability;
  this.min_sale_price  = min_sale_unit_price;
  this.sale_quantity   = sale_availability;
  this.sale_variation  = sale_price_change_last_hour;
  this.offer_variation = offer_price_change_last_hour;
};

///////////////////////////
// Create Item functions //
///////////////////////////

Item.prototype.getName           = function() { return this.name; };
Item.prototype.getLevel          = function() { return this.level; };
Item.prototype.getRarity         = function() { if (this.rarity == 0) { return 'junk' } else if (this.rarity == 1) { return 'common' } else if (this.rarity == 2) { return 'fine' } else if (this.rarity == 3) { return 'masterwork' } else if (this.rarity == 4) { return 'rare' } else if (this.rarity == 5) { return 'exotic' } else if (this.rarity == 6) { return 'legendary' }; };
Item.prototype.getImage          = function() { return this.image; };
Item.prototype.getMaxOfferPrice  = function() { return toGSC(this.max_offer_price); };
Item.prototype.getOfferQuantity  = function() { return this.offer_quantity; };
Item.prototype.getMinSalePrice   = function() { return toGSC(this.min_sale_price); };
Item.prototype.getSaleQuantity   = function() { return this.sale_quantity; };
Item.prototype.getSaleVariation  = function() { if (this.sale_variation > 0) { return 'increase' } else if (this.sale_variation < 0) { return 'decrease' } else { return 'same'} }
Item.prototype.getOfferVariation = function() { if (this.offer_variation > 0) { return 'increase' } else if (this.offer_variation < 0) { return 'decrease' } else { return 'same'} }
Item.prototype.printItem         = function() { $('ul', '#results').append( ['<li>', '<img src="' + this.getImage() + '" />', '<span class="name ' + this.getRarity() + '">' + this.getName() + ' (' + this.getLevel() + ')</span>', '<span class="offer ' + this.getOfferVariation() + '">Buy price: '+ this.getMaxOfferPrice() + '</span>', '<span class="sale ' + this.getSaleVariation() + '">Sale price: '+ this.getMinSalePrice() + '</span>', '</li>'].join('') ); };

///////////////////////////////////////////////////////////////////////////
// Function to convert int to gold/silver/copper (credits to tpcalc.com) //
///////////////////////////////////////////////////////////////////////////

toGSC = function(val) { var openG = '<span class="gold">'; var closeG = '</span>'; var openS = '<span class="silver">';  var closeS = '</span>'; var openC = '<span class="copper">'; var closeC = '</span>'; var sign = (val < 0 ? -1 : 1); var g = Math.floor(sign * val / 10000); var s = Math.floor((sign * val - g * 10000) / 100); var c = sign * val - g * 10000 - s * 100; if (g) return openG + (sign * g) + closeG + openS + s + closeS + openC + c + closeC; if (s) return openS + (sign * s) + closeS + openC + c + closeC; if (c) return openC + (sign * c) + closeC; return openC + '0' + closeC; };

////////////////////
// Document ready //
////////////////////

$(document).ready(function() {

  ////////////////
  // UI changes //
  ////////////////

  var right = $(window).width(),
      left  = -$(window).width(),
      show  = 0;

  $('#loader').css({left: right});
  $('#results').css({left: right});

  //////////////////////////////////////////////
  // Initialize script when submit is clicked //
  //////////////////////////////////////////////

  $('#low, #medium, #high').click(function() {

    //////////////////////////
    // Application settings //
    //////////////////////////

    var type = $('#type', '#action').val();

    if ($(this).is('#low')) {
      var itemsDisplayed = 20,    // number of results displayed
          saleQuantity   = 100,   // number of this item on sale
          offerQuantity  = 100,   // number of offers for this item
          minimumOffer   = 100,   // minimum price for offers
          minimumProfit  = 0.5,   // minimum percentage of profit
          exclusivity    = true;  // it is not in the route of tp farmers
    } else if ($(this).is('#medium')) {
      var itemsDisplayed = 20,
          saleQuantity   = 25,
          offerQuantity  = 25,
          minimumOffer   = 35000,
          minimumProfit  = 0.4,
          exclusivity    = false;
    } else if ($(this).is('#low')) {
      var itemsDisplayed = 20,
          saleQuantity   = 3,
          offerQuantity  = 3,
          minimumOffer   = 150000,
          minimumProfit  = 0.3,
          exclusivity    = false;
    };

    ////////////////
    // UI changes //
    ////////////////

    $('#action').animate({left: left});
    $('#loader').animate({left: show});

    ////////////////
    // Parse JSON //
    ////////////////

    $.getJSON('http://gw2spidy.com/api/v0.9/json/all-items/' + type + '?callback=?',
      {},
      function(data) {

        ////////////////
        // UI changes //
        ////////////////

        $('#loader').animate({left: left});
        $('#results').animate({left: show});
        
        var items = new Array();

        ////////////////////////
        // Filter the results //
        ////////////////////////

        $.each(data.results, function(i, result) {

          if (result.max_offer_unit_price >= minimumOffer && result.sale_availability >= saleQuantity && result.offer_availability >= offerQuantity && result.min_sale_unit_price >= result.max_offer_unit_price + (result.max_offer_unit_price * minimumProfit)) {
            if (exclusivity == true) {
              if (result.sale_price_change_last_hour > 0 || result.offer_price_change_last_hour < 0) {
                items.push(result);
              }
            } else {
              items.push(result);
            }
          };
        });

        if (items.length == 0) {

          //////////////////////////////////////
          // Show message if nothing is found //
          //////////////////////////////////////

          $('h2', '#results').html('No donuts for you today.');

        } else {

          if (items.length < itemsDisplayed) {

            ////////////////////////////////////////////////
            // Show message if there is not so many items //
            ////////////////////////////////////////////////

            itemsDisplayed = items.length;
            $('ul', '#results').append("<li>That's all for now folks.</li>");

          };

          ////////////////////////////////////////////
          // Sort array of items by relative profit //
          ////////////////////////////////////////////

          items.sort(function(a, b) { return parseFloat(a.max_offer_unit_price / a.min_sale_unit_price) - parseFloat(b.max_offer_unit_price / b.min_sale_unit_price) } );

          ///////////////////
          // Print results //
          ///////////////////

          for (i = 0; i < itemsDisplayed; i++) {
            var me = items[i];
            var profitable = new Item(me.name, me.restriction_level, me.rarity, me.img, me.max_offer_unit_price, me.offer_availability, me.min_sale_unit_price, me.sale_availability, me.sale_price_change_last_hour, me.offer_price_change_last_hour);
            profitable.printItem();
          };
        }
      }
    );

    return false;
  });
});