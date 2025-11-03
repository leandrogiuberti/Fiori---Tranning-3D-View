using {TravelService.Travel} from '../../../../../service/service';

extend entity Travel with {
  Icon     : String @(UI: {IsImageURL: true});
  ImageUrl : String @(UI: {IsImageURL: true});
};
