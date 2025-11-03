using {TravelService.Travel} from '../../../../../service/service';

annotate Travel with @(UI: {SelectionFields #SF1: [
  TravelID,
  TravelStatus_code,
]});


annotate Travel with @UI.LineItem #LI1: [
  {Value: TravelID},
  {Value: TotalPrice},
  {Value: to_Agency_AgencyID},
  {
    Value             : TravelStatus_code,
    Criticality       : TravelStatus.criticality,
    @UI.Importance    : #High,
    @HTML5.CssDefaults: {width: '10em'}
  }
];
