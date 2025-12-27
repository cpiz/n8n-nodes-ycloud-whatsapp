import { ICredentialTestRequest, ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class YCloudApi implements ICredentialType {
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-name-uppercase-first-char
	name = 'YCloudApi';

	displayName = 'YCloud API';

	icon: Icon = { light: 'file:../nodes/YCloud/YCloud.svg', dark: 'file:../nodes/YCloud/YCloud.dark.svg' };

	documentationUrl = 'https://docs.ycloud.com/reference/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			placeholder: '3da7ced33...',
		},
		{
			displayName: 'WhatsApp商业帐户ID(WABA ID)',
			name: 'wabaId',
			type: 'string',
			default: '',
			required: true,
			placeholder: '1011223344556677',
			description: '用于在WhatsApp商业平台中唯一标识和管理商业电话号码的一串数字',
		},
		{
			displayName: '商户手机号(Phone Number)',
			name: 'phoneNumber',
			type: 'string',
			default: '',
			required: true,
			placeholder: '+16315551111',
			description: '与WhatsApp商业帐户ID对应的商户手机号码，也将作为发送消息的源号码使用，格式为国家码+号码（如：+16315551111）',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.ycloud.com',
			url: '=/v2/whatsapp/phoneNumbers/{{$credentials.wabaId}}/{{encodeURIComponent($credentials.phoneNumber)}}',
			method: 'GET',
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
				accept: 'application/json',
			},
		},
	};
}
