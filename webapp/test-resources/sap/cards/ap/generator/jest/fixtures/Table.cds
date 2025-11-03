namespace sap.cards.ap.test;

service JestService {
    @Core.OperationAvailable: true
    action unboundAction();

    @odata.draft.enabled
    entity TestEntity {
        key ID                              : Integer;
        key ID2                             : Integer;
            name                            : String;
            name2                           : String;
            amount                          : Decimal(15, 3) @Measures    : {ISOCurrency: currency};
            currency                        : String;
            name3                           : String         @Common.Label: 'Label to be changed';
            TextArrangementTextOnlyProperty : String         @Common      : {
                Text           : 'HardCodedText',
                TextArrangement: #TextOnly
            };
            _navigation1                    : Composition of many TestNavigatedEntity
                                                  on _navigation1.owner = $self;
    } actions {
        action nonDetermining();
        action nonDeterminingHidden();
        action determining();
        action determiningHidden();
        @Core.OperationAvailable        : {$edmJson: {$Path: 'sap.cards.ap.test.JestService.EntityContainer/TestEntity/name2'}}
        @cds.odata.bindingparameter.collection
        @cds.odata.bindingparameter.name: '_it'
        action staticAction();
    }

    @odata.draft.enabled
    entity TestEntityImportance {
        key ID                : Integer;
            regularProp       : String;
            requiredProperty  : String;
            requiredProperty2 : Boolean;
    }

    @odata.draft.enabled
    @Aggregation.ApplySupported: {PropertyRestrictions: true}
    entity DraftEnabledApplySupported {
        key ID    : Integer;
            ID2   : Integer;
            name  : String;
            name2 : String;
    }

    @odata.draft.enabled
    entity CreateHiddenEntity {
        key ID   : Integer;
            name : String;
    }

    @odata.draft.enabled
    entity CreateHiddenDynamicEntity {
        key ID           : Integer;
            name         : String;
            hiddenCreate : Boolean;
    }

    @odata.draft.enabled
    entity UpdateHiddenEntity {
        key ID   : Integer;
            name : String;
    }

    entity EntitySetWithStaticUpdateRestriction {
        key ID   : Integer;
            name : String;
    }

    entity EntitySetWithPathBasedUpdateRestriction {
        key ID            : Integer;
            name          : String;
            updatablePath : Boolean;
    }

    entity UpdateHiddenEntity1 {
        key ID   : Integer;
            name : String;
    }

    entity MassEditUpdateHiddenDynamicEntity {
        key ID           : Integer;
            name         : String;
            updateHidden : Boolean;
    }

    @odata.draft.enabled
    entity TestEntityWithNavigation {
        key ID                                    : Integer;
            name                                  : String;
            restrictionOnInsert                   : Boolean;
            restrictionOnUpdate                   : Boolean;
            restrictionOnDelete                   : Boolean;
            localRestrictionOnInsert              : Boolean;
            localRestrictionOnUpdate              : Boolean;
            localRestrictionOnDelete              : Boolean;
            hiddenCreate                          : Boolean;
            hiddenUpdate                          : Boolean;
            hiddenDelete                          : Boolean;
            _navigation                           : Composition of many TestNavigatedEntity
                                                        on _navigation.owner = $self;
            _actionsHidden                        : Composition of many TestDynamicActionsHidden
                                                        on _actionsHidden.owner = $self                @Common: {Label: 'Actions Hidden', };
            _restrictionsAndActionsHidden         : Composition of many TestRestrictionsAndActionsHidden
                                                        on _restrictionsAndActionsHidden.owner = $self @Common: {Label: 'Restrictions and Actions Hidden'};
            _onlyCapabilitiesRestrictionsOnTarget : Composition of many TestDynamicLocalCapabilitiesRestrictions
                                                        on _onlyCapabilitiesRestrictionsOnTarget.owner = $self;
            _restrictionsOnTargetAndNavigation    : Composition of many TestRestrictionsOnTargetAndNavigation
                                                        on _restrictionsOnTargetAndNavigation.owner = $self;
    }

    entity TestNavigatedEntity   @(Communication.Contact: {
        title: 'Contact Title',
        role : 'Contact role',
        fn   : name
    }) {
        key ID          : Integer;
            name        : String @(
                Common      : {
                    Text           : description,
                    TextArrangement: #TextOnly
                },
                Common.Label: 'Name to be updated'
            );
            description : String;
            owner       : Association to one TestEntityWithNavigation;
    } actions {
        @Core.OperationAvailable: _it._ShipToParty.isVerified
        action actionWithOverload();
    }

    entity TestRestrictionsAndActionsHidden {
        key ID    : Integer;
            name  : String;
            owner : Association to one TestEntityWithNavigation;

    }

    entity TestDynamicActionsHidden {
        key ID           : Integer;
            name         : String;
            owner        : Association to one TestEntityWithNavigation;
            hiddenCreate : Boolean;
            hiddenUpdate : Boolean;
            hiddenDelete : Boolean;
            _nav         : Association to one TestRestrictionsOnTargetAndNavigation @Common: {Label: 'Second degree navigation'};
            _nav2        : Association to one TestRestrictionsAndActionsHidden;
    }

    entity TestDynamicLocalCapabilitiesRestrictions {
        key ID    : Integer;
            name  : String;
            owner : Association to one TestEntityWithNavigation @odata.draft.enclosed;
    }

    entity TestRestrictionsOnTargetAndNavigation {
        key ID    : Integer;
            name  : String;
            owner : Association to one TestEntityWithNavigation @odata.draft.enclosed;
    }

    entity TestCriticalityWithTargetNavigation {
        key ID          : Integer;
            Criticality : Integer;
    }

    entity TreeTableEntity {
            @Core.Computed: true
        key ID          : String;
            description : String;
            _Nodes      : Association to many TreeTableSubEntityWithUpdateRestriction
                              on _Nodes.Organization = $self  @(Capabilities: {UpdateRestrictions: {NonUpdatableNavigationProperties: [_Nodes.Superordinate]}});
            _Nodes2     : Association to many TreeTableSubEntityWithUpdateRestriction
                              on _Nodes2.Organization = $self;
            _Nodes3     : Association to many TreeTableSubEntityWithUpdateRestriction
                              on _Nodes3.Organization = $self @(Capabilities: {UpdateRestrictions: {NonUpdatableNavigationProperties: [_Nodes.Organization]}});
            _Nodes4     : Association to many TreeTableSubEntityWithoutUpdateRestriction;
            _Nodes5     : Association to many TreeTableSubEntityWithInvalidUpdateRestriction;
    };

    @Aggregation.RecursiveHierarchy #myQualifier: {
        NodeProperty            : ID,
        ParentNavigationProperty: Superordinate,
        DistanceFromRootProperty: DistanceFromRoot
    }
    entity TreeTableSubEntityWithoutUpdateRestriction {
            @Core.Immutable: true
            @Common.Label  : 'ID'
        key ID               : String;
            parent           : String;

            @Common.Label  : 'Org level name'
            name             : String;

            @UI.Hidden     : true
            orgID            : String;

            @Core.Computed : true
            @UI.Hidden     : true
            DistanceFromRoot : Integer64;

            Superordinate    : Association to TreeTableSubEntityWithoutUpdateRestriction
                                   on Superordinate.ID = parent;
            Organization     : Association to TreeTableEntity
                                   on Organization.ID = orgID;
    }

    @Aggregation.RecursiveHierarchy #myQualifier: {
        NodeProperty            : ID,
        ParentNavigationProperty: Superordinate,
        DistanceFromRootProperty: DistanceFromRoot
    }
    entity TreeTableSubEntityWithInvalidUpdateRestriction {
            @Core.Immutable: true
            @Common.Label  : 'ID'
        key ID               : String;
            parent           : String;

            @Common.Label  : 'Org level name'
            name             : String;

            @UI.Hidden     : true
            orgID            : String;

            @Core.Computed : true
            @UI.Hidden     : true
            DistanceFromRoot : Integer64;

            Superordinate    : Association to TreeTableSubEntityWithoutUpdateRestriction
                                   on Superordinate.ID = parent;
            Organization     : Association to TreeTableEntity
                                   on Organization.ID = orgID;
    }

    @Aggregation.RecursiveHierarchy #myQualifier: {
        NodeProperty            : ID,
        ParentNavigationProperty: Superordinate,
        DistanceFromRootProperty: DistanceFromRoot
    }
    entity TreeTableSubEntityWithUpdateRestriction {
            @Core.Immutable: true
            @Common.Label  : 'ID'
        key ID               : String;
            parent           : String;

            @Common.Label  : 'Org level name'
            name             : String;

            @UI.Hidden     : true
            orgID            : String;

            @Core.Computed : true
            @UI.Hidden     : true
            DistanceFromRoot : Integer64;

            Superordinate    : Association to TreeTableSubEntityWithUpdateRestriction
                                   on Superordinate.ID = parent;
            Organization     : Association to TreeTableEntity
                                   on Organization.ID = orgID;
    }
}


