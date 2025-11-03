// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview simple post fix expressions
 * This allows to enter simple postfix expressions and to test if an id complies with the expression.
 * It can replace unsafe regular expressions that are vulnerable to ReDoS attacks.
 *
 * @version 1.141.0
 */

sap.ui.define([], () => {
    "use strict";
    const SimpleExpression = {};

    /**
     * Parses and evaluates a postfix expression for a given id
     * allows to enter expressions and to test and id if it comply
     * with the expression.
     * Valid operators for expressions are includes, and, or, not.
     * Valid values are strings.
     * @example
     * SimpleExpression.parseAndEvaluate("foo", "myfoo includes not") // false
     * SimpleExpression.parseAndEvaluate("foo", "myfoo includes") // true
     * @param {string} sId the id to test
     * @param {string} sExpression the postfix expression
     * @returns {boolean} result of the evaluation
     * @private
     * @since 1.133.0

     */
    SimpleExpression.parseAndEvaluate = function (sId, sExpression) {
        const aExpression = sExpression.split(" ");
        return SimpleExpression.evaluate(sId, aExpression);
    };

    /**
     * Evaluates a parsed postfix expression for a given id and a parsed postfix expression.
     * @param {string} sId the id to test
     * @param {string[]} aPostfix parsing result of a postfix expression
     * @returns {boolean} result of the evaluation
     * @private
     * @since 1.133.0
     */
    SimpleExpression.evaluate = function (sId, aPostfix) {
        // Help and result stack
        const oStack = [];
        let oElement;

        // main loop, which is executed as long as there are oElements in the Postfix Array
        while (aPostfix.length) {
            // first oElement of the postfix stack and evaluate it depending on the case
            switch (oElement = aPostfix.shift()) {
                case "includes":
                    oStack.push(sId.includes(oStack.pop()));
                    break;
                case "not":
                    oStack.push(!oStack.pop());
                    break;
                case "and":
                    oStack.push((oStack.pop() && oStack.pop()));
                    break;
                case "or":
                    oStack.push((oStack.pop() || oStack.pop()));
                    break;
                default:
                    // Assume that it can only be a string
                    oStack.push(oElement);
            }
        }
        return oStack.pop();
    };

    /**
     * Filters an array of strings by a postfix expression.
     * @param {string[]} aArray The array of strings to filter
     * @param {string} sExpression  the postfix expression
     * @returns {string[]} the filtered array
     * @private
     * @since 1.133.0
     */
    SimpleExpression.filterByExpression = function (aArray, sExpression) {
        return aArray.filter((sId) => {
            return SimpleExpression.parseAndEvaluate(sId, sExpression);
        });
    };
    return SimpleExpression;
});
