# AI-WORKSPACE-LITE

完整目录：[docs/README.md](docs/README.md)

## 快速开始

1. 复制环境变量模板：将 [`.env.example`](.env.example) 复制为 `.env.local`（或 `.env`），填入密钥。
2. `npm install`
3. `npm run dev`，浏览器打开 [http://localhost:3000](http://localhost:3000)

### 环境变量说明

| 变量 | 说明 |
|------|------|
| `MOONSHOT_API_KEY` | Kimi 开放平台 API Key（必填） |
| `MOONSHOT_BASE_URL` | 一般为 `https://api.moonshot.cn/v1`（国内）或官方文档推荐地址 |
| `MOONSHOT_MODEL` | 如 `kimi-k2.5`；Week 1 `/api/generate` 与 Week 2 `/api/extract` 共用 |

> **说明：** Week 2 使用 Moonshot 文档支持的 Chat **`response_format: json_object`**，再配合 Zod 校验得到结构化对象；与 OpenAI Responses API 的 `responses.parse` 不是同一路径，但学习目标（稳定业务对象）一致。

## Week 01 - 文档详细内容

- 对应完整文档：[docs/week-01/README.md](docs/week-01/README.md)

## Week 02 - Structured Extractor v1

- 对应完整文档：[docs/week-02/README.md](docs/week-02/README.md)