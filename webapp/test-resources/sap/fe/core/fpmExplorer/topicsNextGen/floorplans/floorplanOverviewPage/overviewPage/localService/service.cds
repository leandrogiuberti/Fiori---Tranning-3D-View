using {
  sap,
  managed,
  Currency,
  Country
} from '@sap/cds/common';

// ensure all masterdata entities are available to clients
@cds.autoexpose  @readonly
aspect MasterData {}

service TravelService {
  // @odata.draft.enabled

  entity Travel : managed {
    key TravelUUID   : UUID;

        @Common.Label          : 'ID'
        TravelID     : Integer default 0                       @readonly;

        @Common.Label          : 'Begin Date'
        BeginDate    : Date                                    @mandatory;

        @Common.Label          : 'End Date'
        EndDate      : Date                                    @mandatory;

        @Common.Label          : 'Booking Fee'
        BookingFee   : Decimal(10, 2) default 0;

        @Common.Label          : 'Total Price'
        TotalPrice   : Decimal(10, 2)                          @readonly;

        @Common.Label          : 'Currency'
        CurrencyCode : Currency default 'EUR'                  @mandatory;

        @Common.Label          : 'Description'
        Description  : String(1024)                            @mandatory;

        @Common.Label          : 'Status'
        TravelStatus : Association to TravelStatus default 'O' @readonly;

        @title                 : 'Agency'
        @Common.Text           : to_Agency.Name
        @Common.TextArrangement: #TextFirst
        to_Agency    : Association to TravelAgency             @mandatory;

        to_Booking   : Composition of many Booking
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
        FlightPrice   : Decimal(10, 2)                           @mandatory;

        @Common.Label: 'Currency'
        CurrencyCode  : Currency default 'EUR'                   @mandatory;

        @Common.Label: 'Status'
        BookingStatus : Association to BookingStatus default 'N' @mandatory;
        to_Travel     : Association to Travel                    @mandatory;
  };

  entity TravelStatus : sap.common.CodeList {
    key code                    : TravelStatusCode;
        // can't use UInt8 (which would automatically be mapped to Edm.Byte) because it's not supported on H2
        fieldControl            : Int16 @odata.Type: 'Edm.Byte' enum {
          Inapplicable = 0;
          ReadOnly     = 1;
          Optional     = 3;
          Mandatory    = 7;
        };
        createDeleteHidden      : Boolean;
        insertDeleteRestriction : Boolean; // = NOT createDeleteHidden
  };

  entity BookingStatus : sap.common.CodeList {
    key code : BookingStatusCode
  };

  entity TravelAgency : MasterData {
    key AgencyID     : String(6);

        @Common.Label: 'Agency Name'
        Name         : String(80);
        Street       : String(60);
        PostalCode   : String(10);
        City         : String(40);
        CountryCode  : Country;
        PhoneNumber  : String(30);
        EMailAddress : String(256);
        WebAddress   : String(256);
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

  annotate Travel with @UI.LineItem: [
    {Value: TravelID},
    {Value: BeginDate},
    {Value: EndDate},
    {Value: BookingFee},
    {Value: TotalPrice},
    {Value: CurrencyCode_code},
    {Value: Description},
    {Value: to_Agency_AgencyID}
  //{Value: TravelStatus_code}
  ];

  annotate Travel with @(UI: {SelectionFields: [
    TravelID,
    to_Agency_AgencyID,
    BeginDate,
    EndDate,
    Description
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
      {Value: Description},
      {Value: to_Agency_AgencyID},
      {Value: BeginDate},
      {Value: EndDate}
    ]},
    FieldGroup #ApprovalData: {Data: [
      {Value: BookingFee},
      {Value: TotalPrice},
      {Value: CurrencyCode_code},
      {Value: Description},
    //{Value: TravelStatus_code}
    ]},
    FieldGroup #HeaderMain  : {Data: [
      {
        $Type: 'UI.DataField',
        Value: TravelID
      },
      {
        $Type: 'UI.DataField',
        Value: Description
      }
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
        Value: TravelID
      },
      Description   : {
        $Type: 'UI.DataField',
        Value: Description
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

}
