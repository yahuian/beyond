package details

import (
	"time"

	"github.com/yahuian/beyond/ctx"
	"github.com/yahuian/beyond/db"
	"github.com/yahuian/gox/logx"
)

type createParam struct {
	Name   string  `json:"name" validate:"max=20"`
	Money  float64 `json:"money" validate:"required"`
	Kind   string  `json:"kind" validate:"oneof=income pay"`
	Type   string  `json:"type" validate:"max=20"`
	Ledger string  `json:"ledger" validate:"max=20"`
	Note   string  `json:"note" validate:"max=200"`
}

// @Summary 增加明细
// @Tags    bill
// @Accept  json
// @Produce json
// @param   payload body     createParam true "request payload"
// @Success 200     {object} ctx.Response{data=db.BillDetails}
// @Router  /bill/details [post]
func Create(c *ctx.Context) {
	var param createParam
	if err := c.BindJSON(&param); err != nil {
		c.BadRequest(err)
		return
	}

	data := &db.BillDetails{
		Name:      param.Name,
		Money:     param.Money,
		Kind:      param.Kind,
		Type:      param.Type,
		Ledger:    param.Ledger,
		Note:      param.Note,
		CreatedAt: time.Now(),
	}

	if err := db.Create(data); err != nil {
		logx.Errorf("%+v", err)
		c.InternalErr(err)
		return
	}

	c.SuccessWith(ctx.Response{Msg: "success", Data: data})
}
