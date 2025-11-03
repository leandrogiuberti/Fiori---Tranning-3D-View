using {
  sap,
  managed,
  Currency,
  Country
} from '@sap/cds/common';

// using { TravelService.Booking as Booking, MasterData } from '../../../../../service/service';

// ensure all masterdata entities are available to clients
@cds.autoexpose  @readonly
aspect MasterData {}

aspect CodeList @(
  cds.autoexpose,
  cds.persistence.skip: 'if-unused'
) {
  name  : localized String(255)  @title: 'Name';
  descr : localized String(1000) @title: 'Description';
}


service AnalyticsService {
  //
  entity Airline : MasterData {
    key AirlineID     : String(3);
        Name          : String(40);
        CurrencyCode  : Currency;
        AirlinePicURL : String @UI: {IsImageURL: true};
  };

  //
  @readonly
  entity Booking {
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
        CurrencyCode  : Currency default 'USD'                   @mandatory;

        @Common.Label: 'Airline ID'
        airline       : String(3)                                @mandatory;

        @Common.Label: 'Airline Name'
        airlineName   : String(40)                               @mandatory;

        @Common.Label: 'Status'
        BookingStatus : Association to BookingStatus default 'N' @mandatory;

        @title       : 'Airline'
        to_Carrier    : Association to Airline                   @mandatory;

  // maybe later?
  // @Common.Label: 'Status'
  // BookingStatus : Association to BookingStatus default 'N' @mandatory;
  // to_Travel     : Association to Travel                    @mandatory;
  //
  };
  //

  /*
    @readonly
    entity Bookings as
      projection on Booking {

        BookingUUID,
        BookingID,
        BookingDate,
        ConnectionID,
        FlightDate,
        FlightPrice,
        CurrencyCode,
        @Common.Text: airlineName
        to_Carrier.AirlineID as airline,
        to_Carrier.Name      as airlineName,

      }
  */

  //
  // code lists
  //
  type BookingStatusCode : String(1) enum {
    New      = 'N';
    Booked   = 'B';
    Canceled = 'X';
  };

  entity BookingStatus : CodeList {
    key code : BookingStatusCode
  };


  //
  // annotations
  //
  annotate Booking with @(
    Aggregation.CustomAggregate #FlightPrice      : 'Edm.Decimal',
    Aggregation.CustomAggregate #CurrencyCode_code: 'Edm.String',
    Common.SemanticKey                            : [BookingUUID],
  ) {
    BookingUUID  @ID                 : 'ID';
    FlightPrice  @Aggregation.default: #SUM;
    CurrencyCode @Aggregation.default: #MAX;
  };

  annotate Booking with @Aggregation.ApplySupported: {
    Transformations       : [
      'aggregate',
      'topcount',
      'bottomcount',
      'identity',
      'concat',
      'groupby',
      'filter',
      'search'
    ],
    GroupableProperties   : [
      BookingID,
      ConnectionID,
      FlightDate,
      CurrencyCode_code
    ],
    AggregatableProperties: [
      {Property: FlightPrice},
      {Property: BookingUUID},
    ],
  };

  annotate Booking with @(
    Analytics.AggregatedProperty #countBookings: {
      Name                : 'countBookings',
      AggregationMethod   : 'countdistinct',
      AggregatableProperty: BookingUUID,
      @Common.Label       : '{i18n>Bookings}'
    },
    Analytics.AggregatedProperty #minPrice     : {
      Name                : 'minPrice',
      AggregationMethod   : 'min',
      AggregatableProperty: FlightPrice,
      @Common.Label       : '{i18n>MinPrice}'
    },
    Analytics.AggregatedProperty #maxPrice     : {
      Name                : 'maxPrice',
      AggregationMethod   : 'max',
      AggregatableProperty: FlightPrice,
      @Common.Label       : '{i18n>MaxPrice}'
    },
    Analytics.AggregatedProperty #avgPrice     : {
      Name                : 'avgPrice',
      AggregationMethod   : 'average',
      AggregatableProperty: FlightPrice,
      @Common.Label       : '{i18n>AvgPrice}'
    }
  );

  annotate Booking with @UI.LineItem: [
    {
      Value             : BookingID,
      Label             : '{i18n>Booking}',
      @UI.Importance    : #High,
      @HTML5.CssDefaults: {width: '8em'},
    },
    // {
    //   Value             : to_Carrier_AirlineID,
    //   @UI.Importance    : #High,
    //   @HTML5.CssDefaults: {width: '14em'},
    // },
    // {
    //   Value             : airlineName,
    //   @UI.Importance    : #High,
    //   @HTML5.CssDefaults: {width: '20em'},
    // },
    {
      Value             : ConnectionID,
      @UI.Importance    : #High,
      @HTML5.CssDefaults: {width: '8em'},
    },
    {
      Value         : FlightDate,
      @UI.Importance: #High,
    },
    {
      Value             : FlightPrice,
      @UI.Importance    : #High,
      @HTML5.CssDefaults: {width: '12em'},
    }
  ];

  annotate Booking with @UI.Chart: {
    Title              : '{i18n>Bookings}',
    ChartType          : #Bar,
    DynamicMeasures    : [
      '@Analytics.AggregatedProperty#minPrice',
      '@Analytics.AggregatedProperty#maxPrice',
      '@Analytics.AggregatedProperty#avgPrice'
    ],
    Dimensions         : [airline],
    MeasureAttributes  : [{
      DynamicMeasure: '@Analytics.AggregatedProperty#minPrice',
      Role          : #Axis1
    }],
    DimensionAttributes: [{
      Dimension: airline,
      Role     : #Category
    }],
  };

  annotate Booking with @UI.PresentationVariant: {
    GroupBy       : [ // default grouping in table
      airline,
      BookingStatus_code
    ],
    Total         : [ // default aggregation in table
    FlightPrice],
    Visualizations: [
      '@UI.Chart',
      '@UI.LineItem',
    ]
  };


  //
  // Visual Filters
  //
  annotate Booking with @(
    UI.PresentationVariant #pvAirline: {
      SortOrder     : [{
        Property  : airline,
        Descending: false
      }],
      Visualizations: ['@UI.Chart#chartAirline']
    },
    UI.Chart #chartAirline           : {
      Title              : 'Bookings over Airline',
      ChartType          : #Bar,
      DynamicMeasures    : ['@Analytics.AggregatedProperty#countBookings', ],
      Dimensions         : [airline],
      MeasureAttributes  : [{
        DynamicMeasure: '@Analytics.AggregatedProperty#countBookings',
        Role          : #Axis1,
      }],
      DimensionAttributes: [{
        Dimension: airline,
        Role     : #Category
      }],
    }
  ) {
    airline @Common.ValueList #vlAirline: {
      CollectionPath              : 'Booking',
      PresentationVariantQualifier: 'pvAirline',
      Parameters                  : [{
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: airline,
        ValueListProperty: 'airline'
      }]
    };
  };

  /*
    annotate Booking with @(
      UI.PresentationVariant #pvStatus : {
        Visualizations : ['@UI.Chart#chartStatus']
      },
      UI.Chart #chartStatus : {
        ChartType           : #Bar,
        DynamicMeasures : [
          '@Analytics.AggregatedProperty#countBookings',
        ],
        Dimensions          : [BookingStatus_code],
        MeasureAttributes   : [{
          DynamicMeasure : '@Analytics.AggregatedProperty#countBookings',
          Role      : #Axis1,
        }],
        DimensionAttributes : [{
          Dimension : BookingStatus_code,
          Role      : #Category
        }]
      }
    ) {
      BookingStatus @(
        Common.ValueList #vlStatus : {
          CollectionPath               : 'Booking',
          PresentationVariantQualifier : 'pvStatus',
          Parameters                   : [{
            $Type             : 'Common.ValueListParameterInOut',
            LocalDataProperty : BookingStatus_code,
            ValueListProperty : 'BookingStatus_code'
          }]
        },
        Common.ValueList : {
          CollectionPath : 'BookingStatus',
          Parameters : [{
            $Type : 'Common.ValueListParameterInOut',
            LocalDataProperty : BookingStatus_code,
            ValueListProperty : 'code',
          }]
        },
        //Common.ValueListWithFixedValues : true
      )
    };
  */
  annotate Booking with @(
    UI.PresentationVariant #pvFlightDate: {
      SortOrder     : [{
        Property  : FlightDate,
        Descending: true
      }],
      Visualizations: ['@UI.Chart#chartFlightDate']
    },
    UI.Chart #chartFlightDate           : {
      Title              : 'Bookings over FlightDate',
      ChartType          : #Line,
      DynamicMeasures    : ['@Analytics.AggregatedProperty#countBookings', ],
      Dimensions         : [FlightDate],
      MeasureAttributes  : [{
        DynamicMeasure: '@Analytics.AggregatedProperty#countBookings',
        Role          : #Axis1,
      }],
      DimensionAttributes: [{
        Dimension: FlightDate,
        Role     : #Category
      }]
    }
  ) {
    FlightDate @Common.ValueList #vlFlightDate: {
      CollectionPath              : 'Booking',
      PresentationVariantQualifier: 'pvFlightDate',
      Parameters                  : [{
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: FlightDate,
        ValueListProperty: 'FlightDate'
      }]
    };
  };

  // determines the order of visual filters
  annotate Booking with @UI.SelectionFields: [
    airline,
    FlightDate
  ];


  //
  // KPI
  //
  annotate Booking with @(
    UI.KPI #myKPI1: {
      DataPoint       : {
        Value                 : FlightPrice,
        Title                 : 'TOT',
        Description           : '{i18n>Total Price}',
        CriticalityCalculation: {
          ImprovementDirection   : #Maximize,
          AcceptanceRangeLowValue: 26000000,
          ToleranceRangeLowValue : 24000000,
          DeviationRangeLowValue : 22000000
        }
      },
      Detail          : {DefaultPresentationVariant: {Visualizations: ['@UI.Chart#kpi1'], }, },
      SelectionVariant: {SelectOptions: [{
        PropertyName: FlightPrice,
        Ranges      : [{
          Sign  : #E,
          Option: #EQ,
          Low   : 0,
        }, ],
      }], }
    },
    UI.Chart #kpi1: {
      ChartType          : #Line,
      Measures           : [FlightPrice],
      Dimensions         : [FlightDate],
      MeasureAttributes  : [{
        Measure: FlightPrice,
        Role   : #Axis1
      }],
      DimensionAttributes: [{
        Dimension: FlightDate,
        Role     : #Category
      }]
    },
  );


}
