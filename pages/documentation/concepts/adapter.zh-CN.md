各种运行平台的适配器，通过 API、 IaC 引擎等方式与平台交互，完成资源创建、查询、更新、销毁等。Adapter 与 Deducer、Generator 不同的一点是，Adapter 可能包含状态，例如 `tf.state` 文件等。

## 输入

- 项目信息，名称等
- 状态目录
- arch ref
- IaC 代码文件

## 操作

- deploy：部署至目标平台
  - 输出：在目标平台部署的资源列表
- state：当前项目在目标平台的状态
  - 输出：在目标平台部署的资源列表
- destroy：在目标平台下线应用
  - 输出：无
