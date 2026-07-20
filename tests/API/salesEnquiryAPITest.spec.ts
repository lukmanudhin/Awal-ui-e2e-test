import { test, expect } from "../../fixtures/baseFixtures";
import { salesEnquiryPayload } from "../../API-payloads/salesEnquiryPayload";
import { ENV } from "../../utils/ENV";
import { updateEnquiryPayload } from "../../API-payloads/updateEnquiryPayload";
import { Utils } from "../../utils/utils";

test.describe.serial('Verify Sales Enquiry API', () => {
    let accessToken: string;
    let enquiryId: string;

    test.beforeAll('Setup', async () => {
        console.log('Test Start Time: ', Utils.getCurrentTime());
    });

    test.beforeEach(async ({ salesEnquiryAPI }) => {
        if (!accessToken) {
            accessToken = await salesEnquiryAPI.getAccessToken(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        }
    });

    test('Verify Create Sales Enquiry API', async ({ salesEnquiryAPI }) => {
        const createSalesEnquiryAPIResponse = await salesEnquiryAPI.createSalesEnquiryAPI(accessToken, salesEnquiryPayload);
        expect(createSalesEnquiryAPIResponse.message, 'Create Sales Enquiry API Message Mismatch').toBe('Data created successfully');
        enquiryId = createSalesEnquiryAPIResponse.result.extId;
        console.log('----------------------Create Sales Enquiry API Response----------------------');
        console.log('API Response:', createSalesEnquiryAPIResponse);
    });

    test('Verify Create Embroiding And Tailoring API', async ({ salesEnquiryAPI }) => {
        const createEmbroideryAPIResponse = await salesEnquiryAPI.createEmbroideryAPI(accessToken, enquiryId);
        expect(createEmbroideryAPIResponse.message, 'Embroidery API Message Mismatch').toBe('Data created successfully');
        console.log('----------------------Create Embroidery API Response-------------------------');
        console.log('API Response:', createEmbroideryAPIResponse);
    });

    test('Verify Create Acrylic Products API', async ({ salesEnquiryAPI }) => {
        const acrylicProductsAPIResponse = await salesEnquiryAPI.createAcrylicProducts(accessToken, enquiryId);
        expect(acrylicProductsAPIResponse.message, 'Acrylic Products API Message Mismatch').toBe('Data created successfully');
        console.log('----------------------Create Acrylic Products API Response------------------');
        console.log('API Response:', acrylicProductsAPIResponse);
    });
    
    test('Verify Create Signage Illuminated API', async ({ salesEnquiryAPI }) => {
        const signageIlluminatedAPIResponse = await salesEnquiryAPI.createSignageIlluminatedAPI(accessToken, enquiryId);
        expect(signageIlluminatedAPIResponse.message, 'Signage Illuminated API Message Mismatch').toBe('Data created successfully');
        console.log('----------------------Create Signage Illuminated API Response------------------');
        console.log('API Response:', signageIlluminatedAPIResponse);
    });

    test('Verify Create ATM Products API', async ({ salesEnquiryAPI }) => {
        const atmProductsAPIResponse = await salesEnquiryAPI.createAtmProductsAPI(accessToken, enquiryId);
        expect(atmProductsAPIResponse.message, 'ATM Products API Message Mismatch').toBe('Data created successfully');
        console.log('----------------------Create ATM Products API Response------------------');
        console.log('API Response:', atmProductsAPIResponse);
    });

    test('Verify Create Vinyl Graphic API', async ({ salesEnquiryAPI }) => {
        const vinylGraphicAPIResponse = await salesEnquiryAPI.createVinylGraphicAPI(accessToken, enquiryId);
        expect(vinylGraphicAPIResponse.message, 'Vinyl Graphic API Message Mismatch').toBe('Data created successfully');
        console.log('----------------------Create Vinyl Graphic API Response------------------');
        console.log('API Response:', vinylGraphicAPIResponse);
    });

    test('Verify Create Trading Products API', async ({ salesEnquiryAPI }) => {
        const tradingProductsAPIResponse = await salesEnquiryAPI.createTradingProductsAPI(accessToken, enquiryId);
        expect(tradingProductsAPIResponse.message, 'Trading Products API Message Mismatch').toBe('Data created successfully');
        console.log('----------------------Create Trading Products API Response------------------');
        console.log('API Response:', tradingProductsAPIResponse);
    });

    test('Verify Create PVC Products API', async ({ salesEnquiryAPI }) => {
        const pvcProductsAPIResponse = await salesEnquiryAPI.createPvcProductsAPI(accessToken, enquiryId);
        expect(pvcProductsAPIResponse.message, 'PVC Products API Message Mismatch').toBe('Data created successfully');
        console.log('----------------------Create PVC Products API Response------------------');
        console.log('API Response:', pvcProductsAPIResponse);
    });

    test('Verify View Sales Enquiry API', async ({ salesEnquiryAPI }) => {
        const viewSalesEnquiryAPIResponse = await salesEnquiryAPI.viewSalesEnquiryAPI(accessToken, enquiryId);
        expect(viewSalesEnquiryAPIResponse.message, 'View Sales Enquiry API Message Mismatch').toBe('Data fetched successfully');
        console.log('----------------------View Sales Enquiry API Response------------------------');
        console.log('API Response:', viewSalesEnquiryAPIResponse);
    });

    test('Verify Edit Sales Enquiry API', async ({ salesEnquiryAPI }) => {
        const payload = updateEnquiryPayload(enquiryId);
        const editSalesEnquiryAPIResponse = await salesEnquiryAPI.editSalesEnquiryAPI(accessToken, payload);
        expect(editSalesEnquiryAPIResponse.message, 'Edit Sales Enquiry API Message Mismatch').toBe('Data updated successfully');
        console.log('----------------------Edit Sales Enquiry API Response-------------------------');
        console.log('API Response:', editSalesEnquiryAPIResponse);
        const viewSalesEnquiryAPIResponse = await salesEnquiryAPI.viewSalesEnquiryAPI(accessToken, enquiryId);
        expect(viewSalesEnquiryAPIResponse.message, 'View Sales Enquiry API Message Mismatch').toBe('Data fetched successfully');
        console.log('----------------------View Updated Sales Enquiry API Response------------------------');
        console.log('API Response:', viewSalesEnquiryAPIResponse);
        await salesEnquiryAPI.validateViewSalesEnquiryAPIResponse(viewSalesEnquiryAPIResponse, payload);
    });

    test('Verify Delete Sales Enquiry API', async ({ salesEnquiryAPI }) => {
        const deleteAPIResponse = await salesEnquiryAPI.deleteSalesEnquiry(accessToken, enquiryId);
        expect(deleteAPIResponse.message, 'Delete Sales Enquiry API Message Mismatch').toBe('Data deleted successfully');
        console.log('----------------------Delete Sales Enquiry API Response---------------------');
        console.log('API Response:', deleteAPIResponse);
    });
});





