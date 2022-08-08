package template

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/errorx"
	"github.com/yahuian/gox/logx"
)

type createParam struct {
	Name string `json:"name" validate:"required,max=20"`
	Kind string `json:"kind" validate:"required,oneof=type ledger"` // type(分类) ledger(账本)
	Note string `json:"note" validate:"max=200"`
}

// @Summary 添加模板
// @Tags    bill
// @Accept  json
// @Produce json
// @param   payload body     createParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.BillTemplate}
// @Router  /bill/template [post]
func Create(c *ctx.Context) {
	var param createParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	data := &db.BillTemplate{
		Name:      param.Name,
		Kind:      param.Kind,
		CreatedAt: time.Now(),
	}

	count, err := db.Count[db.BillTemplate]("name = ?", data.Name)
	if err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}
	if count != 0 {
		c.BadRequest(errorx.New("名称已存在，不可重复添加"))
		return
	}

	if err := db.Create(data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