annotate JestService.TreeTableSubEntityWithUpdateRestriction with @(Capabilities: {UpdateRestrictions: {NonUpdatableNavigationProperties: [Superordinate]}}); //entitySet

annotate JestService.TreeTableSubEntityWithInvalidUpdateRestriction with @(Capabilities: {UpdateRestrictions: {NonUpdatableNavigationProperties: [Organization]}});

annotate JestService.TestCriticalityWithTargetNavigation with @(UI: {LineItem: {
    ![@UI.Criticality]: Criticality,
    $value            : [{Value: ID}]
}});

annotate JestService.TreeTableEntity with @UI: {LineItem: [
    {
        $Type: 'UI.DataField',
        Value: ID,
    },
    {
        $Type: 'UI.DataField',
        Value: description,
    },
]};

annotate JestService.TreeTableSubEntityWithUpdateRestriction with @UI: {LineItem: [
    {
        $Type: 'UI.DataField',
        Value: name,
    },
    {
        $Type: 'UI.DataField',
        Value: orgID,
    }
]};

annotate JestService.TreeTableSubEntityWithoutUpdateRestriction with @UI: {LineItem: [
    {
        $Type: 'UI.DataField',
        Value: name,
    },
    {
        $Type: 'UI.DataField',
        Value: orgID,
    }
]};

