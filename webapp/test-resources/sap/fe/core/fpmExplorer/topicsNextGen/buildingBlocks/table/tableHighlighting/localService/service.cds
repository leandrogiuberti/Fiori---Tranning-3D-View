using {TravelService.Travel} from '../../../../../service/service';

annotate Travel with @UI.LineItem: {
  ![@UI.Criticality]: TravelStatus.criticality,
  $value            : [
    {Value: TravelID},
    {Value: BeginDate},
    {Value: EndDate},
    {Value: to_Agency_AgencyID},
    {Value: BookingFee},
    {Value: TotalPrice}
  ]
};
