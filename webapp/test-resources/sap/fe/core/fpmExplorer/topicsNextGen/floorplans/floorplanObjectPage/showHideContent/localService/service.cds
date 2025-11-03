using {TravelService.Travel} from '../../../../../service/service';

annotate Travel with @(UI: {
  Facets                : [
    {
      $Type : 'UI.ReferenceFacet',
      ID    : 'TravelData',
      Label : 'Travel Information',
      Target: '@UI.FieldGroup#TravelData'
    },
    {
      $Type               : 'UI.ReferenceFacet',
      ID                  : 'BookingList',
      Label               : 'Bookings',
      Target              : 'to_Booking/@UI.LineItem',
      ![@UI.PartOfPreview]: false
    }
  ],

  FieldGroup #TravelData: {Data: [
    {Value: TravelID},
    {Value: to_Agency_AgencyID},
    {
      Value               : BeginDate,
      ![@UI.PartOfPreview]: false
    },
    {
      Value               : EndDate,
      ![@UI.PartOfPreview]: false
    }
  ]}
});
