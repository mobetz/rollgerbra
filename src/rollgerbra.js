
var DiceExpression = require("./DiceExpression.js");
var DieValue = require("./DieValue.js");

var dicepriority = 3;

var operators = {
    '*': { priority: 2, func: (x,y) => x*y },
    '+': { priority: 1, func: (x,y) => x+y },
    '-': { priority: 1, func: (x,y) => x-y },
    'd': { priority: dicepriority, func: (x,y) => new DiceExpression(x,y) },
    'b': { priority: dicepriority, func: (x,y) => x.best(y) },
    'w': { priority: dicepriority, func: (x,y) => x.worst(y) },
    '!': { priority: dicepriority, variadic: true, func: (x,y) => x.explode(y) },
    'h': { priority: dicepriority, func: (x,y) => x.hits(y) },
    //miss
    //over
    //under
};

function do_next_operation(num_queue, variadic_queue, op_queue, output) {
    var op = op_queue.pop();
    if ( op.variadic ) {
        variadic_operation(num_queue, variadic_queue, op);
    }
    else {
        binary_operation(num_queue, op, output);
    }
}

function binary_operation(num_queue, op, output) {
    var t2 = num_queue.pop();
    var t1 = num_queue.pop();
    var result = op.func(t1, t2);
    num_queue.push(result);
    if ( op == operators['d'] ) {
        output.dice.push(result);
    }
}

function variadic_operation(num_queue, variadic_queue, op) {
    var t1 = num_queue.pop();
    var tn = variadic_queue;
    var result = op.func(t1, ...tn);
    num_queue.push(result);
}

/*
    Use a modified Shunting Yard algorithm to calculate the value of a given dice expression.
 */
function parse(expression) {
    var output = {
        dice: [],
        calculation: 0
    };
    var op_queue = [];
    var num_queue = [0];
    var variadic_queue = [];
    var active_number_queue = num_queue;

    //step through characters left-to-right, pushing them to the queue that represents their symbol type
    for( var i = 0; i < expression.length; i++ ) {
        var next_char = expression[i];

        if ( !isNaN(next_char) && !/\s/.test(next_char)) {
            active_number_queue.push( active_number_queue.pop() * 10 + Number(next_char) );
        }
        else {
            var next_op = operators[next_char];
            //if the next function is variadic, all numbers until the next op will be pushed to a temporary queue instead
            active_number_queue = (next_op.variadic) ? variadic_queue : num_queue;
            if ( next_op ) {
                //do any previously pushed ops with higher or equal priority, as nothing new can affect them
                while ( op_queue.length > 0 && next_op.priority <= op_queue[op_queue.length-1].priority ) {
                    do_next_operation(num_queue, variadic_queue, op_queue, output);
                }//while there are higher priority ops already on the stack
                op_queue.push(next_op);
                active_number_queue.push(0); //if we've encountered an operator, next numbers are new numbers
            }//if there is an op for this character
        }//if the character is not a number
    }//for each character

    //do any leftover operations
    while ( op_queue.length > 0 ) {
        do_next_operation(num_queue, variadic_queue, op_queue, output);
    }

    output.calculation = Number(num_queue.pop());
    return output;
}//parse

module.exports = parse;


/*--- CLI Functions ---*/
function render_die_value(die_value) {
    var valid_char = (die_value.valid) ? '' : '~~';
    var bonus_char = (die_value.bonus) ? '*' : '';
    return bonus_char + valid_char + die_value.raw_value + valid_char + bonus_char;
}

if ( require.main == module ) {
    if ( !process.argv[2]) {
        throw `Usage: rollgerbra [expression]`;
    }
    var roll =  parse(process.argv[2]);
    var diestring = roll.dice.reduce((str, de) =>
        str + " " + de.toString() + ": [" + [...de].map(render_die_value).join(', ') + "]",
    '');
    console.log( "Rolling " + process.argv[2] + ": {" + diestring + "} = " + roll.calculation);
}