annotate JestService.TreeTableSubEntityWithInvalidUpdateRestriction with @UI: {LineItem: [
    {
        $Type: 'UI.DataField',
        Value: name,
    },
    {
        $Type: 'UI.DataField',
        Value: orgID,
    }
]};

annotate JestService.CreateHiddenEntity with @UI.CreateHidden: true;
annotate JestService.CreateHiddenDynamicEntity with @UI.CreateHidden: hiddenCreate;
annotate JestService.UpdateHiddenEntity with @UI.UpdateHidden: true;
annotate JestService.UpdateHiddenEntity1 with @UI.UpdateHidden: false;
annotate JestService.MassEditUpdateHiddenDynamicEntity with @UI.UpdateHidden: updateHidden;

annotate JestService.TestRestrictionsAndActionsHidden with @(UI: {
    CreateHidden: owner.hiddenCreate,
    UpdateHidden: owner.hiddenUpdate,
    DeleteHidden: owner.hiddenDelete,
    LineItem    : [
        {Value: ID},
        {Value: name}
    ]
});


annotate JestService.TestDynamicActionsHidden with @(UI: {
    CreateHidden: owner.hiddenCreate,
    UpdateHidden: owner.hiddenUpdate,
    DeleteHidden: owner.hiddenDelete,
    LineItem    : [
        {Value: ID},
        {Value: name}
    ]
});

annotate JestService.EntitySetWithPathBasedUpdateRestriction with @Capabilities: {UpdateRestrictions: {Updatable: updatablePath}};
annotate JestService.EntitySetWithStaticUpdateRestriction with @Capabilities: {UpdateRestrictions: {Updatable: true}};

