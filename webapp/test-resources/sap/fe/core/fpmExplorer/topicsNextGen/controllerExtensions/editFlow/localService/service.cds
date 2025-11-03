using {TravelService.Travel} from '../../../../service/service';

extend entity Travel with actions {
  action checkTravelPolicy(TotalPrice : Decimal(10, 2), BookingFee : Decimal(10, 2));
}
