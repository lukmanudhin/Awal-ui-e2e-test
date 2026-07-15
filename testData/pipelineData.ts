import { RandomDataGenerator } from '../utils/randomDataGenerator';

export type PipelineData = {
    enquiry: string;
    value: string;
    note: string;
    noteText: string;
    meetingDescription: string;
    emailSubject: string;
    emailRemarks: string;
    fileRemarks: string;
    fileName: string;
};

export const getPipelineData = (): PipelineData => ({
    enquiry: '',
    value: `${RandomDataGenerator.getNumber(1, 9)}`,
    note: `Pipeline not`,
    noteText: `Pipeline Automation E2E Note`,
    meetingDescription: `Pipeline Automation E2E Notes ${RandomDataGenerator.getNumber(1000, 9999)}`,
    emailSubject: `Pipeline Automation E2E Subject ${RandomDataGenerator.getNumber(1000, 9999)}`,
    emailRemarks: `Pipeline Automation E2E Remarks ${RandomDataGenerator.getNumber(1000, 9999)}`,
    fileRemarks: `Pipeline Automation E2E File Remarks ${RandomDataGenerator.getNumber(1000, 9999)}`,
    fileName: 'Test_Document.pdf',
});
