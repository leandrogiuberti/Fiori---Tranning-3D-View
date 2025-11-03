using {TravelService.Travel} from '../../../../../service/service';

extend entity Travel with {
  NumberProperty               : Decimal(6, 2)  @title: 'Number';
  Currency                     : String         @title: 'Currency';
  BooleanProperty              : Boolean        @title: 'Boolean';
  Progress                     : Decimal(4, 1)  @title: 'Progress';
  IntProperty                  : Integer        @title: 'Number';
  StringProperty               : String         @title: 'Value';
  TextProperty                 : String         @title: 'Text';
  TransactionCurrency          : String(5);
  CustomerCreditForecast       : Decimal(23, 2) @title: 'Forecast';
  CustomerCreditExposureAmount : Decimal(23, 2) @title: 'Exposure Amount';
  CustomerCreditLimitAmount    : Decimal(23, 2) @title: 'Limit Amount';
  Criticality                  : Integer;
};

annotate Travel with @(UI: {
  Chart #MicroChart                      : {
    $Type            : 'UI.ChartDefinitionType',
    Title            : 'Credit Limit Bullet',
    Description      : 'Bullet MicroChart',
    ChartType        : #Bullet,
    Measures         : [CustomerCreditExposureAmount],
    MeasureAttributes: [{
      $Type    : 'UI.ChartMeasureAttributeType',
      Measure  : CustomerCreditExposureAmount,
      Role     : #Axis1,
      DataPoint: '@UI.DataPoint#CustomerCreditExposureAmount'
    }]
  },
  DataPoint #CustomerCreditExposureAmount: {
    Title        : 'Exposure Amount',
    Value        : CustomerCreditExposureAmount,
    Description  : 'Bullet Micro Chart',
    TargetValue  : CustomerCreditLimitAmount,
    ForecastValue: CustomerCreditForecast,
    MaximumValue : 7000,
    MinimumValue : 200,
    Criticality  : Criticality,
  },
  Facets                                 : [{
    $Type : 'UI.ReferenceFacet',
    ID    : 'TravelData',
    Label : 'Travel Information',
    Target: '@UI.FieldGroup#TravelData',
  }]
});
