## 约定大于配置

共同的约定可以显著的增加开发效率

### model
- 每个表必须有 ``CreateAt`` 字段，且该字段的过滤参数为 ``create_at[]``，格式为 ``2006-01-02 15:04:05``

### swagger
- 所有的 API 都有可能返回 ``400`` ``500`` 状态，所以这两种情况不在 swagger 文档中写明
