using {TravelService.Travel} from '../../../../service/service';

annotate TravelService.Travel {
  TravelID @Common.SemanticObject: 'TravelRequest';
}

annotate TravelService.Travel with @(UI: {
  FieldGroup #IntentBasedNavigation   : {Data: [{
    $Type         : 'UI.DataFieldWithIntentBasedNavigation',
    Label         : 'Approve Travel',
    SemanticObject: 'TravelRequest',
    Action        : 'approve',
    Value         : TravelID
  }]},

  FieldGroup #SemanticObjectNavigation: {Data: [{
    $Type: 'UI.DataField',
    Value: TravelID,
    Label: 'Travel Request'
  }]},
});
