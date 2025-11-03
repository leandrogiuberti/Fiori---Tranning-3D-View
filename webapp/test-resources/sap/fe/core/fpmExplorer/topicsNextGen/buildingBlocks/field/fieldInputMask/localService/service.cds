using {TravelService.Booking} from '../../../../../service/service';

extend entity Booking with {
  DiscountCode : String @(UI.InputMask: {
    Mask             : 'C ***-***-***',
    PlaceholderSymbol: '_',
  });
};
