using {TravelService.Travel} from '../../../../../service/service';

//As long as the SelectionVarinat is provided, Common.FilterDefaultValue is ignored for all other filters.
// The following will be used to set the default filter values ->

annotate Travel with @(UI: {SelectionVariant: {
  $Type        : 'UI.SelectionVariantType',
  SelectOptions: [
    {
      PropertyName: 'BeginDate',
      Ranges      : [{
        Sign  : #I,
        Option: #GE,
        Low   : '2025-01-01'
      }]
    },
    {
      PropertyName: 'TravelStatus_code',
      Ranges      : [{
        Sign  : #I,
        Option: #EQ,
        Low   : 'O'
      }]
    }
  ]
}});

//The following will be ignored ->

annotate Travel : BeginDate @Common.FilterDefaultValue: '2024-01-01';
annotate Travel : TravelStatus @Common.FilterDefaultValue: 'A';
