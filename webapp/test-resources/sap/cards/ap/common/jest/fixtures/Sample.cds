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

entity ProductType {
    key MasterDataChangeProcess             : String  @Common.Label                       : 'MasterDataChangeProcess';
    key MDChgProcessSrceSystem          : String  @Common.Label                       : 'MDChgProcessSrceSystem';
    key MDChgProcessSrceObject          : String @Common.Label                       : 'MDChgProcessSrceObject';
    key DraftUUID          : UUID;
    key IsActiveEntity          : Boolean @Common.Label                       : 'IsActiveEntity';
}

entity SalesOrderManageType {
    key SalesOrder             : String  @Common.Label                       : 'SalesOrder';
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

entity ProcessType {
    key ProcessUUID: String @Common.Label                       : 'ProcessUUID';
    MasterDataChangeProcess: String;
}

service JestService {
    entity CashBank as projection on CashBankType;
    entity Product as projection on ProductType;
    entity SalesOrderManage as projection on SalesOrderManageType;
    entity Process as projection on ProcessType;
}

annotate JestService.CashBank with @(
  Common.SemanticKey: [BankCountry]
);

annotate JestService.Product with @(
  Common.SemanticKey: [MasterDataChangeProcess, MDChgProcessSrceSystem, MDChgProcessSrceObject]
);

annotate JestService.SalesOrderManage with @(
  Common.SemanticKey: [SalesOrder]
);

annotate JestService.Process with @(
  Common.SemanticKey: [MasterDataChangeProcess]
);