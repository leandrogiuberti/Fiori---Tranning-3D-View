using {TravelService.Travel} from '../../../../service/service';

// Add UI.Facet annotation to include Travel Information
annotate Travel with @(UI: {Facets: [{
  $Type : 'UI.ReferenceFacet',
  ID    : 'TravelInformation',
  Label : 'Travel Information',
  Target: '@UI.FieldGroup#TravelData'
}]});