annotate JestService.TestDynamicLocalCapabilitiesRestrictions with @(
    Capabilities: {
        InsertRestrictions: {Insertable: owner.localRestrictionOnInsert},
        DeleteRestrictions: {Deletable: owner.localRestrictionOnDelete},
        UpdateRestrictions: {Updatable: owner.localRestrictionOnUpdate}
    },
    UI          : {LineItem: [
        {Value: ID},
        {Value: name}
    ]}
);

annotate JestService.TestRestrictionsOnTargetAndNavigation with @(
    Capabilities: {
        InsertRestrictions: {Insertable: owner.localRestrictionOnInsert},
        DeleteRestrictions: {Deletable: owner.localRestrictionOnDelete},
        UpdateRestrictions: {Updatable: owner.localRestrictionOnUpdate}
    },
    UI          : {LineItem: [
        {Value: ID},
        {Value: name}
    ]}
);

annotate JestService.TestEntityWithNavigation with @(
    Capabilities: {NavigationRestrictions: {RestrictedProperties: [
        {
            NavigationProperty: _restrictionsAndActionsHidden,
            InsertRestrictions: {Insertable: restrictionOnInsert}
        },
        {
            NavigationProperty: _restrictionsAndActionsHidden,
            UpdateRestrictions: {Updatable: restrictionOnUpdate}
        },
        {
            NavigationProperty: _restrictionsAndActionsHidden,
            DeleteRestrictions: {Deletable: restrictionOnDelete}
        },
        {
            NavigationProperty: _restrictionsOnTargetAndNavigation,
            InsertRestrictions: {Insertable: restrictionOnInsert}
        },
        {
            NavigationProperty: _restrictionsOnTargetAndNavigation,
            UpdateRestrictions: {Updatable: restrictionOnUpdate}
        },
        {
            NavigationProperty: _restrictionsOnTargetAndNavigation,
            DeleteRestrictions: {Deletable: restrictionOnDelete}
        }
    ]}},
    UI          : {LineItem: [
        {Value: _navigation.name},
        {Value: _actionsHidden.name},
        {Value: _actionsHidden._nav.name},
        {Value: _actionsHidden._nav2.name},
        {Value: _onlyCapabilitiesRestrictionsOnTarget.name},
        {
            $Type : 'UI.DataFieldForAnnotation',
            Target: '_navigation/@Communication.Contact',
            Label : 'Contact Info'
        }
    ], }
);

annotate JestService.TestEntityImportance with @(
    Capabilities      : {InsertRestrictions: {RequiredProperties: [
        requiredProperty,
        requiredProperty2
    ]}},
    Common.SemanticKey: [ID],
    UI                : {
        LineItem                                  : [
            {
                Value: regularProp,
                Label: 'Regular DataField'
            },
            {
                Value: ID,
                Label: 'With SemanticKey'
            },
            {
                Value: requiredProperty,
                Label: 'With required property'
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.FieldGroup#fieldGroupWithRegularProperty'
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.FieldGroup#fieldGroupWithSemanticKey'
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.FieldGroup#fieldGroupWithRequiredProperty'
            }
        ],
        FieldGroup #fieldGroupWithRequiredProperty: {Data: [{Value: requiredProperty}]},
        FieldGroup #fieldGroupWithSemanticKey     : {Data: [{Value: ID}]},
        FieldGroup #fieldGroupWithRegularProperty : {Data: [{Value: regularProp}]}
    }
);

