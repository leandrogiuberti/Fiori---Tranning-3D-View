using {TravelService.Travel} from '../../../../../service/service';

extend entity Travel with {
  FlightRoute : String(1024);
  CityFrom    : String;
  CityTo      : String;
};
