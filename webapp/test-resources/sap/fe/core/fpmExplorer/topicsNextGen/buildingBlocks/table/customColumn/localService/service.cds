using {TravelService.Travel} from '../../../../../service/service';

extend entity Travel with {
  ApprovalStatus     : String;
  PaymentStatus      : String;
  ConfirmationStatus : String;
};

annotate Travel with @UI.LineItem: [
  {Value: TravelID},
  {Value: BeginDate},
  {Value: EndDate},
  {Value: to_Agency_AgencyID},
  {Value: BookingFee},
  {Value: TotalPrice}
];
