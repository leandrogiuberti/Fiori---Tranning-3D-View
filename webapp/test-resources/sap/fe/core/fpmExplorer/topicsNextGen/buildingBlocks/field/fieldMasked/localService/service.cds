using {TravelService.Booking} from '../../../../../service/service';

extend entity Booking with {
  CreditCardNumber : String @Common: {Masked: true};
};
