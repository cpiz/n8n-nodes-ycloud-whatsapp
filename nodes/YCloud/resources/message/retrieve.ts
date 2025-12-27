import type {
	IExecuteFunctions,
	IDataObject,
} from 'n8n-workflow';

export async function retrieveMessage(
	ctx: IExecuteFunctions,
	itemIndex: number,
	apiKey: string,
	baseUrl: string
): Promise<IDataObject> {
	const messageId = ctx.getNodeParameter('messageId', itemIndex) as string;
	const url = `${baseUrl}/messages/${messageId}`;

	const response = await ctx.helpers.httpRequest({
		method: 'GET',
		url,
		headers: {
			'X-API-Key': apiKey,
			'Content-Type': 'application/json',
		},
	});

	return response as IDataObject;
}
