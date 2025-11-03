using {TravelService.TravelAgency} from '../../../../../service/service';

annotate TravelAgency with @(UI: {
  QuickViewFacets             : [{
    $Type : 'UI.ReferenceFacet',
    Label : 'Travel Agency',
    Target: '@UI.FieldGroup#QuickViewContent'
  }],
  FieldGroup #QuickViewContent: {Data: [
    {Value: Name},
    {Value: City},
    {Value: CountryCode_code}
  ]}
});
