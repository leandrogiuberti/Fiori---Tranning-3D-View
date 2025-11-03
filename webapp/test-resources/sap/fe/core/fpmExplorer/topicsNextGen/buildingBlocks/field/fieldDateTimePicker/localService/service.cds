using {TravelService.Travel} from '../../../../../service/service';

extend entity Travel with {
  @Common.Label: 'Reminder'
  ReminderTime : DateTime;
};
