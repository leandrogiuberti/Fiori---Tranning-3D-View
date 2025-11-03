using {TravelService.Travel} from '../../../../../service/service';

annotate Travel with @(UI: {
  PresentationVariant              : {Visualizations: ['@UI.LineItem']},
  SelectionPresentationVariant #All: {
    Text               : 'All',
    SelectionVariant   : {
      Text         : 'All',
      SelectOptions: [{PropertyName: TravelID}]
    },
    PresentationVariant: {
      SortOrder     : [{Property: Description}],
      Visualizations: ['@UI.LineItem']
    }
  }
});
