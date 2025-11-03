using {
  sap,
  managed,
  Currency,
  Country
} from '@sap/cds/common';

@cds.autoexpose  @readonly
aspect MasterData {}

service TravelService {
  @odata.draft.enabled
  @Common.SemanticKey: [TravelID]

  entity Travel : managed {
    key TravelUUID    : UUID;

        @Common.Label          : 'ID'
        @Common.Text           : Description
        TravelID      : Integer default 0                       @readonly;

        @Common.Label          : 'Begin Date'
        BeginDate     : Date                                    @mandatory;

        @Common.Label          : 'End Date'
        EndDate       : Date                                    @mandatory;

        @Common.Label          : 'Booking Fee'
        BookingFee    : Decimal(10, 2) default 0                @Measures.ISOCurrency: CurrencyCode_code;

        @Common.Label          : 'Total Price'
        TotalPrice    : Decimal(10, 2)                          @readonly  @Measures.ISOCurrency: CurrencyCode_code;

        @Common.Label          : 'Currency'
        CurrencyCode  : Currency default 'EUR'                  @mandatory;

        @Common.Label          : 'Description'
        Description   : String(1024);

        @Common.Label          : 'Travel Details'
        @UI.MultiLineText
        TravelDetails : String(1024);

        @title                 : 'Status'
        @Common.Text           : TravelStatus.name
        @Common.TextArrangement: #TextOnly
        TravelStatus  : Association to TravelStatus default 'O' @readonly;

        @title                 : 'Agency'
        @Common.Text           : to_Agency.Name
        @Common.TextArrangement: #TextFirst
        to_Agency     : Association to TravelAgency             @mandatory;

        to_Booking    : Composition of many Booking
                          on to_Booking.to_Travel = $self;
  };

  entity Booking : managed {
    key BookingUUID   : UUID;

        @Common.Label: 'Booking ID'
        BookingID     : Integer                                  @Core.Computed;

        @Common.Label: 'Booking Date'
        BookingDate   : Date;

        @Common.Label: 'Connection'
        ConnectionID  : String(4)                                @mandatory;

        @Common.Label: 'Flight Date'
        FlightDate    : Date                                     @mandatory;

        @Common.Label: 'Flight Price'
        FlightPrice   : Decimal(10, 2)                           @Measures.ISOCurrency: CurrencyCode_code;

        @Common.Label: 'Currency'
        CurrencyCode  : Currency default 'EUR'                   @mandatory;

        @Common.Label: 'Status'
        BookingStatus : Association to BookingStatus default 'N' @mandatory;
        to_Travel     : Association to Travel                    @mandatory;

        PaymentMethod : String(1) default 'B'                    @Common              : {
          Label                   : 'Payment Method',
          Text                    : _Payment.Method,
          TextArrangement         : #TextOnly,
          ValueListWithFixedValues: true,
          ValueList               : {
            Label         : 'Payment Method',
            CollectionPath: 'Payment',
            Parameters    : [{
              $Type            : 'Common.ValueListParameterInOut',
              LocalDataProperty: PaymentMethod,
              ValueListProperty: 'code'
            }]
          }
        };
        _Payment      : Association to one Payment
                          on _Payment.code = PaymentMethod;
  };

  entity Payment {
    key code   : String(1) @(Common: {
          Label          : 'Payment Code',
          Text           : Method,
          TextArrangement: #TextFirst
        });
        Method : String    @(
          Core.Immutable: true,
          Common.Label  : 'Payment Method'
        );
  }

  entity TravelStatus : sap.common.CodeList {
    key code        : String(1) @Common.Text: descr;
        name        : String(255);
        descr       : String(1000);
        criticality : Int16     @odata.Type : 'Edm.Byte' enum {
          Neutral  = 0;
          Negative = 1;
          Critical = 2;
          Positive = 3;
          NewItem  = 5
        };
  };

  entity BookingStatus : sap.common.CodeList {
    key code : BookingStatusCode
  };

  entity TravelAgency : MasterData {
    key AgencyID       : String(6);

        @Common.Label: 'Agency Name'
        Name           : String(80);
        Street         : String(60);
        PostalCode     : String(10);

        @Common.Label: 'City'
        City           : String(40);

        @Common.Label: 'Country Code'
        CountryCode    : Country;
        PhoneNumber    : String(30);
        EMailAddress   : String(256);
        WebAddress     : String(256);
        Rating         : Integer;
        Recommendation : Integer;
  };

  type TravelStatusCode  : String(1) enum {
    Open     = 'O';
    Accepted = 'A';
    Canceled = 'X';
  };

  type BookingStatusCode : String(1) enum {
    New      = 'N';
    Booked   = 'B';
    Canceled = 'X';
  };

  annotate Travel {
    TravelStatus @Common.ValueListWithFixedValues
  }

  annotate Travel with @UI.LineItem: [
    {Value: TravelID},
    {Value: BeginDate},
    {Value: EndDate},
    {Value: to_Agency_AgencyID},
    {
      Value             : TravelStatus_code,
      Criticality       : TravelStatus.criticality,
      @UI.Importance    : #High,
      @HTML5.CssDefaults: {width: '10em'}
    },
    {Value: BookingFee},
    {Value: TotalPrice}
  ];

  annotate Travel with @(UI: {SelectionFields: [
    TravelID,
    to_Agency_AgencyID,
    TravelStatus_code,
    BeginDate,
    EndDate
  ]});

  annotate Travel with @Capabilities.FilterRestrictions.FilterExpressionRestrictions: [
    {
      Property          : 'BeginDate',
      AllowedExpressions: 'SingleRange'
    },
    {
      Property          : 'EndDate',
      AllowedExpressions: 'SingleRange'
    }
  ];

  annotate Travel with @(UI: {
    FieldGroup #TravelData  : {Data: [
      {Value: TravelID},
      {Value: to_Agency_AgencyID},
      {Value: BeginDate},
      {Value: EndDate}
    ]},
    FieldGroup #ApprovalData: {Data: [
      {
        $Type      : 'UI.DataField',
        Value      : TravelStatus_code,
        Criticality: TravelStatus.criticality,
        Label      : 'Status'
      },
      {Value: BookingFee},
      {Value: TotalPrice},
      {Value: CurrencyCode_code}
    ]},
    FieldGroup #HeaderMain  : {Data: [
      {Value: BeginDate},
      {Value: EndDate},
      {Value: TotalPrice}
    ]},
    Facets                  : [
      {
        $Type : 'UI.ReferenceFacet',
        ID    : 'TravelData',
        Label : 'Travel Information',
        Target: '@UI.FieldGroup#TravelData',
      },
      {
        $Type : 'UI.ReferenceFacet',
        ID    : 'ApprovalData',
        Label : 'Approval Data',
        Target: '@UI.FieldGroup#ApprovalData'
      },
      {
        $Type : 'UI.ReferenceFacet',
        ID    : 'BookingList',
        Label : 'Bookings',
        Target: 'to_Booking/@UI.LineItem'
      }
    ],
    HeaderFacets            : [{
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#HeaderMain'
    }],
    HeaderInfo              : {
      TypeName      : 'Travel',
      TypeNamePlural: 'Travels',
      Title         : {
        $Type: 'UI.DataField',
        Value: Description
      },
      Description   : {
        $Type: 'UI.DataField',
        Value: TravelID
      },
      TypeImageUrl  : 'sap-icon://header',
    }
  });

  annotate Travel {
    to_Agency @Common.ValueList: {
      CollectionPath: 'TravelAgency',
      Label         : '',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: to_Agency_AgencyID,
          ValueListProperty: 'AgencyID'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'Name'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'Street'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'PostalCode'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'City'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'CountryCode_code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'PhoneNumber'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'EMailAddress'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'WebAddress'
        }
      ]
    };
  };

  annotate TravelAgency with @(UI: {
    DataPoint #Recommendation: {
      Value        : Recommendation,
      TargetValue  : 100.0,
      Title        : 'Recommendation',
      Visualization: #Progress
    },
    DataPoint #Rating        : {
      Value        : Rating,
      TargetValue  : 5.0,
      Title        : 'Rating',
      Visualization: #Rating
    },
    FieldGroup #Contact      : {Data: [{
      $Type : 'UI.DataFieldForAnnotation',
      Target: '@Communication.Contact',
      Label : 'Travel Agency'
    }]}
  });

  annotate TravelAgency with @(
    Communication.Contact : {
      email: [{
        type   : #work,
        address: EMailAddress
      }],
      fn   : Name,
      adr  : [{
        type    : #work,
        code    : PostalCode,
        country : CountryCode_code,
        locality: City
      }]
    },
    Common.IsNaturalPerson: false
  );

  annotate Booking with @(UI: {
    HeaderInfo: {
      TypeName      : 'Booking',
      TypeNamePlural: 'Bookings',
      TypeImageUrl  : 'sap-icon://alert',
      Title         : {
        $Type: 'UI.DataField',
        Value: BookingID
      }
    },
    Facets    : [{
      $Type : 'UI.ReferenceFacet',
      ID    : 'FacetIdentifier1',
      Target: '@UI.FieldGroup'
    }],
    LineItem  : [
      {Value: BookingID},
      {Value: BookingDate},
      {Value: ConnectionID},
      {Value: FlightDate},
      {Value: FlightPrice},
      {Value: CurrencyCode_code}
    ],
    FieldGroup: {Data: [
      {
        $Type: 'UI.DataField',
        Value: BookingID
      },
      {
        $Type: 'UI.DataField',
        Value: BookingDate
      },
      {
        $Type: 'UI.DataField',
        Value: FlightDate
      },
      {
        $Type: 'UI.DataField',
        Value: FlightPrice
      }
    ]}
  });

  annotate TravelAgency with @(UI: {FieldGroup #Link: {Data: [{
    $Type: 'UI.DataFieldWithUrl',
    Value: Name,
    Url  : WebAddress
  }]}});
}
