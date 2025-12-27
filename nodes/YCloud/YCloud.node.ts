// eslint-disable-next-line n8n-nodes-base/node-filename-against-convention
/* eslint-disable n8n-nodes-base/node-param-operation-option-action-miscased */
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ICredentialDataDecryptedObject,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

// 导入资源模块
import { sendMessage } from './resources/message/send';
import { retrieveMessage } from './resources/message/retrieve';
import { uploadMedia } from './resources/media/upload';
import { markAsRead, typingIndicator } from './resources/inbound/operations';

export class YCloud implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'YCloud WhatsApp',
		// eslint-disable-next-line n8n-nodes-base/node-class-description-name-miscased
		name: 'YCloud',
		icon: { light: 'file:YCloud.svg', dark: 'file:YCloud.dark.svg' },
		group: ['input'],
		version: 1,
		description: 'YCloud WhatsApp API - 管理 WhatsApp 消息',
		defaults: {
			name: 'YCloud WhatsApp',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'YCloudApi',
				displayName: 'YCloud 凭证',
				required: true,
			},
		],
		properties: [
			{
				displayName: '资源',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '发送消息',
						value: 'message',
					},
					{
						name: '接收消息',
						value: 'inbound',
					},
					{
						name: '媒体',
						value: 'media',
					},
				],
				default: 'message',
			},
			// 发送消息资源的操作
			{
				displayName: '操作',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '直接发送',
						value: 'sendDirectly',
						action: '同步发送 WhatsApp 消息',
						description: '同步发送 WhatsApp 消息（即时提交）',
					},
					{
						name: '队列发送',
						value: 'send',
						action: '将 WhatsApp 消息加入队列异步发送',
						description: '将 WhatsApp 消息加入队列异步发送',
					},
					{
						name: '检索消息',
						value: 'retrieve',
						action: '检索之前发送的 WhatsApp 消息',
						description: '检索之前发送的 WhatsApp 消息',
					},
				],
				default: 'sendDirectly',
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
			},
			// 接收消息资源的操作
			{
				displayName: '操作',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '标记已读',
						value: 'markAsRead',
						action: '将接收到的消息标记为已读',
						description: '将消息标记为已读，显示蓝色勾选标记',
					},
					{
						name: '显示输入指示器',
						value: 'typingIndicator',
						action: '显示输入指示器并标记消息为已读',
						description: '显示输入指示器并标记消息为已读',
					},
				],
				default: 'markAsRead',
				displayOptions: {
					show: {
						resource: ['inbound'],
					},
				},
			},
			// 媒体资源的操作
			{
				displayName: '操作',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '上传媒体',
						value: 'upload',
						action: '上传媒体文件用于后续发送',
						description: '上传媒体文件，媒体将加密保存 30 天',
					},
				],
				default: 'upload',
				displayOptions: {
					show: {
						resource: ['media'],
					},
				},
			},
			{
				displayName: '消息类型',
				name: 'messageType',
				type: 'options',
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{ name: '文本', value: 'text' },
					{ name: '图片', value: 'image' },
					{ name: '模板', value: 'template' },
					{ name: '音频', value: 'audio' },
					{ name: '视频', value: 'video' },
					{ name: '文档', value: 'document' },
					{ name: '贴纸', value: 'sticker' },
					{ name: '位置', value: 'location' },
					{ name: '互动', value: 'interactive' },
					{ name: '表情回应', value: 'reaction' },
					{ name: '联系人', value: 'contacts' },
				],
				default: 'text',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
					},
				},
			},
			{
				displayName: '收件人号码',
				name: 'to',
				type: 'string',
				default: '',
				placeholder: '+8613812345678',
				description: '收件人电话号码，E.164 格式',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
					},
				},
			},
			{
				displayName: '文本内容',
				name: 'textContent',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: '最大长度4096个字符。文本消息内容可以包含以https://开头的URL链接和格式化内容，URL 必须包含域名 因为IP地址将无法匹配',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
						messageType: ['text'],
					},
				},
			},
			{
				displayName: '预览链接',
				name: 'textPreviewUrl',
				type: 'boolean',
				default: false,
				// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
				description: '是否生成链接预览（默认 false）',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
						messageType: ['text'],
					},
				},
			},
			{
				displayName: '模板名称',
				name: 'templateName',
				type: 'string',
				default: '',
				placeholder: 'your_template_name',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
						messageType: ['template'],
					},
				},
			},
			{
				displayName: '模板语言',
				name: 'templateLanguage',
				type: 'string',
				default: 'en',
				placeholder: 'en, zh_CN, etc.',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
						messageType: ['template'],
					},
				},
			},
			{
				displayName: '模板参数 (JSON)',
				name: 'templateParams',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '[]',
				placeholder: '[{"type": "text", "text": "Hello {{1}}"}]',
				description: '包含消息参数的组件对象数组（JSON 格式）',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
						messageType: ['template'],
					},
				},
			},
			{
				displayName: '附件ID或链接',
				name: 'attachmentIdOrUrl',
				type: 'string',
				default: '',
				placeholder: '提前上传的附件ID',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
						messageType: ['audio', 'document', 'image', 'sticker', 'video'],
					},
				},
			},
			{
				displayName: '媒体标题',
				name: 'mediaCaption',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
						messageType: ['document', 'image', 'video'],
					},
				},
			},
			{
				displayName: '文件名',
				name: 'documentFilename',
				type: 'string',
				default: '',
				description: '文档文件名（如：report.pdf）',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDirectly', 'send'],
						messageType: ['document'],
					},
				},
			},
			// Location 消息字段
			{
				displayName: '纬度',
				name: 'locationLatitude',
				type: 'number',
				default: 0,
				description: '位置的纬度',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['location'],
					},
				},
			},
			{
				displayName: '经度',
				name: 'locationLongitude',
				type: 'number',
				default: 0,
				description: '位置的经度',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['location'],
					},
				},
			},
			{
				displayName: '名称',
				name: 'locationName',
				type: 'string',
				default: '',
				description: '位置的名称',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['location'],
					},
				},
			},
			{
				displayName: '地址',
				name: 'locationAddress',
				type: 'string',
				default: '',
				description: '位置的地址',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['location'],
					},
				},
			},
			// Interactive 消息字段
			{
				displayName: '互动类型',
				name: 'interactiveType',
				type: 'options',
				options: [
					{ name: '按钮', value: 'button' },
					{ name: '列表', value: 'list' },
					{ name: '产品', value: 'product' },
					{ name: '目录产品', value: 'catalog_message' },
				],
				default: 'button',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['interactive'],
					},
				},
			},
			{
				displayName: '头部',
				name: 'interactiveHeader',
				type: 'string',
				default: '',
				description: '互动消息的头部文本',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['interactive'],
						interactiveType: ['button'],
					},
				},
			},
			{
				displayName: '正文',
				name: 'interactiveBody',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: '互动消息的正文内容',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['interactive'],
					},
				},
			},
			{
				displayName: '底部',
				name: 'interactiveFooter',
				type: 'string',
				default: '',
				description: '互动消息的底部文本',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['interactive'],
					},
				},
			},
			{
				displayName: '按钮 (JSON)',
				name: 'interactiveButtons',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				default: '[]',
				placeholder: '[{"type": "reply", "title": "是"}, {"type": "reply", "title": "否"}]',
				description: '按钮数组（JSON 格式）',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['interactive'],
						interactiveType: ['button'],
					},
				},
			},
			// Reaction 消息字段
			{
				displayName: '回复消息 ID',
				name: 'reactionMessageId',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'wamid.xxx',
				description: '要回应的消息 ID',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['reaction'],
					},
				},
			},
			{
				displayName: '表情符号',
				name: 'reactionEmoji',
				type: 'string',
				default: '',
				placeholder: 'Emoji表情，留空则撤回',
				description: 'Emoji表情符号',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['reaction'],
					},
				},
			},
			// Contacts 消息字段
			{
				displayName: '联系人 (JSON)',
				name: 'contactsData',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				default: '[]',
				placeholder: '[{"name": {"first_name": "John", "last_name": "Doe"}, "phones": [{"phone": "+1234567890", "type": "MOBILE"}]}]',
				description: '联系人数组（JSON 格式）',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['contacts'],
					},
				},
			},
			{
				displayName: '消息 ID',
				name: 'messageId',
				type: 'string',
				default: '',
				description: '要检索的消息的唯一 ID',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['retrieve'],
					},
				},
			},
			{
				displayName: 'Binary 属性',
				name: 'binaryProperty',
				type: 'string',
				default: 'data',
				placeholder: 'data',
				description: '输入项中包含二进制数据的字段名称，注意媒体需要符合格式要求，参考<a href="https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media#supported-media-types">支持的媒体类型</a>',
				displayOptions: {
					show: {
						resource: ['media'],
						operation: ['upload'],
					},
				},
			},
			{
				displayName: '消息 ID',
				name: 'inboundMessageId',
				type: 'string',
				default: '',
				placeholder: 'wamid.xxx',
				description: '要标记为已读的消息 ID（可使用 wamid）',
				displayOptions: {
					show: {
						resource: ['inbound'],
					},
				},
			},
			{
				displayName: '商业账号 ID',
				name: 'businessAccount',
				type: 'string',
				default: '',
				description: '商业账号 ID（仅用于模板消息）',
				displayOptions: {
					show: {
						resource: ['message'],
						messageType: ['template'],
					},
				},
			},
			// 高级选项组（默认隐藏）
			{
				displayName: '高级选项',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: '添加选项',
				default: {},
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						displayName: '回复消息 ID',
						name: 'replyToMessageId',
						type: 'string',
						default: '',
						description: '用于回复特定消息',
						displayOptions: {
							show: {
								'/resource': ['message'], // 这里要用单引号和/开头来实现限制在特定的资源和操作下展示 https://community.n8n.io/t/custom-node-how-to-have-a-collection-options-with-specific-display-options/62310
								'/operation': ['sendDirectly', 'send'],
								'/messageType': ['text', 'image', 'template', 'audio', 'video', 'document'],
							},
						},
					},
					{
						displayName: '自定义消息 ID',
						name: 'customClientMsgId',
						type: 'string',
						default: '',
						description: '自定义的客户端消息 ID，用于追踪消息',
						displayOptions: {
							show: {
								'/resource': ['message'],
								'/operation': ['sendDirectly', 'send'],
							},
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('YCloudApi') as ICredentialDataDecryptedObject;
		const apiKey = credentials.apiKey as string;
		const phoneNumber = credentials.phoneNumber as string;

		const baseUrl = 'https://api.ycloud.com/v2/whatsapp';

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				let responseData: IDataObject;
				const messageType = resource === 'message' && (operation === 'sendDirectly' || operation === 'send')
					? this.getNodeParameter('messageType', itemIndex) as string
					: undefined;

				if (resource === 'message') {
					if (operation === 'retrieve') {
						responseData = await retrieveMessage(this, itemIndex, apiKey, baseUrl);
					} else {
						responseData = await sendMessage(this, itemIndex, apiKey, baseUrl, operation as 'sendDirectly' | 'send');
					}
				} else if (resource === 'media' && operation === 'upload') {
					responseData = await uploadMedia(this, itemIndex, apiKey, baseUrl, phoneNumber);
				} else if (resource === 'inbound') {
					if (operation === 'markAsRead') {
						responseData = await markAsRead(this, itemIndex, apiKey, baseUrl);
					} else if (operation === 'typingIndicator') {
						responseData = await typingIndicator(this, itemIndex, apiKey, baseUrl);
					} else {
						responseData = {};
					}
				} else {
					responseData = {};
				}

				// 构建返回数据
				const resultItem: INodeExecutionData = {
					json: {
						success: true,
						operation,
						output: responseData,
					},
				};

				if (resource === 'message' && (operation === 'sendDirectly' || operation === 'send')) {
					const to = this.getNodeParameter('to', itemIndex) as string;
					(resultItem.json as IDataObject).input = { to, type: messageType };
				} else if (resource === 'inbound') {
					const messageId = this.getNodeParameter('inboundMessageId', itemIndex) as string;
					(resultItem.json as IDataObject).input = { messageId };
				}

				returnData.push(resultItem);
			} catch (error) {
				// 处理错误信息
				if (error.response?.data?.error?.message) {
					error.message = JSON.stringify(error.response?.data, null, 2);
				}

				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: error instanceof Error ? error.message : String(error),
						},
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
}
