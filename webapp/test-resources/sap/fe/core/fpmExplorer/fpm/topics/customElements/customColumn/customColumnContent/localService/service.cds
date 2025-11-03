using {TravelService.Booking} from '../../../../../service/service';

extend entity Booking with {
  ApprovalStatus     : String;
  PaymentStatus      : String;
  ConfirmationStatus : String;
};
