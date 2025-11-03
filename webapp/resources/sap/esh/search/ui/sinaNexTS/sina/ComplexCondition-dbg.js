/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./Condition", "./ConditionType", "./LogicalOperator", "./SimpleCondition"], function (___Condition, ___ConditionType, ___LogicalOperator, ___SimpleCondition) {
  "use strict";

  const Condition = ___Condition["Condition"];
  const ConditionType = ___ConditionType["ConditionType"];
  const LogicalOperator = ___LogicalOperator["LogicalOperator"];
  const isSimpleCondition = ___SimpleCondition["isSimpleCondition"];
  const SimpleCondition = ___SimpleCondition["SimpleCondition"];
  function isComplexCondition(condition) {
    return condition instanceof ComplexCondition;
  }
  class ComplexCondition extends Condition {
    // _meta: {
    //     properties: {
    //         operator: {
    //             required: false,
    //             default: function () {
    //                 return this.sina.LogicalOperator.And;
    //             }
    //         },
    //         conditions: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // },

    type = ConditionType.Complex;
    operator = LogicalOperator.And;
    conditions = [];
    constructor(properties) {
      super(properties);
      this.operator = properties.operator ?? this.operator;
      this.conditions = properties.conditions ?? this.conditions;
    }
    setSina(sina) {
      this.sina = sina;
      for (const condition of this.conditions) {
        condition.setSina(sina);
      }
    }
    clone() {
      const clonedConditions = [];
      for (let i = 0; i < this.conditions.length; ++i) {
        clonedConditions.push(this.conditions[i].clone());
      }
      return new ComplexCondition({
        sina: this.sina,
        operator: this.operator,
        conditions: clonedConditions,
        valueLabel: this.valueLabel,
        attributeLabel: this.attributeLabel
      });
    }
    equals(other) {
      if (!(other instanceof ComplexCondition)) {
        return false;
      }
      if (this.operator !== other.operator) {
        return false;
      }
      if (this.conditions.length !== other.conditions.length) {
        return false;
      }
      const matchedOtherConditions = {};
      for (let i = 0; i < this.conditions.length; ++i) {
        const condition = this.conditions[i];
        let match = false;
        for (let j = 0; j < other.conditions.length; ++j) {
          if (matchedOtherConditions[j]) {
            continue;
          }
          const otherCondition = other.conditions[j];
          if (isComplexCondition(condition) && isComplexCondition(otherCondition)) {
            if (condition.equals(otherCondition)) {
              match = true;
              matchedOtherConditions[j] = true;
              break;
            }
          } else if (isSimpleCondition(condition) && isSimpleCondition(otherCondition)) {
            if (condition.equals(otherCondition)) {
              match = true;
              matchedOtherConditions[j] = true;
              break;
            }
          }
        }
        if (!match) {
          return false;
        }
      }
      return true;
    }
    containsAttribute(attribute) {
      for (const condition of this.conditions) {
        if (condition.containsAttribute(attribute)) {
          return true;
        }
      }
      return false;
    }
    _collectAttributes(attributeMap) {
      for (const condition of this.conditions) {
        condition._collectAttributes(attributeMap);
      }
    }
    addCondition(condition) {
      if (!(condition instanceof Condition)) {
        condition = this.sina.createSimpleCondition(condition);
      }
      this.conditions.push(condition);
    }
    removeConditionAt(index) {
      this.conditions.splice(index, 1);
    }
    hasFilters() {
      return this.conditions.length >= 1;
    }
    removeAttributeConditions(attribute) {
      let result = {
        deleted: false,
        attribute: "",
        value: ""
      };
      for (let i = 0; i < this.conditions.length; ++i) {
        const subCondition = this.conditions[i];
        switch (subCondition.type) {
          case ConditionType.Complex:
            result = subCondition.removeAttributeConditions(attribute);
            break;
          case ConditionType.Simple:
            if (subCondition.attribute === attribute) {
              result = {
                deleted: true,
                attribute: subCondition.attribute,
                value: subCondition.value
              };
              this.removeConditionAt(i);
              i--;
            }
            break;
        }
      }
      this.cleanup();
      return result;
    }
    getAttributeConditions(attribute) {
      const results = [];
      const doGetAttributeConditions = function (condition, attributeName) {
        switch (condition.type) {
          case ConditionType.Complex:
            for (let i = 0; i < condition.conditions.length; i++) {
              doGetAttributeConditions(condition.conditions[i], attributeName);
            }
            break;
          case ConditionType.Simple:
            if (condition.attribute === attributeName) {
              results.push(condition);
            }
            break;
        }
      };
      doGetAttributeConditions(this, attribute);
      return results;
    }
    cleanup() {
      let removed = false;
      const doCleanup = function (condition) {
        for (let i = 0; i < condition.conditions.length; ++i) {
          const subCondition = condition.conditions[i];
          switch (subCondition.type) {
            case ConditionType.Complex:
              doCleanup(subCondition);
              if (subCondition.conditions.length === 0) {
                removed = true;
                condition.removeConditionAt(i);
                i--;
              }
              break;
            case ConditionType.Simple:
              break;
          }
        }
      };
      do {
        removed = false;
        doCleanup(this);
      } while (removed);
    }
    resetConditions() {
      this.conditions.splice(0, this.conditions.length);
    }
    getFirstAttribute() {
      if (this.conditions.length === 0) {
        return null;
      }
      // just use first condition
      if (this.conditions[0] instanceof ComplexCondition) {
        return this.conditions[0].getFirstAttribute();
      }
      if (this.conditions[0] instanceof SimpleCondition) {
        return this.conditions[0].getFirstAttribute();
      }
      throw new Error("Condition is neither simple nor complex");
    }
    _collectFilterConditions(attribute, filterConditions) {
      for (const condition of this.conditions) {
        condition._collectFilterConditions(attribute, filterConditions);
      }
    }
    getAttribute(condition) {
      if (condition instanceof SimpleCondition) {
        return condition.attribute;
      }
      for (let i = 0; i < condition.conditions.length; ++i) {
        const attribute = this.getAttribute(condition.conditions[i]);
        if (attribute) {
          return attribute;
        }
      }
    }
    autoInsertCondition(condition) {
      // identify complex condition which is responsible for the attribute -> matchCondition
      const attribute = this.getAttribute(condition);
      let matchCondition, currentCondition;
      for (let i = 0; i < this.conditions.length; ++i) {
        currentCondition = this.conditions[i];
        const currentAttribute = this.getAttribute(currentCondition);
        if (currentAttribute === attribute) {
          matchCondition = currentCondition;
          break;
        }
      }

      // if there is no matchCondition -> create
      if (!matchCondition) {
        if (this.sina) {
          matchCondition = this.sina.createComplexCondition({
            operator: LogicalOperator.Or
          });
        } else {
          matchCondition = new ComplexCondition({
            operator: LogicalOperator.Or
          });
        }
        this.addCondition(matchCondition);
      }

      // prevent duplicate conditions
      for (let j = 0; j < matchCondition.conditions.length; ++j) {
        currentCondition = matchCondition.conditions[j];
        if (currentCondition.equals(condition)) {
          return;
        }
      }

      // add condition
      matchCondition.addCondition(condition);
    }
    autoRemoveCondition(condition) {
      // helper
      const removeCondition = function (complexCondition, condition) {
        for (let i = 0; i < complexCondition.conditions.length; ++i) {
          const subCondition = complexCondition.conditions[i];
          if (subCondition.equals(condition)) {
            complexCondition.removeConditionAt(i);
            i--;
            continue;
          }
          if (subCondition instanceof ComplexCondition) {
            removeCondition(subCondition, condition);
            if (subCondition.conditions.length === 0) {
              complexCondition.removeConditionAt(i);
              i--;
              continue;
            }
          }
        }
      };

      // remove
      removeCondition(this, condition);
    }
    toJson() {
      const result = {
        type: ConditionType.Complex,
        operator: this.operator,
        conditions: [],
        valueLabel: this.valueLabel,
        attributeLabel: this.attributeLabel
      };
      for (let i = 0; i < this.conditions.length; ++i) {
        const condition = this.conditions[i];
        if (condition instanceof ComplexCondition) {
          result.conditions.push(condition.toJson());
        }
        if (condition instanceof SimpleCondition) {
          result.conditions.push(condition.toJson());
        }
      }
      if (this.userDefined) {
        result.userDefined = true;
      }
      return result;
    }
    toString() {
      let result = this.operator + " (";
      for (let i = 0; i < this.conditions.length; ++i) {
        const condition = this.conditions[i];
        if (condition instanceof ComplexCondition) {
          result += condition.toString();
        }
        if (condition instanceof SimpleCondition) {
          result += condition.toString();
        }
        if (i < this.conditions.length - 1) {
          result += ", ";
        }
      }
      return result + ")";
    }
    static fromString(input) {
      const operatorMatch = input.match(/^(\w+) \(/);
      if (!operatorMatch) {
        throw new Error("Invalid input string format");
      }
      const operator = operatorMatch[1];
      const conditionsString = input.slice(operatorMatch[0].length, -1); // Remove operator and surrounding parentheses

      const conditions = conditionsString.split(/,\s*(?=(?:[^()]*\([^()]*\))*[^()]*$)/); // Split by commas not inside parentheses
      const parsedConditions = [];
      for (const condition of conditions) {
        const trimmedCondition = condition.trim();
        if (trimmedCondition) {
          parsedConditions.push(ComplexCondition.parseCondition(trimmedCondition));
        }
      }
      return new ComplexCondition({
        operator,
        conditions: parsedConditions
      });
    }
    static parseCondition(conditionString) {
      const operatorMatch = conditionString.match(/^(\w+) \(/);
      if (operatorMatch) {
        return ComplexCondition.fromString(conditionString);
      } else {
        return SimpleCondition.fromString(conditionString);
      }
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.isComplexCondition = isComplexCondition;
  __exports.ComplexCondition = ComplexCondition;
  return __exports;
});
//# sourceMappingURL=ComplexCondition-dbg.js.map
