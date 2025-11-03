using {TravelService.Travel} from '../../../../../service/service';

annotate Travel with @UI: {
  LineItem                              : [
    {Value: TravelID},
    {Value: BeginDate},
    {Value: EndDate},
    {Value: to_Agency_AgencyID},
    {Value: BookingFee},
    {Value: TotalPrice}
  ],
  PresentationVariant                   : {
    $Type         : 'UI.PresentationVariantType',
    Visualizations: ['@UI.LineItem']
  },
  SelectionVariant #Approved            : {
    $Type        : 'UI.SelectionVariantType',
    Text         : 'Approved',
    SelectOptions: [{
      $Type       : 'UI.SelectOptionType',
      PropertyName: 'TravelStatus_code',
      Ranges      : [{
        $Type : 'UI.SelectionRangeType',
        Sign  : #I,
        Option: #EQ,
        Low   : 'A'
      }]
    }]
  },
  SelectionPresentationVariant #Approved: {
    $Type              : 'UI.SelectionPresentationVariantType',
    SelectionVariant   : ![@UI.SelectionVariant#Approved],
    PresentationVariant: ![@UI.PresentationVariant],
    Text               : 'Approved',
  },
  SelectionPresentationVariant #All     : {
    $Type              : 'UI.SelectionPresentationVariantType',
    SelectionVariant   : {
      $Type: 'UI.SelectionVariantType',
      Text : 'All'
    },
    PresentationVariant: ![@UI.PresentationVariant],
    Text               : 'All'
  }
};
