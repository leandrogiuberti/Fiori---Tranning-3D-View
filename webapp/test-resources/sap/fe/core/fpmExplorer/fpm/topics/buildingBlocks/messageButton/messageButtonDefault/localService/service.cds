namespace sap.fe.core;

entity Products                 @(Common: {SemanticKey: [ID]}) {
  key ID             : Integer  @title: 'Identifier'  @Core.Computed;
      Title          : String   @title: 'Product Title';
      Description    : String   @title: 'Product Description';
      Requester      : String   @title: 'Requester';
      ProductGroup   : String   @title: 'Product Group';
      Progress       : Integer  @title: 'Progress';
      Rating         : Integer  @title: 'Rating';
      Classification : String   @title: 'Product Classification';
      _Comments      : Composition of many Comments
                         on _Comments.Parent = $self;
}

entity Comments               @(Common: {SemanticKey: [ID]}) {
  key ID          : Integer   @title: 'Identifier'  @Core.Computed;
      Comment     : String    @title: 'Comment';
      CommentedBy : String    @title: 'Commented by';
      CommentedOn : Timestamp @title: 'Commented on';
      Parent_ID   : Integer;
      Parent      : Association to Products
                      on Parent.ID = Parent_ID;
}

annotate Products with @UI: {
  PresentationVariant           : {Visualizations: ['@UI.LineItem']},
  SelectionFields               : [Title],
  HeaderInfo                    : {
    TypeName      : 'Product',
    TypeNamePlural: 'Products',
    TypeImageUrl  : 'sap-icon://product',
    Title         : {
      $Type: 'UI.DataField',
      Value: Title
    },
    Description   : {
      $Type: 'UI.DataField',
      Value: Description
    }
  },
  Facets                        : [
    {
      $Type : 'UI.ReferenceFacet',
      Label : 'General information',
      Target: '@UI.FieldGroup#GeneralInformation',
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : 'Comments',
      Target: '_Comments/@UI.PresentationVariant'
    }
  ],
  FieldGroup #GeneralInformation: {
    $Type: 'UI.FieldGroupType',
    Label: 'General Information',
    Data : [
      {
        $Type: 'UI.DataField',
        Value: Title,
      },
      {
        $Type: 'UI.DataField',
        Value: Requester,
      },
      {
        $Type: 'UI.DataField',
        Value: Description
      }
    ],
  },
  LineItem                      : [
    {
      $Type            : 'UI.DataField',
      Value            : ID,
      ![@UI.Importance]: #High
    },
    {
      $Type            : 'UI.DataField',
      Value            : Title,
      ![@UI.Importance]: #High
    },
    {
      $Type            : 'UI.DataField',
      Value            : Description,
      ![@UI.Importance]: #Medium
    },
    {
      $Type            : 'UI.DataField',
      Value            : Classification,
      ![@UI.Importance]: #Low
    },
    {
      $Type            : 'UI.DataField',
      Value            : Requester,
      ![@UI.Importance]: #High
    },
    {
      $Type            : 'UI.DataField',
      Value            : ProductGroup,
      ![@UI.Importance]: #Medium
    }
  ]
};

annotate Comments with @UI: {
  PresentationVariant               : {
    Visualizations: ['@UI.LineItem'],
    SortOrder     : [{
      Property  : CommentedOn,
      Descending: false
    }],
  },
  HeaderInfo                        : {
    TypeName      : 'Comment',
    TypeNamePlural: 'Comments',
    TypeImageUrl  : 'sap-icon://comment',
    Title         : {
      $Type : 'UI.DataFieldForAnnotation',
      Target: '@UI.ConnectedFields#ConcatenatedTitle',
    },
    Description   : {
      $Type: 'UI.DataField',
      Value: Comment
    }
  },
  ConnectedFields #ConcatenatedTitle: {
    Template: '{ProductGroup}: {ProductTitle}',
    Data    : {
      ProductTitle: {
        $Type            : 'UI.DataField',
        Value            : Parent.Title,
        ![@UI.Importance]: #High
      },
      ProductGroup: {
        $Type            : 'UI.DataField',
        Value            : Parent.ProductGroup,
        ![@UI.Importance]: #High
      }
    }
  },
  Facets                            : [{
    $Type            : 'UI.ReferenceFacet',
    Label            : 'Comment',
    Target           : '@UI.Identification',
    ![@UI.Importance]: #High
  }, ],
  Identification                    : [
    {
      $Type: 'UI.DataField',
      Value: CommentedBy
    },
    {
      $Type: 'UI.DataField',
      Value: CommentedOn
    },
    {
      $Type: 'UI.DataField',
      Value: Comment
    }
  ],
  LineItem                          : [
    {
      $Type            : 'UI.DataField',
      Value            : ID,
      ![@UI.Importance]: #High
    },
    {
      $Type            : 'UI.DataField',
      Value            : Comment,
      ![@UI.Importance]: #High
    },
    {
      $Type            : 'UI.DataField',
      Value            : CommentedBy,
      ![@UI.Importance]: #Medium
    },
    {
      $Type            : 'UI.DataField',
      Value            : CommentedOn,
      ![@UI.Importance]: #Low
    }
  ]
};

service BuildingBlockMessages {
  @odata.draft.enabled
  entity Products as projection on core.Products;

  entity Comments as projection on core.Comments;
}
