import type {
	IExecuteFunctions,
	IDataObject,
} from 'n8n-workflow';

export async function uploadMedia(
	ctx: IExecuteFunctions,
	itemIndex: number,
	apiKey: string,
	baseUrl: string,
	phoneNumber: string
): Promise<IDataObject> {
	const binaryPropertyName = ctx.getNodeParameter('binaryProperty', itemIndex, 'data') as string;
	const binaryData = await ctx.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const buffer = await ctx.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

	const formData = new FormData();
	const uint8Array = new Uint8Array(buffer);
	formData.append('file', new Blob([uint8Array], { type: binaryData.mimeType }), binaryData.fileName);

	const url = `${baseUrl}/media/${encodeURIComponent(phoneNumber)}/upload`;
	const response = await ctx.helpers.httpRequest({
		method: 'POST',
		url:url,
		headers: {
			'X-API-Key': apiKey,
			'accept': 'application/json',
			'Content-Type': 'multipart/form-data',
		},
		body: formData
	});

	return response as IDataObject;
}
