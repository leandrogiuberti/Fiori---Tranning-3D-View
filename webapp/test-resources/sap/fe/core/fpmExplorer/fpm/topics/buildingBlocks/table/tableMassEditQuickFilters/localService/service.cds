service Service {
  @odata.draft.enabled
  entity RootEntity {
    key ID                                  : Integer       @title: 'ID';
        StringProperty                      : String        @title: 'String';
        IntegerProperty                     : Integer       @title: 'Integer';
        NumberProperty                      : Decimal(4, 2) @title: 'Number';
        BooleanProperty                     : Boolean       @title: 'Boolean';
        DateProperty                        : Date          @title: 'Date';
        TimeProperty                        : Time          @title: 'Time';
        PropertyWithUnit                    : Integer64     @title: 'With Unit'      @Measures.Unit       : Unit;
        PropertyWithCurrency                : Integer64     @title: 'With Currency'  @Measures.ISOCurrency: Currency;
        Unit                                : String        @title: 'UoM';
        Currency                            : String        @title: 'Currency';
        TagStatus                           : String;
        TextOnlyProperty                    : String        @title: 'Text Only Description';
        TextLastProperty                    : String        @title: 'Text Last Description';
        TextFirstProperty                   : String        @title: 'Text First Description';
        TextSeparateProperty                : String        @title: 'Text Separate Description';
        TextArrangementTextOnlyProperty     : String        @title: 'Text Only';
        TextArrangementTextLastProperty     : String        @title: 'Text Last';
        TextArrangementTextFirstProperty    : String        @title: 'Text First';
        TextArrangementTextSeparateProperty : String        @title: 'TextSeparate';
        PropertyWithValueHelp               : String        @title: 'With Value Help';
  }

  entity RootEntity2 {
    key ID             : Integer @title: 'ID';
        StringProperty : String  @title: 'String';
  }

  entity ValueHelpEntity {
    key KeyProp     : String(1)  @title: 'Value Help Key';

        @Core.Immutable
        Description : String(20) @title: 'Value Help Description';
  }

  entity ValueHelpCurrencyEntity {
    key Currency    : String(3)  @title: 'Currency Key';

        @Core.Immutable
        Description : String(20) @title: 'Currency Name';
  }

  annotate RootEntity2 with @(UI: {LineItem: [
    {Value: ID},
    {Value: StringProperty}
  ]});

  annotate RootEntity with @(Capabilities: {InsertRestrictions: {RequiredProperties: [TextArrangementTextFirstProperty]}});

  annotate RootEntity with @(UI: {
    LineItem                             : [
      {Value: ID},
      {Value: BooleanProperty},
      {Value: TagStatus},
      {Value: PropertyWithValueHelp},
      {Value: PropertyWithCurrency}
    ],
    PresentationVariant                  : {
      $Type         : 'UI.PresentationVariantType',
      SortOrder     : [{Property: ID}],
      Visualizations: ['@UI.LineItem']
    },
    SelectionVariant #Success            : {
      $Type        : 'UI.SelectionVariantType',
      Text         : '{@i18n>QuickFilterSucess}',
      SelectOptions: [{
        $Type       : 'UI.SelectOptionType',
        PropertyName: 'TagStatus',
        Ranges      : [{
          $Type : 'UI.SelectionRangeType',
          Sign  : #I,
          Option: #EQ,
          Low   : 'Success'
        }]
      }]
    },
    SelectionPresentationVariant #Success: {
      $Type              : 'UI.SelectionPresentationVariantType',
      SelectionVariant   : ![@UI.SelectionVariant#Success],
      PresentationVariant: ![@UI.PresentationVariant],
      Text               : 'Success',
    },
    SelectionPresentationVariant #All    : {
      $Type              : 'UI.SelectionPresentationVariantType',
      SelectionVariant   : {
        $Type: 'UI.SelectionVariantType',
        Text : 'All'
      },
      PresentationVariant: ![@UI.PresentationVariant],
      Text               : 'All'
    }
  }) {
    TextArrangementTextOnlyProperty     @Common: {
      Text           : TextOnlyProperty,
      TextArrangement: #TextOnly
    };
    TextArrangementTextLastProperty     @Common: {
      Text           : TextLastProperty,
      TextArrangement: #TextLast
    };
    TextArrangementTextFirstProperty    @Common: {
      Text           : TextFirstProperty,
      TextArrangement: #TextFirst,
      FieldControl   : #Mandatory
    };
    TextArrangementTextSeparateProperty @Common: {
      Text           : TextArrangementTextSeparateProperty,
      TextArrangement: #TextSeparate
    };
    PropertyWithValueHelp               @(Common: {ValueList: {
      Label         : 'Value with Value Help',
      CollectionPath: 'ValueHelpEntity',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: PropertyWithValueHelp,
          ValueListProperty: 'KeyProp'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'Description'
        }
      ]
    }});
    Currency                            @(Common: {
      ValueListWithFixedValues,
      ValueList: {
        Label         : 'Currency Value Help',
        CollectionPath: 'ValueHelpCurrencyEntity',
        Parameters    : [
          {
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: Currency,
            ValueListProperty: 'Currency'
          },
          {
            $Type            : 'Common.ValueListParameterDisplayOnly',
            ValueListProperty: 'Description'
          }
        ]
      }
    });
  };

  annotate ValueHelpEntity with {
    KeyProp @(Common: {
      Text           : Description,
      TextArrangement: #TextFirst
    },

    );
  };
}
