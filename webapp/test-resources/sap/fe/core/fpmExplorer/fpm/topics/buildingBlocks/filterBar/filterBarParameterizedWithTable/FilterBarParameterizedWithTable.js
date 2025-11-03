/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/mdx-runtime/useMDXComponents", "sap/fe/base/jsx-runtime/jsx", "sap/fe/base/jsx-runtime/Fragment", "sap/fe/base/jsx-runtime/jsxs"], function (_provideComponents, _jsx, _Fragment, _jsxs) {
  "use strict";

  function _createMdxContent(props) {
    const _components = Object.assign({
        p: "p"
      }, _provideComponents(), props.components),
      {
        BuildingBlockPlayground
      } = _components;
    if (!BuildingBlockPlayground) _missingMdxReference("BuildingBlockPlayground", true);
    return _jsxs(_Fragment, {
      children: [_jsx(_components.p, {
        children: "When linked to a parameterized entity set, the filter bar automatically adds fields for required parameters.\nA parameterized entity set has specific parameters to tailor the data it delivers,\nmaking it valuable for complex data retrieval involving complex queries or calculations based on different input values."
      }), "\n", _jsx(_components.p, {
        children: "In this sample's service definition, \"Customers\" with a \"Total Spend\" that is stored in \"US Dollar (USD)\"\nare linked to the parameterized entity set \"CustomerParameters\", using the pseudo key \"PreferredCurrency\".\nThe filter bar, now linked to the parameterized entity set as well, automatically includes a field for the required parameter \"Preferred Currency\".\nThe backend will use this input to convert the \"Total Spend\" to your specified preferred currency."
      }), "\n", _jsx(BuildingBlockPlayground, {
        children: `
        <core:Fragment fragmentName="sap.fe.core.fpmExplorer.filterBarParameterizedWithTable.FilterBarParameterizedWithTable" type="XML" />
	`
      }), "\n", _jsx(_components.p, {
        children: "\xA0"
      })]
    });
  }
  function MDXContent() {
    let props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const {
      wrapper: MDXLayout
    } = Object.assign({}, _provideComponents(), props.components);
    return MDXLayout ? _jsx(MDXLayout, {
      ...props,
      children: _jsx(_createMdxContent, {
        ...props
      })
    }) : _createMdxContent(props);
  }
  return MDXContent;
  function _missingMdxReference(id, component) {
    throw new Error("Expected " + (component ? "component" : "object") + " `" + id + "` to be defined: you likely forgot to import, pass, or provide it.");
  }
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfanN4cyIsIl9GcmFnbWVudCIsImNoaWxkcmVuIiwiX2pzeCIsIl9jb21wb25lbnRzIiwicCIsIkJ1aWxkaW5nQmxvY2tQbGF5Z3JvdW5kIiwiTURYQ29udGVudCIsInByb3BzIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwid3JhcHBlciIsIk1EWExheW91dCIsIk9iamVjdCIsImFzc2lnbiIsIl9wcm92aWRlQ29tcG9uZW50cyIsImNvbXBvbmVudHMiLCJfY3JlYXRlTWR4Q29udGVudCIsIl9taXNzaW5nTWR4UmVmZXJlbmNlIiwiaWQiLCJjb21wb25lbnQiLCJFcnJvciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyUGFyYW1ldGVyaXplZFdpdGhUYWJsZS5tZHgiXSwic291cmNlc0NvbnRlbnQiOlsiV2hlbiBsaW5rZWQgdG8gYSBwYXJhbWV0ZXJpemVkIGVudGl0eSBzZXQsIHRoZSBmaWx0ZXIgYmFyIGF1dG9tYXRpY2FsbHkgYWRkcyBmaWVsZHMgZm9yIHJlcXVpcmVkIHBhcmFtZXRlcnMuXG5BIHBhcmFtZXRlcml6ZWQgZW50aXR5IHNldCBoYXMgc3BlY2lmaWMgcGFyYW1ldGVycyB0byB0YWlsb3IgdGhlIGRhdGEgaXQgZGVsaXZlcnMsXG5tYWtpbmcgaXQgdmFsdWFibGUgZm9yIGNvbXBsZXggZGF0YSByZXRyaWV2YWwgaW52b2x2aW5nIGNvbXBsZXggcXVlcmllcyBvciBjYWxjdWxhdGlvbnMgYmFzZWQgb24gZGlmZmVyZW50IGlucHV0IHZhbHVlcy5cblxuSW4gdGhpcyBzYW1wbGUncyBzZXJ2aWNlIGRlZmluaXRpb24sIFwiQ3VzdG9tZXJzXCIgd2l0aCBhIFwiVG90YWwgU3BlbmRcIiB0aGF0IGlzIHN0b3JlZCBpbiBcIlVTIERvbGxhciAoVVNEKVwiXG5hcmUgbGlua2VkIHRvIHRoZSBwYXJhbWV0ZXJpemVkIGVudGl0eSBzZXQgXCJDdXN0b21lclBhcmFtZXRlcnNcIiwgdXNpbmcgdGhlIHBzZXVkbyBrZXkgXCJQcmVmZXJyZWRDdXJyZW5jeVwiLlxuVGhlIGZpbHRlciBiYXIsIG5vdyBsaW5rZWQgdG8gdGhlIHBhcmFtZXRlcml6ZWQgZW50aXR5IHNldCBhcyB3ZWxsLCBhdXRvbWF0aWNhbGx5IGluY2x1ZGVzIGEgZmllbGQgZm9yIHRoZSByZXF1aXJlZCBwYXJhbWV0ZXIgXCJQcmVmZXJyZWQgQ3VycmVuY3lcIi5cblRoZSBiYWNrZW5kIHdpbGwgdXNlIHRoaXMgaW5wdXQgdG8gY29udmVydCB0aGUgXCJUb3RhbCBTcGVuZFwiIHRvIHlvdXIgc3BlY2lmaWVkIHByZWZlcnJlZCBjdXJyZW5jeS5cblxuPEJ1aWxkaW5nQmxvY2tQbGF5Z3JvdW5kPlxuXHR7YFxuICAgICAgICA8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUuY29yZS5mcG1FeHBsb3Jlci5maWx0ZXJCYXJQYXJhbWV0ZXJpemVkV2l0aFRhYmxlLkZpbHRlckJhclBhcmFtZXRlcml6ZWRXaXRoVGFibGVcIiB0eXBlPVwiWE1MXCIgLz5cblx0YH1cbjwvQnVpbGRpbmdCbG9ja1BsYXlncm91bmQ+XG4mbmJzcDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O1dBQUFBLEtBQUEsQ0FBQUMsU0FBQTtNQUFBQyxRQUFBLEdBQUFDLElBQUEsQ0FBQUMsV0FBQSxDQUFBQyxDQUFBO1FBQUFILFFBQUE7TUFFd0gsQ0FBRCxDQUFDLFFBRXhIQyxJQUFBLENBQUFDLFdBQUEsQ0FBQUMsQ0FBQTtRQUFBSCxRQUFBO01BR2tHLENBQUQsQ0FBQyxRQUVsR0MsSUFBQSxDQUFBRyx1QkFBQTtRQUFBSixRQUFBLEVBQ0U7QUFDRjtBQUNBO01BQUUsQ0FDdUIsQ0FBQyxRQUMxQkMsSUFBQSxDQUFBQyxXQUFBLENBQUFDLENBQUE7UUFBQUgsUUFBQTtNQUFLLEVBQUM7SUFBQSxDQUNOO0VBQUE7RUFBQSxTQUFBSyxXQUFBO0lBQUEsSUFBQUMsS0FBQSxHQUFBQyxTQUFBLENBQUFDLE1BQUEsUUFBQUQsU0FBQSxRQUFBRSxTQUFBLEdBQUFGLFNBQUE7SUFBQTtNQUFBRyxPQUFBLEVBQUFDO0lBQUEsSUFBQUMsTUFBQSxDQUFBQyxNQUFBLEtBQUFDLGtCQUFBLElBQUFSLEtBQUEsQ0FBQVMsVUFBQTtJQUFBLE9BQUFKLFNBQUEsR0FBQVYsSUFBQSxDQUFBVSxTQUFBO01BQUEsR0FBQUwsS0FBQTtNQUFBTixRQUFBLEVBQUFDLElBQUEsQ0FBQWUsaUJBQUE7UUFBQSxHQUFBVjtNQUFBO0lBQUEsS0FBQVUsaUJBQUEsQ0FBQVYsS0FBQTtFQUFBO0VBQUEsT0FBQUQsVUFBQTtFQUFBLFNBQUFZLHFCQUFBQyxFQUFBLEVBQUFDLFNBQUE7SUFBQSxVQUFBQyxLQUFBLGdCQUFBRCxTQUFBLG9DQUFBRCxFQUFBO0VBQUE7QUFBQSIsImlnbm9yZUxpc3QiOltdfQ==