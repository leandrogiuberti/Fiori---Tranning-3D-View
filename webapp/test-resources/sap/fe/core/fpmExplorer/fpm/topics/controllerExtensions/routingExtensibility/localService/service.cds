service Service {
  entity RootEntity {
    key ID                  : Integer  @Core.Computed  @title: 'Identifier';
        Priority            : String   @title: 'Priority';
        Criticality         : Integer  @UI.Hidden;
        TitleProperty       : String   @title: 'Title';
        DescriptionProperty : String   @title: 'Description';
        _toSecretEntity     : Composition of many SecretEntity
                                on _toSecretEntity.ID = ID;
  }

  annotate RootEntity with
  @(UI: {
    HeaderInfo                    : {
      TypeName      : 'Root Entity',
      TypeNamePlural: 'Root Entities',
      Title         : {
        $Type: 'UI.DataField',
        Value: TitleProperty
      },
      Description   : {
        $Type: 'UI.DataField',
        Value: DescriptionProperty
      }
    },
    Facets                        : [{
      $Type : 'UI.ReferenceFacet',
      Label : 'General Information',
      Target: '@UI.FieldGroup#GeneralInformation',
    }],
    FieldGroup #GeneralInformation: {
      $Type: 'UI.FieldGroupType',
      Label: 'General Information',
      Data : [
        {
          $Type      : 'UI.DataField',
          Value      : Priority,
          Criticality: Criticality,
        },
        {
          $Type: 'UI.DataField',
          Value: TitleProperty,
        },
        {
          $Type: 'UI.DataField',
          Value: DescriptionProperty
        },
      ],
    },
    LineItem                      : [
      {Value: ID},
      {
        $Type      : 'UI.DataField',
        Value      : Priority,
        Criticality: Criticality,
      },
      {Value: TitleProperty},
      {Value: DescriptionProperty}
    ]
  });

  entity SecretEntity {
    key secretKey           : UUID;
        ID                  : Integer @Core.Computed;
        TitleProperty       : String  @title: 'Title';
        DescriptionProperty : String  @title: 'Description';
  }

  annotate SecretEntity with @(
    Common: {SemanticKey: [
      ID,
      secretKey
    ]},
    UI    : {
      Facets                        : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'General Information',
        Target: '@UI.FieldGroup#GeneralInformation',
      }],
      FieldGroup #GeneralInformation: {
        $Type: 'UI.FieldGroupType',
        Label: 'General Information',
        Data : [
          {
            $Type: 'UI.DataField',
            Value: TitleProperty,
          },
          {
            $Type: 'UI.DataField',
            Value: DescriptionProperty
          }
        ]
      },
      LineItem                      : [
        {Value: ID},
        {Value: TitleProperty},
        {Value: DescriptionProperty},
        {Value: secretKey}
      ]
    }
  )
}
