---
title: "如何跨越 LangChain 应用研发的最后一公里"
date: 2024-05-15
description: "由于 LangChain 应用通常需要集成各种云服务，因此部署过程相对复杂。本文探讨了开发者在部署过程中面临的种种挑战，并介绍了一个名为 Pluto 的研发工具，这款工具致力于帮助开发者专注于编写业务逻辑，避免陷入繁琐的基础设施配置。"
---

# 如何跨越 LangChain 应用研发的最后一公里

![Cover](../../public/assets/240515-cover.jpg)

说 [LangChain](https://github.com/langchain-ai/langchain) 是现在最流行的 AI 应用开发框架，应该没有人出来反对吧。LangChain 的出现极大地简化了基于大型语言模型（LLM）的 AI 应用构建难度，如果把 AI 应用比作一个人的话，那么 LLM 相当于这个人的“大脑”，而 LangChain 则是通过提供各种工具和抽象，来充当这个人的“四肢”，两者结合起来，就能实现一个具备“思考能力”的 AI 应用。不过，本文**并不介绍 LangChain 的具体使用方法，而是希望与读者探讨一下 LangChain 应用研发的最后一公里问题 —— 如何部署 LangChain 应用**，以 AWS 为例。_你说为什么要部署到 AWS 上？当然是羊毛太香了，日常使用完全免费。_

首先，明确一下本文讨论的范围：本文讨论的不仅仅是将一个 LangChain 应用的代码部署到云上跑起来，如果只考虑这一点的话，那么我们只需要考虑使用虚拟机 EC2、容器服务 Fargate 或者 Lambda 函数就可以完成。但是，一个完整的 AI 应用通常还需要一系列的基础服务来支撑，比如使用数据库来保存会话历史，使用向量数据库存储知识库的 Embedding 等。想要实现功能更加完善的 AI 应用甚至还需要消息队列、API Gateway 等能力。因此，本文要讨论的是：**如何将一个 LangChain 应用及其依赖的基础服务一并部署到云上。**

## 🔗 LangServe

熟悉 LangChain 生态的读者看到这可能会联想到 LangChain 的一个子项目 [LangServe](https://github.com/langchain-ai/langserve)。LangServe 的目标就是简化 LangChain 应用的部署，它可以将 LangChain 应用封装成 API 服务器，并默认提供 stream、async、docs、playground 等端口。但只有 LangServe 还远没有解决 LangChain 应用部署的问题，因为它最终提供的只是一个基于 FastAPI 的 API 服务器，类似 Flask、Django 等框架。如何部署 LangServe 应用到云上，如何创建与管理应用依赖的基础服务，这些问题 LangServe 并没有解决。

不过，LangChain 正在积极地在 LangSmith 平台上提供托管 LangServe 的能力，说明 LangChain 社区也意识到 LangChain 应用产品化部署的问题，正在努力解决。但即使如此，LangChain 应用依赖的基础服务怎么办？难道 LangSmith 也要提供这些服务吗？应用托管、后端服务，这些不都是云服务商的核心竞争力吗？为何不如直接使用 AWS、Azure 等云服务商提供的服务呢？

## 🪄 部署 LangChain 应用的 3 种方式

那我们就来看看如何将 LangChain 应用部署到 AWS 上。在这里，我们介绍三种不同方式来部署 LangChain 应用。如果你有更好的方式，欢迎一起探讨。

### ⚙️ AWS CDK

在一次 AWS GenAI Day 活动中，AWS 邀请了 LangChain 的 CEO Harrison Chase，活动主题就是“使用 LangChain 和 Amazon Bedrock 构建和部署前沿生成式 AI 应用”，你可以从[这里](https://aws.amazon.com/startups/learn/build-and-deploy-a-cutting-edge-generative-ai-application-with-langchain-and-amazon-bedrock)观看活动的录播。

有趣的是，活动中有大量篇幅在介绍 AWS 提供的 OpenSearch、Bedrock、Kendra 等多种服务都可以和 LangChain 集成，但是在最后演示的时候，却没有演示如何创建这些服务的实例，也没有演示如何部署 LangChain 应用到 AWS 上，只演示了一个在本地执行的 LangChain 应用，应用中使用了已经部署好的 AWS Bedrock 和 Kendra 的服务实例。

不过，我在视频最后的 Resources 列表里发现了 [`langchain-aws-template` 这个 GitHub 仓库](https://github.com/langchain-ai/langchain-aws-template)，里面包含了两个 AWS 与 LangChain 集成的示例应用，并且包含了完整的部署指南，整个部署过程包括 4 步：

1. 使用 Conda 创建特定的 Python 环境；
2. 配置密钥等应用所需数据；
3. 执行 Bash 脚本打包应用；
4. 使用 AWS CDK 部署应用。

看起来非常简单对不对？但是，如果你需要实现更复杂的功能，依赖更多的基础服务，那你就需要修改打包过程、CDK 部署脚本等，这个过程对于不熟悉 AWS CDK，或者不熟悉 AWS 云服务的开发者来说，是有一定门槛的。

此外，我们之前做过一个[对比](https://pluto-lang.vercel.app/zh-CN/cookbook/langchain-llama2-chatbot-sagemaker)，结果发现如果采用基于 IaC 的部署方式（比如 Terraform），**IaC 代码的代码量是业务代码的 2-3 倍**，这意味着使用 IaC 工具就需要花费大量的时间来维护 IaC 代码，而开发者显然希望能够更多地专注于业务代码开发，毕竟开发目标是实现应用功能。

_这里简单提一下，AWS CDK 是基础设施即代码（IaC）工具中的一种，此类工具除了 AWS CDK 之外，还有 Terraform、Pulumi 等。使用方式类似，也同样存在上面提到的这些问题。_

### ⌨️ AWS 控制台

如果不使用 AWS CDK，我们可以通过登录 AWS 控制台手动创建应用依赖的基础服务。不过这种方式操作起来非常繁琐，需要在控制台的不同页面反复跳转，来创建不同的服务实例，以及服务实例之间的权限配置等，这对于不熟悉 AWS 的开发者来说，是一个很大的挑战。并且这些过程也不能被自动化，团队协作、持续集成、持续部署就更不用想了，对于复杂的应用来说，这种方式显然不可行。

从上面的介绍可以看出，基于 AWS CDK 的部署方式具有一定的门槛，而手动创建的方式又不够自动化，并且这两种方式存在一些相同的问题：

1. 极易出错：两种方式本质都是手动逐个创建细粒度的服务实例，容易出现配置遗漏、错误等问题，而这些问题在部署过程中很难被发现，只有在应用运行时才会暴露出来。
2. 需要 AWS 背景知识：不管是通过 CDK 代码定义服务实例，还是通过控制台手动创建服务实例，都需要开发者对 AWS 的服务有深入的了解，包括应用直接依赖的 DynamoDB、S3 等服务，以及间接依赖的 IAM 等服务。
3. 权限配置繁琐：出于安全的考虑，我们通常以最小权限原则来配置各个资源服务实例的权限，如果由开发者通过 CDK 或者控制台手动管理这些权限，那必定是一个非常繁琐的配置过程，并且在修改业务代码后，也非常容易忘记更新权限配置。
4. 依赖管理：在将 LangChain 应用发布成 AWS Lambda 函数实例时，我们需要在打包时将应用依赖的 SDK 一并打包进来，而这个过程需要开发者手动管理，一方面容易遗漏依赖库，另一方面如果本地设备的操作系统、CPU 架构与 AWS 平台不一致，那打包过程就会更加麻烦。

### 🤖️ Pluto

从上面的分析可以看到，AWS 等大型云服务商提供了很多强大的服务，但距离开发者真正用起来却还有一段距离，上手门槛还挺高的。因此，我们产生一个想法：能不能直接从 LangChain 应用代码中直接推导出应用的基础设施资源需求，然后自动在 AWS 等云平台上创建相应的资源实例，通过这种方式来简化资源创建和应用部署的流程。基于此，我们构建了一个研发工具 [Pluto](https://github.com/pluto-lang/pluto)。

Pluto 是一款面向个人开发者的研发工具，致力于帮助开发者**更便捷地构建云和 AI 应用**，解决上面提到的一系列云的易用性相关问题。开发者可以**在应用代码中直接定义与使用应用所需的云服务**，包括 AWS DynamoDB、SageMaker 等。Pluto 会通过**静态程序分析**的方式从代码中自动获取应用程序的基础设施需求，并在指定云平台上创建相应的服务实例。可以从我们的 [GitHub 仓库](https://github.com/pluto-lang/pluto)进一步了解 Pluto 的设计与理念，本文就不再过多赘述了。

那么，使用 Pluto 部署 LangChain 应用是什么样的体验呢？我们来看一个简单的示例：

```python
import os

from pluto_client import Router, HttpRequest, HttpResponse
from langchain_core.pydantic_v1 import SecretStr
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("tell me a short joke about {topic}")
model = ChatOpenAI(
    model="gpt-3.5-turbo",
    api_key=SecretStr(os.environ["OPENAI_API_KEY"]),
)
output_parser = StrOutputParser()

def handler(req: HttpRequest) -> HttpResponse:
    chain = prompt | model | output_parser
    topic = req.query.get("topic", "ice cream")
    joke = chain.invoke({"topic": topic})
    return HttpResponse(status_code=200, body=joke)

router = Router("pluto")
router.get("/", handler)
```

上面这段代码就是一个基于 Pluto 实现的 LangChain 应用，是不是就像普通 Python 应用一样？但是，只需要执行 `pluto deploy`，Pluto 就能在 AWS 平台上构建出下图所示的应用架构，过程中会自动创建 API Gateway、Lambda 资源实例，并且配置好 API Gateway 到 Lambda 的路由、触发器、权限等。

<p align="center">
  <img src="/assets/240515-demo-aws.png" style="width: 350px">
</p>

限于篇幅，上面这个例子只展示了将 LangChain 应用与 API Gateway 资源集成，同样采用变量定义的方式，可以**集成 DynamoDB、S3、SageMaker 等更多资源**，你可以从[这里](https://pluto-lang.vercel.app/zh-CN/cookbook)获取更多示例。

因为基础设施配置是和应用代码一起定义的，所以开发者可以根据自己的需求随意更改代码，在下次 `pluto deploy` 时，Pluto 会自动更新应用的基础设施配置，而不需要开发者进行额外的操作，解决了上面提到的容易出错、代码打包、权限配置繁琐等体验问题。

## 💬 总结

本文讨论了多种将 LangChain 应用部署到 AWS 上的方式，发现像 AWS、Azure 等大型云服务提供商虽然提供了很多强大的服务，但是开发者真正用起来却并不轻松，上手门槛较高。这或许也是 [LangSmith](https://smith.langchain.com)、[Modal](https://modal.com)、[LaptonAI](https://www.lepton.ai) 等 AI Infra 产品出现的原因，他们致力于成为 AI 应用的一站式服务商。而我们则从另一个角度出发，直接从应用代码中推导出应用的基础设施需求，自动在云平台上创建相应的服务实例，以此帮助开发者解决应用部署问题。我们希望最终能够让开发者专注于业务逻辑的编写，即使是对 AWS 不太熟悉的开发者，也能不纠结于基础设施的繁琐配置，将应用轻松地部署到云上。

最后，如果大家喜欢 Pluto 这个项目，想上手体验一下，可以访问我们的[上手指南](https://pluto-lang.vercel.app/zh-CN/documentation/getting-started)，我们提供了容器、在线等多种使用方式。如果大家有任何问题或建议，或想参与贡献（非常欢迎！），欢迎大家[加入我们的社区](https://github.com/pluto-lang/community)一起参与讨论和共建。

最后最后，走过路过的朋友，读到这了，**给个 star🌟** 呗！GitHub 链接 👉 [https://github.com/pluto-lang/pluto](https://github.com/pluto-lang/pluto)

## Reference

- [案例集](https://pluto-lang.vercel.app/zh-CN/cookbook)
  - [Llama2 会话聊天机器人](https://pluto-lang.vercel.app/zh-CN/cookbook/langchain-llama2-chatbot-sagemaker-python)
  - [RAG 文档机器人](https://pluto-lang.vercel.app/zh-CN/cookbook/rag-qa-bot-with-web)
  - [部署 LangServe 应用到 AWS](https://pluto-lang.vercel.app/zh-CN/cookbook/deploy-langserve-to-aws)
- [LangChain GitHub](https://github.com/langchain-ai/langchain)
- [LangServe GitHub](https://github.com/langchain-ai/langserve)
- [AWS 免费资源](https://aws.amazon.com/cn/free)
- [Build and deploy a cutting-edge generative AI application with LangChain and Amazon Bedrock | AWS GenAI Day](https://aws.amazon.com/startups/learn/build-and-deploy-a-cutting-edge-generative-ai-application-with-langchain-and-amazon-bedrock)
- [LangChain AWS Template](https://github.com/langchain-ai/langchain-aws-template)
- [Pluto GitHub](https://github.com/pluto-lang/pluto)
- [Pluto Community](https://github.com/pluto-lang/community)
- [Pluto 网站](https://pluto-lang.vercel.app/zh-CN)
