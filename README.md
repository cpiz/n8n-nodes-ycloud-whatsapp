# @cpiz/n8n-nodes-ycloud-whatsapp

这是一个 n8n 社区节点，让你可以在 n8n 工作流中使用 [YCloud WhatsApp](https://www.ycloud.com/)。

YCloud WhatsApp 是一个消息 API 服务，帮助企业发送和接收 WhatsApp 消息、上传和管理媒体文件，以及处理入站消息操作。

[n8n](https://n8n.io/) 是一个采用 [公平代码许可](https://docs.n8n.io/reference/license/)的工作流自动化平台。

[安装](#安装) |
[操作](#操作) |
[凭证](#凭证) |
[兼容性](#兼容性) |
[使用说明](#使用说明) |
[资源](#资源)

## 安装

在n8n设置-社区节点中搜索 `@cpiz/n8n-nodes-ycloud-whatsapp` 并安装，参考[帮助文档](https://docs.n8n.io/integrations/community-nodes/installation/)。

## 操作

### 消息

- **直接发送** - 立即同步发送 WhatsApp 消息
- **队列发送** - 将 WhatsApp 消息加入队列异步发送
- **检索消息** - 检索之前发送的 WhatsApp 消息

### 接收消息

- **标记已读** - 将接收到的消息标记为已读（显示蓝色勾选标记）
- **显示输入指示器** - 显示输入指示器并标记消息为已读

### 媒体

- **上传媒体** - 上传媒体文件供后续消息使用（加密存储 30 天）

## 凭证

要使用此节点，你需要使用 API Key 进行 YCloud 身份验证。

### 前置条件

1. 注册 [YCloud 账户](https://www.ycloud.com/)
2. 登录 YCloud 控制台
3. 在设置页面生成 API Key

### 身份验证设置

1. 在 n8n 中创建"YCloud API"凭证
2. 输入你的 YCloud API Key，节点使用 `X-API-Key` 头进行身份验证
3. 输入 WhatsApp 应用程序 ID（WABA ID）
4. 输入发送消息的电话号码

更多信息请访问 [YCloud 身份验证文档](https://docs.ycloud.com/reference/authentication)。

## 兼容性

此节点兼容 n8n 1.0.0 及以上版本。

已在最新的 n8n 稳定版本上进行测试。

## 功能特性

### 消息类型支持

- **文本消息** - 支持纯文本和链接预览
- **图片消息** - 支持通过 ID 或 URL 发送图片
- **模板消息** - 使用预审批的 WhatsApp 模板
- **音频消息** - 发送音频文件
- **视频消息** - 发送视频文件
- **文档消息** - 发送文档，支持自定义文件名
- **贴纸消息** - 发送 WhatsApp 贴纸
- **位置消息** - 发送位置信息（经纬度、名称、地址）
- **互动消息** - 发送带按钮、列表的互动消息
- **表情回应** - 对消息进行表情回应或撤回
- **联系人** - 发送联系人卡片

### 高级功能

- **回复消息** - 在高级选项中设置 `replyToMessageId` 回复特定消息
- **自定义消息 ID** - 在高级选项中设置 `customClientMsgId` 用于追踪消息
- **电话号码验证** - 自动验证收件人号码格式（E.164 标准）
- **统一附件处理** - 消息附件支持通过媒体 ID 或 URL 发送

## 使用说明

### 发送 WhatsApp 消息

1. 将 YCloud WhatsApp 节点添加到工作流
2. 选择"消息"作为资源
3. 选择操作（例如"直接发送"）
4. 配置收件人电话号码和消息内容
5. 可选：附加媒体或自定义消息参数

### 处理接收消息

1. 使用 Webhook 节点接收来自 YCloud 的传入消息
2. 添加 YCloud WhatsApp 节点并选择"接收消息"资源
3. 选择"标记已读"来确认收到消息
4. 可选：显示输入指示器以提供更好的用户体验

### 上传媒体

1. 选择"媒体"作为资源
2. 选择"上传媒体"操作
3. 配置输入数据的二进制属性（默认为 `data`）或提供媒体 URL
4. 上传的媒体将返回 ID，可在消息中引用
5. 媒体文件加密保存 30 天

### 示例工作流

```
Webhook (接收 WhatsApp) → YCloud WhatsApp (标记已读) → 处理消息 → YCloud WhatsApp (发送回复)
```

## 资源

- [n8n 社区节点文档](https://docs.n8n.io/integrations/#community-nodes)
- [YCloud API 文档](https://docs.ycloud.com/)
- [YCloud WhatsApp API 参考](https://docs.ycloud.com/v2.0.1/reference/whatsapp-%E6%B6%88%E6%81%AF%E5%8F%91%E9%80%81%E6%8C%87%E5%8D%97)
- [YCloud 身份验证](https://docs.ycloud.com/reference/authentication)

## 许可证

MIT 许可证 - 详见 LICENSE 文件
