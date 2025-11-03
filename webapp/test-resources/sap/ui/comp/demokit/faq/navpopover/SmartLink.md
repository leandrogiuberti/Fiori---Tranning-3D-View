<details>
  <summary><b>1. How can I navigate from an app instance to another instance of the same app?</b></summary>

By design, the `SmartLink` control prohibits navigation from an app to another instance of the same app. For example, within the Factsheet app (with URL #SalesOrder-displayFactSheet), no link to the same factsheet should be shown in the `NavigationPopover`. However, there are situations where it makes sense to navigate to another instance of the same app.

To achieve this, you can modify the desired link in the method `navigationTargetsObtainedCallback` provided as callback. The intent to navigate to the same app is provided by the `ownNavigation` parameter of the event object. Finally, you need to set the modified link using the `show` method.
</details>

<details>
  <summary><b>2. What is shown in the title area of the <code>SmartLink</code>?</b></summary>

The title area consists of title and subtitle. The text of the title is the binding context value of associated semantic object. The title is shown as text if the `SemanticObject` does not offer `displayFactSheet` action and it is shown as link if the `displayFactSheet` action is defined.

In case that the `SmartTable` or the `SmartField` controls are annotated with the `TextArrangement` annotation, the popover opened by the `SmartLink` shows the subtitle according to the display behavior of the annotation.

In case that `SmartTable` or `SmartField` controls are annotated with `SemanticKey`, the popover opened by `ObjectIdentifier` control shows the subtitle according to the `ObjectIdentifier`.
</details>

<details>
  <summary><b>3. The names of the parameter(s) are replaced by the <code>SmartLink</code> with the names of the semantic objects. As a result, navigation does not occur because the intent is incorrect.</b></summary>

Replacing the field name with the semantic object name is a standard behavior of the `SmartLink` as defined by the `mapFieldToSemanticObject` property in the API Reference. This behavior can be modified under the following circumstances:

- Freestyle app:
  - You can set the `mapFieldToSemanticObject` property to false.
  - Alternatively, you can define a `SemanticObjectMapping` annotation. (Check also question number 7 below for more details.)

- Smart Templates-based app:
  - Define an empty `SemanticObjectMapping` annotation in the local annotation file. (Check also question number 7 below for more details.)
Here you can find an example where an empty `SemanticObjectMapping` annotation is defined for the `Name` property of the `EPM_DEVELOPER_SCENARIO_SRV.Product` entity type:
```xml
<Annotations Target="EPM_DEVELOPER_SCENARIO_SRV.Product/Name" xmlns="http://docs.oasis-open.org/odata/ns/edm">
<Annotation Term="com.sap.vocabularies.Common.v1.SemanticObjectMapping"/>
</Annotations>
```
</details>

<details>
  <summary><b>4. The parameter name in the target application is different from the property of the local entity type. As a result, navigation does not take place because the target application expects a correct parameter name.</b></summary>

You can use `SemanticObjectMapping` annotation in order to map the `local` property name to the parameter of target application. Check also question 7 for more details.
</details>

<details>
  <summary><b>5. Why do I sometimes see no links, sometimes only a few links, and sometimes a lot of links in the <code>NavigationPopover</code>?</b></summary>

The links shown on the `NavigationPopover` can be personalized by end users and key users, which could be one reason for the variability. If no link personalization has occurred, then the default logic defined by UX takes place:

- Show all links if there are a few (maximum 10 links). If more than 10 links exist, do not show them at all.
- Links defined as `SuperiorAction` are always shown (other links not marked as `SuperiorAction` are not shown).
- Show all links if personalization is disabled by setting `enableAvailableActionsPersonalization` to `false`.
</details>

<details>
  <summary><b>6. Why does the <code>SemanticObjectController</code> raise the error: "sap.ui.comp.navpopover.SemanticObjectController: Please be aware that in case of a large amount of semantic objects the performance may suffer significantly and the received links will be created out of context"?</b></summary>

The `prefetchNavigationTargets` parameter and the `prefetchDone` event handler are deprecated and should not be used anymore on the `SmartLink`, as their usage might lead to severe performance issues.
</details>

<details>
  <summary><b>7. Why is the <code>SmartLink</code> sometimes rendered as a text instead of a link?</b></summary>

In general, we have to decide very early (at the time when the view is created) whether the `SmartLink` should be shown as a text or as a link.

This decision is made based on the semantic objects defined in the metadata:
- If at least one semantic object is returned by SAP Fiori launchpad, the link is rendered.
- If no semantic object is returned by SAP Fiori launchpad (for example, due to the user lacking authority for the defined semantic objects), the text is rendered.
  Check also question number 8 below for more details.
</details>

<details>
  <summary><b>8. Clicking on a <code>SmartLink</code> sometimes opens an empty <code>NavigationPopover</code> that says no content is available. Why?</b></summary>

If no content is shown in the `NavigationPopover`, it means that no navigation targets are available. A better solution would be to render the `SmartLink` as text, but this cannot be achieved due to performance constraints. When deciding whether the `SmartLink` should be rendered as a link or text, we do not verify whether a semantic object contains navigation targets, again due to performance concerns. Consequently, if a semantic object does not contain any navigation targets, clicking on the link will result in the navigation popover opening with a message that no content is available. Check also question number 7 above.
</details>

<details>
  <summary><b>9. When I open a <code>SmartLink</code> in a new tab or window, why does it redirect to the application's home page instead of the expected target application?</b></summary>

Typically, when you click on a `SmartLink`, a navigation popover opens, providing context and navigation target links. In this scenario, the `href` of the `SmartLink` is empty, which means there is nothing to open in a new tab or window. In cases of direct navigation, the `href` of the `SmartLink` is populated with intent information, such as `#ObjectDetail-display?ADDRESS=Kistlerhofstra%C3%9Fe%20142%2C%2081379%20M%C3%BCnchen%2C%20Germany`. Since this is not a complete URL, it redirects to the SAP Fiori launchpad home page. Therefore, the current infrastructure for intent-based navigation does not support opening URLs directly in a new tab or window.
</details>

<details>
  <summary><b>10. Clicking on a <code>SmartLink</code> opens the <code>NavigationPopover</code>, but we cannot find some of our expected links. Why?</b></summary>

This is simply because no such links are defined for the semantic object in SAP Fiori launchpad.
In other words, the retrieved navigation targets depend on the user authorizations and the system configuration.
You can check this by using SAP Fiori launchpad.

Another possible reason might be that the application's code might be filtering or modifying the retrieved links when the `navigationTargetsObtainedCallback` is called.
</details>

<details>
  <summary><b>11. Clicking on a <code>SmartLink</code> opens the <code>NavigationPopover</code> but the <code>mainNavigation</code> in the header link is not the expected one. Why?</b></summary>

You can check question number 10 above as the reason is quite similar.

Also, there is possibility that the `mainNavigation` is overridden by application coding using the `navigationTargetsObtainedCallback` callback.
</details>
