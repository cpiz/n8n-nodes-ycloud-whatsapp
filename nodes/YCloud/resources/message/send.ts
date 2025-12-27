import type {
	IExecuteFunctions,
	IDataObject,
} from 'n8n-workflow';

interface TemplateContent {
	name: string;
	language: {
		code: string;
	};
	components?: Array<{
		type: 'header' | 'body' | 'button' | 'limited_time_offer' | 'carousel' | 'order_status';
		parameters?: Array<{
			type: 'text' | 'image' | 'video' | 'document' | 'payload' | 'coupon_code' | 'limited_time_offer' | 'action' | 'order_status' | 'location';
			text?: string;
			image?: { id: string };
			video?: { id: string };
			document?: { id: string };
			payload?: string;
			coupon_code?: string;
			limited_time_offer?: { discount_code?: string };
			action?: { parameters?: { url?: string } };
			order_status?: { order_id?: string };
			location?: { latitude: number; longitude: number; name?: string; address?: string };
		}>;
		buttons?: Array<{
			type: 'quick_reply' | 'url' | 'copy_code' | 'catalog' | 'mpm' | 'flow' | 'order_details';
			text?: string;
			subType?: string;
			index?: number;
		}>;
	}>;
}

export async function sendMessage(
	ctx: IExecuteFunctions,
	itemIndex: number,
	apiKey: string,
	baseUrl: string,
	operation: 'sendDirectly' | 'send'
): Promise<IDataObject> {
	// 获取凭证中的发送号码
	const credentials = await ctx.getCredentials('YCloudApi') as IDataObject;
	const fromNumber = credentials.phoneNumber as string;

	if (!fromNumber) {
		throw new Error('请先在 YCloud API 凭证中设置发送号码（phoneNumber）');
	}

	const to = ctx.getNodeParameter('to', itemIndex) as string;
	const messageType = ctx.getNodeParameter('messageType', itemIndex) as string;

	// 获取高级选项
	const advancedOptions = ctx.getNodeParameter('advancedOptions', itemIndex, {}) as IDataObject;
	const customClientMsgId = (advancedOptions.customClientMsgId as string) || '';
	const businessAccount = (advancedOptions.businessAccount as string) || '';
	const replyToMessageId = (advancedOptions.replyToMessageId as string) || '';

	const body: IDataObject = {
		from: fromNumber,
		to,
		type: messageType,
	};

	// 设置通用参数
	if (customClientMsgId) {
		body.custom_client_msg_id = customClientMsgId;
	}
	if (businessAccount) {
		body.business_account = businessAccount;
	}
	if (replyToMessageId) {
		body.context = { message_id: replyToMessageId };
	}

	switch (messageType) {
		case 'text': {
			const textContent = ctx.getNodeParameter('textContent', itemIndex, '') as string;
			const textPreviewUrl = ctx.getNodeParameter('textPreviewUrl', itemIndex, false) as boolean;
			body.text = { body: textContent, preview_url: textPreviewUrl };
			break;
		}
		case 'template': {
			const templateName = ctx.getNodeParameter('templateName', itemIndex) as string;
			const templateLanguage = ctx.getNodeParameter('templateLanguage', itemIndex) as string;
			const templateParamsStr = ctx.getNodeParameter('templateParams', itemIndex, '[]') as string;
			const templateParams = JSON.parse(templateParamsStr);

			const templateContent: TemplateContent = {
				name: templateName,
				language: { code: templateLanguage },
			};

			if (templateParams && Array.isArray(templateParams) && templateParams.length > 0) {
				templateContent.components = templateParams;
			}

			body.template = templateContent;
			break;
		}
		case 'audio':
		case 'image':
		case 'sticker':
		case 'video':
		case 'document': {
			const attachmentContent: IDataObject = {};
			const attachmentIdOrUrl = ctx.getNodeParameter('attachmentIdOrUrl', itemIndex, '') as string;
			const mediaCaption = ctx.getNodeParameter('mediaCaption', itemIndex, '') as string;
			const documentFilename = ctx.getNodeParameter('documentFilename', itemIndex, '') as string;
			if (attachmentIdOrUrl) {
				if (attachmentIdOrUrl.startsWith('http://') || attachmentIdOrUrl.startsWith('https://')) {
					attachmentContent.link = attachmentIdOrUrl;
				} else {
					attachmentContent.id = attachmentIdOrUrl;
				}
			}
			if (mediaCaption) {
				attachmentContent.caption = mediaCaption;
			}
			if (messageType === 'document' && documentFilename) {
				attachmentContent.filename = documentFilename;
			}
			body[messageType] = attachmentContent;
			break;
		}
		case 'location': {
			const latitude = ctx.getNodeParameter('locationLatitude', itemIndex, 0) as number;
			const longitude = ctx.getNodeParameter('locationLongitude', itemIndex, 0) as number;
			const name = ctx.getNodeParameter('locationName', itemIndex, '') as string;
			const address = ctx.getNodeParameter('locationAddress', itemIndex, '') as string;
			body.location = { latitude, longitude, name, address };
			break;
		}
		case 'interactive': {
			const interactiveType = ctx.getNodeParameter('interactiveType', itemIndex, 'button') as string;
			const interactiveBody = ctx.getNodeParameter('interactiveBody', itemIndex, '') as string;
			const interactiveFooter = ctx.getNodeParameter('interactiveFooter', itemIndex, '') as string;

			const interactiveContent: IDataObject = { type: interactiveType, body: { text: interactiveBody } };
			if (interactiveFooter) {
				interactiveContent.footer = { text: interactiveFooter };
			}

			if (interactiveType === 'button') {
				const header = ctx.getNodeParameter('interactiveHeader', itemIndex, '') as string;
				const buttonsStr = ctx.getNodeParameter('interactiveButtons', itemIndex, '[]') as string;
				const buttons = JSON.parse(buttonsStr);

				if (header) {
					interactiveContent.header = { type: 'text', text: header };
				}
				interactiveContent.action = { buttons };
			}

			body.interactive = interactiveContent;
			break;
		}
		case 'contacts': {
			const contactsDataStr = ctx.getNodeParameter('contactsData', itemIndex, '[]') as string;
			const contactsData = JSON.parse(contactsDataStr);
			body.contacts = contactsData;
			break;
		}
		case 'reaction': {
			const reactionMessageId = ctx.getNodeParameter('reactionMessageId', itemIndex, '') as string;
			const reactionEmoji = ctx.getNodeParameter('reactionEmoji', itemIndex, '') as string;
			body.reaction = { message_id: reactionMessageId, emoji: reactionEmoji };
			break;
		}
	}

	const endpoint = operation === 'sendDirectly' ? '/messages/sendDirectly' : '/messages';
	const url = `${baseUrl}${endpoint}`;
	const headers = {
		'X-API-Key': apiKey,
		'Content-Type': 'application/json',
	};

	// 打印请求体
	 
	// console.log('Request URL:', url);
	 
	// console.log('Request Headers:', headers);
	 
	// console.log('Request Body:', body);

	const response = await ctx.helpers.httpRequest({
		method: 'POST',
		url,
		headers: headers,
		body,
	});

	return response as IDataObject;
}
