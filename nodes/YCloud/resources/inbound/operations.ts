import type {
	IExecuteFunctions,
	IDataObject,
} from 'n8n-workflow';

export async function markAsRead(
	ctx: IExecuteFunctions,
	itemIndex: number,
	apiKey: string,
	baseUrl: string
): Promise<IDataObject> {
	const messageId = ctx.getNodeParameter('inboundMessageId', itemIndex) as string;
	const url = `${baseUrl}/inboundMessages/${messageId}/markAsRead`;

	const response = await ctx.helpers.httpRequest({
		method: 'POST',
		url,
		headers: {
			'X-API-Key': apiKey,
			'Content-Type': 'application/json',
		},
	});

	return response as IDataObject;
}

export async function typingIndicator(
	ctx: IExecuteFunctions,
	itemIndex: number,
	apiKey: string,
	baseUrl: string
): Promise<IDataObject> {
	const messageId = ctx.getNodeParameter('inboundMessageId', itemIndex) as string;
	const url = `${baseUrl}/inboundMessages/${messageId}/typingIndicator`;

	const response = await ctx.helpers.httpRequest({
		method: 'POST',
		url,
		headers: {
			'X-API-Key': apiKey,
			'Content-Type': 'application/json',
		},
	});

	return response as IDataObject;
}