annotate JestService.TestEntity with @(
    Common.SemanticKey: [
        ID,
        ID2
    ],
    UI                : {
        LineItem #WithFieldGroup                               : [{
            $Type : 'UI.DataFieldForAnnotation',
            Target: '@UI.FieldGroup#fieldGroupWithSemanticKeyAndName'
        }],
        LineItem                                               : [
            {
                Value: ID,
                //Label shouldn't be updated as 'ID' property is also used on a FieldGroup
                Label: 'Label should not updated from column'
            },
            {
                Value            : ID2,
                ![@UI.Importance]: #Medium
            },
            {Value: name},
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.FieldGroup#fieldGroupWithSemanticKey'
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.FieldGroup#fieldGroupWithoutSemanticKey'
            },
            {
                $Type            : 'UI.DataFieldForAnnotation',
                Target           : '@UI.FieldGroup#fieldGroupWithLowImp',
                ![@UI.Importance]: #Low
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.FieldGroup#fieldGroupWithoutImp'
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.FieldGroup#fieldGroupWithoutImpBis'
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target: '@UI.FieldGroup#fieldGroupWithNavPropertyAndTextArrangement'
            },
            {
                Value: name3,
                Label: 'Updated Label from Column'
            }
        ],
        FieldGroup #fieldGroupWithSemanticKey                  : {Data: [{Value: ID2}]},
        FieldGroup #fieldGroupWithSemanticKeyAndName           : {Data: [
            {Value: ID2},
            {Value: name}
        ]},
        FieldGroup #fieldGroupWithoutSemanticKey               : {Data: [{Value: name}]},
        FieldGroup #fieldGroupWithLowImp                       : {Data: [{Value: name}]},
        FieldGroup #fieldGroupWithoutImp                       : {Data: [{
            Value            : name2,
            ![@UI.Importance]: #Medium
        }]},
        FieldGroup #fieldGroupWithoutImpBis                    : {Data: [
            {
                Value            : name2,
                ![@UI.Importance]: #Medium
            },
            {
                Value            : name,
                ![@UI.Importance]: #High
            }
        ]},
        FieldGroup #fieldGroupWithNavPropertyAndTextArrangement: {Data: [
            {
                Value            : ID,
                ![@UI.Importance]: #High
            },
            {
                Value            : _navigation1.name,
                ![@UI.Importance]: #High
            }
        ]},
        LineItem #WithActions                                  : [
            {Value: ID},
            {Value: name},
            {
                $Type : 'UI.DataFieldForAction',
                Label : 'Non Determining',
                Action: 'sap.cards.ap.test.JestService.nonDetermining'
            },
            {
                $Type        : 'UI.DataFieldForAction',
                Label        : 'Non Determining Hidden',
                Action       : 'sap.cards.ap.test.JestService.nonDeterminingHidden',
                ![@UI.Hidden]: true
            },
            {
                $Type      : 'UI.DataFieldForAction',
                Label      : 'Determining',
                Action     : 'sap.cards.ap.test.JestService.determining',
                Determining: true
            },
            {
                $Type        : 'UI.DataFieldForAction',
                Label        : 'Determining Hidden',
                Action       : 'sap.cards.ap.test.JestService.determiningHidden',
                ![@UI.Hidden]: true,
                Determining  : true
            },
        ],
        LineItem #WithActionsOA                                : [
            {Value: ID},
            {Value: name},
            {
                $Type : 'UI.DataFieldForAction',
                Label : 'Action with Overload',
                Action: 'sap.cards.ap.test.JestService.actionWithOverload(sap.cards.ap.test.JestService.TestNavigatedEntity)'
            },
        ],
        LineItem #WithStaticAction                             : [
            {Value: ID},
            {Value: name},
            {
                $Type : 'UI.DataFieldForAction',
                Label : 'Action with Overload',
                Action: 'sap.cards.ap.test.JestService.staticAction'
            },
        ],
        LineItem #WithUnboundAction                            : [
            {Value: ID},
            {Value: name},
            {
                $Type : 'UI.DataFieldForAction',
                Label : 'Unboud Action',
                Action: 'sap.cards.ap.test.JestService.EntityContainer/unboundAction'
            },
        ],
        PresentationVariant                                    : {
            $Type                : 'UI.PresentationVariantType',
            InitialExpansionLevel: 4,
            Visualizations       : ['@UI.LineItem', ],
        },
        PresentationVariant #withGrouping                      : {
            $Type         : 'UI.PresentationVariantType',
            GroupBy       : [name],
            Visualizations: ['@UI.LineItem', ],
        },
        PresentationVariant #withMaxItems                      : {
            $Type         : 'UI.PresentationVariantType',
            MaxItems      : 123,
            Visualizations: ['@UI.LineItem', ],
        }
    }
);
