using {TravelService} from '../../../../../service/service';

extend service TravelService with {
  entity ActionVisibilityEntity {
    key code        : Integer    @(
          Common: {
            Text           : Description,
            TextArrangement: #TextFirst
          },
          title : 'Visibility'
        );
        Description : String(20) @(
          Core.Immutable: true,
          Common        : {Label: 'Value Help Description'}
        );
  }

  @odata.singleton
  entity EntitiesSingleton {
    key DoNotChange      : Integer @Core.Computed;
        ShowAlertVisible : Boolean @Core.Computed;
  }
}

extend entity TravelService.Travel with {
  HeaderBooleanEnabled  : Boolean @title: 'Boolean';
  HeaderActionVisible   : Integer @title: 'Boolean';
  ShowAlertDescription1 : String  @title: 'Description'  @UI.MultiLineText: true  @readonly;
  ShowAlertDescription2 : String  @title: 'Description'  @UI.MultiLineText: true  @readonly;
  NameProperty          : String  @title: 'Secured Execution visibility';
  BooleanProperty       : Boolean @title: 'Boolean';
  visible               : Association to TravelService.ActionVisibilityEntity
                            on visible.code = $self.HeaderActionVisible;
} actions {
  action CopyAction();
  action ShareAction();
  action CheckStatusAction();
}

extend entity TravelService.Booking with {
  TextProperty : String @title: 'Text';
}

annotate TravelService.Travel with
@(UI: {

  Identification        : [
    {
      $Type  : 'UI.DataFieldForActionGroup',
      ID     : 'TravelActions',
      Label  : 'Travel Actions',
      Actions: [
        {
          $Type : 'UI.DataFieldForAction',
          Label : 'Copy',
          Action: 'TravelService.CopyAction',
        },
        {
          $Type : 'UI.DataFieldForAction',
          Label : 'Share',
          Action: 'TravelService.ShareAction',
        }
      ]
    },
    {
      $Type : 'UI.DataFieldForAction',
      Label : 'Check Travel Status',
      Action: 'TravelService.CheckStatusAction',
    }
  ],

  FieldGroup #HeaderMain: {Data: [
    {
      $Type: 'UI.DataField',
      Label: '"Show Message" Enabled',
      Value: HeaderBooleanEnabled
    },
    {
      $Type: 'UI.DataField',
      Label: '"Show Message" Visible',
      Value: HeaderActionVisible
    },
    {
      $Type: 'UI.DataField',
      Label: '"Show Alert" Enabled',
      Value: ShowAlertDescription1
    },
    {
      $Type: 'UI.DataField',
      Label: '"Show Alert" Visible',
      Value: ShowAlertDescription2
    }
  ]},

  FieldGroup #TravelData: {Data: [
    {Value: TravelID},
    {Value: to_Agency_AgencyID},
    {Value: BeginDate},
    {Value: EndDate},
    {
      $Type      : 'UI.DataField',
      Value      : TravelStatus_code,
      Criticality: TravelStatus.criticality,
      Label      : 'Status'
    },
    {
      $Type: 'UI.DataField',
      Label: 'Secured Execution enabled',
      Value: BooleanProperty
    },
    {
      $Type: 'UI.DataField',
      Value: NameProperty
    }
  ]}
}) {
  HeaderActionVisible @(Common: {
    Text                    : visible.Description,
    TextArrangement         : #TextOnly,
    ValueListWithFixedValues: true,
    ValueList               : {
      Label         : 'Value with Value Help',
      CollectionPath: 'ActionVisibilityEntity',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: HeaderActionVisible,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'Description'
        }
      ]
    }
  });
  NameProperty        @(Common: {
    // Text                    : visible.Description,
    // TextArrangement         : #TextOnly,
    ValueListWithFixedValues: true,
    ValueList               : {
      Label         : 'Value with Value Help',
      CollectionPath: 'ActionVisibilityEntity',
      Parameters    : [{
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: NameProperty,
        ValueListProperty: 'Description'
      }]
    }
  });
}

annotate TravelService.Travel with @(UI: {Facets: [
  {
    $Type : 'UI.ReferenceFacet',
    ID    : 'TravelData',
    Label : 'Travel Information',
    Target: '@UI.FieldGroup#TravelData',
  },
  {
    $Type : 'UI.ReferenceFacet',
    ID    : 'BookingList',
    Label : 'Bookings',
    Target: 'to_Booking/@UI.LineItem'
  }
]});

annotate TravelService.Booking with @(UI: {LineItem: [
  {Value: BookingID},
  {Value: BookingDate},
  {Value: ConnectionID},
  {Value: FlightDate},
  {Value: FlightPrice},
  {Value: CurrencyCode_code},
  {Value: TextProperty},
]});
