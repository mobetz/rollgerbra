
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
    }
}
