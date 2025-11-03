using {TravelService.Booking} from '../../../../../service/service';

extend entity Booking with {
  Distance     : Integer @Measures.Unit: DistanceUnit;
  DistanceUnit : String(3)
};
