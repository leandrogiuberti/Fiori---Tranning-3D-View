/*global QUnit, sinon */
sap.ui.define([
	'sap/base/i18n/Localization',
	'sap/ui/core/Element',
	'sap/ui/model/Context',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/model/odata/v4/ODataListBinding',
	'sap/ui/model/odata/v4/ODataModel',
	'sap/ui/export/library',
	'sap/ui/export/ExportBase',
	'sap/ui/export/PortableDocument',
	'sap/ui/export/ExportUtils',
	'sap/ui/export/ExportDialog',
	'sap/ui/export/util/PDFCapabilities',
	'sap/ui/thirdparty/sinon-qunit' /* Sinon itself is already part of MockServer */
], function (Localization, Element, Context, ODataModelV2, ODataListBinding, ODataModel, exportLibrary, ExportBase, PortableDocument, ExportUtils, ExportDialog, PDFCapabilities, SinonQUnit) {
	'use strict';

	const EdmType = exportLibrary.EdmType;

	let oPortableDocument;

	const mValidDataSource = {
		dataUrl: 'someString',
		serviceUrl: 'anotherString',
		version: 2
	};

	const oFakeBinding = {
		isA: () => { return true; }
	};

	const mSettings = {
		dataSource: {},
		workbook: {}
	};

	const mPDFCapabilities = {
		DocumentDescriptionCollection: 'MyCustomCollection',
		ResultSizeMaximum: 20000
	};

	const mCloudFileInfo = {
		FileShare: 'ZPERSONAL8',
		FileShareItemName: 'QUnit_Export.pdf',
		ParentFileShareItem: '0ACGgV1bbQGeXUk9PVA'
	};

	const mModuleConfig = {
		beforeEach: () => {
			sinon.stub(ExportUtils, 'saveAsFile');
			sinon.stub(ExportUtils, 'announceExportStatus');
			sinon.stub(ExportDialog, 'showErrorMessage');
			sinon.stub(ExportDialog, 'showWarningDialog').returns(Promise.resolve());
			oPortableDocument = new PortableDocument(mSettings, mPDFCapabilities, mCloudFileInfo);
		},
		afterEach: () => {
			oPortableDocument = null;
			ExportUtils.saveAsFile.restore();
			ExportUtils.announceExportStatus.restore();
			ExportDialog.showErrorMessage.restore();
			ExportDialog.showWarningDialog.restore();
		}
	};

	QUnit.module('API', mModuleConfig);

	QUnit.test('constructor', function(assert) {
		assert.ok(oPortableDocument instanceof PortableDocument, 'Constructor is present and working');
		assert.ok(oPortableDocument instanceof ExportBase, 'PortableDocument is inheriting ExportBase');
		assert.ok(oPortableDocument._mCapabilities.isA('sap.ui.export.util.PDFCapabilities'), 'Capabilities object has been converted to PDFCapabilities automatically');
		assert.ok(oPortableDocument._mCloudFileInfo, 'CloudFileInfo is set');

		oPortableDocument = new PortableDocument(mSettings, mPDFCapabilities, { foo: 'bar' });
		assert.notOk(oPortableDocument._mCloudFileInfo, 'CloudFileInfo is not set');
	});

	QUnit.test('function processDataSource', function(assert) {
		sinon.stub(oPortableDocument, 'createDataSourceFromBinding').returns(mValidDataSource);

		assert.equal(typeof oPortableDocument.processDataSource, 'function','Function processDataSource exists');
		assert.equal(oPortableDocument.processDataSource(), null, 'Returns null in case the dataSource configuration is not supported');
		assert.equal(oPortableDocument.processDataSource(mValidDataSource), mValidDataSource, 'Valid dataSource remains untouched');

		assert.ok(oPortableDocument.createDataSourceFromBinding.notCalled, 'Function createDataSourceFromBinding was not called');
		assert.equal(oPortableDocument.processDataSource(oFakeBinding), mValidDataSource, 'The expected dataSource was returned');
		assert.ok(oPortableDocument.createDataSourceFromBinding.calledOnce, 'Function createDataSourceFromBinding was called');
	});

	QUnit.test('function createDataSourceFromBinding', function(assert) {
		const oModel = {
			getHeaders: sinon.stub().returns({}), // OData V2
			getHttpHeaders: sinon.stub().returns({}), // OData V4
			sServiceUrl: '/sap/opu/odata/sap/MM_PUR_PO_MAINT_V2_SRV',
			isA: sinon.stub()
		};
		const oBinding = {
			getDownloadUrl: sinon.stub().withArgs('pdf').returns('/sap/opu/odata/sap/MM_PUR_PO_MAINT_V2_SRV/C_PurchaseOrderTP?sap-client=715&$format=pdf&$orderby=DraftUUID%20desc,PurchaseOrder%20desc&$filter=IsActiveEntity%20eq%20false%20or%20SiblingEntity/IsActiveEntity%20eq%20null&$select=PurchaseOrder%2cPurchaseOrderTypeName%2cIsAdvancedPurchaseOrder%2cSupplier%2cSupplierName%2cNumberOfOverduePurOrdItm%2cCompanyCode%2cCompanyCode_Text%2cPurchaseOrderStatus%2cPurchaseOrderStatusName%2cApprovalStatusName%2cApprovalStatus%2cApproverName%2cPurchaseOrderNumberOfApprovers%2cPurchaseOrderDate%2cPurchaseOrderNetAmount%2cDocumentCurrency%2cDraftUUID%2cIsActiveEntity%2cHasDraftEntity%2cHasActiveEntity%2cCancel_approval_ac%2cCopy_po_ac%2cDelete_mc%2cUpdate_mc%2cDraftAdministrativeData&$expand=DraftAdministrativeData'),
			getModel: sinon.stub().returns(oModel),
			isA: sinon.stub()
		};

		oModel.isA.withArgs('sap.ui.model.odata.v4.ODataModel').returns(true);
		oModel.isA.returns(false);
		oBinding.isA.withArgs(['sap.ui.model.ListBinding', 'sap.ui.model.TreeBinding']).returns(true);
		oBinding.isA.returns(false);

		assert.ok(oBinding.getDownloadUrl('pdf').includes('$format=pdf'), 'DataUrl from binding contains $format=pdf');

		const oDataSource = oPortableDocument.createDataSourceFromBinding(oBinding);
		assert.ok(oDataSource, 'DataSource is defined');
		assert.equal(oDataSource.type, 'odata', 'DataSource type is odata');
		assert.ok(oDataSource.version === 2 || oDataSource.version === 4, 'OData versions is as expected');
		assert.equal(typeof oDataSource.dataUrl, 'string', 'DataUrl is of type string');
		assert.notOk(oDataSource.dataUrl.includes('$format=pdf'), 'string', 'Processed dataUrl should not include $format anymore');
		assert.equal(typeof oDataSource.commonServiceUrl, 'string', 'ServiceUrl is of type string');
		assert.ok(oDataSource.commonServiceUrl.endsWith('/default/iwbep/common/0001/'), 'ServiceUrl has the expected ending');
		assert.equal(typeof oDataSource.serviceUrl, 'string', 'ServiceUrl is of type string');
		assert.equal(typeof oDataSource.useBatch, 'boolean', 'useBatch is of type boolean');
	});

	QUnit.test('function setDefaultExportSettings', function(assert) {
		const oSettings = JSON.parse(JSON.stringify(mSettings)); // Copy

		assert.expect(3);
		assert.notOk(oSettings.workbook.context, 'No Context assigned yet');

		return oPortableDocument.setDefaultExportSettings(oSettings).then(() => {
			assert.ok(oSettings.workbook.context, 'Context assigned');
			assert.ok(oSettings.workbook.context.title, 'Default title assigned');
		});
	});

	QUnit.test('function setDefaultExportSettings with empty string title', function(assert) {
		const oSettings = JSON.parse(JSON.stringify(mSettings)); // Copy
		oSettings.workbook.context = { title: '' };

		assert.expect(2);
		assert.notOk(oSettings.workbook.context.title, 'Empty title');

		return oPortableDocument.setDefaultExportSettings(oSettings).then(() => {
			assert.ok(oSettings.workbook.context.title, 'Default title assigned');
		});
	});

	QUnit.test('function createBuildPromise', async function(assert) {
		assert.expect(8);

		sinon.stub(oPortableDocument, '_createDocumentDescription');
		sinon.stub(oPortableDocument, 'postDocumentDescription').returns(Promise.resolve());
		sinon.stub(oPortableDocument, 'sendRequest').returns(Promise.resolve());

		assert.ok(oPortableDocument._createDocumentDescription.notCalled, 'DocumentDescription not created yet');
		assert.ok(oPortableDocument.postDocumentDescription.notCalled, 'DocumentDescription not sent yet');
		assert.ok(oPortableDocument.sendRequest.notCalled, 'Export request not sent yet');

		try {
			await oPortableDocument.createBuildPromise(mSettings);
			assert.ok(oPortableDocument._createDocumentDescription.calledOnce, 'DocumentDescription created');
			assert.ok(oPortableDocument.postDocumentDescription.calledOnce, 'DocumentDescription sent');
			assert.ok(oPortableDocument.sendRequest.calledOnce, 'Export request sent');
			assert.ok(ExportUtils.saveAsFile.calledOnce, 'File has been saved');
			assert.ok(ExportUtils.announceExportStatus.calledOnce, 'Export Status was announced');
		} catch (oError) {
			assert.ok(false, `Error ${oError.message} must not happen`);
		} finally {
			oPortableDocument._createDocumentDescription.restore();
			oPortableDocument.postDocumentDescription.restore();
			oPortableDocument.sendRequest.restore();

			/* Ensure that the BusyDialog is destroyed to avoid a duplicate id when running other tests */
			const oDialog = Element.getElementById('PDFExportBusyDialog');
			oDialog?.destroy();
		}
	});

	QUnit.test('function createBuildPromise (cancelled)', async function(assert) {
		let oDialog;

		assert.expect(7);

		sinon.stub(oPortableDocument, '_createDocumentDescription');
		sinon.stub(oPortableDocument, 'postDocumentDescription').callsFake(() => {
			return new Promise((fnResolve) => {
				oDialog = Element.getElementById('PDFExportBusyDialog');

				assert.ok(oDialog, 'BusyDialog exists before DocumentDescription has been saved');
				fnResolve(/* sDocumentDescriptionId */ '42010aee-0122-1eed-aded-1b0fe7766b3c');
			});
		});
		sinon.stub(oPortableDocument, 'sendRequest').callsFake(() => {
			return new Promise((fnResolve, fnReject) => {
				oPortableDocument.cancel = () => {
					/* Simulate user cancelation */
					fnReject(null);
				};

				assert.ok(oDialog, 'BusyDialog still present');
				oDialog.close(/*bIsClosedFromUserInteraction*/ true);
			});
		});

		try {
			await oPortableDocument.createBuildPromise(mSettings);
			assert.ok(true, 'Promise resolved');
			assert.ok(oPortableDocument._createDocumentDescription.calledOnce, 'DocumentDescription created');
			assert.ok(oPortableDocument.postDocumentDescription.calledOnce, 'DocumentDescription sent');
			assert.ok(oPortableDocument.sendRequest.calledOnce, 'Export request sent');
			assert.ok(ExportUtils.saveAsFile.notCalled, 'File has not been saved');
		} catch (oError) {
			assert.ok(false, `Error ${oError.message} must not happen`);
		} finally {
			oPortableDocument._createDocumentDescription.restore();
			oPortableDocument.postDocumentDescription.restore();
			oPortableDocument.sendRequest.restore();
		}
	});

	QUnit.test('function sendRequest', async function(assert) {
		const sDocumentDescriptionId = '42010aee-0122-1eed-aded-1b0fe7766b3c';
		const oDataSource = {
			dataUrl: 'https://fake.host.com:8080/sap/opu/odata4/Orders?sap-client=120&$select=ID,CompanyCode,OrderType,CreatedAt,CreatedBy&$top=20000',
			serviceUrl: 'https://fake.host.com:8080/sap/opu/odata4/',
			useBatch: false
		};

		oPortableDocument._request = new AbortController();

		sinon.spy(PortableDocument, 'createGetRequest');
		sinon.spy(PortableDocument, 'createBatchRequest');
		sinon.stub(PortableDocument, 'getBatchResponse').callsFake((oResponse) => oResponse);
		sinon.stub(oPortableDocument, '_applyResultSize').returns(oDataSource.dataUrl);
		sinon.stub(window, 'fetch').resolves({
			ok: true,
			status: 200,
			redirected: false,
			blob: sinon.stub().resolves()
		});

		/* GET request */
		try {
			await oPortableDocument.sendRequest(oDataSource, sDocumentDescriptionId);
			assert.ok(true, 'Promise resolved');
			assert.ok(globalThis.fetch.calledOnce, 'fetch API has been called');
			assert.ok(oPortableDocument._applyResultSize.calledOnce, 'PortableDocument#_applyResultSize has been called');
			assert.ok(PortableDocument.createGetRequest.calledOnce, 'PortableDocument#createGetRequest has been called');
			assert.ok(PortableDocument.createBatchRequest.notCalled, 'PortableDocument#createBatchRequest has not been called');
		} catch (oError) {
			assert.ok(false, `Error ${oError.message} must not happen`);
		} finally {
			PortableDocument.createGetRequest.resetHistory();
			PortableDocument.createBatchRequest.resetHistory();
			oPortableDocument._applyResultSize.resetHistory();
			globalThis.fetch.resetHistory();
		}

		/* $batch request */
		oDataSource.useBatch = true;

		try {
			await oPortableDocument.sendRequest(oDataSource, sDocumentDescriptionId);
			assert.ok(true, 'Promise resolved');
			assert.ok(window.fetch.calledOnce, 'fetch API has been called');
			assert.ok(oPortableDocument._applyResultSize.calledOnce, 'PortableDocument#_applyResultSize has been called');
			assert.ok(PortableDocument.createGetRequest.notCalled, 'PortableDocument#createGetRequest has not been called');
			assert.ok(PortableDocument.createBatchRequest.calledOnce, 'PortableDocument#createBatchRequest has been called');
		} catch (oError) {
			assert.ok(false, `Error ${oError.message} must not happen`);
		}

		globalThis.fetch.restore();
		PortableDocument.createGetRequest.restore();
		PortableDocument.createBatchRequest.restore();
		PortableDocument.getBatchResponse.restore();
		oPortableDocument._applyResultSize.restore();
	});

	QUnit.test('function sendRequest - redirect', async function(assert) {
		const sDocumentDescriptionId = '42010aee-0122-1eed-aded-1b0fe7766b3c';
		const oDataSource = {
			dataUrl: 'https://fake.host.com:8080/sap/opu/odata4/Orders?sap-client=120&$select=ID,CompanyCode,OrderType,CreatedAt,CreatedBy&$top=20000',
			serviceUrl: 'https://fake.host.com:8080/sap/opu/odata4/',
			useBatch: true
		};

		oPortableDocument._request = new AbortController();

		sinon.stub(window, 'open');
		sinon.spy(PortableDocument, 'createBatchRequest');
		sinon.stub(oPortableDocument, '_applyResultSize').returns(oDataSource.dataUrl);
		sinon.stub(window, 'fetch')
			.resolves(new Response('--FA567EB6CAD5766029DA52DB090377900\r\nContent-Type: application/http\r\nContent-Length: 2599\r\ncontent-transfer-encoding: binary\r\n\r\nHTTP/1.1 301 Moved Permanently\r\nContent-Type: application/pdf;ieee754compatible=true;odata.metadata=minimal\r\nContent-Length: 2408\r\nodata-version: 4.0\r\nlocation: https://some.fake.host/drive/u/0/folders/14pigX2l0koou-KaABC6lyDqSAGpBNsEt\r\n\r\n--FA567EB6CAD5766029DA52DB090377900--', {
				status: 200,
				statusText: 'OK'
			}));

		try {
			const oResult = await oPortableDocument.sendRequest(oDataSource, sDocumentDescriptionId);
			assert.ok(window.open.calledOnce, 'Promise must not resolve');
			assert.ok(oResult === undefined, 'Empty result due to redirect');
			assert.ok(PortableDocument.createBatchRequest.calledOnce, 'PortableDocument#createBatchRequest has been called');
		} catch (oError) {
			assert.ok(false, `Error ${oError.message} must not happen`);
		}

		window.open.restore();
		globalThis.fetch.restore();
		PortableDocument.createBatchRequest.restore();
		oPortableDocument._applyResultSize.restore();
	});

	QUnit.test('function sendRequest - aborted', async function(assert) {
		const oDataSource = {
			dataUrl: 'https://fake.host.com:8080/sap/opu/odata4/Orders?sap-client=120&$select=ID,CompanyCode,OrderType,CreatedAt,CreatedBy&$top=20000',
			useBatch: false
		};
		const sDocumentDescriptionId = '42010aee-0122-1eed-aded-1b0fe7766b3c';
		const oController = oPortableDocument._request = new AbortController();

		oController.abort();

		try {
			await oPortableDocument.sendRequest(oDataSource, sDocumentDescriptionId);
			assert.ok(false, 'Promise must not resolve');
		} catch (oError) {
			assert.ok(true, 'Process has been aborted');
			assert.strictEqual(oError, null, 'Error is of type AbortError');
		}
	});

	QUnit.test('function cancel', function(assert) {
		const oController = oPortableDocument._request = new AbortController();
		sinon.spy(oController, 'abort');

		assert.ok(oController.abort.notCalled, 'AbortController#abort has not been called yet');
		assert.notOk(oController.signal.aborted, 'AbortSignal is not aborted yet');

		oPortableDocument.cancel();

		assert.ok(oController.abort.calledOnce, 'AbortController#abort has not been called yet');
		assert.ok(oController.signal.aborted, 'AbortSignal is aborted');

		oPortableDocument.cancel();

		assert.ok(oController.abort.calledTwice, 'Fake XHR has been aborted a second time');
	});

	QUnit.test('function destroy', function(assert) {
		sinon.stub(oPortableDocument, 'cancel');

		/* Fake Model object */
		oPortableDocument._oModel = {};

		assert.ok(oPortableDocument.cancel.notCalled, 'Cancel has not been called');
		assert.ok(oPortableDocument._oModel, 'PortableDocument has a reference to a Model');

		oPortableDocument.destroy();

		assert.ok(oPortableDocument.cancel.calledOnce, 'Cancel has been called implicitly');
		assert.notOk(oPortableDocument._oModel, 'PortableDocument has no reference to a Model');

		oPortableDocument.cancel.restore();
	});

	QUnit.test('function getMimeType', function(assert) {
		assert.equal(oPortableDocument.getMimeType(), 'application/pdf', 'The instance function getMimeType returned the expected MIME type for PDF');
	});

	/**
	 * Test static functions to ensure stability
	 */
	QUnit.module('Static functions');

	QUnit.test('harmonizeUrl', function(assert) {
		const sUrl = "./some/relative/path";

		assert.ok(!sUrl.endsWith('/'), 'URL has no trailing slash');

		const sResult = PortableDocument.harmonizeUrl(sUrl);

		assert.ok(sResult.endsWith('/'), 'URL has a trailing slash');
	});

	QUnit.test('createGetRequest', function(assert) {
		const oAbortController = new AbortController();
		const sDocumentDescriptionId = '77feaaca-6c41-4878-b0f6-971f84a49447';
		const oDataSource = { dataUrl: 'https://fake.host.com:8080/sap/opu/odata4/Orders?sap-client=120&$select=ID,CompanyCode,OrderType,CreatedAt,CreatedBy&$top=20000' };
		const oRequest = PortableDocument.createGetRequest(oDataSource, sDocumentDescriptionId, oAbortController);

		assert.ok(oRequest instanceof Request, 'Request object has been created');
		assert.equal(oRequest.method, 'GET', 'Request method is GET');
		assert.equal(oRequest.url, oDataSource.dataUrl, 'Request URL is as expected');
		assert.equal(oRequest.headers.get('Accept'), 'application/pdf', 'Request Accept header is as expected');
		assert.equal(oRequest.headers.get('SAP-Document-Description-Id'), sDocumentDescriptionId, 'Request SAP-Document-Description-Id header is as expected');
		assert.ok(oRequest.signal, 'Abort signal is defined');
	});

	QUnit.test('createBatchRequest', function(assert) {
		const oAbortController = new AbortController();
		const sDocumentDescriptionId = '809b1ffa-31c2-495a-b01c-75582b24a250';
		const oDataSource = {
			dataUrl: 'https://fake.host.com:8080/sap/opu/odata4/Orders?sap-client=120&$select=ID,CompanyCode,OrderType,CreatedAt,CreatedBy&$top=20000',
			serviceUrl: 'https://fake.host.com:8080/sap/opu/odata4/'
		};
		const oSpy = sinon.spy(PortableDocument, 'createRequestBody');
		const oRequest = PortableDocument.createBatchRequest(oDataSource, sDocumentDescriptionId, oAbortController);

		assert.ok(oRequest instanceof Request, 'Request object has been created');
		assert.equal(oRequest.method, 'POST', 'Request method is POST');
		assert.equal(oRequest.url, `${oDataSource.serviceUrl}$batch`, 'Request URL is as expected');
		assert.equal(oRequest.headers.get('Accept'), 'multipart/mixed', 'Request Accept header is as expected');
		assert.ok(oRequest.headers.get('Content-Type')?.startsWith('multipart/mixed;boundary=batch_'), 'Request Content-Type header is as expected');
		assert.ok(oRequest.signal, 'Abort signal is defined');
		assert.equal(oRequest.cache, 'no-store', 'Request cache is set to no-cache');
		assert.ok(oSpy.calledOnce, 'createRequestBody has been called');
	});

	QUnit.test('createRequestBody', function(assert) {
		const sBoundary = `batch_16d8ed4d-6399-47f2-9458-49b1690a3161`;
		const sUrl = 'Orders?sap-client=120&$select=ID,CompanyCode,OrderType,CreatedAt,CreatedBy&$top=20000';
		const oHeaders = new Headers({
			"Accept": "application/pdf",
			"SAP-Document-Description-Id": '6d910773-f176-4d04-9c0b-5926a27d4e03'
		});
		const sRequestBody = PortableDocument.createRequestBody(sUrl, sBoundary, oHeaders);

		assert.equal(typeof sRequestBody, 'string', 'Request body is of type string');
		assert.ok(sRequestBody.startsWith(`--${sBoundary}`), 'Request body starts with boundary');
		assert.ok(sRequestBody.includes(`GET ${sUrl} HTTP/1.1`), 'Request body includes URL');
		assert.ok(sRequestBody.includes('accept:application/pdf'), 'Request body includes Accept header');
		assert.ok(sRequestBody.includes('sap-document-description-id:'), 'Request body includes SAP-Document-Description-Id header');
		assert.ok(sRequestBody.endsWith(`--${sBoundary}--\r\n`), 'Request body ends with boundary');
	});

	QUnit.test('getBatchResponse - $batch failed', async function(assert) {
		/**
		 * If $batch request fails, it makes no sense to unwrapp the response.
		 * In this case the original response is returned.
		 */
		const oResponse = new Response('Connection timeout', {
			status: 504,
			statusText: 'Gateway Timeout'
		});
		const oResult = await PortableDocument.getBatchResponse(oResponse);

		assert.equal(oResult, oResponse, 'Original response has been returned');
	});

	QUnit.test('parseResponseBody - Error', function(assert) {
		const oUint8 = new TextEncoder().encode('--FA567EB6CAD5766029DA52DB090377900\r\nContent-Type: application/http\r\nContent-Length: 2599\r\ncontent-transfer-encoding: binary\r\n\r\nHTTP/1.1 500 Internal Server Error\r\nContent-Type: application/xml;ieee754compatible=true;odata.metadata=minimal\r\nContent-Length: 43\r\nodata-version: 4.0\r\ncache-control: no-cache, no-store, must-revalidate\r\n\r\n<error><message>HEAP Dump</message></error>\r\n--FA567EB6CAD5766029DA52DB090377900--');
		const oResult = PortableDocument.parseResponseBody(oUint8);

		assert.ok(oResult, 'Response has been parsed');
		assert.equal(oResult.status, 500, 'Status code has been extracted');
		assert.equal(oResult.statusText, 'Internal Server Error', 'Status text has been extracted');
		assert.equal(oResult.headers.get('Content-Type'), 'application/xml;ieee754compatible=true;odata.metadata=minimal', 'Content-Type has been extracted');
		assert.equal(oResult.headers.get('Content-Length'), '43', 'Content-Length has been extracted');
		assert.equal(oResult.headers.get('odata-version'), '4.0', 'OData version has been extracted');
		assert.equal(oResult.headers.get('cache-control'), 'no-cache, no-store, must-revalidate', 'Cache-Control has been extracted');
		assert.notOk(oResult.pdfContent, 'PDF content could not be extracted');
	});

	QUnit.test('parseResponseBody - Success', function(assert) {
		const oUint8 = new TextEncoder().encode('--FA567EB6CAD5766029DA52DB090377900\r\nContent-Type: application/http\r\nContent-Length: 2599\r\ncontent-transfer-encoding: binary\r\n\r\nHTTP/1.1 200 OK\r\nContent-Type: application/pdf;ieee754compatible=true;odata.metadata=minimal\r\nContent-Length: 2408\r\nodata-version: 4.0\r\ncache-control: no-cache, no-store, must-revalidate\r\n\r\n%PDF-1.6\r\n<< /Length 26208 /Filter [ /FlateDecode ] >>\r\nstream\r\nxœ´¼	xTEÖ?\§êÞÞ“Þ·t\r\n%%EOF\r\n--FA567EB6CAD5766029DA52DB090377900--');
		const oResult = PortableDocument.parseResponseBody(oUint8);

		assert.ok(oResult, 'Response has been parsed');
		assert.equal(oResult.status, 200, 'Status code has been extracted');
		assert.equal(oResult.statusText, 'OK', 'Status text has been extracted');
		assert.equal(oResult.headers.get('Content-Type'), 'application/pdf;ieee754compatible=true;odata.metadata=minimal', 'Content-Type has been extracted');
		assert.equal(oResult.headers.get('Content-Length'), '2408', 'Content-Length has been extracted');
		assert.equal(oResult.headers.get('odata-version'), '4.0', 'OData version has been extracted');
		assert.equal(oResult.headers.get('cache-control'), 'no-cache, no-store, must-revalidate', 'Cache-Control has been extracted');
		assert.equal(new TextDecoder().decode(oResult.pdfContent), '%PDF-1.6\r\n<< /Length 26208 /Filter [ /FlateDecode ] >>\r\nstream\r\nxœ´¼	xTEÖ?\§êÞÞ“Þ·t\r\n%%EOF', 'PDF content has been extracted');
	});

	QUnit.test('parseResponseBody - Redirect', function(assert) {
		const oUint8 = new TextEncoder().encode('--FA567EB6CAD5766029DA52DB090377900\r\nContent-Type: application/http\r\nContent-Length: 2599\r\ncontent-transfer-encoding: binary\r\n\r\nHTTP/1.1 301 Moved Permanently\r\nContent-Type: application/pdf;ieee754compatible=true;odata.metadata=minimal\r\nContent-Length: 2408\r\nodata-version: 4.0\r\nlocation: https://some.fake.host/drive/u/0/folders/14pigX2l0koou-KaABC6lyDqSAGpBNsEt\r\n\r\n--FA567EB6CAD5766029DA52DB090377900--');
		const oResult = PortableDocument.parseResponseBody(oUint8);

		assert.ok(oResult, 'Response has been parsed');
		assert.equal(oResult.status, 301, 'Status code has been extracted');
		assert.equal(oResult.statusText, 'Moved Permanently', 'Status text has been extracted');
		assert.equal(oResult.headers.get('Content-Type'), 'application/pdf;ieee754compatible=true;odata.metadata=minimal', 'Content-Type has been extracted');
		assert.equal(oResult.headers.get('Content-Length'), '2408', 'Content-Length has been extracted');
		assert.equal(oResult.headers.get('odata-version'), '4.0', 'OData version has been extracted');
		assert.equal(oResult.headers.get('location'), 'https://some.fake.host/drive/u/0/folders/14pigX2l0koou-KaABC6lyDqSAGpBNsEt', 'Location has been extracted');
	});

	QUnit.test('function getStartIndex', function(assert) {
		let oUint8 = new TextEncoder().encode('--FA567EB6CAD5766029DA52DB090377900\r\nContent-Type: application/http\r\nContent-Length: 2599\r\ncontent-transfer-encoding: binary\r\n\r\nHTTP/1.1 301 Moved Permanently\r\nContent-Type: application/pdf;ieee754compatible=true;odata.metadata=minimal\r\nContent-Length: 2408\r\nodata-version: 4.0\r\nlocation: https://some.fake.host/drive/u/0/folders/14pigX2l0koou-KaABC6lyDqSAGpBNsEt\r\n\r\n--FA567EB6CAD5766029DA52DB090377900--');
		let iIndex = PortableDocument.getStartIndex(oUint8);

		assert.ok(iIndex === -1, 'Start-of-file boundary has not been found');

		oUint8 = new TextEncoder().encode('--FA567EB6CAD5766029DA52DB090377900\r\nContent-Type: application/http\r\nContent-Length: 2599\r\ncontent-transfer-encoding: binary\r\n\r\nHTTP/1.1 200 OK\r\nContent-Type: application/pdf;ieee754compatible=true;odata.metadata=minimal\r\nContent-Length: 2408\r\nodata-version: 4.0\r\ncache-control: no-cache, no-store, must-revalidate\r\n\r\n%PDF-1.6\r\n<< /Length 26208 /Filter [ /FlateDecode ] >>\r\nstream\r\nxœ´¼	xTEÖ?\§êÞÞ“Þ·t\r\n%%EOF\r\n--FA567EB6CAD5766029DA52DB090377900--');
		iIndex = PortableDocument.getStartIndex(oUint8);

		assert.ok(iIndex > -1, `Start-of-file boundary has been found at ${iIndex}`);
	});

	QUnit.test('function getEndIndex', function(assert) {
		let oUint8 = new TextEncoder().encode('--FA567EB6CAD5766029DA52DB090377900\r\nContent-Type: application/http\r\nContent-Length: 2599\r\ncontent-transfer-encoding: binary\r\n\r\nHTTP/1.1 301 Moved Permanently\r\nContent-Type: application/pdf;ieee754compatible=true;odata.metadata=minimal\r\nContent-Length: 2408\r\nodata-version: 4.0\r\nlocation: https://some.fake.host/drive/u/0/folders/14pigX2l0koou-KaABC6lyDqSAGpBNsEt\r\n\r\n--FA567EB6CAD5766029DA52DB090377900--');
		let iIndex = PortableDocument.getEndIndex(oUint8);

		assert.ok(iIndex === -1, 'End-of-file boundary has not been found');

		oUint8 = new TextEncoder().encode('--FA567EB6CAD5766029DA52DB090377900\r\nContent-Type: application/http\r\nContent-Length: 2599\r\ncontent-transfer-encoding: binary\r\n\r\nHTTP/1.1 200 OK\r\nContent-Type: application/pdf;ieee754compatible=true;odata.metadata=minimal\r\nContent-Length: 2408\r\nodata-version: 4.0\r\ncache-control: no-cache, no-store, must-revalidate\r\n\r\n%PDF-1.6\r\n<< /Length 26208 /Filter [ /FlateDecode ] >>\r\nstream\r\nxœ´¼	xTEÖ?\§êÞÞ“Þ·t\r\n%%EOF\r\n--FA567EB6CAD5766029DA52DB090377900--');
		iIndex = PortableDocument.getEndIndex(oUint8);

		assert.ok(iIndex > -1, `End-of-file boundary has been found at ${iIndex}`);
	});

	/**
	 * Test private functions to ensure stability
	 */
	QUnit.module('Private functions', mModuleConfig);

	QUnit.test('function _getModel', function(assert) {
		const oFakeModel = Symbol('ODataV2Model');
		const oFakeDataSource = {
			version: 2,
			commonServiceUrl: '/sap/opu/odata/sap/SERVICE/'
		};

		oPortableDocument._oModel = oFakeModel;

		let oModel = oPortableDocument._getModel(oFakeDataSource);

		assert.equal(oModel, oFakeModel, 'Model has been returned');

		oFakeDataSource.version = 4;
		oModel = oPortableDocument._getModel(oFakeDataSource);

		assert.notEqual(oModel, oFakeModel, 'Model has been replaced');
		assert.ok(oModel.isA('sap.ui.model.odata.v4.ODataModel'), 'Model is of type OData V4');
	});

	/**
	 * Ensures that the DocumentDescription is created via Binding#create
	 * and its ID is returned after Context#created has been resolved
	 */
	QUnit.test('postDocumentDescription - OData V2', async function(assert) {
		const sSampleId = '42010aee-0122-1eed-aded-1b0fe7766b3c';
		const oModelStub = sinon.createStubInstance(ODataModelV2);
		const oDataSource = { version: 2 };

		oModelStub.isA.returns(false);
		oModelStub.isA.withArgs(["sap.ui.model.odata.v4.ODataModel", "sap.ui.model.odata.v2.ODataModel"]).returns(true);
		sinon.stub(oPortableDocument, '_getModel').returns(oModelStub);
		oModelStub.create.callsFake((sPath, oDocumentDescription, mSettings) => {
			mSettings.success({ Id: sSampleId });
		});

		const sId = await oPortableDocument.postDocumentDescription({ /* DocumentDescription */ }, oDataSource);

		assert.ok(oPortableDocument._getModel.calledOnce, 'PortableDocument#_getModel has been called');
		assert.equal(sId, sSampleId, 'Expected ID has been returned');

		oPortableDocument._getModel.restore();
	});

	/**
	 * Ensures that the DocumentDescription is created via Binding#create
	 * and its ID is returned after Context#created has been resolved
	 */
	QUnit.test('postDocumentDescription - OData V4', async function(assert) {
		const sSampleId = '42010aee-0122-1eed-aded-1b0fe7766b3c';
		const oModelStub = sinon.createStubInstance(ODataModel);
		const oBindingStub = sinon.createStubInstance(ODataListBinding);
		const oContextStub = sinon.createStubInstance(Context);
		const oDataSource = { version: 4 };

		oContextStub.created = sinon.stub().returns(Promise.resolve());

		oModelStub.isA.withArgs(["sap.ui.model.odata.v4.ODataModel", "sap.ui.model.odata.v2.ODataModel"]).returns(true);
		oModelStub.isA.withArgs('sap.ui.model.odata.v4.ODataModel').returns(true);
		oModelStub.bindList.returns(oBindingStub);
		oBindingStub.create.returns(oContextStub);

		oContextStub.getObject.returns({ Id: sSampleId });
		sinon.stub(oPortableDocument, '_getModel').returns(oModelStub);

		const sId = await oPortableDocument.postDocumentDescription({ /* DocumentDescription */}, oDataSource);

		assert.ok(oPortableDocument._getModel.calledOnce, 'PortableDocument#_getModel has been called');
		assert.equal(sId, sSampleId, 'Expected ID has been returned');

		oPortableDocument._getModel.restore();
	});

	QUnit.test('function _applyResultSize', function(assert) {
		const sUrl = 'https://fake.host.com:8080/sap/opu/odata4/Orders?sap-client=120&$select=ID,CompanyCode,OrderType,CreatedAt,CreatedBy';
		let mCapabilities = {
			ResultSizeMaximum: 10000
		};
		oPortableDocument = new PortableDocument(mSettings, mCapabilities);

		let sResult = oPortableDocument._applyResultSize(sUrl);
		assert.ok(sResult.endsWith(`$top=${mCapabilities.ResultSizeMaximum}`), '$top was applied');

		mCapabilities = {
			ResultSizeMaximum: '10000'
		};
		oPortableDocument = new PortableDocument(mSettings, mCapabilities);
		sResult = oPortableDocument._applyResultSize(sUrl);
		assert.ok(sResult.includes('$top'), '$top was applied');
		assert.notEqual(sResult, sUrl, 'URL has been changed');
		assert.ok(sResult.endsWith(`$top=20000`), 'Default ResultSizeMaximum was applied');

		mCapabilities = {
			ResultSizeMaximum: -200
		};
		oPortableDocument = new PortableDocument(mSettings, mCapabilities);
		sResult = oPortableDocument._applyResultSize(sUrl);
		assert.ok(!sResult.includes('$top'), '$top was not applied');
		assert.equal(sResult, sUrl, 'URL has not been changed');

		mCapabilities = {
			ResultSizeMaximum: 'abc'
		};
		oPortableDocument = new PortableDocument(mSettings, mCapabilities);
		sResult = oPortableDocument._applyResultSize(sUrl);
		assert.ok(sResult.includes('$top'), '$top was applied');
		assert.notEqual(sResult, sUrl, 'URL has been changed');
		assert.ok(sResult.endsWith('$top=20000'), 'Default ResultSizeMaximum was applied');

		mCapabilities = {
			ResultSizeMaximum: undefined
		};
		oPortableDocument = new PortableDocument(mSettings, mCapabilities);
		sResult = oPortableDocument._applyResultSize(sUrl);
		assert.ok(sResult.includes('$top'), '$top was applied');
		assert.notEqual(sResult, sUrl, 'URL has been changed');
		assert.ok(sResult.endsWith('$top=20000'), 'Default ResultSizeMaximum was applied');
	});

	QUnit.test('function _resolveCommonServiceUrl', function(assert) {
		/* OData V4 default */
		let mCapabilities = {
			DocumentDescriptionReference: '../../../../default/iwbep/common/0001/$metadata'
		};

		oPortableDocument = new PortableDocument(mSettings, mCapabilities);
		let result = oPortableDocument._resolveCommonServiceUrl('/sap/opu/odata4/sap/zmdc_v4sb_books/srvd/sap/zmdc_sd_books/0001');
		assert.equal(result, '/sap/opu/odata4/sap/zmdc_v4sb_books/default/iwbep/common/0001/', 'Service URL correctly resolved');

		/* OData V2 default */
		mCapabilities = {
			DocumentDescriptionReference: './$metadata'
		};

		oPortableDocument = new PortableDocument(mSettings, mCapabilities);
		result = oPortableDocument._resolveCommonServiceUrl('/sap/opu/odata/sap/MM_PUR_PO_MAINT_V2_SRV');
		assert.equal(result, '/sap/opu/odata/sap/MM_PUR_PO_MAINT_V2_SRV/', 'Service URL correctly resolved');

		/* Custom */
		mCapabilities = {
			DocumentDescriptionReference: './$metadata'
		};

		oPortableDocument = new PortableDocument(mSettings, mCapabilities);
		result = oPortableDocument._resolveCommonServiceUrl('/browse');
		assert.equal(result, '/browse/', 'Service URL correctly resolved');

		mCapabilities = {
			DocumentDescriptionReference: './common/0001/$metadata'
		};

		oPortableDocument = new PortableDocument(mSettings, mCapabilities);
		result = oPortableDocument._resolveCommonServiceUrl('/service/binding/DATA');
		assert.equal(result, '/service/binding/DATA/common/0001/', 'Service URL correctly resolved');
	});

	QUnit.test('function _getEntitySetName', function(assert) {
		/* Without PDF capabilities */
		oPortableDocument = new PortableDocument(mSettings);
		let oDataSource = {
			version: 2
		};

		let sResult = oPortableDocument._getEntitySetName(oDataSource);
		assert.equal(typeof sResult, 'string', 'Function returns a string');
		assert.equal(sResult, 'SAP__MyDocumentDescriptions');

		oDataSource = {
			version: 4
		};

		sResult = oPortableDocument._getEntitySetName(oDataSource);
		assert.equal(typeof sResult, 'string', 'Function returns a string');
		assert.equal(sResult, 'MyDocumentDescriptions');

		/* Including PDF capabilities */
		oPortableDocument = new PortableDocument(mSettings, mPDFCapabilities);
		oDataSource = {
			version: 2
		};

		sResult = oPortableDocument._getEntitySetName(oDataSource);
		assert.equal(typeof sResult, 'string', 'Function returns a string');
		assert.equal(sResult, mPDFCapabilities.DocumentDescriptionCollection);

		oDataSource = {
			version: 4
		};

		sResult = oPortableDocument._getEntitySetName(oDataSource);
		assert.equal(typeof sResult, 'string', 'Function returns a string');
		assert.equal(sResult, mPDFCapabilities.DocumentDescriptionCollection);
	});

	QUnit.test('function _createDocumentDescription', function (assert) {
		let oDocumentDescription, oTableColumn;

		//Create fake settings (without hierarchyLevel and drillState)
		const oSettings = {
			fileName: 'Outdated_name.pdf',
			dataSource: {
				version: 2,
				headers: {}
			},
			workbook: {
				context: {
					title: 'QUnit Workbook',
					metainfo: [
						{
							name: 'Filter',
							items: [
								{
									key: 'Description',
									value: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'
								}
							]
						}
					]
				},
				columns: [
					{
						property: 'SamplePropertyFirst',
						type: EdmType.String,
						label: 'Node Value'
					},
					{
						property: 'SamplePropertySecond',
						type: EdmType.String,
						label: 'Node Value 2'
					},
					{
						property: '',
						type: EdmType.String,
						label: 'Actions'
					},
					{
						property: 'CreatedAt',
						type: EdmType.DateTime,
						timezone: 'Europe/Berlin'
					},
					{
						property: 'Departure',
						type: EdmType.DateTime,
						timezone: 'America/New_York',
						timezoneProperty: 'TimezoneID'
					},
					{
						property: 'SampleNumber',
						type: EdmType.Number,
						timezone: 'Europe/Berlin'
					}
				],
				hierarchyLevel: '',
				drillState: ''
			},
			//Format
			paperSize: 'DIN_A4',
			orientation: 'LANDSCAPE',
			fontSize: 10,
			fitToPage: false,
			//PDFStandard
			doEnableAccessibility: false,
			pdfArchive: false,
			//Signature
			signature: false,
			signatureReason: '',
			showPageNumber: true
		};

		/* DocumentDescription with minimal capabilities */
		oDocumentDescription = oPortableDocument._createDocumentDescription(oSettings);

		assert.ok(oDocumentDescription.TableColumns.length, 'Columns have been added to the DocumentDescription');
		assert.ok(oDocumentDescription.TableColumns.length < oSettings.workbook.columns.length, 'Columns without property have been ignored');

		assert.equal(oDocumentDescription.Title, oSettings.workbook.context.title, 'Workbook title is correct');
		assert.equal(typeof oDocumentDescription.Title, 'string', 'Title is type of string');

		assert.ok(oDocumentDescription.Format, 'Format is defined');
		assert.equal(typeof oDocumentDescription.Format, 'object', 'Format is type of object');

		assert.ok(oDocumentDescription.PDFStandard, 'PDFStandard is defined');
		assert.equal(typeof oDocumentDescription.PDFStandard, 'object', 'PDFStandard is type of object');

		assert.notOk(oDocumentDescription.Signature, 'Signature is undefined');

		assert.ok(!oDocumentDescription.Footer,'Pagemnumber is not available');

		oTableColumn = oDocumentDescription.TableColumns.find((oCol) => oCol.Name === 'CreatedAt');
		assert.ok(oTableColumn, 'Column "CreatedAt" is present');
		assert.notOk(oTableColumn.Format, 'Column has no format settings');

		oTableColumn = oDocumentDescription.TableColumns.find((oCol) => oCol.Name === 'Departure');
		assert.ok(oTableColumn, 'Column "Departure" is present');
		assert.notOk(oTableColumn.Format, 'Column has no format settings');

		//Additional settings
		oSettings.workbook.hierarchyLevel = 'SamplePropertyFirst';
		oDocumentDescription = oPortableDocument._createDocumentDescription(oSettings);
		assert.notOk(oDocumentDescription.Hierarchy, 'hierarchyLevel alone is not suitable to maintain the PDF Hierarchy information');

		oSettings.workbook.drillState = 'SamplePropertySecond';
		oDocumentDescription = oPortableDocument._createDocumentDescription(oSettings);
		assert.notOk(oDocumentDescription.Hierarchy, 'Hierarchy is still empty when PDFCapabilities.Treeview is not supported');


		/* DocumentDescription with full feature set */
		const oCapabilities = new PDFCapabilities({
			ArchiveFormat: true,
			Border: true,
			CoverPage: true,
			DocumentDescriptionCollection: 'MyDocumentDescription',
			DocumentDescriptionReference: '/sap/opu/odata/sap/MM_PUR_PO_MAINT_V2_SRV/',
			FitToPage: true,
			FontName: true,
			FontSize: true,
			HeaderFooter: true,
			IANATimezoneFormat: true,
			Margin: true,
			Padding: true,
			ResultSizeDefault: 5000,
			ResultSizeMaximum: 10000,
			Signature: true,
			TextDirectionLayout: true,
			Treeview: true,
			UploadToFileShare: true
		});

		assert.ok(oSettings.dataSource.headers["SAP-Upload-To-File-Share"] === undefined, 'HTTP header "SAP-Upload-To-File-Share" is not set');

		oPortableDocument = new PortableDocument(oSettings, oCapabilities, mCloudFileInfo);
		oDocumentDescription = oPortableDocument._createDocumentDescription(oSettings);

		assert.ok(typeof oDocumentDescription.PDFStandard.UsePDFAConformance !== 'undefined', 'ArchiveFormat is defined');
		assert.ok(Array.isArray(oDocumentDescription.CoverPage), 'CoverPage is defined');
		assert.equal(typeof oDocumentDescription.Format.FitToPage, 'object', 'FitToPage is of type object');
		assert.equal(oDocumentDescription.Format.FitToPage.MinimumFontSize, 1, 'MinimumFontSize is set');
		assert.equal(typeof oDocumentDescription.Format.FontSize, 'number', 'FontSize is of type number');
		assert.equal(typeof oDocumentDescription.Format.TextDirectionLayout, 'string', 'FontSize is of type number');
		assert.equal(oDocumentDescription.Format.TextDirectionLayout, Localization.getRTL() ? "RTL" : "LTR", 'Right-to-left flag has been set correctly');
		assert.ok(oDocumentDescription.Signature, 'Signature is defined');
		assert.deepEqual(oDocumentDescription.Footer, {Center: {Type: 'PAGENUM'}}, 'Pagenumber is available in the Footer');
		assert.equal(typeof oDocumentDescription.Signature, 'object', 'Signature is of type object');
		assert.equal(oDocumentDescription.FileName, mCloudFileInfo.FileShareItemName, 'FileName is set correctly');
		assert.equal(typeof oDocumentDescription.FileShare, 'object', 'FileShare is of type object');
		assert.equal(oDocumentDescription.FileShare.Repository, mCloudFileInfo.FileShare, 'FileShare is set correctly');
		assert.equal(oDocumentDescription.FileShare.Folder, mCloudFileInfo.ParentFileShareItem, 'ParentFileShareItem is set correctly');
		assert.ok(oSettings.dataSource.headers["SAP-Upload-To-File-Share"] === true, 'HTTP header "SAP-Upload-To-File-Share" is set');

		/* DocumentDescription - OData V2 specific */
		oDocumentDescription = oPortableDocument._createDocumentDescription(oSettings);

		const oCoverPage = oDocumentDescription.CoverPage;
		const oFilter = oCoverPage.find((oEntry) => oEntry.Name === 'Description');
		assert.ok(oFilter, 'Filter is defined');
		assert.equal(oFilter.Value.length, oSettings.workbook.context.metainfo[0].items[0].value.length, 'Filter value is not limited');

		assert.ok(oDocumentDescription.Hierarchy, 'Hierarchy is defined');
		assert.ok(!oDocumentDescription.Format.TableFormat, 'OData V4 specific hierarchy settings undefined');
		assert.equal(typeof oDocumentDescription.Hierarchy, 'object', 'Hierarchy is type of object');

		oTableColumn = oDocumentDescription.TableColumns.find((oCol) => oCol.Name === 'CreatedAt');
		assert.ok(oTableColumn, 'Column "CreatedAt" is present');
		assert.ok(oTableColumn.Format, 'Column has format settings');
		assert.equal(oTableColumn.Format.DisplayFormat, 'IANATSSHOR', 'Column has OData V2 DisplayFormat value');
		assert.equal(oTableColumn.Format.IANATimezone, 'Europe/Berlin', 'Static timezone applied');
		assert.notOk(oTableColumn.Format.IANATimezoneProperty, 'No IANATimezoneProperty defined');

		oTableColumn = oDocumentDescription.TableColumns.find((oCol) => oCol.Name === 'Departure');
		assert.ok(oTableColumn, 'Column "Departure" is present');
		assert.ok(oTableColumn.Format, 'Column has format settings');
		assert.equal(oTableColumn.Format.DisplayFormat, 'IANATSSHOR', 'Column has OData V2 DisplayFormat value');
		assert.notOk(oTableColumn.Format.IANATimezone, 'No static timezone applied');
		assert.equal(oTableColumn.Format.IANATimezoneProperty, 'TimezoneID', 'IANATimezoneProperty defined with expected value');

		oTableColumn = oDocumentDescription.TableColumns.find((oCol) => oCol.Name === 'SampleNumber');
		assert.ok(oTableColumn, 'Column "SampleNumber" is present');
		assert.notOk(oTableColumn.Format, 'Column has no format settings');


		/* DocumentDescription - OData V4 specific */
		oSettings.dataSource = { version: 4, headers: {} };
		oDocumentDescription = oPortableDocument._createDocumentDescription(oSettings);

		assert.ok(!oDocumentDescription.Hierarchy, 'OData V2 Hierarchy setting is undefined');
		assert.ok(oDocumentDescription.Format.TableFormat, 'OData V4 specific hierarchy settings defined');
		assert.equal(oDocumentDescription.Format.TableFormat, 'TREE', 'TableFormat is configured as "TREE"');

		oTableColumn = oDocumentDescription.TableColumns.find((oCol) => oCol.Name === 'CreatedAt');
		assert.ok(oTableColumn, 'Column "CreatedAt" is present');
		assert.ok(oTableColumn.Format, 'Column has format settings');
		assert.equal(oTableColumn.Format.DisplayFormat, 'IANA-Timestamp-Short', 'Column has OData V4 DisplayFormat value');
		assert.equal(oTableColumn.Format.IANATimezone, 'Europe/Berlin', 'Static timezone applied');
		assert.notOk(oTableColumn.Format.IANATimezoneProperty, 'No IANATimezoneProperty defined');

		oTableColumn = oDocumentDescription.TableColumns.find((oCol) => oCol.Name === 'Departure');
		assert.ok(oTableColumn, 'Column "Departure" is present');
		assert.ok(oTableColumn.Format, 'Column has format settings');
		assert.equal(oTableColumn.Format.DisplayFormat, 'IANA-Timestamp-Short', 'Column has OData V4 DisplayFormat value');
		assert.notOk(oTableColumn.Format.IANATimezone, 'No static timezone applied');
		assert.equal(oTableColumn.Format.IANATimezoneProperty, 'TimezoneID', 'IANATimezoneProperty defined with expected value');

		oTableColumn = oDocumentDescription.TableColumns.find((oCol) => oCol.Name === 'SampleNumber');
		assert.ok(oTableColumn, 'Column "SampleNumber" is present');
		assert.notOk(oTableColumn.Format, 'Column has no format settings');
	});

	QUnit.test('function _showWarning', async function(assert) {
		await oPortableDocument._showWarning({ dataSource: { count: 100 } });
		assert.ok(ExportDialog.showWarningDialog.notCalled, 'Warning dialog has not been shown');

		await oPortableDocument._showWarning({ dataSource: { count: mPDFCapabilities.ResultSizeMaximum + 1 } });
		assert.ok(ExportDialog.showWarningDialog.calledOnce, 'Warning dialog has been shown');
	});

	QUnit.test('function showErrorMessage', async function(assert) {
		await PortableDocument.showErrorMessage();
		assert.ok(ExportDialog.showErrorMessage.notCalled, 'Error message has not been shown');

		await PortableDocument.showErrorMessage({ message: 'Test error message' });
		assert.ok(ExportDialog.showErrorMessage.calledOnce, 'Error message has been shown');
	});
});
