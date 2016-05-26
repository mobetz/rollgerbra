
var parse = require("../src/rollgerbra");

module.exports = {

    "arithmetic": {
        "Addition": function (test) {
            var result = parse("13+8");
            test.equals(result.calculation, 21);
            test.done();
        },
        "Subtraction":  function (test) {
            var result = parse("18-12");
            test.equals(result.calculation, 6);
            test.done();
        },
        "Multiplication":  function (test) {
            var result = parse("7*4");
            test.equals(result.calculation, 28);
            test.done();
        },
        "Order of Operations":  function (test) {
            var result = parse("2*7+13-8*5+2");
            test.equals(result.calculation, -11);
            test.done();
        }
    },
    "dice": {
      "Rolling": function (test) {
          var num_dice = 10;
          var num_sides = 6;
          var result = parse( num_dice + "d" + num_sides);
          var all_dice = result.dice.reduce((a, d) => a.concat(...d), []);
          var no_values_over_sides = all_dice.every((d) => d.raw_value <= num_sides );
          var dice_total = all_dice.reduce((s, d)=> s+d, 0);
          test.equals(all_dice.length, num_dice, "The wrong number of dice were rolled.");
          test.ok(no_values_over_sides, "Some of the dice rolled have too many sides.");
          test.equals(result.calculation, dice_total, "The returned sum does not match the sum of the returned dice.");
          test.done();
      },
      "Binary Explosion": function (test) {
          var num_dice = 12;
          var num_sides = 8;
          var explode_on = 5;
          var added_const = 100;
          var result = parse(num_dice + "d" + num_sides + "!" + explode_on + "+" + added_const);
          var all_dice = result.dice.reduce((a, d) => a.concat(...d), []);
          var number_exploded = all_dice.length - num_dice;
          var explosions_expected = all_dice.reduce((s, d)=>s + (d.raw_value >= explode_on), 0);
          var dice_total = all_dice.reduce((s, d)=>s + d, 0);
          test.equal(number_exploded, explosions_expected, "The wrong number of dice exploded.");
          test.equal(result.calculation, dice_total + added_const, "The dice were added incorrectly to the calculated result.");
          test.done();
      },
      "Unary Explosion": function (test) {
          var num_dice = 8;
          var num_sides = 4;
          var result = parse(num_dice + "d" + num_sides + "!");
          var all_dice = result.dice.reduce((a, d) => a.concat(...d), []);
          var number_exploded = all_dice.length - num_dice;
          var explosions_expected = all_dice.reduce((s, d)=>s +(d.raw_value == num_sides), 0);
          test.equal(number_exploded, explosions_expected, "The wrong number of dice exploded.");
          test.done();
      }
    }
};
