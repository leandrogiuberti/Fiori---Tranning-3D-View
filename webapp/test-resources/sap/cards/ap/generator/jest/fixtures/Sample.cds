namespace sap.cards.ap.test;

entity CashBankType {
    key BankCountry             : String  @Common.Label                       : 'BankCountry';
    key BankInternalID          : String  @Common.Label                       : 'BankInternalID';
    key IsActiveEntity          : Boolean @Common.Label                       : 'IsActiveEntity';
        property1               : String  @Measures.Unit                      : 'kg';
        property2               : String  @PersonalData.IsPotentiallySensitive: false  @Measures.ISOCurrency: 'INR';
        property3               : String  @PersonalData.IsPotentiallySensitive: true;
        navProperty             : Composition of many SomeEntity;
        RootPaymentTerms        : String;
        SAP__Messages           : String;
        referencedTestEntities  : Association to RootElement;
        _RootPaymentTerms       : Composition of one RootPaymentTerms;
        DraftAdministrativeData : Association to RootPaymentTerms;
        SiblingEntity           : Association to RootElement;
}

entity SomeEntity {
    key ID        : String;
        property1 : String;
}

entity RootElement {
    key ID : String;
}

entity RootPaymentTerms {
    key RootPaymentTerms : String;
}

service JestService {
    entity CashBank as projection on CashBankType;
}
