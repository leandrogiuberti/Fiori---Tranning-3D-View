using {TravelService} from '../../../../../service/service';

extend service TravelService with {
  entity AgencyName {
        @Common.Label: 'ID'
    key AgencyID : String;
        Name     : String;
  };
}

extend entity TravelService.Booking with {
  Name : String;
};

annotate TravelService.Booking with {
  Name @(Common: {
    Label    : 'Agencies',
    ValueList: {
      Label         : 'Travel Agency',
      CollectionPath: 'AgencyName',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'AgencyID'
        },
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: Name,
          ValueListProperty: 'Name'
        }
      ]
    }
  });
};

annotate TravelService.Booking with @UI: {FieldGroup #Default: {Data: [{
  $Type: 'UI.DataField',
  Value: Name
}]}};

annotate TravelService.Travel with @UI.LineItem: [
  {Value: TravelID, },
  {
    $Type: 'UI.DataField',
    Label: 'Agencies (MVF)',
    Value: to_Booking.Name
  }
];
